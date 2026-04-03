<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AllocationType extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'description',
        'amount',
        'unit_of_measurement_id',
        'program_id',
        'category_ids',
        'commodity_ids',
        'variety_ids',
        'barangay_ids',
        'farmer_eligibility_criteria',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'amount' => 'decimal:2',
        'category_ids' => 'array',
        'commodity_ids' => 'array',
        'variety_ids' => 'array',
        'barangay_ids' => 'array',
        'farmer_eligibility_criteria' => 'array',
    ];

    /**
     * Get the unit of measurement for the allocation type.
     */
    public function unitOfMeasurement(): BelongsTo
    {
        return $this->belongsTo(UnitOfMeasure::class, 'unit_of_measurement_id');
    }

    /**
     * Get the program that owns the allocation type.
     */
    public function program(): BelongsTo
    {
        return $this->belongsTo(Program::class);
    }
}
