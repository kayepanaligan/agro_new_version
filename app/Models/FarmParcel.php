<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FarmParcel extends Model
{
    use HasFactory;

    protected $fillable = [
        'farm_id',
        'parcel_number',
        'barangay',
        'city_municipality',
        'total_farm_area',
        'within_ancestral_domain',
        'ownership_document_type',
        'ownership_document_number',
        'agrarian_reform_beneficiary',
        'ownership_type',
        'landowner_name',
        'landowner_contact',
        'parcel_size',
        'livestock_count',
        'farm_type',
        'is_organic_practitioner',
        'remarks',
        'fpid',
    ];

    protected $casts = [
        'within_ancestral_domain' => 'boolean',
        'agrarian_reform_beneficiary' => 'boolean',
        'is_organic_practitioner' => 'boolean',
        'total_farm_area' => 'decimal:2',
        'parcel_size' => 'decimal:2',
    ];

    public function farm()
    {
        return $this->belongsTo(Farm::class);
    }

    /**
     * Generate FPID (Farm Parcel ID) for this parcel
     * Format: [LFID]-FO[farm_number]-PO[parcel_number]
     * Example: DCAG-26-ZN1-0001-FO1-PO1
     */
    public function generateFpid()
    {
        if ($this->fpid) {
            return $this->fpid; // Already has FPID
        }

        $farm = $this->farm;
        if (!$farm) {
            return null; // Can't generate without farm
        }

        // Ensure farm has FID
        if (!$farm->fid) {
            $farm->generateFid();
        }

        // Count how many parcels this farm already has (including this one)
        $parcelNumber = $farm->farmParcels()->where('id', '<=', $this->id)->count();
        
        // Extract farm number from FID (e.g., "DCAG-26-ZN1-0001-FO1" -> "1")
        preg_match('/-FO(\d+)$/', $farm->fid, $matches);
        $farmNumber = $matches[1] ?? '1';
        
        $this->fpid = $farm->fid . '-PO' . $parcelNumber;
        $this->save();
        
        return $this->fpid;
    }

    /**
     * Boot the model and auto-generate FPID on creation
     */
    protected static function boot()
    {
        parent::boot();

        static::created(function ($parcel) {
            $parcel->generateFpid();
        });
    }
}
