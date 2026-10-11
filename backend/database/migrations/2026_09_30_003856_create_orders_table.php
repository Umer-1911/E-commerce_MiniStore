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
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            // Restrict user deletion when order records exist to preserve financial/order history.
            $table->foreignId('user_id')->constrained('users')->restrictOnDelete();
            // Total order amount in paisa (1 PKR = 100 paisa)
            $table->unsignedBigInteger('total_amount_in_paisa');
            // Allowed statuses: pending, processing, shipped, completed, cancelled
            $table->string('status')->default('pending');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
