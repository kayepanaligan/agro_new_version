<?php

namespace Database\Seeders;

use App\Models\CropDamageRecord;
use App\Models\CropDamageRecordItem;
use App\Models\Farm;
use App\Models\DamageType;
use App\Models\Farmer;
use Illuminate\Database\Seeder;

class CropDamageRecordSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $farmers = Farmer::all();
        $damageTypes = DamageType::all();

        if ($farmers->isEmpty()) {
            $this->command->error('No farmers found. Please run FarmerSeeder first.');
            return;
        }

        if ($damageTypes->isEmpty()) {
            $this->command->error('No damage types found. Please run DamageTypeSeeder first.');
            return;
        }

        // Create farms for each farmer if they don't exist
        $farmers->each(function($farmer) {
            if ($farmer->farms()->count() === 0) {
                $farmer->farms()->create([
                    'farm_name' => $farmer->lfid . '_Farm',
                ]);
            }
        });

        $farms = Farm::all();

        if ($farms->isEmpty()) {
            $this->command->error('No farms found after creation attempt. Check FarmerSeeder.');
            return;
        }

        $this->command->info('Found ' . $farms->count() . ' farms and ' . $damageTypes->count() . ' damage types.');

        // Create Crop Damage Record Folders
        $folders = [
            [
                'name' => 'Rice Blast Outbreak 2024',
                'recorded_date' => now()->subDays(30)->format('Y-m-d'),
                'notes' => 'Major rice blast outbreak affecting multiple farms in the northern region. Monitoring ongoing.',
            ],
            [
                'name' => 'Pest Infestation Q1 2024',
                'recorded_date' => now()->subDays(60)->format('Y-m-d'),
                'notes' => 'Stem borer and planthopper infestations reported across several locations.',
            ],
            [
                'name' => 'Weather Damage - Typhoon Season',
                'recorded_date' => now()->subDays(90)->format('Y-m-d'),
                'notes' => 'Lodging and flood damage from recent typhoon. Assessment ongoing.',
            ],
            [
                'name' => 'Nutrient Deficiency Cases',
                'recorded_date' => now()->subDays(45)->format('Y-m-d'),
                'notes' => 'Various nutrient deficiency cases identified during soil testing program.',
            ],
        ];

        foreach ($folders as $folderData) {
            $folder = CropDamageRecord::create($folderData);
            
            // Create items for this folder (2-5 items per folder)
            $itemsCount = rand(2, 5);
            for ($i = 0; $i < $itemsCount; $i++) {
                $farm = $farms->random();
                $damageType = $damageTypes->random();
                
                CropDamageRecordItem::create([
                    'crop_damage_record_id' => $folder->crop_damage_record_id,
                    'farm_id' => $farm->id,
                    'commodity_name' => 'Rice',
                    'variety_name' => ['PSB Rc82', 'NSIC Rc222', 'PSB Rc4', 'PSB Rc14'][array_rand(['PSB Rc82', 'NSIC Rc222', 'PSB Rc4', 'PSB Rc14'])],
                    'damage_type_id' => $damageType->damage_type_id,
                    'damage_severity' => ['low', 'medium', 'high'][array_rand(['low', 'medium', 'high'])],
                    'status' => ['pending', 'verified', 'closed'][array_rand(['pending', 'verified', 'closed'])],
                    'notes' => $this->generateRandomNotes(),
                ]);
            }
            
            $this->command->info("Created folder '{$folder->name}' with {$itemsCount} items");
        }

        $this->command->info(count($folders) . ' crop damage record folders seeded successfully!');
    }

    private function generateRandomNotes(): string
    {
        $notesList = [
            'Severe damage observed in the field. Immediate intervention recommended.',
            'Moderate damage with gradual progression. Monitoring closely.',
            'Early stage detection. Preventive measures applied.',
            'Advanced stage of damage. Yield loss estimated at 30-40%.',
            'Localized damage affecting specific area only. Containment successful.',
            'Widespread damage across multiple sections. Emergency response activated.',
            'Recovery observed after treatment. Follow-up inspection scheduled.',
            'Progressive improvement noted. Continue current management practices.',
        ];
        
        return $notesList[array_rand($notesList)];
    }
}
