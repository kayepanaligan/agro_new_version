<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Barangay extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'description',
        'is_active',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Get the allocation types for the barangay.
     */
    public function allocationTypes(): BelongsToMany
    {
        return $this->belongsToMany(AllocationType::class, 'allocation_types', 'barangay_ids')
            ->whereJsonContains('barangay_ids', $this->id);
    }
}
