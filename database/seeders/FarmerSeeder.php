<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Commodity;
use App\Models\Farmer;
use App\Models\FarmerAddress;
use App\Models\Farm;
use App\Models\FarmParcel;
use App\Models\Variety;
use App\Services\LfidGenerator;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class FarmerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get some commodities and varieties for farm profiles
        $commodities = Commodity::with('varieties')->get();
        
        // Initialize LFID Generator
        $lfidGenerator = new LfidGenerator();
        
        // Track generated LFIDs per barangay and year for display
        $generatedLfids = [];
        
        // Create 20 farmers with comprehensive data and addresses
        $farmers = Farmer::factory()
            ->count(20)
            ->withAddress()
            ->create();
        
        // Now generate LFIDs for all farmers (after they and their addresses are created)
        foreach ($farmers as $farmer) {
            // Reload farmer with address relationship
            $farmer->load('address');
            
            // Generate LFID using the service
            $lfid = $lfidGenerator->generate($farmer->id);
            
            if ($lfid) {
                $farmer->update(['lfid' => $lfid]);
                
                // Track for display
                $barangay = $farmer->address?->barangay ?? 'Unknown';
                if (!isset($generatedLfids[$barangay])) {
                    $generatedLfids[$barangay] = [];
                }
                $generatedLfids[$barangay][] = $lfid;
            } else {
                $this->command->warn("⚠ Failed to generate LFID for farmer #{$farmer->id} ({$farmer->first_name} {$farmer->last_name})");
            }
            
            // Set registration status based on completeness
            $registrationStatus = $this->determineRegistrationStatus($farmer);
            $farmer->update(['registration_status' => $registrationStatus]);
            
            // Create Farm and parcels for each farmer
            $this->createFarmAndParcels($farmer, $commodities);
        }
        
        // Display summary of generated LFIDs
        $this->displayLfidSummary($generatedLfids);
    }
    
    /**
     * Determine registration status based on farmer data completeness
     */
    private function determineRegistrationStatus(Farmer $farmer): string
    {
        // Check if farmer has complete data
        $hasRsbsa = !empty($farmer->rsbsa_number);
        $hasCompleteAddress = !empty($farmer->address) && 
                              !empty($farmer->address->barangay) && 
                              !empty($farmer->address->municipality_city);
        $hasContact = !empty($farmer->contact_number);
        
        if ($hasRsbsa && $hasCompleteAddress) {
            // Has RSBSA and complete address - verified
            return 'verified';
        } elseif ($hasCompleteAddress && $hasContact) {
            // Has complete address and contact - ready for submission
            return 'for_submission';
        } else {
            // Newly encoded, incomplete
            return 'not_registered';
        }
    }
    
    /**
     * Create farm and parcels for a farmer
     */
    private function createFarmAndParcels(Farmer $farmer, $commodities): void
    {
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
    }
    
    /**
     * Display summary of generated LFIDs with explanation
     */
    private function displayLfidSummary(array $generatedLfids): void
    {
        $this->command->info("\n========================================");
        $this->command->info("LFID (Local Farmer ID) Generation Summary");
        $this->command->info("========================================\n");
        
        $this->command->info("LFID Format: DCAG-YY-BRGY-XXXX\n");
        $this->command->info("Where:");
        $this->command->info("  DCAG = Digos City Agriculturist (Fixed prefix)");
        $this->command->info("  YY   = Year (last 2 digits, e.g., 26 for 2026)");
        $this->command->info("  BRGY = Barangay Code (3 letters, e.g., APL for Aplaya)");
        $this->command->info("  XXXX = Zero-padded sequence number (e.g., 0001)\n");
        
        $this->command->info("Barangay Code Examples:");
        $this->command->info("  Aplaya     -> APL");
        $this->command->info("  Zone 1     -> ZN1");
        $this->command->info("  San Isidro -> SNI");
        $this->command->info("  Poblacion  -> POB\n");
        
        foreach ($generatedLfids as $barangay => $lfids) {
            $this->command->info("Barangay: {$barangay}");
            $this->command->table(
                ['Sequence', 'LFID', 'Breakdown'],
                array_map(function($lfid, $index) use ($barangay) {
                    $parts = explode('-', $lfid);
                    $breakdown = "DCAG (Digos City Agric) - {$parts[1]} (Year) - {$parts[2]} ({$barangay}) - {$parts[3]} (Seq #" . ($index + 1) . ")";
                    return [
                        ($index + 1),
                        $lfid,
                        $breakdown
                    ];
                }, $lfids, array_keys($lfids))
            );
            $this->command->newLine();
        }
        
        $this->command->info("========================================\n");
    }
}
