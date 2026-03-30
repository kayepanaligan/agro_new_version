<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Vegetable',
                'description' => 'Fresh vegetables and leafy greens for healthy eating',
            ],
            [
                'name' => 'Fruit',
                'description' => 'Sweet and nutritious fruits from local farms',
            ],
            [
                'name' => 'Grain',
                'description' => 'Essential grains and cereals for daily consumption',
            ],
            [
                'name' => 'Legume',
                'description' => 'Protein-rich beans, peas, and lentils',
            ],
            [
                'name' => 'Root Crop',
                'description' => 'Underground vegetables and tubers',
            ],
        ];

        foreach ($categories as $category) {
            Category::create($category);
        }
    }
}
