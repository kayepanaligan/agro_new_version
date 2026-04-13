<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get the first admin user or create one if none exists
        $adminUser = User::whereHas('role', function($query) {
            $query->where('name', 'admin');
        })->first();

        if (!$adminUser) {
            $adminUser = User::first();
        }

        $userId = $adminUser ? $adminUser->id : null;

        // Disable foreign key checks to allow truncation
        \Illuminate\Support\Facades\DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        
        // Clear existing categories and commodities
        Category::truncate();
        
        \Illuminate\Support\Facades\DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        $categories = [
            [
                'name' => 'Vegetable',
                'description' => 'Fresh vegetables and leafy greens for healthy eating',
                'user_id' => $userId,
            ],
            [
                'name' => 'Fruit',
                'description' => 'Sweet and nutritious fruits from local farms',
                'user_id' => $userId,
            ],
            [
                'name' => 'Grain',
                'description' => 'Essential grains and cereals for daily consumption',
                'user_id' => $userId,
            ],
            [
                'name' => 'Legume',
                'description' => 'Protein-rich beans, peas, and lentils',
                'user_id' => $userId,
            ],
            [
                'name' => 'Root Crop',
                'description' => 'Underground vegetables and tubers',
                'user_id' => $userId,
            ],
        ];

        foreach ($categories as $category) {
            Category::create($category);
        }
    }
}
