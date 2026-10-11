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
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description');
            // Monetary values use smallest-currency-unit convention (1 PKR = 100 paisa).
            // Example: PKR 2,500 is stored as 250000 paisa.
            $table->unsignedBigInteger('price_in_paisa');
            $table->string('image_path')->nullable();
            $table->unsignedInteger('stock_quantity')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
