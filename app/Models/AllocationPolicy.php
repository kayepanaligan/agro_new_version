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
        'formula_type_id',
        'is_custom',
        'config_json',
        'formula_expression',
        'is_active',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'allocation_inputs'  => 'array',
        'eligible_rules'     => 'array',
        'eligible_barangays' => 'array',
        'policy_config'      => 'array',
        'config_json'        => 'array',
        'is_custom'          => 'boolean',
        'is_active'          => 'boolean',
    ];

    /**
     * Get the allocation type for the policy.
     */
    public function allocationType(): BelongsTo
    {
        return $this->belongsTo(AllocationType::class);
    }

    /**
     * Get the formula type definition for this policy.
     */
    public function formulaType(): BelongsTo
    {
        return $this->belongsTo(FormulaType::class);
    }
}
