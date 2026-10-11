<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            // Order items belong to the order; cascade if the order itself is removed.
            $table->foreignId('order_id')->constrained('orders')->cascadeOnDelete();
            // Products referenced in order history MUST NOT be deleted to maintain historical order integrity.
            $table->foreignId('product_id')->constrained('products')->restrictOnDelete();
            $table->unsignedInteger('quantity');
            // Preserves historical price of the product at the time of purchase in paisa.
            $table->unsignedBigInteger('price_at_purchase_in_paisa');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_items');
    }
};
