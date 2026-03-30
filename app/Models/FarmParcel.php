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
}
