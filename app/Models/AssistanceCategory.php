<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AssistanceCategory extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'description',
        'program_id',
        'barangay_ids',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'barangay_ids' => 'array',
    ];

    /**
     * Get the program that owns the assistance category.
     */
    public function program(): BelongsTo
    {
        return $this->belongsTo(Program::class);
    }
}
