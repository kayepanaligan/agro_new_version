<?php

namespace Database\Seeders;

use App\Models\DamageCategory;
use Illuminate\Database\Seeder;

class DamageCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'damage_category_name' => 'Pest Damage',
                'damage_category_description' => 'Damage caused by agricultural pests and insects',
            ],
            [
                'damage_category_name' => 'Disease Damage',
                'damage_category_description' => 'Damage caused by plant diseases and pathogens',
            ],
            [
                'damage_category_name' => 'Weather Damage',
                'damage_category_description' => 'Damage caused by adverse weather conditions',
            ],
            [
                'damage_category_name' => 'Nutrient Deficiency',
                'damage_category_description' => 'Damage caused by lack of essential nutrients',
            ],
            [
                'damage_category_name' => 'Physical Damage',
                'damage_category_description' => 'Damage caused by physical factors or mechanical injury',
            ],
        ];

        foreach ($categories as $category) {
            DamageCategory::create($category);
        }
    }
}
