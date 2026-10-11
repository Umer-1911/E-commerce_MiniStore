<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class AdminOrderController extends Controller
{
    private const STATUS_PROGRESSION = [
        'pending'    => 1,
        'processing' => 2,
        'shipped'    => 3,
        'completed'  => 4,
    ];

    private const TERMINAL_STATUSES = [
        'completed',
        'cancelled',
    ];

    /**
     * List all orders for admin management.
     */
    public function index(): JsonResponse
    {
        $orders = Order::with(['user:id,name,email', 'orderItems.product'])
            ->latest()
            ->get();

        return response()->json([
            'data' => $orders,
        ]);
    }

    /**
     * Display order details for admin.
     */
    public function show(Order $order): JsonResponse
    {
        return response()->json([
            'data' => $order->load(['user:id,name,email', 'orderItems.product']),
        ]);
    }

    /**
     * Update order status with transition and terminal validation.
     */
    public function updateStatus(Request $request, Order $order): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'required|string|in:pending,processing,shipped,completed,cancelled',
        ]);

        $currentStatus = $order->status;
        $newStatus = $validated['status'];

        // Terminal statuses: completed and cancelled orders cannot be changed
        if (in_array($currentStatus, self::TERMINAL_STATUSES, true)) {
            throw ValidationException::withMessages([
                'status' => ["Order #{$order->id} is in a terminal state ('{$currentStatus}') and cannot be updated."],
            ]);
        }

        // Idempotent: same status
        if ($currentStatus === $newStatus) {
            return response()->json([
                'message' => "Order #{$order->id} is already '{$currentStatus}'.",
                'data' => $order->load(['user:id,name,email', 'orderItems.product']),
            ]);
        }

        // Cancellation is permitted from any non-terminal state
        if ($newStatus === 'cancelled') {
            $order->update(['status' => 'cancelled']);

            return response()->json([
                'message' => "Order #{$order->id} status updated to 'cancelled'.",
                'data' => $order->fresh()->load(['user:id,name,email', 'orderItems.product']),
            ]);
        }

        // Backward status change prevention
        $currentLevel = self::STATUS_PROGRESSION[$currentStatus] ?? 0;
        $newLevel = self::STATUS_PROGRESSION[$newStatus] ?? 0;

        if ($newLevel < $currentLevel) {
            throw ValidationException::withMessages([
                'status' => ["Cannot revert order status backwards from '{$currentStatus}' to '{$newStatus}'."],
            ]);
        }

        $order->update(['status' => $newStatus]);

        return response()->json([
            'message' => "Order #{$order->id} status updated to '{$newStatus}'.",
            'data' => $order->fresh()->load(['user:id,name,email', 'orderItems.product']),
        ]);
    }
}
