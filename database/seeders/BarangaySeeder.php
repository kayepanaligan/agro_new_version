<?php

namespace Database\Seeders;

use App\Models\Barangay;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class BarangaySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $barangays = [
            ['name' => 'Aplaya'],
            ['name' => 'Balabag'],
            ['name' => 'San Jose (Balutakay)'],
            ['name' => 'Binaton'],
            ['name' => 'Cogon'],
            ['name' => 'Colorado'],
            ['name' => 'Dawis'],
            ['name' => 'Dulangan'],
            ['name' => 'Goma'],
            ['name' => 'Igpit'],
            ['name' => 'Kiagot'],
            ['name' => 'Lungag'],
            ['name' => 'Mahayahay'],
            ['name' => 'Matti'],
            ['name' => 'Kapatagan (Rizal)'],
            ['name' => 'Ruparan'],
            ['name' => 'San Agustin'],
            ['name' => 'San Miguel (Odaca)'],
            ['name' => 'San Roque'],
            ['name' => 'Sinawilan'],
            ['name' => 'Soong'],
            ['name' => 'Tiguman'],
            ['name' => 'Tres De Mayo'],
            ['name' => 'Zone 1 (Poblacion)'],
            ['name' => 'Zone 2 (Poblacion)'],
            ['name' => 'Zone 3 (Poblacion)'],
        ];

        foreach ($barangays as $barangay) {
            Barangay::create($barangay);
        }
    }
}
