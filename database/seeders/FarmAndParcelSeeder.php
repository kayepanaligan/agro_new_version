<?php

namespace Database\Seeders;

use App\Models\Farm;
use App\Models\FarmParcel;
use App\Models\Farmer;
use Illuminate\Database\Seeder;

class FarmAndParcelSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info("\n========================================");
        $this->command->info("Seeding Farms and Farm Parcels");
        $this->command->info("========================================\n");

        // Get all farmers with LFIDs
        $farmers = Farmer::whereNotNull('lfid')->get();

        if ($farmers->isEmpty()) {
            $this->command->error("No farmers found with LFIDs. Please run FarmerSeeder first.");
            return;
        }

        $this->command->info("Found {$farmers->count()} farmers with LFIDs\n");

        $totalFarms = 0;
        $totalParcels = 0;

        // Sample data for realistic farm creation
        $barangays = [
            'Poblacion', 'San Isidro', 'Santa Cruz', 'San Jose', 'Rizal',
            'Zone I', 'Zone II', 'Zone III', 'Aplaya', 'Bato-bato',
            'Budayan', 'Bulacan', 'Cabcaban', 'Genansal', 'Guangan',
            'Igpit', 'Kinamayan', 'Malongon', 'Mintal', 'Sabangan'
        ];

        $municipalities = [
            'Digos City', 'Davao del Sur', 'Sta. Cruz', 'Hagonoy',
            'Padada', 'Sulop', 'Magsaysay', 'Bansalan', 'Matanao'
        ];

        $ownershipTypes = ['registered_owner', 'tenant', 'lessee'];
        $farmTypes = ['irrigated', 'rainfed_upland', 'rainfed_lowland'];
        $documentTypes = ['Titled Land', 'Tax Declaration', 'Free Patent', 'Homestead Patent', 'Lease Agreement'];

        foreach ($farmers as $farmer) {
            // Each farmer gets 1 farm (to reach 100+ farms, we need 100+ farmers)
            // If we have less than 100 farmers, create multiple farms per farmer
            $farmsPerFarmer = max(1, ceil(100 / $farmers->count()));
            
            for ($f = 1; $f <= $farmsPerFarmer; $f++) {
                // Create Farm
                $farm = Farm::create([
                    'farmer_id' => $farmer->id,
                    'farm_name' => "{$farmer->first_name}'s Farm #{$f}",
                ]);

                $totalFarms++;

                // Generate 3-5 parcels for each farm
                $parcelCount = rand(3, 5);

                for ($p = 1; $p <= $parcelCount; $p++) {
                    $barangay = $barangays[array_rand($barangays)];
                    $municipality = $municipalities[array_rand($municipalities)];
                    $ownershipType = $ownershipTypes[array_rand($ownershipTypes)];
                    $farmType = $farmTypes[array_rand($farmTypes)];

                    // Generate realistic landowner names if tenant/lessee
                    $landownerFirstName = null;
                    $landownerMiddleName = null;
                    $landownerSurname = null;
                    
                    if ($ownershipType !== 'registered_owner') {
                        $landownerFirstNames = ['Juan', 'Maria', 'Pedro', 'Ana', 'Jose', 'Rosa', 'Carlos', 'Elena', 'Miguel', 'Sofia'];
                        $landownerMiddleNames = ['Santos', 'Reyes', 'Cruz', 'Garcia', 'Lopez', 'Gonzalez', 'Rodriguez', 'Martinez', 'Hernandez', 'Perez'];
                        $landownerSurnames = ['Dela Cruz', 'Santos', 'Reyes', 'Garcia', 'Lopez', 'Gonzalez', 'Rodriguez', 'Martinez', 'Hernandez', 'Perez'];
                        
                        $landownerFirstName = $landownerFirstNames[array_rand($landownerFirstNames)];
                        $landownerMiddleName = $landownerMiddleNames[array_rand($landownerMiddleNames)];
                        $landownerSurname = $landownerSurnames[array_rand($landownerSurnames)];
                    }

                    FarmParcel::create([
                        'farm_id' => $farm->id,
                        'parcel_number' => "Parcel {$p}",
                        'barangay' => $barangay,
                        'city_municipality' => $municipality,
                        'total_farm_area' => round(rand(100, 5000) / 100, 2), // 1.00 to 50.00 hectares
                        'within_ancestral_domain' => rand(0, 1),
                        'ownership_document_type' => $documentTypes[array_rand($documentTypes)],
                        'is_agrarian_reform_beneficiary' => rand(0, 1),
                        'ownership_type' => $ownershipType,
                        'landowner_first_name' => $landownerFirstName,
                        'landowner_middle_name' => $landownerMiddleName,
                        'landowner_surname' => $landownerSurname,
                        'parcel_size' => round(rand(50, 2000) / 100, 2), // 0.50 to 20.00 hectares
                        'livestock_heads' => rand(0, 1) ? rand(5, 100) : null,
                        'livestock_type' => rand(0, 1) ? ['Poultry', 'Cattle', 'Swine', 'Goat'][array_rand(['Poultry', 'Cattle', 'Swine', 'Goat'])] : null,
                        'farm_type' => $farmType,
                        'is_organic_practitioner' => rand(0, 1),
                        'remarks' => rand(0, 1) ? "Farm parcel located in {$barangay}, {$municipality}" : null,
                    ]);

                    $totalParcels++;
                }

                $this->command->info("✓ Created Farm #{$totalFarms} (FID: {$farm->fid}) with {$parcelCount} parcels for {$farmer->first_name} {$farmer->last_name}");
            }
        }

        $this->command->info("\n========================================");
        $this->command->info("Seeding Complete!");
        $this->command->info("========================================");
        $this->command->info("Total Farms Created: {$totalFarms}");
        $this->command->info("Total Farm Parcels Created: {$totalParcels}");
        $this->command->info("========================================\n");
    }
}
