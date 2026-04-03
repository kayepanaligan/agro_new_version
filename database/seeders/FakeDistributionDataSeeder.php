<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\DistributionRecord;
use App\Models\DistributionRecordItem;
use App\Models\Acknowledgement;
use App\Models\AllocationType;
use App\Models\AllocationPolicy;
use App\Models\Farmer;

class FakeDistributionDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('🌱 Generating fake distribution data...');

        // Get existing data
        $allocationTypes = AllocationType::all();
        $policies = AllocationPolicy::all();
        $farmers = Farmer::limit(100)->get();

        if ($allocationTypes->isEmpty()) {
            $this->command->error('❌ No allocation types found. Please seed allocation types first.');
            return;
        }

        if ($farmers->isEmpty()) {
            $this->command->error('❌ No farmers found. Please seed farmers first.');
            return;
        }

        // Generate 20 distribution records
        $distributionNames = [
            'Q{} {} Rice Subsidy - {}',
            'Q{} {} Fertilizer Distribution - {}',
            'Q{} {} Seeds Distribution - {}',
            'Emergency Relief - {} {}',
            'Special Assistance - {} {}',
            'Agricultural Support Program - {} {}',
            'Farm Input Distribution - {} {}',
            'Crop Production Support - {} {}',
        ];

        $barangays = ['Zone 1', 'Zone 2', 'Poblacion', 'Bonifacio', 'San Jose', 'Rizal', 'Aguinaldo', 'Maligaya'];
        $quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
        $years = [2025, 2026];

        $createdDistributions = 0;
        $createdItems = 0;
        $createdAcks = 0;

        for ($i = 0; $i < 20; $i++) {
            $quarter = $quarters[array_rand($quarters)];
            $year = $years[array_rand($years)];
            $barangay = $barangays[array_rand($barangays)];
            
            $nameTemplate = $distributionNames[array_rand($distributionNames)];
            $distributionName = sprintf($nameTemplate, $quarter, $year, $barangay);

            // Check if similar distribution already exists
            $existingSimilar = DistributionRecord::where('distribution_name', 'like', "%{$barangay}%")
                ->whereYear('release_date', $year)
                ->exists();

            if ($existingSimilar && rand(0, 100) < 30) {
                continue; // Skip 30% of the time to avoid too many duplicates
            }

            $allocationType = $allocationTypes->random();
            $sourceType = rand(0, 100) < 60 ? 'dss_generated' : 'manual';
            $releaseDate = now()->subDays(rand(1, 180))->format('Y-m-d');

            // Create distribution record
            $distribution = DistributionRecord::create([
                'distribution_name' => $distributionName,
                'allocation_type_id' => $allocationType->id,
                'source_type' => $sourceType,
                'total_quantity' => 0,
                'release_date' => $releaseDate,
                'note' => $this->generateRandomNote(),
                'allocation_policy_id' => $sourceType === 'dss_generated' && $policies->isNotEmpty() 
                    ? $policies->random()->id 
                    : null,
            ]);

            $createdDistributions++;

            // Generate 5-20 items per distribution
            $itemCount = rand(5, 20);
            $usedFarmers = [];
            $totalQuantity = 0;

            for ($j = 0; $j < $itemCount; $j++) {
                // Pick unique farmer
                $availableFarmers = $farmers->filter(fn($f) => !in_array($f->lfid, $usedFarmers));
                
                if ($availableFarmers->isEmpty()) {
                    break;
                }

                $farmer = $availableFarmers->random();
                $usedFarmers[] = $farmer->lfid;

                // Random quantity (5-150 kg or units)
                $quantity = round(rand(5, 150) + (rand(0, 99) / 100), 2);
                $totalQuantity += $quantity;

                // 75% received, 25% pending
                $status = rand(0, 100) < 75 ? 'received' : 'pending';

                $item = DistributionRecordItem::create([
                    'distribution_record_id' => $distribution->id,
                    'farmer_lfid' => $farmer->lfid,
                    'quantity_allocated' => $quantity,
                    'allocation_policy_id' => $sourceType === 'dss_generated' && $policies->isNotEmpty()
                        ? $policies->random()->id
                        : null,
                    'status' => $status,
                ]);

                $createdItems++;

                // Create acknowledgement for received items (80% chance)
                if ($status === 'received' && rand(0, 100) < 80) {
                    $receivedDate = $item->created_at->copy()->addDays(rand(1, 14));
                    
                    Acknowledgement::create([
                        'distribution_record_item_id' => $item->id,
                        'farmer_lfid' => $farmer->lfid,
                        'received_at' => $receivedDate,
                        'photo_proof' => rand(0, 100) < 40 ? 'acknowledgements/' . $farmer->lfid . '_' . time() . '.jpg' : null,
                        'notes' => $this->generateRandomAcknowledgementNote(),
                    ]);

                    $createdAcks++;
                }
            }

            // Update total quantity
            $distribution->update(['total_quantity' => round($totalQuantity, 2)]);
        }

        $this->command->info("✅ Distribution data generation complete!");
        $this->command->info("📦 Created {$createdDistributions} distribution records");
        $this->command->info("📝 Created {$createdItems} distribution items");
        $this->command->info("✓ Created {$createdAcks} acknowledgements");
    }

    private function generateRandomNote(): ?string
    {
        $notes = [
            'Regular quarterly distribution program for qualified farmers in the area.',
            'Special assistance program approved by the municipal agriculture office.',
            'Emergency relief distribution for affected farmers and fisherfolk.',
            'Part of the national agricultural support initiative.',
            'Coordinated with local barangay officials for efficient distribution.',
            'Priority given to senior citizens, PWD, and women farmers.',
            'Distribution conducted at the barangay covered court.',
            'Beneficiaries selected based on DSS scoring and eligibility criteria.',
            'This distribution is part of the LGU agricultural development program.',
            'Funded through the annual agricultural budget allocation.',
            null, // Some distributions without notes
            'Follow-up distribution to reach remaining qualified beneficiaries.',
            'Special seeds distribution for the upcoming planting season.',
        ];

        return $notes[array_rand($notes)];
    }

    private function generateRandomAcknowledgementNote(): ?string
    {
        $notes = [
            null,
            'Received in good condition. Thank you!',
            'Farmer confirmed receipt via phone call.',
            'Picked up at barangay hall distribution center.',
            'Delivered to farm site. Farmer very satisfied.',
            'Received with minor packaging damage but contents OK.',
            'Early morning delivery. Farmer present.',
            'Verified by barangay official.',
            'Items complete and in good quality.',
            'Farmer expressed gratitude for the assistance.',
            'Distribution was smooth and well-organized.',
            'All items accounted for. No issues reported.',
            'Received on behalf of farmer by family member.',
            'Quality check passed. Farmer satisfied with items.',
        ];

        return $notes[array_rand($notes)];
    }
}
