<?php

namespace App\Console\Commands;

use App\Models\Farm;
use App\Services\FarmQrCodeGenerator;
use Illuminate\Console\Command;

class RegenerateFarmQrcodes extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'farm-qrcode:regenerate {--farm= : Specific farm ID to regenerate}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Regenerate QR codes for farms';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $qrCodeGenerator = new FarmQrCodeGenerator();
        $farmId = $this->option('farm');

        if ($farmId) {
            // Regenerate for specific farm
            $farm = Farm::find($farmId);
            
            if (!$farm) {
                $this->error("Farm with ID {$farmId} not found.");
                return Command::FAILURE;
            }

            if (!$farm->fid) {
                $this->warn("Farm #{$farm->id} does not have an FID. Please generate FID first.");
                return Command::FAILURE;
            }

            $this->info("Regenerating QR code for farm #{$farm->id} ({$farm->farm_name})...");
            
            // Delete old QR code if exists
            if ($farm->qr_code) {
                $qrCodeGenerator->delete($farm->qr_code);
            }
            
            $qrCodePath = $qrCodeGenerator->generate($farm);
            $farm->update(['qr_code' => $qrCodePath]);
            
            $this->info("✓ QR code generated: {$qrCodePath}");
            $this->info("✓ URL: " . route('public.farm.profile', ['fid' => $farm->fid]));
            return Command::SUCCESS;
        }

        // Regenerate for all farms
        $this->info('Regenerating QR codes for all farms with FIDs...');
        
        $farms = Farm::whereNotNull('fid')->get();
        $success = 0;
        $failed = 0;

        foreach ($farms as $farm) {
            $this->line("Processing farm #{$farm->id}: {$farm->farm_name}");
            
            try {
                // Delete old QR code if exists
                if ($farm->qr_code) {
                    $qrCodeGenerator->delete($farm->qr_code);
                }
                
                $qrCodePath = $qrCodeGenerator->generate($farm);
                $farm->update(['qr_code' => $qrCodePath]);
                
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
                ['Total', $farms->count()],
            ]
        );

        return Command::SUCCESS;
    }
}
