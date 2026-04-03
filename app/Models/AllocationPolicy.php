<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AllocationPolicy extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'allocation_type_id',
        'allocation_inputs',
        'eligible_rules',
        'eligible_barangays',
        'policy_type',
        'policy_config',
        'is_active',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'allocation_inputs' => 'array',
        'eligible_rules' => 'array',
        'eligible_barangays' => 'array',
        'policy_config' => 'array',
        'is_active' => 'boolean',
    ];

    /**
     * Get the allocation type for the policy.
     */
    public function allocationType(): BelongsTo
    {
        return $this->belongsTo(AllocationType::class);
    }
}
