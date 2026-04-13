<?php

namespace App\Services;

use App\Models\Farmer;
use SimpleSoftwareIO\QrCode\Facades\QrCode;
use Illuminate\Support\Str;

class QrCodeGenerator
{
    /**
     * Generate a unique QR code for a farmer
     * 
     * @param Farmer $farmer
     * @return string The QR code filename
     */
    public function generate(Farmer $farmer): string
    {
        // Create a unique URL for the farmer profile
        $url = route('public.farmer.profile', ['lfid' => $farmer->lfid]);
        
        // Generate a unique filename
        $filename = 'qr_' . $farmer->id . '_' . Str::random(10) . '.svg';
        
        // Create directory if it doesn't exist
        $directory = public_path('qr-codes');
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
        return 'qr-codes/' . $filename;
    }
    
    /**
     * Delete a farmer's QR code
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
