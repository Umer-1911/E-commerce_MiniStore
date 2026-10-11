<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class OrderController extends Controller
{
    /**
     * Store a newly created order.
     * Authenticated customers only.
     */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        // Admin or non-customer cannot create customer orders
        if (!$user || !$user->isCustomer()) {
            return response()->json([
                'message' => 'Only customers are authorized to place orders.',
            ], 403);
        }

        $validated = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|integer|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
        ]);

        // Aggregate quantities by product_id
        $itemMap = [];
        foreach ($validated['items'] as $item) {
            $pid = (int) $item['product_id'];
            $qty = (int) $item['quantity'];
            $itemMap[$pid] = ($itemMap[$pid] ?? 0) + $qty;
        }

        $order = DB::transaction(function () use ($user, $itemMap) {
            $productIds = array_keys($itemMap);
            // Sort IDs to prevent database deadlocks under concurrency
            sort($productIds);

            // Fetch products from database with lockForUpdate() to prevent overselling / race conditions
            $products = Product::whereIn('id', $productIds)
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            // Validate stock and calculate total server-side
            $totalAmountInPaisa = 0;
            foreach ($itemMap as $productId => $qty) {
                /** @var Product|null $product */
                $product = $products->get($productId);

                if (!$product) {
                    throw ValidationException::withMessages([
                        'items' => ["Product #{$productId} was not found."],
                    ]);
                }

                if ($product->stock_quantity < $qty) {
                    throw ValidationException::withMessages([
                        'items' => ["Insufficient stock for '{$product->name}'. Available: {$product->stock_quantity}, requested: {$qty}."],
                    ]);
                }

                // Never trust frontend prices: calculate strictly from database price
                $totalAmountInPaisa += $product->price_in_paisa * $qty;
            }

            // Create Order record (status = pending)
            $order = Order::create([
                'user_id' => $user->id,
                'total_amount_in_paisa' => $totalAmountInPaisa,
                'status' => 'pending',
            ]);

            // Create OrderItem records with snapshot price and deduct stock
            foreach ($itemMap as $productId => $qty) {
                /** @var Product $product */
                $product = $products->get($productId);

                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $product->id,
                    'quantity' => $qty,
                    'price_at_purchase_in_paisa' => $product->price_in_paisa,
                ]);

                // Deduct stock
                $product->decrement('stock_quantity', $qty);
            }

            return $order;
        });

        return response()->json([
            'message' => 'Order placed successfully.',
            'data' => $order->load(['orderItems.product']),
        ], 201);
    }

    /**
     * List all orders for the authenticated customer.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user || !$user->isCustomer()) {
            return response()->json([
                'message' => 'Only customers can view their order history.',
            ], 403);
        }

        $orders = $user->orders()
            ->with(['orderItems.product'])
            ->latest()
            ->get();

        return response()->json([
            'data' => $orders,
        ]);
    }

    /**
     * Show a single order (authenticated customer can view only their own order).
     */
    public function show(Request $request, Order $order): JsonResponse
    {
        $user = $request->user();

        if ($order->user_id !== $user->id) {
            return response()->json([
                'message' => 'Unauthorized access to order.',
            ], 403);
        }

        return response()->json([
            'data' => $order->load(['orderItems.product']),
        ]);
    }
}
