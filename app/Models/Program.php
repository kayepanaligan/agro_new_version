<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Program extends Model
{
    protected $fillable = [
        'program_name',
        'program_description',
        'start_date',
        'end_date',
        'funding_source_id',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    public function eligibilities()
    {
        return $this->hasMany(Eligibility::class);
    }

    /**
     * Get the funding source for the program.
     */
    public function fundingSource(): BelongsTo
    {
        return $this->belongsTo(FundingSource::class);
    }

    /**
     * Get the assistance categories for the program.
     */
    public function assistanceCategories(): HasMany
    {
        return $this->hasMany(AssistanceCategory::class);
    }
}
