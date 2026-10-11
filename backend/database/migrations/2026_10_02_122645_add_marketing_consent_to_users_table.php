<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Adds an explicit marketing consent flag to the users table.
     * - Default false: users must opt-in; they are NOT automatically subscribed.
     * - This controls promotional/marketing emails only.
     * - Transactional emails (order confirmations, etc.) are NOT gated by this field.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->boolean('marketing_consent')
                ->default(false)
                ->after('role')
                ->comment('Explicit opt-in for promotional/marketing emails. Does NOT affect transactional order emails.');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('marketing_consent');
        });
    }
};
