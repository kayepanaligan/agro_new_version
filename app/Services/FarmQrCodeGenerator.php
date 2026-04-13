<?php

namespace App\Services;

use App\Models\Farm;
use SimpleSoftwareIO\QrCode\Facades\QrCode;
use Illuminate\Support\Str;

class FarmQrCodeGenerator
{
    /**
     * Generate a unique QR code for a farm
     * 
     * @param Farm $farm
     * @return string The QR code filename
     */
    public function generate(Farm $farm): string
    {
        // Create a unique URL for the farm profile
        $url = route('public.farm.profile', ['fid' => $farm->fid]);
        
        // Generate a unique filename
        $filename = 'farm_qr_' . $farm->id . '_' . Str::random(10) . '.svg';
        
        // Create directory if it doesn't exist
        $directory = public_path('qr-codes/farms');
        if (!file_exists($directory)) {
            mkdir($directory, 0755, true);
        }
        
        // Generate QR code
        $qrCodeContent = QrCode::format('svg')
            ->size(300)
            ->errorCorrection('H')
            ->generate($url);
        
        // Save to file
        file_put_contents($directory . '/' . $filename, $qrCodeContent);
        
        // Return the relative path
        return 'qr-codes/farms/' . $filename;
    }
    
    /**
     * Delete a farm's QR code
     * 
     * @param string $qrCodePath
     * @return bool
     */
    public function delete(string $qrCodePath): bool
    {
        $fullPath = public_path($qrCodePath);
        
        if (file_exists($fullPath)) {
            return unlink($fullPath);
        }
        
        return false;
    }
}
