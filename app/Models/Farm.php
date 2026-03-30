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
    ];

    public function farmer()
    {
        return $this->belongsTo(Farmer::class);
    }

    public function farmParcels()
    {
        return $this->hasMany(FarmParcel::class);
    }
}
