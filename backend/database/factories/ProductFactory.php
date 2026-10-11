<?php

namespace Database\Factories;

use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Product>
 */
class ProductFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name'           => fake()->words(3, true),
            'description'    => fake()->paragraph(),
            'category'       => fake()->randomElement(['Clothing', 'Food & Groceries', 'Home Decor', 'Footwear', 'Handicrafts']),
            // 500 PKR to 15,000 PKR in paisa
            'price_in_paisa' => fake()->numberBetween(500, 15000) * 100,
            'image_path'     => null,
            'stock_quantity' => fake()->numberBetween(5, 100),
        ];
    }
}
