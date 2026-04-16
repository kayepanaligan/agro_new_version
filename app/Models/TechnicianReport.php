<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class TechnicianReport extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'technician_id',
        'report_type',
        'reference_model_type',
        'reference_model_id',
        'status',
        'verified_by',
        'verified_at',
        'rejection_remarks',
        'evidence_data',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'evidence_data' => 'array',
            'verified_at' => 'datetime',
        ];
    }

    /**
     * Get the technician who submitted the report.
     */
    public function technician(): BelongsTo
    {
        return $this->belongsTo(User::class, 'technician_id');
    }

    /**
     * Get the user who verified the report.
     */
    public function verifiedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    /**
     * Get the referenced model (polymorphic).
     */
    public function referenceModel(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Scope a query to only include pending reports.
     */
    public function scopePending($query)
    {
        return $query->whereIn('status', ['pending', 'submitted']);
    }

    /**
     * Scope a query to only include submitted reports.
     */
    public function scopeSubmitted($query)
    {
        return $query->where('status', 'submitted');
    }

    /**
     * Scope a query to only include verified reports.
     */
    public function scopeVerified($query)
    {
        return $query->where('status', 'verified');
    }

    /**
     * Scope a query to only include rejected reports.
     */
    public function scopeRejected($query)
    {
        return $query->where('status', 'rejected');
    }

    /**
     * Scope a query to filter by technician.
     */
    public function scopeForTechnician($query, $userId)
    {
        return $query->where('technician_id', $userId);
    }
}
