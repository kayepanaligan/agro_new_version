<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class DistributionRecordItem extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'distribution_record_id',
        'farmer_lfid',
        'quantity_allocated',
        'allocation_policy_id',
        'status',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'quantity_allocated' => 'decimal:2',
    ];

    /**
     * Get the parent distribution record.
     */
    public function distributionRecord(): BelongsTo
    {
        return $this->belongsTo(DistributionRecord::class);
    }

    /**
     * Get the allocation policy applied (if DSS generated).
     */
    public function allocationPolicy(): BelongsTo
    {
        return $this->belongsTo(AllocationPolicy::class);
    }

    /**
     * Get the acknowledgement for this item.
     */
    public function acknowledgement(): HasOne
    {
        return $this->hasOne(Acknowledgement::class);
    }
}
