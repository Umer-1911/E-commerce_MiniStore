<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ProductCatalogTest extends TestCase
{
    use RefreshDatabase;

    // -----------------------------------------------------------------------
    // Helpers
    // -----------------------------------------------------------------------

    private function adminUser(): User
    {
        return User::factory()->create(['role' => 'admin']);
    }

    private function customerUser(): User
    {
        return User::factory()->create(['role' => 'customer']);
    }

    private function makeProduct(array $overrides = []): Product
    {
        return Product::factory()->create(array_merge([
            'name'           => 'Test Product',
            'category'       => 'Clothing',
            'price_in_paisa' => 100000,
            'stock_quantity' => 10,
        ], $overrides));
    }

    // -----------------------------------------------------------------------
    // Public Listing
    // -----------------------------------------------------------------------

    public function test_public_can_list_products(): void
    {
        Product::factory()->count(3)->create();

        $response = $this->getJson('/api/products');

        $response->assertOk()
            ->assertJsonStructure([
                'data',
                'current_page',
                'total',
                'per_page',
                'last_page',
            ]);
    }

    public function test_products_list_is_paginated(): void
    {
        Product::factory()->count(15)->create();

        $response = $this->getJson('/api/products?per_page=5');

        $response->assertOk()
            ->assertJsonPath('per_page', 5)
            ->assertJsonPath('current_page', 1);

        $this->assertCount(5, $response->json('data'));
    }

    public function test_products_can_be_searched_by_name(): void
    {
        Product::factory()->create(['name' => 'Peshawari Chappal']);
        Product::factory()->create(['name' => 'Basmati Rice']);

        $response = $this->getJson('/api/products?search=chappal');

        $response->assertOk();
        $this->assertCount(1, $response->json('data'));
        $this->assertStringContainsStringIgnoringCase('chappal', $response->json('data.0.name'));
    }

    public function test_products_can_be_filtered_by_category(): void
    {
        Product::factory()->create(['category' => 'Clothing']);
        Product::factory()->create(['category' => 'Clothing']);
        Product::factory()->create(['category' => 'Food & Groceries']);

        $response = $this->getJson('/api/products?category=Clothing');

        $response->assertOk();
        $this->assertCount(2, $response->json('data'));
        $this->assertEquals('Clothing', $response->json('data.0.category'));
    }

    public function test_products_can_be_sorted_by_price(): void
    {
        Product::factory()->create(['price_in_paisa' => 300000]);
        Product::factory()->create(['price_in_paisa' => 100000]);
        Product::factory()->create(['price_in_paisa' => 200000]);

        $response = $this->getJson('/api/products?sort_by=price_in_paisa&sort_dir=asc');

        $response->assertOk();
        $prices = collect($response->json('data'))->pluck('price_in_paisa')->toArray();
        $this->assertEquals([100000, 200000, 300000], $prices);
    }

    // -----------------------------------------------------------------------
    // Public Product Detail
    // -----------------------------------------------------------------------

    public function test_public_can_view_single_product(): void
    {
        $product = $this->makeProduct(['name' => 'Kahwa Tea', 'category' => 'Food & Groceries']);

        $response = $this->getJson("/api/products/{$product->id}");

        $response->assertOk()
            ->assertJsonPath('data.name', 'Kahwa Tea')
            ->assertJsonPath('data.category', 'Food & Groceries')
            ->assertJsonStructure(['data' => ['id', 'name', 'description', 'category', 'price_in_paisa', 'stock_quantity']]);
    }

    public function test_returns_404_for_nonexistent_product(): void
    {
        $this->getJson('/api/products/99999')->assertNotFound();
    }

    // -----------------------------------------------------------------------
    // Admin Create
    // -----------------------------------------------------------------------

    public function test_admin_can_create_product(): void
    {
        $admin = $this->adminUser();

        $response = $this->actingAs($admin)->postJson('/api/admin/products', [
            'name'           => 'New Handmade Rug',
            'description'    => 'Handwoven Balochi carpet.',
            'category'       => 'Home Decor',
            'price_in_paisa' => 500000,
            'stock_quantity' => 5,
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.name', 'New Handmade Rug')
            ->assertJsonPath('data.category', 'Home Decor');

        $this->assertDatabaseHas('products', ['name' => 'New Handmade Rug', 'category' => 'Home Decor']);
    }

    public function test_admin_can_create_product_with_image(): void
    {
        Storage::fake('public');
        $admin = $this->adminUser();

        $response = $this->actingAs($admin)->postJson('/api/admin/products', [
            'name'           => 'Kurti with Image',
            'price_in_paisa' => 200000,
            'stock_quantity' => 10,
            'image'          => UploadedFile::fake()->image('kurti.jpg'),
        ]);

        $response->assertCreated();
        $this->assertNotNull($response->json('data.image_path'));
        Storage::disk('public')->assertExists($response->json('data.image_path'));
    }

    // -----------------------------------------------------------------------
    // Admin Update
    // -----------------------------------------------------------------------

    public function test_admin_can_update_product(): void
    {
        $admin   = $this->adminUser();
        $product = $this->makeProduct();

        $response = $this->actingAs($admin)->putJson("/api/admin/products/{$product->id}", [
            'name'           => 'Updated Name',
            'price_in_paisa' => 999000,
            'stock_quantity' => 99,
        ]);

        $response->assertOk()
            ->assertJsonPath('data.name', 'Updated Name')
            ->assertJsonPath('data.price_in_paisa', 999000);
    }

    public function test_admin_can_replace_product_image(): void
    {
        Storage::fake('public');
        $admin   = $this->adminUser();
        $product = $this->makeProduct(['image_path' => 'products/old-image.jpg']);

        Storage::disk('public')->put('products/old-image.jpg', 'old content');

        $response = $this->actingAs($admin)->putJson("/api/admin/products/{$product->id}", [
            'name'           => $product->name,
            'price_in_paisa' => $product->price_in_paisa,
            'stock_quantity' => $product->stock_quantity,
            'image'          => UploadedFile::fake()->image('new.png'),
        ]);

        $response->assertOk();
        Storage::disk('public')->assertMissing('products/old-image.jpg');
        $this->assertNotNull($response->json('data.image_path'));
    }

    public function test_admin_can_replace_product_image_using_method_spoofing(): void
    {
        Storage::fake('public');
        $admin   = $this->adminUser();
        $product = $this->makeProduct(['image_path' => 'products/old-image.jpg']);

        Storage::disk('public')->put('products/old-image.jpg', 'old content');

        $response = $this->actingAs($admin)->post("/api/admin/products/{$product->id}", [
            '_method'        => 'PUT',
            'name'           => $product->name,
            'price_in_paisa' => $product->price_in_paisa,
            'stock_quantity' => $product->stock_quantity,
            'image'          => UploadedFile::fake()->image('replacement.jpg'),
        ]);

        $response->assertOk();
        Storage::disk('public')->assertMissing('products/old-image.jpg');
        $this->assertNotNull($response->json('data.image_path'));
        Storage::disk('public')->assertExists($response->json('data.image_path'));
    }

    // -----------------------------------------------------------------------
    // Admin Delete
    // -----------------------------------------------------------------------

    public function test_admin_can_delete_product(): void
    {
        $admin   = $this->adminUser();
        $product = $this->makeProduct();

        $response = $this->actingAs($admin)->deleteJson("/api/admin/products/{$product->id}");

        $response->assertOk()->assertJsonPath('message', 'Product deleted successfully.');
        $this->assertDatabaseMissing('products', ['id' => $product->id]);
    }

    public function test_product_deletion_fails_if_referenced_by_order(): void
    {
        $admin   = $this->adminUser();
        $product = $this->makeProduct();

        // Create an order that references this product
        $customer = $this->customerUser();
        $order    = Order::factory()->create(['user_id' => $customer->id]);
        OrderItem::factory()->create([
            'order_id'                  => $order->id,
            'product_id'                => $product->id,
            'quantity'                  => 1,
            'price_at_purchase_in_paisa' => $product->price_in_paisa,
        ]);

        $response = $this->actingAs($admin)->deleteJson("/api/admin/products/{$product->id}");

        $response->assertStatus(409);
        $this->assertDatabaseHas('products', ['id' => $product->id]);
    }

    // -----------------------------------------------------------------------
    // Authorization
    // -----------------------------------------------------------------------

    public function test_customer_cannot_create_product(): void
    {
        $customer = $this->customerUser();

        $this->actingAs($customer)->postJson('/api/admin/products', [
            'name'           => 'Fake Product',
            'price_in_paisa' => 100,
            'stock_quantity' => 1,
        ])->assertForbidden();
    }

    public function test_customer_cannot_update_product(): void
    {
        $customer = $this->customerUser();
        $product  = $this->makeProduct();

        $this->actingAs($customer)->putJson("/api/admin/products/{$product->id}", [
            'name' => 'Hacked',
        ])->assertForbidden();
    }

    public function test_customer_cannot_delete_product(): void
    {
        $customer = $this->customerUser();
        $product  = $this->makeProduct();

        $this->actingAs($customer)->deleteJson("/api/admin/products/{$product->id}")->assertForbidden();
    }

    public function test_unauthenticated_cannot_create_product(): void
    {
        $this->postJson('/api/admin/products', [
            'name'           => 'Fake Product',
            'price_in_paisa' => 100,
            'stock_quantity' => 1,
        ])->assertUnauthorized();
    }

    // -----------------------------------------------------------------------
    // Validation
    // -----------------------------------------------------------------------

    public function test_admin_create_fails_without_required_fields(): void
    {
        $admin = $this->adminUser();

        $this->actingAs($admin)->postJson('/api/admin/products', [])->assertUnprocessable()
            ->assertJsonValidationErrors(['name', 'price_in_paisa', 'stock_quantity']);
    }

    public function test_admin_create_fails_with_negative_price(): void
    {
        $admin = $this->adminUser();

        $this->actingAs($admin)->postJson('/api/admin/products', [
            'name'           => 'Bad Product',
            'price_in_paisa' => -1,
            'stock_quantity' => 10,
        ])->assertUnprocessable()->assertJsonValidationErrors(['price_in_paisa']);
    }

    public function test_admin_create_fails_with_invalid_image_type(): void
    {
        Storage::fake('public');
        $admin = $this->adminUser();

        $this->actingAs($admin)->postJson('/api/admin/products', [
            'name'           => 'Product',
            'price_in_paisa' => 100,
            'stock_quantity' => 1,
            'image'          => UploadedFile::fake()->create('doc.pdf', 100, 'application/pdf'),
        ])->assertUnprocessable()->assertJsonValidationErrors(['image']);
    }
}
