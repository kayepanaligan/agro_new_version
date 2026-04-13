<?php

namespace App\Services;

use App\Models\FarmParcel;
use SimpleSoftwareIO\QrCode\Facades\QrCode;
use Illuminate\Support\Str;

class FarmParcelQrCodeGenerator
{
    /**
     * Generate a unique QR code for a farm parcel
     */
    public function generate(FarmParcel $parcel): string
    {
        // Create a unique URL for the farm parcel profile
        $url = route('public.farm-parcel.profile', ['fpid' => $parcel->fpid]);
        
        // Generate a unique filename
        $filename = 'parcel_qr_' . $parcel->id . '_' . Str::random(10) . '.svg';
        
        // Create directory if it doesn't exist
        $directory = public_path('qr-codes/farm-parcels');
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
        return 'qr-codes/farm-parcels/' . $filename;
    }
    
    /**
     * Delete a QR code file
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
