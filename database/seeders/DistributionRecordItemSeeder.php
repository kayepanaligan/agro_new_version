<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\DistributionRecordItem;
use App\Models\DistributionRecord;
use App\Models\Farmer;
use App\Models\AllocationPolicy;

class DistributionRecordItemSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get all distribution records
        $distributions = DistributionRecord::all();
        
        // Get some farmers for sample data
        $farmers = Farmer::limit(50)->get();
        
        if ($farmers->count() === 0) {
            $this->command->warn('No farmers found. Please seed farmers first.');
            return;
        }

        // Get allocation policies
        $policies = AllocationPolicy::limit(3)->get();

        $items = [];

        foreach ($distributions as $distribution) {
            // Generate 5-15 items per distribution
            $itemCount = rand(5, 15);
            $usedFarmers = [];

            for ($i = 0; $i < $itemCount; $i++) {
                // Pick a random farmer (avoid duplicates within same distribution)
                $availableFarmers = $farmers->filter(fn($f) => !in_array($f->lfid, $usedFarmers));
                
                if ($availableFarmers->isEmpty()) {
                    break;
                }

                $farmer = $availableFarmers->random();
                $usedFarmers[] = $farmer->lfid;

                // Random quantity between 10 and 100
                $quantity = round(rand(10, 100) + (rand(0, 99) / 100), 2);

                // 70% chance of being received, 30% pending
                $status = rand(0, 100) < 70 ? 'received' : 'pending';

                // If DSS generated, assign a policy
                $policyId = null;
                if ($distribution->source_type === 'dss_generated' && $policies->isNotEmpty()) {
                    $policyId = $policies->random()->id;
                }

                $items[] = [
                    'distribution_record_id' => $distribution->id,
                    'farmer_lfid' => $farmer->lfid,
                    'quantity_allocated' => $quantity,
                    'allocation_policy_id' => $policyId,
                    'status' => $status,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }

            // Update total quantity for this distribution
            $distributionTotal = collect($items)
                ->where('distribution_record_id', $distribution->id)
                ->sum('quantity_allocated');
            
            $distribution->update(['total_quantity' => $distributionTotal]);
        }

        // Insert all items
        DistributionRecordItem::insert($items);

        $this->command->info('Distribution record items seeded successfully!');
        $this->command->info('Created ' . count($items) . ' items across ' . $distributions->count() . ' distributions');
    }
}
