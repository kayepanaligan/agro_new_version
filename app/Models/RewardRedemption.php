<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RewardRedemption extends Model
{
    protected $fillable = [
        'farmer_id',
        'reward_type',
        'reward_name',
        'points_cost',
        'status',
        'notes',
        'voucher_code',
        'valid_until',
        'approved_at',
        'approved_by',
    ];

    protected $casts = [
        'points_cost' => 'integer',
        'valid_until' => 'date',
        'approved_at' => 'datetime',
    ];

    public function farmer(): BelongsTo
    {
        return $this->belongsTo(Farmer::class);
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    public function scopeRejected($query)
    {
        return $query->where('status', 'rejected');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }
}
