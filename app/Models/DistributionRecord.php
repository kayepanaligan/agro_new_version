<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DistributionRecord extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'distribution_name',
        'allocation_type_id',
        'source_type',
        'total_quantity',
        'release_date',
        'note',
        'allocation_policy_id',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'total_quantity' => 'decimal:2',
        'release_date' => 'date',
    ];

    /**
     * Get the allocation type for this distribution.
     */
    public function allocationType(): BelongsTo
    {
        return $this->belongsTo(AllocationType::class);
    }

    /**
     * Get the allocation policy that generated this distribution (if DSS generated).
     */
    public function allocationPolicy(): BelongsTo
    {
        return $this->belongsTo(AllocationPolicy::class);
    }

    /**
     * Get all items in this distribution record.
     */
    public function items(): HasMany
    {
        return $this->hasMany(DistributionRecordItem::class);
    }
}
