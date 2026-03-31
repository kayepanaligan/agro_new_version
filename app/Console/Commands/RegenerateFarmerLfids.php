<?php

namespace App\Console\Commands;

use App\Models\Farmer;
use App\Services\LfidGenerator;
use Illuminate\Console\Command;

class RegenerateFarmerLfids extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'lfid:regenerate {--farmer= : Specific farmer ID to regenerate}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Regenerate LFIDs for farmers based on their barangay and current year';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $lfidGenerator = new LfidGenerator();
        $farmerId = $this->option('farmer');

        if ($farmerId) {
            // Regenerate for specific farmer
            $farmer = Farmer::find($farmerId);
            
            if (!$farmer) {
                $this->error("Farmer with ID {$farmerId} not found.");
                return Command::FAILURE;
            }

            $this->info("Regenerating LFID for farmer #{$farmer->id} ({$farmer->first_name} {$farmer->last_name})...");
            
            $lfid = $lfidGenerator->regenerateForFarmer($farmer->id);
            
            if ($lfid) {
                $farmer->update(['lfid' => $lfid]);
                $this->info("✓ LFID generated: {$lfid}");
                return Command::SUCCESS;
            } else {
                $this->warn("⚠ Could not generate LFID. Farmer may be missing address/barangay information.");
                return Command::FAILURE;
            }
        }

        // Regenerate for all farmers
        $this->info('Regenerating LFIDs for all farmers...');
        
        $farmers = Farmer::with('address')->get();
        $success = 0;
        $failed = 0;

        foreach ($farmers as $farmer) {
            $this->line("Processing farmer #{$farmer->id}: {$farmer->first_name} {$farmer->last_name}");
            
            $lfid = $lfidGenerator->regenerateForFarmer($farmer->id);
            
            if ($lfid) {
                $farmer->update(['lfid' => $lfid]);
                $this->line("  ✓ Generated: {$lfid}");
                $success++;
            } else {
                $this->warn("  ⚠ Failed to generate LFID (missing barangay?)");
                $failed++;
            }
        }

        $this->newLine();
        $this->info("Completed!");
        $this->table(
            ['Status', 'Count'],
            [
                ['Successful', $success],
                ['Failed', $failed],
                ['Total', $farmers->count()],
            ]
        );

        return Command::SUCCESS;
    }
}
