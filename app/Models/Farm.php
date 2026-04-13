<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Farm extends Model
{
    use HasFactory;

    protected $fillable = [
        'farmer_id',
        'farm_name',
        'fid',
        'qr_code',
    ];

    public function farmer()
    {
        return $this->belongsTo(Farmer::class);
    }

    public function farmParcels()
    {
        return $this->hasMany(FarmParcel::class);
    }

    /**
     * Generate FID (Farm ID) for this farm
     * Format: [LFID]-FO[number]
     * Example: DCAG-26-ZN1-0001-FO1
     */
    public function generateFid()
    {
        if ($this->fid) {
            return $this->fid; // Already has FID
        }

        $farmer = $this->farmer;
        if (!$farmer || !$farmer->lfid) {
            return null; // Can't generate without farmer LFID
        }

        // Count how many farms this farmer already has (including this one)
        $farmNumber = $farmer->farms()->where('id', '<=', $this->id)->count();
        
        $this->fid = $farmer->lfid . '-FO' . $farmNumber;
        $this->save();
        
        return $this->fid;
    }

    /**
     * Boot the model and auto-generate FID and QR code on creation
     */
    protected static function boot()
    {
        parent::boot();

        static::created(function ($farm) {
            // Generate FID
            $farm->generateFid();
            
            // Generate QR code if FID exists
            if ($farm->fid) {
                try {
                    $qrCodeGenerator = new \App\Services\FarmQrCodeGenerator();
                    $qrCodePath = $qrCodeGenerator->generate($farm);
                    $farm->update(['qr_code' => $qrCodePath]);
                } catch (\Exception $e) {
                    \Log::warning('Failed to generate QR code for farm: ' . $farm->id . ' - ' . $e->getMessage());
                }
            }
        });
    }
}
