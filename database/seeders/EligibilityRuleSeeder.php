<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\EligibilityRule;
use App\Models\AllocationType;

class EligibilityRuleSeeder extends Seeder
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

        $rules = [
            // Age-based rules
            [
                'allocation_type_id' => $allocationTypes->random()->id,
                'field_name' => 'age',
                'operator' => '>=',
                'value' => '60',
                'score' => 80,
            ],
            [
                'allocation_type_id' => $allocationTypes->random()->id,
                'field_name' => 'age',
                'operator' => '<=',
                'value' => '30',
                'score' => 70,
            ],
            // PWD rule
            [
                'allocation_type_id' => $allocationTypes->random()->id,
                'field_name' => 'is_pwd',
                'operator' => '=',
                'value' => '1',
                'score' => 90,
            ],
            // Gender rule
            [
                'allocation_type_id' => $allocationTypes->random()->id,
                'field_name' => 'gender',
                'operator' => '=',
                'value' => 'female',
                'score' => 75,
            ],
            // Farm area rule
            [
                'allocation_type_id' => $allocationTypes->random()->id,
                'field_name' => 'farm_area',
                'operator' => '>=',
                'value' => '2',
                'score' => 85,
            ],
            // Years of farming experience
            [
                'allocation_type_id' => $allocationTypes->random()->id,
                'field_name' => 'years_of_farming',
                'operator' => '>=',
                'value' => '10',
                'score' => 80,
            ],
        ];

        foreach ($rules as $rule) {
            EligibilityRule::create($rule);
        }

        $this->command->info('Eligibility rules seeded successfully!');
    }
}
