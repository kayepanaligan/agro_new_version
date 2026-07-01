<?php

namespace Database\Seeders;

use App\Models\Farmer;
use App\Models\FarmerPoint;
use Illuminate\Database\Seeder;

class FarmerPointsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $farmers = Farmer::all();

        $activities = [
            [
                'activity_name' => 'Crop Damage Report Submitted',
                'description' => 'Submitted detailed crop damage assessment',
                'category' => 'reporting',
                'points' => 50,
                'icon' => 'FileText',
            ],
            [
                'activity_name' => 'Farming Activity Logged',
                'description' => 'Recorded planting activity',
                'category' => 'farming',
                'points' => 30,
                'icon' => 'Sprout',
            ],
            [
                'activity_name' => 'Completed Training Module',
                'description' => 'Finished agricultural training course',
                'category' => 'learning',
                'points' => 100,
                'icon' => 'GraduationCap',
            ],
            [
                'activity_name' => 'Community Forum Participation',
                'description' => 'Shared farming insights with community',
                'category' => 'community',
                'points' => 25,
                'icon' => 'Users',
            ],
            [
                'activity_name' => 'Farm Profile Updated',
                'description' => 'Updated farm parcel information',
                'category' => 'farming',
                'points' => 20,
                'icon' => 'Home',
            ],
            [
                'activity_name' => 'Weather Report Submitted',
                'description' => 'Reported local weather conditions',
                'category' => 'reporting',
                'points' => 15,
                'icon' => 'Cloud',
            ],
            [
                'activity_name' => 'Harvest Report Filed',
                'description' => 'Submitted harvest yield data',
                'category' => 'farming',
                'points' => 40,
                'icon' => 'Package',
            ],
        ];

        foreach ($farmers as $farmer) {
            // Add 5-15 random activities per farmer
            $numActivities = rand(5, 15);
            
            for ($i = 0; $i < $numActivities; $i++) {
                $activity = $activities[array_rand($activities)];
                
                FarmerPoint::create([
                    'farmer_id' => $farmer->id,
                    'activity_name' => $activity['activity_name'],
                    'description' => $activity['description'],
                    'category' => $activity['category'],
                    'points' => $activity['points'],
                    'status' => 'verified',
                    'icon' => $activity['icon'],
                    'created_at' => now()->subDays(rand(1, 90)),
                    'verified_at' => now()->subDays(rand(1, 90)),
                ]);
            }
        }

        $this->command->info('Farmer points seeded successfully!');
    }
}
