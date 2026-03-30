<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FarmerAddress extends Model
{
    use HasFactory;

    protected $fillable = [
        'farmer_id',
        'house_lot_bldg_no_purok',
        'street_sitio_subdv',
        'barangay',
        'municipality_city',
        'province',
        'region',
    ];

    public function farmer()
    {
        return $this->belongsTo(Farmer::class);
    }
}
