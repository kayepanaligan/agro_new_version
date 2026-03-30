<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FarmerCrop extends Model
{
    protected $fillable = [
        'farmer_id',
        'commodity_id',
        'variety_id',
        'area_allocated',
    ];

    public function farmer()
    {
        return $this->belongsTo(Farmer::class);
    }

    public function commodity()
    {
        return $this->belongsTo(Commodity::class);
    }

    public function variety()
    {
        return $this->belongsTo(Variety::class);
    }
}
