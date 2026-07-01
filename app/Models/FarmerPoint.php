<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FarmerPoint extends Model
{
    protected $fillable = [
        'farmer_id',
        'activity_name',
        'description',
        'category',
        'points',
        'status',
        'icon',
        'metadata',
        'verified_at',
        'verified_by',
        'point_rule_id',
        'awarded_by',
        'admin_notes',
        'is_manual',
    ];

    protected $casts = [
        'points' => 'integer',
        'metadata' => 'array',
        'verified_at' => 'datetime',
        'is_manual' => 'boolean',
    ];

    public function farmer(): BelongsTo
    {
        return $this->belongsTo(Farmer::class);
    }

    public function pointRule(): BelongsTo
    {
        return $this->belongsTo(PointRule::class);
    }

    public function scopeVerified($query)
    {
        return $query->where('status', 'verified');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeThisMonth($query)
    {
        return $query->whereMonth('created_at', now()->month)
                    ->whereYear('created_at', now()->year);
    }
}
