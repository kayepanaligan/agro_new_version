<?php

namespace Database\Seeders;

use App\Models\Farm;
use App\Models\FarmParcel;
use Illuminate\Database\Seeder;

class BackfillFarmIdsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info("\n========================================");
        $this->command->info("Backfilling FIDs and FPIDs");
        $this->command->info("========================================\n");

        // Get farms without FID
        $farmsWithoutFid = Farm::whereNull('fid')->get();
        
        if ($farmsWithoutFid->isEmpty()) {
            $this->command->info("All farms already have FIDs. Nothing to backfill.\n");
            return;
        }

        $this->command->info("Found {$farmsWithoutFid->count()} farms without FID\n");

        $backfilledFarms = 0;
        $backfilledParcels = 0;

        foreach ($farmsWithoutFid as $farm) {
            // Generate FID for the farm
            $farm->generateFid();
            
            if ($farm->fid) {
                $backfilledFarms++;
                $this->command->info("✓ Generated FID: {$farm->fid} for Farm #{$farm->id}");
                
                // Now generate FPIDs for all parcels of this farm that don't have FPID
                $parcelsWithoutFpid = FarmParcel::where('farm_id', $farm->id)
                    ->whereNull('fpid')
                    ->get();
                
                foreach ($parcelsWithoutFpid as $parcel) {
                    $parcel->generateFpid();
                    
                    if ($parcel->fpid) {
                        $backfilledParcels++;
                    }
                }
            }
        }

        $this->command->info("\n========================================");
        $this->command->info("Backfill Complete!");
        $this->command->info("========================================");
        $this->command->info("Farms Backfilled: {$backfilledFarms}");
        $this->command->info("Parcels Backfilled: {$backfilledParcels}");
        $this->command->info("========================================\n");
    }
}
