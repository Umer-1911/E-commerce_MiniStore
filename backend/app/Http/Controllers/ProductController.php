<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProductController extends Controller
{
    /**
     * List products with pagination, search, category filtering, and sorting.
     * Public endpoint — no auth required.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Product::query();

        // Full-text search on name (cross-DB: lower() works on both SQLite and PostgreSQL)
        if ($request->filled('search')) {
            $query->whereRaw('LOWER(name) LIKE ?', ['%' . strtolower($request->search) . '%']);
        }

        // Category filter
        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        // Sorting: name|price_in_paisa|stock_quantity, default created_at desc
        $sortable = ['name', 'price_in_paisa', 'stock_quantity', 'created_at'];
        $sortBy = in_array($request->sort_by, $sortable) ? $request->sort_by : 'created_at';
        $sortDir = $request->sort_dir === 'asc' ? 'asc' : 'desc';
        $query->orderBy($sortBy, $sortDir);

        $perPage = min((int) ($request->per_page ?? 12), 50);
        $products = $query->paginate($perPage);

        return response()->json($products);
    }

    /**
     * Show a single product.
     * Public endpoint — no auth required.
     */
    public function show(Product $product): JsonResponse
    {
        return response()->json(['data' => $product]);
    }

    /**
     * Create a new product.
     * Admin only.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'            => 'required|string|max:255',
            'description'     => 'nullable|string',
            'category'        => 'nullable|string|max:100',
            'price_in_paisa'  => 'required|integer|min:0',
            'stock_quantity'  => 'required|integer|min:0',
            'image'           => 'nullable|image|mimes:jpeg,png,webp,jpg|max:5120',
        ]);

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $this->storeImage($request->file('image'));
        }

        $product = Product::create([
            'name'           => $validated['name'],
            'description'    => $validated['description'] ?? null,
            'category'       => $validated['category'] ?? null,
            'price_in_paisa' => $validated['price_in_paisa'],
            'stock_quantity' => $validated['stock_quantity'],
            'image_path'     => $imagePath,
        ]);

        return response()->json(['data' => $product, 'message' => 'Product created successfully.'], 201);
    }

    /**
     * Update an existing product.
     * Admin only.
     */
    public function update(Request $request, Product $product): JsonResponse
    {
        $validated = $request->validate([
            'name'            => 'sometimes|required|string|max:255',
            'description'     => 'nullable|string',
            'category'        => 'nullable|string|max:100',
            'price_in_paisa'  => 'sometimes|required|integer|min:0',
            'stock_quantity'  => 'sometimes|required|integer|min:0',
            'image'           => 'nullable|image|mimes:jpeg,png,webp,jpg|max:5120',
        ]);

        if ($request->hasFile('image')) {
            // Remove old image if it exists on disk
            if ($product->image_path && Storage::disk('public')->exists($product->image_path)) {
                Storage::disk('public')->delete($product->image_path);
            }
            $validated['image_path'] = $this->storeImage($request->file('image'));
        }

        // Remove the raw 'image' key so it isn't passed to fill()
        unset($validated['image']);

        $product->update($validated);

        return response()->json(['data' => $product->fresh(), 'message' => 'Product updated successfully.']);
    }

    /**
     * Delete a product.
     * Admin only.
     * Returns a clear error if the product is referenced by order_items.
     */
    public function destroy(Product $product): JsonResponse
    {
        try {
            if ($product->image_path) {
                Storage::disk('public')->delete($product->image_path);
            }
            $product->delete();
        } catch (QueryException $e) {
            // PostgreSQL FK violation = 23503; SQLite FK violation = 23000 / code 19
            $sqlState = $e->getCode();
            $msg      = $e->getMessage();
            if (
                $sqlState === '23503'
                || $sqlState === '23000'
                || str_contains($msg, 'FOREIGN KEY constraint failed')
                || str_contains($msg, 'foreign key')
            ) {
                return response()->json([
                    'message' => 'This product cannot be deleted because it is referenced by existing orders.',
                ], 409);
            }
            throw $e;
        }

        return response()->json(['message' => 'Product deleted successfully.']);
    }

    /**
     * Store an uploaded image to the public disk with a safe generated filename.
     */
    private function storeImage(\Illuminate\Http\UploadedFile $file): string
    {
        $extension = $file->getClientOriginalExtension() ?: $file->extension() ?: 'jpg';
        $filename  = \Illuminate\Support\Str::uuid() . '.' . strtolower($extension);
        // Stored at storage/app/public/products/<uuid>.<ext>
        // Publicly accessible via /storage/products/<uuid>.<ext>
        return $file->storeAs('products', $filename, 'public');
    }
}
