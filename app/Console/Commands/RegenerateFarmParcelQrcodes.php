<?php

namespace App\Console\Commands;

use App\Models\FarmParcel;
use App\Services\FarmParcelQrCodeGenerator;
use Illuminate\Console\Command;

class RegenerateFarmParcelQrcodes extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'farm-parcel-qrcode:regenerate';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Regenerate QR codes for all existing farm parcels';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting QR code regeneration for farm parcels...');
        
        $parcels = FarmParcel::whereNotNull('fpid')->get();
        $count = $parcels->count();
        
        if ($count === 0) {
            $this->warn('No farm parcels with FPID found.');
            return Command::SUCCESS;
        }
        
        $this->info("Found {$count} farm parcel(s) with FPID.");
        
        $bar = $this->output->createProgressBar($count);
        $bar->start();
        
        $qrCodeGenerator = new FarmParcelQrCodeGenerator();
        $successCount = 0;
        $failCount = 0;
        
        foreach ($parcels as $parcel) {
            try {
                // Delete old QR code if exists
                if ($parcel->qr_code) {
                    $qrCodeGenerator->delete($parcel->qr_code);
                }
                
                // Generate new QR code
                $qrCodePath = $qrCodeGenerator->generate($parcel);
                $parcel->update(['qr_code' => $qrCodePath]);
                
                $successCount++;
            } catch (\Exception $e) {
                $this->error("\nFailed to generate QR code for parcel {$parcel->id} (FPID: {$parcel->fpid}): " . $e->getMessage());
                $failCount++;
            }
            
            $bar->advance();
        }
        
        $bar->finish();
        $this->newLine(2);
        
        $this->info("QR code regeneration completed!");
        $this->info("✓ Successful: {$successCount}");
        if ($failCount > 0) {
            $this->error("✗ Failed: {$failCount}");
        }
        
        return Command::SUCCESS;
    }
}
