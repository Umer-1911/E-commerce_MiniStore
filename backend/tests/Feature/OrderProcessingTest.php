<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrderProcessingTest extends TestCase
{
    use RefreshDatabase;

    private function customerUser(): User
    {
        return User::factory()->create(['role' => 'customer']);
    }

    private function adminUser(): User
    {
        return User::factory()->create(['role' => 'admin']);
    }

    private function makeProduct(array $overrides = []): Product
    {
        return Product::factory()->create(array_merge([
            'name'           => 'Test Product',
            'category'       => 'Clothing',
            'price_in_paisa' => 250000, // PKR 2,500
            'stock_quantity' => 10,
        ], $overrides));
    }

    // -----------------------------------------------------------------------
    // Authorization
    // -----------------------------------------------------------------------

    public function test_guest_cannot_create_order(): void
    {
        $product = $this->makeProduct();

        $response = $this->postJson('/api/orders', [
            'items' => [
                ['product_id' => $product->id, 'quantity' => 1],
            ],
        ]);

        $response->assertUnauthorized();
    }

    public function test_admin_cannot_create_customer_order(): void
    {
        $admin = $this->adminUser();
        $product = $this->makeProduct();

        $response = $this->actingAs($admin)->postJson('/api/orders', [
            'items' => [
                ['product_id' => $product->id, 'quantity' => 1],
            ],
        ]);

        $response->assertForbidden()
            ->assertJsonPath('message', 'Only customers are authorized to place orders.');
    }

    public function test_customer_can_create_order(): void
    {
        $customer = $this->customerUser();
        $product1 = $this->makeProduct(['price_in_paisa' => 200000, 'stock_quantity' => 10]);
        $product2 = $this->makeProduct(['price_in_paisa' => 150000, 'stock_quantity' => 5]);

        $response = $this->actingAs($customer)->postJson('/api/orders', [
            'items' => [
                ['product_id' => $product1->id, 'quantity' => 2],
                ['product_id' => $product2->id, 'quantity' => 1],
            ],
        ]);

        $response->assertCreated()
            ->assertJsonPath('message', 'Order placed successfully.')
            ->assertJsonPath('data.status', 'pending')
            ->assertJsonPath('data.total_amount_in_paisa', 550000) // (200000 * 2) + (150000 * 1) = 550000
            ->assertJsonCount(2, 'data.order_items');

        $this->assertDatabaseHas('orders', [
            'user_id' => $customer->id,
            'total_amount_in_paisa' => 550000,
            'status' => 'pending',
        ]);
    }

    // -----------------------------------------------------------------------
    // Server-side calculation & Price snapshot
    // -----------------------------------------------------------------------

    public function test_correct_server_side_total_and_price_snapshot(): void
    {
        $customer = $this->customerUser();
        $product = $this->makeProduct(['price_in_paisa' => 385000, 'stock_quantity' => 20]);

        $response = $this->actingAs($customer)->postJson('/api/orders', [
            'items' => [
                ['product_id' => $product->id, 'quantity' => 3],
            ],
        ]);

        $response->assertCreated();
        $orderId = $response->json('data.id');

        $this->assertDatabaseHas('orders', [
            'id' => $orderId,
            'total_amount_in_paisa' => 1155000, // 385000 * 3
        ]);

        $this->assertDatabaseHas('order_items', [
            'order_id' => $orderId,
            'product_id' => $product->id,
            'quantity' => 3,
            'price_at_purchase_in_paisa' => 385000,
        ]);
    }

    public function test_frontend_price_manipulation_cannot_change_total(): void
    {
        $customer = $this->customerUser();
        $product = $this->makeProduct(['price_in_paisa' => 500000, 'stock_quantity' => 10]);

        // Attempting to inject manipulated fake prices from client
        $response = $this->actingAs($customer)->postJson('/api/orders', [
            'total_amount_in_paisa' => 100, // Client tries to pay 1 PKR
            'items' => [
                [
                    'product_id' => $product->id,
                    'quantity' => 2,
                    'price_in_paisa' => 50, // Client tries to claim product price is 50 paisa
                ],
            ],
        ]);

        $response->assertCreated();

        // Must still be calculated strictly using database price: 500000 * 2 = 1,000,000 paisa
        $this->assertDatabaseHas('orders', [
            'user_id' => $customer->id,
            'total_amount_in_paisa' => 1000000,
        ]);

        $this->assertDatabaseHas('order_items', [
            'product_id' => $product->id,
            'quantity' => 2,
            'price_at_purchase_in_paisa' => 500000,
        ]);
    }

    // -----------------------------------------------------------------------
    // Stock deduction & Rollback
    // -----------------------------------------------------------------------

    public function test_stock_is_deducted_upon_successful_order(): void
    {
        $customer = $this->customerUser();
        $product = $this->makeProduct(['stock_quantity' => 15]);

        $response = $this->actingAs($customer)->postJson('/api/orders', [
            'items' => [
                ['product_id' => $product->id, 'quantity' => 4],
            ],
        ]);

        $response->assertCreated();

        // Fresh check from database
        $this->assertEquals(11, $product->fresh()->stock_quantity);
    }

    public function test_insufficient_stock_fails_and_rolls_back_entire_order(): void
    {
        $customer = $this->customerUser();
        $product1 = $this->makeProduct(['stock_quantity' => 5]);
        $product2 = $this->makeProduct(['stock_quantity' => 2]); // Not enough stock for quantity 3

        $response = $this->actingAs($customer)->postJson('/api/orders', [
            'items' => [
                ['product_id' => $product1->id, 'quantity' => 2],
                ['product_id' => $product2->id, 'quantity' => 3],
            ],
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['items']);

        // No order should have been created
        $this->assertDatabaseCount('orders', 0);
        $this->assertDatabaseCount('order_items', 0);

        // Neither product stock should have changed
        $this->assertEquals(5, $product1->fresh()->stock_quantity);
        $this->assertEquals(2, $product2->fresh()->stock_quantity);
    }

    public function test_invalid_or_nonexistent_product_fails(): void
    {
        $customer = $this->customerUser();

        $response = $this->actingAs($customer)->postJson('/api/orders', [
            'items' => [
                ['product_id' => 99999, 'quantity' => 1],
            ],
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['items.0.product_id']);

        $this->assertDatabaseCount('orders', 0);
    }

    public function test_empty_items_array_fails_validation(): void
    {
        $customer = $this->customerUser();

        $response = $this->actingAs($customer)->postJson('/api/orders', [
            'items' => [],
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['items']);
    }

    public function test_duplicate_items_aggregate_and_deduct_properly(): void
    {
        $customer = $this->customerUser();
        $product = $this->makeProduct(['price_in_paisa' => 100000, 'stock_quantity' => 10]);

        $response = $this->actingAs($customer)->postJson('/api/orders', [
            'items' => [
                ['product_id' => $product->id, 'quantity' => 2],
                ['product_id' => $product->id, 'quantity' => 3],
            ],
        ]);

        $response->assertCreated();

        // 2 + 3 = 5 total quantity, 5 * 100000 = 500000 paisa
        $this->assertDatabaseHas('orders', [
            'user_id' => $customer->id,
            'total_amount_in_paisa' => 500000,
        ]);

        $this->assertEquals(5, $product->fresh()->stock_quantity);
    }

    public function test_customer_can_view_own_order(): void
    {
        $customer = $this->customerUser();
        $product = $this->makeProduct();

        $createRes = $this->actingAs($customer)->postJson('/api/orders', [
            'items' => [
                ['product_id' => $product->id, 'quantity' => 1],
            ],
        ]);

        $orderId = $createRes->json('data.id');

        $response = $this->actingAs($customer)->getJson("/api/orders/{$orderId}");

        $response->assertOk()
            ->assertJsonPath('data.id', $orderId)
            ->assertJsonPath('data.user_id', $customer->id);
    }

    public function test_customer_cannot_view_another_customers_order(): void
    {
        $customer1 = $this->customerUser();
        $customer2 = $this->customerUser();
        $product = $this->makeProduct();

        $createRes = $this->actingAs($customer1)->postJson('/api/orders', [
            'items' => [
                ['product_id' => $product->id, 'quantity' => 1],
            ],
        ]);

        $orderId = $createRes->json('data.id');

        $response = $this->actingAs($customer2)->getJson("/api/orders/{$orderId}");

        $response->assertForbidden();
    }
}
