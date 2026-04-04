<?php

namespace Database\Seeders;

use App\Models\CropMonitoringCategory;
use Illuminate\Database\Seeder;

class CropMonitoringCategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            [
                'category_name' => 'Crop Damage Observation',
                'description' => 'Monitor and track pest, disease, and environmental damage progression over time',
            ],
            [
                'category_name' => 'Growth Experimentation',
                'description' => 'Track experimental treatments, new varieties, and growth trials',
            ],
            [
                'category_name' => 'Yield Monitoring',
                'description' => 'Observe yield development, harvest predictions, and production metrics',
            ],
            [
                'category_name' => 'Soil Health Assessment',
                'description' => 'Monitor soil conditions, amendments, and fertility changes',
            ],
        ];

        foreach ($categories as $category) {
            CropMonitoringCategory::create($category);
        }

        $this->command->info(count($categories) . ' crop monitoring categories seeded successfully!');
    }
}
