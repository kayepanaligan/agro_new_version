<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EligibilityRule extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'allocation_type_id',
        'field_name',
        'operator',
        'value',
        'score',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'score' => 'integer',
    ];

    /**
     * Get the allocation type that owns the eligibility rule.
     */
    public function allocationType(): BelongsTo
    {
        return $this->belongsTo(AllocationType::class);
    }
}
