<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FarmerLocation extends Model
{
    protected $fillable = [
        'farmer_id',
        'region',
        'province',
        'municipality',
        'barangay',
        'latitude',
        'longitude',
    ];

    public function farmer()
    {
        return $this->belongsTo(Farmer::class);
    }
}
