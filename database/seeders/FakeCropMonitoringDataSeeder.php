<?php

namespace Database\Seeders;

use App\Models\CropMonitoringCategory;
use App\Models\CropMonitoringFolder;
use App\Models\CropMonitoringItem;
use App\Models\CropMonitoringUpdater;
use App\Models\Commodity;
use App\Models\Farm;
use App\Models\User;
use App\Models\Variety;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class FakeCropMonitoringDataSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('🌱 Generating fake crop monitoring data...');

        $categories = CropMonitoringCategory::all();
        $commodities = Commodity::all();
        $varieties = Variety::all();
        $users = User::all();
        $farms = Farm::limit(50)->get();

        if ($categories->isEmpty() || $commodities->isEmpty()) {
            $this->command->error('❌ Categories or Commodities not found. Please run base seeders first.');
            return;
        }

        if ($users->isEmpty()) {
            $this->command->error('❌ No users found. Please seed users first.');
            return;
        }

        // Folder name templates
        $folderTemplates = [
            'Crop Damage Observation' => [
                '{} Disease Monitoring - Field {}',
                '{} Pest Infestation Tracking - Area {}',
                'Weather Damage Assessment - {}',
                '{} Blight Outbreak Monitoring',
                'Viral Infection Tracking - {} Plot {}',
                'Fungal Disease Progression - {}',
                'Insect Damage Documentation - Field {}',
                '{} Nutrient Deficiency Observation',
            ],
            'Growth Experimentation' => [
                '{} Variety Performance Trial - Plot {}',
                'Fertilizer Impact Study - {}',
                '{} Growth Rate Analysis',
                'Irrigation Method Comparison - {}',
                '{} Hybrid Testing - Field {}',
                'Planting Density Experiment - {}',
                '{} Yield Optimization Study',
            ],
            'Soil Health Assessment' => [
                '{} Soil Quality Monitoring - Field {}',
                'pH Level Tracking - {} Area {}',
                '{} Organic Matter Analysis',
                'Soil Microbial Activity Study - {}',
                '{} Nutrient Content Assessment',
                'Soil Erosion Monitoring - {}',
            ],
            'Yield Monitoring' => [
                '{} Harvest Tracking - Field {}',
                'Yield Performance Analysis - {}',
                '{} Production Monitoring',
                'Crop Quality Assessment - {} Plot {}',
                '{} Post-Harvest Evaluation',
                'Yield Comparison Study - {}',
            ],
        ];

        $descriptions = [
            'Comprehensive monitoring and documentation of crop conditions with regular assessments and detailed observations.',
            'Systematic tracking of growth patterns and environmental factors affecting crop development.',
            'Detailed analysis of disease progression and treatment effectiveness over time.',
            'Long-term study of variety performance under local growing conditions.',
            'Regular monitoring of soil health indicators and their impact on crop productivity.',
            'Post-disaster recovery assessment and implementation of remedial measures.',
            'Experimental trial evaluating new agricultural techniques and their effectiveness.',
            'Seasonal yield monitoring with focus on quality metrics and production efficiency.',
        ];

        $itemTemplates = [
            'Initial Assessment',
            'Week 1 Observation',
            'Week 2 Progress Check',
            'Mid-Phase Evaluation',
            'Week 4 Measurement',
            'Treatment Application',
            'Post-Treatment Check',
            'Week 6 Analysis',
            'Recovery Assessment',
            'Final Evaluation',
            'Harvest Preparation',
            'Yield Documentation',
        ];

        $weatherConditions = ['Sunny', 'Partly Cloudy', 'Cloudy', 'Rainy', 'Overcast', 'Light Rain', 'Thunderstorms', 'Windy'];
        
        $descriptions_items = [
            'Initial observations recorded with detailed measurements and photographic documentation.',
            'Significant changes noted in plant health and growth patterns.',
            'Progressive improvement observed following intervention measures.',
            'Critical data points collected for comparative analysis and future reference.',
            'Environmental conditions favorable for continued monitoring and growth.',
            'Unexpected developments require further investigation and additional monitoring.',
            'Quantitative measurements show positive trends in key performance indicators.',
            'Comprehensive assessment completed with actionable recommendations for next phase.',
            'Baseline measurements established for ongoing comparative studies.',
            'Intervention strategies implemented based on previous observations.',
        ];

        $createdFolders = 0;
        $createdItems = 0;
        $createdUpdaters = 0;

        // Generate 100 monitoring folders (will skip those without varieties)
        for ($f = 0; $f < 100; $f++) {
            // Random category
            $category = $categories->random();
            $categoryName = $category->category_name;
            
            // Determine folder name template based on category
            if (str_contains($categoryName, 'Damage')) {
                $templates = $folderTemplates['Crop Damage Observation'];
            } elseif (str_contains($categoryName, 'Experiment')) {
                $templates = $folderTemplates['Growth Experimentation'];
            } elseif (str_contains($categoryName, 'Soil')) {
                $templates = $folderTemplates['Soil Health Assessment'];
            } else {
                $templates = $folderTemplates['Yield Monitoring'];
            }

            // Random commodity and variety
            $commodity = $commodities->random();
            $commodityVarieties = $varieties->where('commodity_id', $commodity->id);
            
            // Skip this iteration if commodity has no varieties
            if ($commodityVarieties->isEmpty()) {
                continue;
            }
            
            $variety = $commodityVarieties->random();

            // Generate folder name
            $template = $templates[array_rand($templates)];
            $folderName = str_replace('{}', $commodity->name, $template);
            $folderName = str_replace('{}', rand(1, 20), $folderName);

            // Random date in the past 6 months
            $startDate = Carbon::now()->subMonths(rand(1, 6))->subDays(rand(0, 30));

            // Create folder
            $folder = CropMonitoringFolder::create([
                'folder_name' => $folderName,
                'description' => $descriptions[array_rand($descriptions)],
                'category_id' => $category->crop_monitoring_category_id,
                'commodity_id' => $commodity->id,
                'variety_id' => $variety->id,
            ]);

            $createdFolders++;

            // Create 3-5 random updaters per folder
            $updaterCount = rand(3, 5);
            $updaterUsers = $users->random(min($updaterCount, $users->count()));
            
            foreach ($updaterUsers as $user) {
                CropMonitoringUpdater::create([
                    'folder_id' => $folder->crop_monitoring_folder_id,
                    'user_id' => $user->id,
                    'updated_at' => $startDate->copy()->addDays(rand(1, 60)),
                ]);
                $createdUpdaters++;
            }

            // Create 4-12 timeline items per folder
            $itemCount = rand(4, 12);
            $itemsToCreate = min($itemCount, count($itemTemplates));

            for ($i = 0; $i < $itemsToCreate; $i++) {
                $observationDate = $startDate->copy()->addDays($i * rand(5, 10));
                $user = $users->random();

                CropMonitoringItem::create([
                    'folder_id' => $folder->crop_monitoring_folder_id,
                    'item_name' => $itemTemplates[$i],
                    'description' => $descriptions_items[array_rand($descriptions_items)],
                    'latitude' => 6.7000 + (rand(-200, 200) / 10000), // Random GPS near Digos area
                    'longitude' => 125.3300 + (rand(-200, 200) / 10000),
                    'temperature' => rand(20, 36) + (rand(0, 9) / 10), // 20-36°C
                    'weather_condition' => $weatherConditions[array_rand($weatherConditions)],
                    'humidity' => rand(55, 98), // 55-98%
                    'wind_speed' => rand(3, 30) + (rand(0, 9) / 10), // 3-30 km/h
                    'weather_notes' => 'Weather conditions documented during observation period with standard equipment.',
                    'media_path' => rand(0, 100) < 60 ? 'monitoring/photos/observation_' . rand(1, 50) . '.jpg' : null,
                    'updated_by' => $user->id,
                    'observation_date' => $observationDate,
                    'created_at' => $observationDate,
                    'updated_at' => $observationDate,
                ]);

                $createdItems++;
            }
        }

        $this->command->info("✅ Crop monitoring data generation complete!");
        $this->command->info("📁 Created {$createdFolders} monitoring folders");
        $this->command->info("📝 Created {$createdItems} timeline items");
        $this->command->info("👥 Created {$createdUpdaters} updater records");
    }
}
