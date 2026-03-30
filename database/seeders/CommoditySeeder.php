<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Commodity;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CommoditySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $vegetableCategory = Category::where('name', 'Vegetable')->first();
        $fruitCategory = Category::where('name', 'Fruit')->first();
        $grainCategory = Category::where('name', 'Grain')->first();
        $legumeCategory = Category::where('name', 'Legume')->first();
        $rootCropCategory = Category::where('name', 'Root Crop')->first();

        $commodities = [
            // Vegetables
            [
                'category_id' => $vegetableCategory->id,
                'name' => 'Carrot',
                'description' => 'Fresh orange carrots, rich in vitamins and minerals',
                'image_path' => null,
            ],
            [
                'category_id' => $vegetableCategory->id,
                'name' => 'Tomato',
                'description' => 'Ripe red tomatoes, perfect for salads and cooking',
                'image_path' => null,
            ],
            [
                'category_id' => $vegetableCategory->id,
                'name' => 'Lettuce',
                'description' => 'Crisp green lettuce leaves for fresh salads',
                'image_path' => null,
            ],
            // Fruits
            [
                'category_id' => $fruitCategory->id,
                'name' => 'Banana',
                'description' => 'Sweet yellow bananas, a great source of potassium',
                'image_path' => null,
            ],
            [
                'category_id' => $fruitCategory->id,
                'name' => 'Mango',
                'description' => 'Juicy tropical mangoes with sweet flesh',
                'image_path' => null,
            ],
            [
                'category_id' => $fruitCategory->id,
                'name' => 'Papaya',
                'description' => 'Ripe papayas with orange flesh and black seeds',
                'image_path' => null,
            ],
            // Grains
            [
                'category_id' => $grainCategory->id,
                'name' => 'Rice',
                'description' => 'White rice grains, a staple food for many cultures',
                'image_path' => null,
            ],
            [
                'category_id' => $grainCategory->id,
                'name' => 'Corn',
                'description' => 'Yellow corn kernels, versatile grain for various dishes',
                'image_path' => null,
            ],
            // Legumes
            [
                'category_id' => $legumeCategory->id,
                'name' => 'Mongo Beans',
                'description' => 'Dried mung beans, high in protein and fiber',
                'image_path' => null,
            ],
            [
                'category_id' => $legumeCategory->id,
                'name' => 'Soybeans',
                'description' => 'Protein-rich soybeans for various food products',
                'image_path' => null,
            ],
            // Root Crops
            [
                'category_id' => $rootCropCategory->id,
                'name' => 'Potato',
                'description' => 'Brown-skinned potatoes, versatile cooking ingredient',
                'image_path' => null,
            ],
            [
                'category_id' => $rootCropCategory->id,
                'name' => 'Sweet Potato',
                'description' => 'Orange-fleshed sweet potatoes, naturally sweet and nutritious',
                'image_path' => null,
            ],
            [
                'category_id' => $rootCropCategory->id,
                'name' => 'Cassava',
                'description' => 'Tapioca root, starchy tuber used in many dishes',
                'image_path' => null,
            ],
        ];

        foreach ($commodities as $commodity) {
            Commodity::create($commodity);
        }
    }
}
