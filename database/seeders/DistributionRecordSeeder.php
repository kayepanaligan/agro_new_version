<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\DistributionRecord;
use App\Models\AllocationType;
use App\Models\AllocationPolicy;

class DistributionRecordSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get existing allocation types (they should already be seeded)
        $allocationTypes = AllocationType::all();
        
        if ($allocationTypes->isEmpty()) {
            $this->command->warn('No allocation types found. Please seed allocation types first.');
            return;
        }

        // Get or create allocation policies
        $policy1 = AllocationPolicy::first();
        $policy2 = AllocationPolicy::skip(1)->first();

        // Sample Distribution Records (Master Level)
        $distributions = [
            [
                'distribution_name' => 'Q1 2026 Rice Subsidy - Zone 1',
                'allocation_type_id' => $allocationTypes->random()->id,
                'source_type' => 'dss_generated',
                'total_quantity' => 0, // Will be auto-calculated from items
                'release_date' => '2026-01-15',
                'note' => 'First quarter rice subsidy distribution for Zone 1 farmers. Priority given to senior citizens and PWD farmers.',
                'allocation_policy_id' => $policy1?->id,
            ],
            [
                'distribution_name' => 'Q1 2026 Fertilizer Distribution - Bonifacio',
                'allocation_type_id' => $allocationTypes->random()->id,
                'source_type' => 'manual',
                'total_quantity' => 0,
                'release_date' => '2026-01-20',
                'note' => 'Manual distribution list from barangay officials. Organic fertilizer for rice farmers.',
                'allocation_policy_id' => null,
            ],
            [
                'distribution_name' => 'Q2 2026 Seeds Distribution - San Jose',
                'allocation_type_id' => $allocationTypes->random()->id,
                'source_type' => 'dss_generated',
                'total_quantity' => 0,
                'release_date' => '2026-04-01',
                'note' => 'High-yield variety seeds distribution. DSS generated based on farm area and previous harvest data.',
                'allocation_policy_id' => $policy2?->id,
            ],
            [
                'distribution_name' => 'Emergency Relief - Typhoon Recovery',
                'allocation_type_id' => $allocationTypes->random()->id,
                'source_type' => 'manual',
                'total_quantity' => 0,
                'release_date' => '2026-03-15',
                'note' => 'Emergency distribution for typhoon-affected farmers in Rizal and Aguinaldo areas.',
                'allocation_policy_id' => null,
            ],
            [
                'distribution_name' => 'Q1 2026 Rice Subsidy - Poblacion',
                'allocation_type_id' => $allocationTypes->random()->id,
                'source_type' => 'dss_generated',
                'total_quantity' => 0,
                'release_date' => '2026-02-01',
                'note' => 'Regular quarterly distribution for Poblacion registered farmers.',
                'allocation_policy_id' => $policy1?->id,
            ],
        ];

        foreach ($distributions as $distribution) {
            DistributionRecord::create($distribution);
        }

        $this->command->info('Distribution records seeded successfully!');
    }
}
