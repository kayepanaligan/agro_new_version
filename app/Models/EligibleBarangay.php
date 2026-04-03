<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EligibleBarangay extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'allocation_type_id',
        'barangay_id',
    ];

    /**
     * Get the allocation type that owns the eligible barangay.
     */
    public function allocationType(): BelongsTo
    {
        return $this->belongsTo(AllocationType::class);
    }

    /**
     * Get the barangay.
     */
    public function barangay(): BelongsTo
    {
        return $this->belongsTo(Barangay::class);
    }
}
