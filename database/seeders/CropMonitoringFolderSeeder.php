<?php

namespace Database\Seeders;

use App\Models\CropMonitoringCategory;
use App\Models\CropMonitoringFolder;
use App\Models\CropMonitoringItem;
use App\Models\CropMonitoringUpdater;
use App\Models\Commodity;
use App\Models\User;
use App\Models\Variety;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class CropMonitoringFolderSeeder extends Seeder
{
    public function run(): void
    {
        $categories = CropMonitoringCategory::all();
        $commodities = Commodity::all();
        $users = User::where('role_id', '!=', null)->take(5)->get(); // Get admin users

        if ($categories->isEmpty() || $commodities->isEmpty()) {
            $this->command->error('Categories or Commodities not found. Please run base seeders first.');
            return;
        }

        // Find rice and corn commodities
        $rice = $commodities->firstWhere('name', 'Rice');
        $corn = $commodities->firstWhere('name', 'Corn');

        if (!$rice || !$corn) {
            $this->command->error('Rice or Corn commodity not found.');
            return;
        }

        // Get varieties for rice and corn
        $riceVarieties = Variety::where('commodity_id', $rice->id)->take(3)->get();
        $cornVarieties = Variety::where('commodity_id', $corn->id)->take(2)->get();

        $folders = [
            [
                'folder_name' => 'Rice Blast Monitoring - Field A',
                'description' => 'Tracking rice blast disease progression in irrigated field with PSB Rc82 variety',
                'category' => $categories->firstWhere('category_name', 'Crop Damage Observation'),
                'commodity' => $rice,
                'variety' => $riceVarieties[0] ?? null,
                'items_count' => 5,
                'start_date' => Carbon::parse('2024-11-01'),
            ],
            [
                'folder_name' => 'Nitrogen Treatment Experiment',
                'description' => 'Weekly monitoring of nitrogen fertilizer impact on NSIC Rc222 growth',
                'category' => $categories->firstWhere('category_name', 'Growth Experimentation'),
                'commodity' => $rice,
                'variety' => $riceVarieties[1] ?? null,
                'items_count' => 8,
                'start_date' => Carbon::parse('2024-10-15'),
            ],
            [
                'folder_name' => 'Typhoon Recovery Tracking',
                'description' => 'Post-typhoon damage assessment and recovery monitoring',
                'category' => $categories->firstWhere('category_name', 'Crop Damage Observation'),
                'commodity' => $rice,
                'variety' => $riceVarieties[2] ?? null,
                'items_count' => 4,
                'start_date' => Carbon::parse('2024-12-01'),
            ],
            [
                'folder_name' => 'New Variety Trial - DKC6913',
                'description' => 'Evaluating performance of new corn hybrid variety DKC6913',
                'category' => $categories->firstWhere('category_name', 'Growth Experimentation'),
                'commodity' => $corn,
                'variety' => $cornVarieties[0] ?? null,
                'items_count' => 6,
                'start_date' => Carbon::parse('2024-09-20'),
            ],
            [
                'folder_name' => 'Organic Fertilizer Impact Study',
                'description' => 'Long-term monitoring of organic fertilizer effects on soil health and crop yield',
                'category' => $categories->firstWhere('category_name', 'Soil Health Assessment'),
                'commodity' => $rice,
                'variety' => $riceVarieties[0] ?? null,
                'items_count' => 7,
                'start_date' => Carbon::parse('2024-08-10'),
            ],
            [
                'folder_name' => 'Drought Stress Recovery',
                'description' => 'Monitoring crop recovery after extended drought period',
                'category' => $categories->firstWhere('category_name', 'Yield Monitoring'),
                'commodity' => $rice,
                'variety' => $riceVarieties[1] ?? null,
                'items_count' => 5,
                'start_date' => Carbon::parse('2024-11-15'),
            ],
        ];

        foreach ($folders as $folderData) {
            if (!$folderData['variety']) {
                continue;
            }

            // Create folder
            $folder = CropMonitoringFolder::create([
                'folder_name' => $folderData['folder_name'],
                'description' => $folderData['description'],
                'category_id' => $folderData['category']->crop_monitoring_category_id,
                'commodity_id' => $folderData['commodity']->id,
                'variety_id' => $folderData['variety']->id,
            ]);

            // Create updaters (3-5 random admins per folder to ensure avatar group shows)
            $updaterUsers = $users->random(min(5, max(3, $users->count())));
            foreach ($updaterUsers as $user) {
                CropMonitoringUpdater::create([
                    'folder_id' => $folder->crop_monitoring_folder_id,
                    'user_id' => $user->id,
                    'updated_at' => $folderData['start_date']->copy()->addDays(rand(1, 30)),
                ]);
            }

            // Create timeline items
            $this->createTimelineItems($folder, $folderData, $users);

            $this->command->info("Created folder '{$folderData['folder_name']}' with {$folderData['items_count']} timeline items");
        }

        $this->command->info(count($folders) . ' crop monitoring folders seeded successfully!');
    }

    private function createTimelineItems($folder, $folderData, $users): void
    {
        $itemTemplates = [
            'damage' => [
                'Initial Assessment',
                'Week 1 Progress Check',
                'Week 2 Disease Spread Analysis',
                'Treatment Application',
                'Post-Treatment Evaluation',
                'Recovery Phase 1',
                'Recovery Phase 2',
                'Final Assessment',
            ],
            'experiment' => [
                'Baseline Measurement',
                'Week 1 Observation',
                'Week 2 Growth Check',
                'Mid-Term Evaluation',
                'Week 4 Measurement',
                'Week 6 Final Check',
                'Harvest Preparation',
                'Yield Analysis',
            ],
            'soil' => [
                'Initial Soil Test',
                'Amendment Application',
                'Week 2 Soil pH Check',
                'Nutrient Level Assessment',
                'Microbial Activity Test',
                'Plant Response Evaluation',
                'Final Soil Analysis',
            ],
            'yield' => [
                'Pre-Stress Baseline',
                'Stress Period Documentation',
                'Irrigation Resumption',
                'Recovery Week 1',
                'Recovery Week 2',
                'Yield Projection Update',
                'Final Harvest Assessment',
            ],
        ];

        // Select appropriate templates based on category
        $categoryName = $folderData['category']->category_name;
        if (str_contains($categoryName, 'Damage')) {
            $templates = $itemTemplates['damage'];
        } elseif (str_contains($categoryName, 'Experiment')) {
            $templates = $itemTemplates['experiment'];
        } elseif (str_contains($categoryName, 'Soil')) {
            $templates = $itemTemplates['soil'];
        } else {
            $templates = $itemTemplates['yield'];
        }

        $descriptions = [
            'Initial observations recorded with detailed measurements and photographic evidence.',
            'Significant changes noted in plant morphology and color patterns.',
            'Progressive improvement observed following intervention measures.',
            'Critical data points collected for comparative analysis.',
            'Environmental conditions favorable for continued monitoring.',
            'Unexpected developments require further investigation and documentation.',
            'Quantitative measurements show positive trend in key indicators.',
            'Comprehensive assessment completed with recommendations for next phase.',
        ];

        $weatherConditions = ['Sunny', 'Partly Cloudy', 'Cloudy', 'Rainy', 'Overcast', 'Thunderstorms'];

        $startDate = $folderData['start_date'];
        $itemCount = min($folderData['items_count'], count($templates));

        for ($i = 0; $i < $itemCount; $i++) {
            $observationDate = $startDate->copy()->addWeeks($i);
            $user = $users->random();

            CropMonitoringItem::create([
                'folder_id' => $folder->crop_monitoring_folder_id,
                'item_name' => $templates[$i],
                'description' => $descriptions[array_rand($descriptions)],
                'latitude' => 6.7300 + (rand(-100, 100) / 10000), // Random GPS near Digos
                'longitude' => 125.3500 + (rand(-100, 100) / 10000),
                'temperature' => rand(22, 35) + (rand(0, 9) / 10), // 22-35°C
                'weather_condition' => $weatherConditions[array_rand($weatherConditions)],
                'humidity' => rand(60, 95), // 60-95%
                'wind_speed' => rand(5, 25) + (rand(0, 9) / 10), // 5-25 km/h
                'weather_notes' => 'Weather conditions recorded during observation period.',
                'media_path' => rand(0, 1) ? 'monitoring/photos/sample_' . rand(1, 10) . '.jpg' : null,
                'updated_by' => $user->id,
                'observation_date' => $observationDate,
                'created_at' => $observationDate,
                'updated_at' => $observationDate,
            ]);
        }
    }
}
