<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrderHistoryAndAdminManagementTest extends TestCase
{
    use RefreshDatabase;

    private function customerUser(array $overrides = []): User
    {
        return User::factory()->create(array_merge(['role' => 'customer'], $overrides));
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
            'price_in_paisa' => 150000,
            'stock_quantity' => 20,
        ], $overrides));
    }

    private function createOrderFor(User $user, string $status = 'pending', int $quantity = 1): Order
    {
        $product = $this->makeProduct();
        $order = Order::create([
            'user_id' => $user->id,
            'total_amount_in_paisa' => $product->price_in_paisa * $quantity,
            'status' => $status,
        ]);

        OrderItem::create([
            'order_id' => $order->id,
            'product_id' => $product->id,
            'quantity' => $quantity,
            'price_at_purchase_in_paisa' => $product->price_in_paisa,
        ]);

        return $order;
    }

    // -----------------------------------------------------------------------
    // Customer Order History Tests
    // -----------------------------------------------------------------------

    public function test_guest_cannot_view_order_history(): void
    {
        $response = $this->getJson('/api/orders');
        $response->assertUnauthorized();
    }

    public function test_guest_cannot_view_order_details(): void
    {
        $customer = $this->customerUser();
        $order = $this->createOrderFor($customer);

        $response = $this->getJson("/api/orders/{$order->id}");
        $response->assertUnauthorized();
    }

    public function test_customer_can_view_only_own_orders(): void
    {
        $customer1 = $this->customerUser();
        $customer2 = $this->customerUser();

        $this->createOrderFor($customer1, 'pending', 1);
        $this->createOrderFor($customer1, 'processing', 2);
        $this->createOrderFor($customer2, 'pending', 3);

        $response = $this->actingAs($customer1)->getJson('/api/orders');

        $response->assertOk()
            ->assertJsonCount(2, 'data');

        $orderUserIds = collect($response->json('data'))->pluck('user_id')->all();
        $this->assertEquals([$customer1->id, $customer1->id], $orderUserIds);
    }

    public function test_customer_order_history_includes_required_fields(): void
    {
        $customer = $this->customerUser();
        $order = $this->createOrderFor($customer, 'pending', 2);

        $response = $this->actingAs($customer)->getJson('/api/orders');

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'user_id',
                        'total_amount_in_paisa',
                        'status',
                        'created_at',
                        'order_items' => [
                            '*' => [
                                'id',
                                'order_id',
                                'product_id',
                                'quantity',
                                'price_at_purchase_in_paisa',
                                'product' => [
                                    'id',
                                    'name',
                                ],
                            ],
                        ],
                    ],
                ],
            ]);
    }

    public function test_customer_cannot_access_another_customers_order(): void
    {
        $customer1 = $this->customerUser();
        $customer2 = $this->customerUser();

        $order2 = $this->createOrderFor($customer2);

        $response = $this->actingAs($customer1)->getJson("/api/orders/{$order2->id}");

        $response->assertForbidden()
            ->assertJsonPath('message', 'Unauthorized access to order.');
    }

    // -----------------------------------------------------------------------
    // Admin Order Management Tests
    // -----------------------------------------------------------------------

    public function test_guest_cannot_access_admin_orders(): void
    {
        $response = $this->getJson('/api/admin/orders');
        $response->assertUnauthorized();
    }

    public function test_customer_cannot_access_admin_orders(): void
    {
        $customer = $this->customerUser();

        $response = $this->actingAs($customer)->getJson('/api/admin/orders');
        $response->assertForbidden();
    }

    public function test_admin_can_view_all_orders(): void
    {
        $admin = $this->adminUser();
        $customer1 = $this->customerUser();
        $customer2 = $this->customerUser();

        $this->createOrderFor($customer1);
        $this->createOrderFor($customer2);

        $response = $this->actingAs($admin)->getJson('/api/admin/orders');

        $response->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'user' => ['id', 'name', 'email'],
                        'total_amount_in_paisa',
                        'status',
                        'created_at',
                        'order_items',
                    ],
                ],
            ]);
    }

    public function test_admin_can_view_single_order_details(): void
    {
        $admin = $this->adminUser();
        $customer = $this->customerUser();
        $order = $this->createOrderFor($customer);

        $response = $this->actingAs($admin)->getJson("/api/admin/orders/{$order->id}");

        $response->assertOk()
            ->assertJsonPath('data.id', $order->id)
            ->assertJsonPath('data.user.email', $customer->email);
    }

    public function test_admin_can_update_status_progressively(): void
    {
        $admin = $this->adminUser();
        $customer = $this->customerUser();
        $order = $this->createOrderFor($customer, 'pending');

        // pending -> processing
        $res1 = $this->actingAs($admin)->patchJson("/api/admin/orders/{$order->id}/status", [
            'status' => 'processing',
        ]);
        $res1->assertOk()->assertJsonPath('data.status', 'processing');

        // processing -> shipped
        $res2 = $this->actingAs($admin)->patchJson("/api/admin/orders/{$order->id}/status", [
            'status' => 'shipped',
        ]);
        $res2->assertOk()->assertJsonPath('data.status', 'shipped');

        // shipped -> completed
        $res3 = $this->actingAs($admin)->patchJson("/api/admin/orders/{$order->id}/status", [
            'status' => 'completed',
        ]);
        $res3->assertOk()->assertJsonPath('data.status', 'completed');
    }

    public function test_admin_can_cancel_active_order(): void
    {
        $admin = $this->adminUser();
        $customer = $this->customerUser();
        $order = $this->createOrderFor($customer, 'pending');

        $response = $this->actingAs($admin)->patchJson("/api/admin/orders/{$order->id}/status", [
            'status' => 'cancelled',
        ]);

        $response->assertOk()
            ->assertJsonPath('data.status', 'cancelled');
    }

    public function test_terminal_status_completed_cannot_be_changed(): void
    {
        $admin = $this->adminUser();
        $customer = $this->customerUser();
        $order = $this->createOrderFor($customer, 'completed');

        $response = $this->actingAs($admin)->patchJson("/api/admin/orders/{$order->id}/status", [
            'status' => 'shipped',
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['status']);

        $this->assertEquals('completed', $order->fresh()->status);
    }

    public function test_terminal_status_cancelled_cannot_be_changed(): void
    {
        $admin = $this->adminUser();
        $customer = $this->customerUser();
        $order = $this->createOrderFor($customer, 'cancelled');

        $response = $this->actingAs($admin)->patchJson("/api/admin/orders/{$order->id}/status", [
            'status' => 'processing',
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['status']);

        $this->assertEquals('cancelled', $order->fresh()->status);
    }

    public function test_backward_status_change_is_prevented(): void
    {
        $admin = $this->adminUser();
        $customer = $this->customerUser();
        $order = $this->createOrderFor($customer, 'shipped');

        // Attempting to revert from shipped back to processing
        $response = $this->actingAs($admin)->patchJson("/api/admin/orders/{$order->id}/status", [
            'status' => 'processing',
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['status']);

        $this->assertEquals('shipped', $order->fresh()->status);
    }

    public function test_invalid_status_value_is_rejected(): void
    {
        $admin = $this->adminUser();
        $customer = $this->customerUser();
        $order = $this->createOrderFor($customer, 'pending');

        $response = $this->actingAs($admin)->patchJson("/api/admin/orders/{$order->id}/status", [
            'status' => 'flying_to_moon',
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['status']);
    }
}
