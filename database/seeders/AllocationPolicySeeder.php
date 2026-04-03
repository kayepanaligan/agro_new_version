<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\AllocationPolicy;
use App\Models\AllocationType;
use App\Models\EligibilityRule;

class AllocationPolicySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $allocationTypes = AllocationType::all();

        if ($allocationTypes->isEmpty()) {
            $this->command->warn('No allocation types found. Please seed them first.');
            return;
        }

        $policies = [
            [
                'allocation_type_id' => $allocationTypes->first()->id,
                'policy_type' => 'equal',
                'is_active' => true,
                'policy_config' => [
                    'distribution_method' => 'equal_share',
                ],
            ],
            [
                'allocation_type_id' => $allocationTypes->skip(1)->first()->id,
                'policy_type' => 'proportional',
                'is_active' => true,
                'policy_config' => [
                    'distribution_method' => 'proportional_to_farm_area',
                ],
            ],
            [
                'allocation_type_id' => $allocationTypes->skip(2)->first()->id,
                'policy_type' => 'priority',
                'is_active' => true,
                'policy_config' => [
                    'distribution_method' => 'priority_based',
                    'priority_field' => 'age',
                ],
            ],
            [
                'allocation_type_id' => $allocationTypes->random()->id,
                'policy_type' => 'weighted',
                'is_active' => false,
                'policy_config' => [
                    'distribution_method' => 'weighted_score',
                    'weights' => [
                        'age' => 0.3,
                        'farm_area' => 0.4,
                        'years_of_farming' => 0.3,
                    ],
                ],
            ],
        ];

        foreach ($policies as $policy) {
            AllocationPolicy::create($policy);
        }

        $this->command->info('Allocation policies seeded successfully!');
    }
}
