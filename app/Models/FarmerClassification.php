<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FarmerClassification extends Model
{
    protected $fillable = [
        'farmer_id',
        'category',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function farmer()
    {
        return $this->belongsTo(Farmer::class);
    }
}
