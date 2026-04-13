<?php

namespace App\Console\Commands;

use App\Models\Farmer;
use App\Services\QrCodeGenerator;
use Illuminate\Console\Command;

class RegenerateFarmerQrcodes extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'qrcode:regenerate {--farmer= : Specific farmer ID to regenerate}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Regenerate QR codes for farmers';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $qrCodeGenerator = new QrCodeGenerator();
        $farmerId = $this->option('farmer');

        if ($farmerId) {
            // Regenerate for specific farmer
            $farmer = Farmer::find($farmerId);
            
            if (!$farmer) {
                $this->error("Farmer with ID {$farmerId} not found.");
                return Command::FAILURE;
            }

            if (!$farmer->lfid) {
                $this->warn("Farmer #{$farmer->id} does not have an LFID. Please generate LFID first.");
                return Command::FAILURE;
            }

            $this->info("Regenerating QR code for farmer #{$farmer->id} ({$farmer->first_name} {$farmer->last_name})...");
            
            // Delete old QR code if exists
            if ($farmer->qr_code) {
                $qrCodeGenerator->delete($farmer->qr_code);
            }
            
            $qrCodePath = $qrCodeGenerator->generate($farmer);
            $farmer->update(['qr_code' => $qrCodePath]);
            
            $this->info("✓ QR code generated: {$qrCodePath}");
            $this->info("✓ URL: " . route('public.farmer.profile', ['lfid' => $farmer->lfid]));
            return Command::SUCCESS;
        }

        // Regenerate for all farmers
        $this->info('Regenerating QR codes for all farmers with LFIDs...');
        
        $farmers = Farmer::whereNotNull('lfid')->get();
        $success = 0;
        $failed = 0;
        $skipped = 0;

        foreach ($farmers as $farmer) {
            $this->line("Processing farmer #{$farmer->id}: {$farmer->first_name} {$farmer->last_name}");
            
            try {
                // Delete old QR code if exists
                if ($farmer->qr_code) {
                    $qrCodeGenerator->delete($farmer->qr_code);
                }
                
                $qrCodePath = $qrCodeGenerator->generate($farmer);
                $farmer->update(['qr_code' => $qrCodePath]);
                
                $this->line("  ✓ Generated: {$qrCodePath}");
                $success++;
            } catch (\Exception $e) {
                $this->warn("  ⚠ Failed to generate QR code: " . $e->getMessage());
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
