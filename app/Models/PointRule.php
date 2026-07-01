<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PointRule extends Model
{
    protected $fillable = [
        'name',
        'trigger_action',
        'points_awarded',
        'max_earnable',
        'description',
        'is_active',
    ];

    protected $casts = [
        'points_awarded' => 'integer',
        'max_earnable' => 'integer',
        'is_active' => 'boolean',
    ];

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function farmerPoints(): HasMany
    {
        return $this->hasMany(FarmerPoint::class);
    }
}
