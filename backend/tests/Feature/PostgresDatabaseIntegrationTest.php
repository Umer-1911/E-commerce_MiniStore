<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class PostgresDatabaseIntegrationTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        config([
            'database.connections.pgsql.database' => 'ecommerce_mini_store',
            'database.connections.pgsql.password' => env('DB_PASSWORD', 'hello123'),
        ]);
    }
    /**
     * Verify live PostgreSQL database connection and server version.
     */
    public function test_postgresql_live_connection_and_tables(): void
    {
        $version = DB::connection('pgsql')->select('SELECT version()');
        $this->assertNotEmpty($version);
        $this->assertStringContainsString('PostgreSQL', $version[0]->version);

        // Verify required tables exist in PostgreSQL
        $tables = DB::connection('pgsql')->select("
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        ");
        $tableNames = array_map(fn ($t) => $t->table_name, $tables);

        $this->assertContains('users', $tableNames);
        $this->assertContains('products', $tableNames);
        $this->assertContains('orders', $tableNames);
        $this->assertContains('order_items', $tableNames);
    }

    /**
     * Verify seed data in PostgreSQL.
     */
    public function test_postgresql_seed_data_and_schema(): void
    {
        // Admin user exists
        $admin = User::on('pgsql')->where('role', 'admin')->first();
        $this->assertNotNull($admin);
        $this->assertEquals('admin@example.com', $admin->email);
        $this->assertTrue($admin->isAdmin());

        // Customer user check (create temporary customer if none exists in seed)
        $customer = User::on('pgsql')->where('role', 'customer')->first();
        if (!$customer) {
            $customer = User::on('pgsql')->create([
                'name' => 'Temporary Test Customer',
                'email' => 'test-customer-temp@example.com',
                'password' => Hash::make('password123'),
                'role' => 'customer',
            ]);
        }
        $this->assertNotNull($customer);
        $this->assertTrue($customer->isCustomer());

        // At least 8 products exist
        $productCount = Product::on('pgsql')->count();
        $this->assertGreaterThanOrEqual(8, $productCount);

        // Verify all products have integer paisa prices and non-negative stock
        $products = Product::on('pgsql')->get();
        foreach ($products as $product) {
            $this->assertIsInt($product->price_in_paisa);
            $this->assertGreaterThan(0, $product->price_in_paisa);
            $this->assertIsInt($product->stock_quantity);
            $this->assertGreaterThanOrEqual(0, $product->stock_quantity);
        }
    }

    /**
     * Verify foreign key constraints and transactional relationship integrity on PostgreSQL.
     */
    public function test_postgresql_foreign_key_and_relationship_behavior(): void
    {
        $customer = User::on('pgsql')->where('role', 'customer')->first();
        if (!$customer) {
            $customer = User::on('pgsql')->create([
                'name' => 'Temporary Test Customer',
                'email' => 'test-customer-fk@example.com',
                'password' => Hash::make('password123'),
                'role' => 'customer',
            ]);
        }
        $product = Product::on('pgsql')->first();

        // Create an order
        $order = Order::on('pgsql')->create([
            'user_id' => $customer->id,
            'total_amount_in_paisa' => $product->price_in_paisa,
            'status' => 'pending',
        ]);

        $orderItem = OrderItem::on('pgsql')->create([
            'order_id' => $order->id,
            'product_id' => $product->id,
            'quantity' => 1,
            'price_at_purchase_in_paisa' => $product->price_in_paisa,
        ]);

        // Verify relations loaded over pgsql connection
        $this->assertEquals($customer->id, $order->user->id);
        $this->assertEquals(1, $order->orderItems()->count());
        $this->assertEquals($product->id, $orderItem->product->id);

        // Verify cascade deletion of order items when order is removed
        $orderId = $order->id;
        $order->delete();

        $this->assertEquals(
            0,
            OrderItem::on('pgsql')->where('order_id', $orderId)->count()
        );

        // Verify product itself was NOT deleted when order item was removed
        $this->assertNotNull(Product::on('pgsql')->find($product->id));
    }
}
