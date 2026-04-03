<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\UnitOfMeasure;

class UnitOfMeasureSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $units = [
            ['name' => 'Kilogram', 'code' => 'kg', 'description' => 'Metric unit of weight'],
            ['name' => 'Liter', 'code' => 'L', 'description' => 'Metric unit of volume'],
            ['name' => 'Bag', 'code' => 'bag', 'description' => 'Standard agricultural bag (50kg)'],
            ['name' => 'Sack', 'code' => 'sack', 'description' => 'Standard agricultural sack'],
            ['name' => 'Piece', 'code' => 'pc', 'description' => 'Individual unit count'],
        ];

        foreach ($units as $unit) {
            UnitOfMeasure::firstOrCreate(
                ['code' => $unit['code']],
                $unit
            );
        }

        $this->command->info('Unit of measures seeded successfully!');
    }
}
