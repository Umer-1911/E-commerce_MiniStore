<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * Seeds only the development admin account.
     * Demo customer accounts (customer@example.com, example@gmail.com) are removed
     * only if they have no associated orders, to preserve referential integrity.
     */
    public function run(): void
    {
        // 1 Admin user (Development credentials only)
        User::updateOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name'     => 'Store Administrator',
                'password' => Hash::make('admin12345'),
                'role'     => 'admin',
                'email_verified_at' => now(),
            ]
        );

        // Remove demo customer accounts only when safe (no referencing orders).
        // If they have orders, we leave them to preserve foreign key integrity.
        $demoEmails = ['customer@example.com', 'example@gmail.com'];
        foreach ($demoEmails as $email) {
            $user = User::where('email', $email)->first();
            if ($user && $user->orders()->count() === 0) {
                $user->delete();
            }
        }
    }
}
