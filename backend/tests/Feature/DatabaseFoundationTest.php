<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class DatabaseFoundationTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test database connection works.
     */
    public function test_database_connection_works(): void
    {
        $this->assertNotNull(DB::connection()->getPdo());
    }

    /**
     * Test product can be created with integer paisa price and stock.
     */
    public function test_product_can_be_created_and_price_stored_in_paisa(): void
    {
        $product = Product::create([
            'name' => 'Handcrafted Peshawari Chappal',
            'description' => 'Genuine leather handmade traditional footwear',
            'price_in_paisa' => 385000, // PKR 3,850
            'stock_quantity' => 25,
            'image_path' => 'products/chappal.jpg',
        ]);

        $this->assertDatabaseHas('products', [
            'id' => $product->id,
            'name' => 'Handcrafted Peshawari Chappal',
            'price_in_paisa' => 385000,
            'stock_quantity' => 25,
        ]);

        $this->assertIsInt($product->price_in_paisa);
        $this->assertEquals(385000, $product->price_in_paisa);
        $this->assertIsInt($product->stock_quantity);
        $this->assertEquals(25, $product->stock_quantity);
    }

    /**
     * Test user to order relationship.
     */
    public function test_user_order_relationship_works(): void
    {
        $user = User::factory()->create([
            'name' => 'Tariq Mehmood',
            'email' => 'tariq@example.com',
            'role' => 'customer',
        ]);

        $order = Order::create([
            'user_id' => $user->id,
            'total_amount_in_paisa' => 500000,
            'status' => 'pending',
        ]);

        // User has many Orders
        $this->assertTrue($user->orders->contains($order));
        $this->assertEquals(1, $user->orders()->count());

        // Order belongs to User
        $this->assertInstanceOf(User::class, $order->user);
        $this->assertEquals($user->id, $order->user->id);
    }

    /**
     * Test order to order-item relationship.
     */
    public function test_order_to_order_item_relationship_works(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->create([
            'price_in_paisa' => 250000,
        ]);

        $order = Order::create([
            'user_id' => $user->id,
            'total_amount_in_paisa' => 500000,
            'status' => 'pending',
        ]);

        $orderItem = OrderItem::create([
            'order_id' => $order->id,
            'product_id' => $product->id,
            'quantity' => 2,
            'price_at_purchase_in_paisa' => 250000,
        ]);

        // Order has many OrderItems
        $this->assertTrue($order->orderItems->contains($orderItem));
        $this->assertEquals(1, $order->orderItems()->count());

        // OrderItem belongs to Order
        $this->assertInstanceOf(Order::class, $orderItem->order);
        $this->assertEquals($order->id, $orderItem->order->id);
    }

    /**
     * Test order-item to product relationship and historical price retention.
     */
    public function test_order_item_to_product_relationship_and_price_retention(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->create([
            'name' => 'Kashmiri Saffron Shawl',
            'price_in_paisa' => 450000,
        ]);

        $order = Order::create([
            'user_id' => $user->id,
            'total_amount_in_paisa' => 450000,
            'status' => 'pending',
        ]);

        $orderItem = OrderItem::create([
            'order_id' => $order->id,
            'product_id' => $product->id,
            'quantity' => 1,
            'price_at_purchase_in_paisa' => 450000,
        ]);

        // OrderItem belongs to Product
        $this->assertInstanceOf(Product::class, $orderItem->product);
        $this->assertEquals($product->id, $orderItem->product->id);
        $this->assertEquals('Kashmiri Saffron Shawl', $orderItem->product->name);

        // Product has many OrderItems
        $this->assertTrue($product->orderItems->contains($orderItem));

        // Test price retention: update product price in catalog
        $product->update(['price_in_paisa' => 600000]);

        // Historical price_at_purchase_in_paisa remains unchanged
        $freshOrderItem = $orderItem->fresh();
        $this->assertEquals(450000, $freshOrderItem->price_at_purchase_in_paisa);
        $this->assertEquals(600000, $freshOrderItem->product->price_in_paisa);
    }

    /**
     * Test user roles (customer vs admin).
     */
    public function test_user_roles_functionality(): void
    {
        $admin = User::factory()->admin()->create();
        $customer = User::factory()->customer()->create();

        $this->assertTrue($admin->isAdmin());
        $this->assertFalse($admin->isCustomer());
        $this->assertEquals('admin', $admin->role);

        $this->assertTrue($customer->isCustomer());
        $this->assertFalse($customer->isAdmin());
        $this->assertEquals('customer', $customer->role);
    }
}
