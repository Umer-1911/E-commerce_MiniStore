<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $products = [
            [
                'name'           => 'Handcrafted Peshawari Chappal',
                'description'    => 'Traditional genuine cowhide leather chappal with durable tyre sole, hand-stitched by master artisans in Khyber Pakhtunkhwa.',
                'category'       => 'Footwear',
                'price_in_paisa' => 385000, // PKR 3,850
                'image_path'     => null,
                'stock_quantity' => 25,
            ],
            [
                'name'           => 'Embroidered Cotton Kurti',
                'description'    => 'Breathable premium lawn cotton tunic featuring intricate threadwork and neck embroidery, ideal for casual and festive occasions.',
                'category'       => 'Clothing',
                'price_in_paisa' => 299000, // PKR 2,990
                'image_path'     => null,
                'stock_quantity' => 40,
            ],
            [
                'name'           => 'Hunza Organic Dry Fruits Assortment (1kg)',
                'description'    => 'Premium valley-fresh gift box containing sun-dried apricots, organic almonds, walnuts, and chilgoza pine nuts from Gilgit-Baltistan.',
                'category'       => 'Food & Groceries',
                'price_in_paisa' => 345000, // PKR 3,450
                'image_path'     => null,
                'stock_quantity' => 30,
            ],
            [
                'name'           => 'Multani Ceramic Blue Pottery Vase',
                'description'    => 'Authentic hand-painted ceramic art vase crafted with centuries-old cobalt blue and turquoise glaze techniques in Multan.',
                'category'       => 'Home Decor',
                'price_in_paisa' => 180000, // PKR 1,800
                'image_path'     => null,
                'stock_quantity' => 15,
            ],
            [
                'name'           => 'Super Kernel Basmati Rice (5kg)',
                'description'    => 'Aged extra-long grain aromatic basmati harvested from the fertile plains of Punjab, known for slender grains and distinctive aroma.',
                'category'       => 'Food & Groceries',
                'price_in_paisa' => 225000, // PKR 2,250
                'image_path'     => null,
                'stock_quantity' => 60,
            ],
            [
                'name'           => 'Pure Organic Beri (Sidr) Honey (500g)',
                'description'    => '100% pure raw unpasteurized wild Sidr blossom honey collected from local beekeepers in the arid hills of Karak.',
                'category'       => 'Food & Groceries',
                'price_in_paisa' => 270000, // PKR 2,700
                'image_path'     => null,
                'stock_quantity' => 20,
            ],
            [
                'name'           => 'Sindhi Ajrak Hand-Block Printed Shawl',
                'description'    => 'Traditional block-printed artisan cotton shawl utilizing natural mineral and vegetable dyes in deep crimson and indigo.',
                'category'       => 'Clothing',
                'price_in_paisa' => 420000, // PKR 4,200
                'image_path'     => null,
                'stock_quantity' => 18,
            ],
            [
                'name'           => 'Chinioti Brass Inlaid Rosewood Box',
                'description'    => 'Masterfully carved solid Sheesham (rosewood) keepsake jewelry box accented with floral brass inlay from Chiniot.',
                'category'       => 'Home Decor',
                'price_in_paisa' => 310000, // PKR 3,100
                'image_path'     => null,
                'stock_quantity' => 12,
            ],
            [
                'name'           => 'Pashmina Wool Winter Shawl',
                'description'    => 'Feather-light and exceptionally warm woven wool shawl with classic self-embroidered borders, perfect for cold evenings.',
                'category'       => 'Clothing',
                'price_in_paisa' => 550000, // PKR 5,500
                'image_path'     => null,
                'stock_quantity' => 10,
            ],
            [
                'name'           => 'Original Kashmiri Kahwa Green Tea (250g)',
                'description'    => 'Traditional spiced loose-leaf green tea blended with organic saffron threads, green cardamom, cinnamon bark, and crushed almonds.',
                'category'       => 'Food & Groceries',
                'price_in_paisa' => 125000, // PKR 1,250
                'image_path'     => null,
                'stock_quantity' => 50,
            ],
        ];

        foreach ($products as $product) {
            Product::updateOrCreate(
                ['name' => $product['name']],
                $product
            );
        }
    }
}
