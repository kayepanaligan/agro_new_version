<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TierConfig extends Model
{
    protected $fillable = [
        'tier_name',
        'min_points',
        'max_points',
        'benefits',
        'color',
        'sort_order',
    ];

    protected $casts = [
        'min_points' => 'integer',
        'max_points' => 'integer',
        'benefits' => 'array',
        'sort_order' => 'integer',
    ];

    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order', 'asc');
    }
}
