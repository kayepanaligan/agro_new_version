<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\AllocationType;
use App\Models\UnitOfMeasure;
use App\Models\Program;

class AllocationTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get existing unit of measure and program
        $unitOfMeasure = UnitOfMeasure::first();
        $program = Program::first();

        if (!$unitOfMeasure || !$program) {
            $this->command->warn('Unit of Measure or Program not found. Please seed them first.');
            return;
        }

        $allocationTypes = [
            [
                'name' => 'Rice Subsidy',
                'description' => 'Monthly rice subsidy for registered farmers',
                'amount' => 50.00,
                'unit_of_measurement_id' => $unitOfMeasure->id,
                'program_id' => $program->id,
            ],
            [
                'name' => 'Fertilizer Distribution',
                'description' => 'Organic fertilizer distribution per planting season',
                'amount' => 100.00,
                'unit_of_measurement_id' => $unitOfMeasure->id,
                'program_id' => $program->id,
            ],
            [
                'name' => 'Seeds Distribution',
                'description' => 'High-yield variety seeds for qualified farmers',
                'amount' => 25.00,
                'unit_of_measurement_id' => $unitOfMeasure->id,
                'program_id' => $program->id,
            ],
            [
                'name' => 'Financial Assistance',
                'description' => 'Direct financial assistance for calamity-affected farmers',
                'amount' => 5000.00,
                'unit_of_measurement_id' => $unitOfMeasure->id,
                'program_id' => $program->id,
            ],
        ];

        foreach ($allocationTypes as $type) {
            AllocationType::create($type);
        }

        $this->command->info('Allocation types seeded successfully!');
    }
}
