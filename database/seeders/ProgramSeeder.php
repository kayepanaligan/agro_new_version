<?php

namespace Database\Seeders;

use App\Models\Program;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ProgramSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $programs = [
            [
                'program_name' => 'RSBSA Registration Program',
                'program_description' => 'Registry System for Basic Sectors in Agriculture - National registration program for farmers',
            ],
            [
                'program_name' => 'Agricultural Credit Policy Council (ACPC)',
                'program_description' => 'Provides access to credit and financial services for farmers and fisherfolk',
            ],
            [
                'program_name' => 'PhilRice Pinoy Rice Program',
                'program_description' => 'Support program for rice farmers with training and resources',
            ],
            [
                'program_name' => 'DA-ATP Agricultural Technology Program',
                'program_description' => 'Technology transfer and capacity building for farmers',
            ],
            [
                'program_name' => 'PCA Coconut Development Program',
                'program_description' => 'Philippine Coconut Authority program for coconut farmers',
            ],
        ];

        foreach ($programs as $program) {
            Program::firstOrCreate(
                ['program_name' => $program['program_name']],
                $program
            );
        }
    }
}
