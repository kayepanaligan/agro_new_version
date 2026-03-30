<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CropRotation extends Model
{
    protected $fillable = [
        'farm_parcel_id',
        'farmer_id',
        'season_identifier',
        'cycle_order',
        'commodity_id',
        'variety_id',
        'planting_date',
        'harvest_date',
        'area_planted',
        'yield_quantity',
        'yield_unit',
        'remarks',
    ];

    protected $casts = [
        'planting_date' => 'date',
        'harvest_date' => 'date',
        'area_planted' => 'decimal:4',
        'yield_quantity' => 'decimal:2',
    ];

    public function farmParcel()
    {
        return $this->belongsTo(FarmParcel::class);
    }

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
