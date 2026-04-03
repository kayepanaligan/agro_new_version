<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Acknowledgement extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'distribution_record_item_id',
        'farmer_lfid',
        'received_at',
        'photo_proof',
        'notes',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'received_at' => 'datetime',
    ];

    /**
     * Get the distribution record item for this acknowledgement.
     */
    public function distributionRecordItem(): BelongsTo
    {
        return $this->belongsTo(DistributionRecordItem::class);
    }
}
