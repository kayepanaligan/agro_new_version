<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Commodity;
use App\Models\Farmer;
use App\Models\Farm;
use App\Models\FarmParcel;
use App\Models\Variety;
use Illuminate\Database\Seeder;

class FarmerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get some commodities and varieties for farm profiles
        $commodities = Commodity::with('varieties')->get();
        
        // Create 20 farmers with comprehensive data
        Farmer::factory()->count(20)->create()->each(function ($farmer) use ($commodities) {
            // Create Farm
            $farm = Farm::create([
                'farmer_id' => $farmer->id,
                'farm_name' => 'Farm ' . $farmer->first_name,
            ]);

            // Create 1-3 Farm Parcels for each farm
            $parcelCount = rand(1, 3);
            for ($i = 1; $i <= $parcelCount; $i++) {
                FarmParcel::create([
                    'farm_id' => $farm->id,
                    'parcel_number' => "Parcel " . $i,
                    'barangay' => ['Poblacion', 'San Isidro', 'Santa Cruz', 'San Jose', 'Rizal'][array_rand(['Poblacion', 'San Isidro', 'Santa Cruz', 'San Jose', 'Rizal'])],
                    'city_municipality' => 'Sample Municipality',
                    'total_farm_area' => rand(1, 20) + (rand(0, 99) / 100),
                    'ownership_type' => ['registered_owner', 'tenant', 'lessee'][array_rand(['registered_owner', 'tenant', 'lessee'])],
                    'parcel_size' => rand(0.5, 10) + (rand(0, 99) / 100),
                    'farm_type' => ['irrigated', 'rainfed_upland', 'rainfed_lowland'][array_rand(['irrigated', 'rainfed_upland', 'rainfed_lowland'])],
                    'is_organic_practitioner' => rand(0, 1),
                    'within_ancestral_domain' => rand(0, 1),
                    'is_agrarian_reform_beneficiary' => rand(0, 1),
                ]);
            }
        });
    }
}
