<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Task extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'title',
        'description',
        'task_type',
        'target_barangay',
        'due_date',
        'status',
        'assigned_by',
        'assigned_to',
        'priority',
        'remarks',
        'completed_at',
        'submitted_at',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'target_barangay' => 'array',
            'due_date' => 'date',
            'completed_at' => 'datetime',
            'submitted_at' => 'datetime',
        ];
    }

    /**
     * Get the user who assigned the task.
     */
    public function assignedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_by');
    }

    /**
     * Get the user assigned to the task.
     */
    public function assignedTo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    /**
     * Get the task attachments.
     */
    public function attachments(): HasMany
    {
        return $this->hasMany(TaskAttachment::class);
    }

    /**
     * Scope a query to filter by technician.
     */
    public function scopeForTechnician($query, $userId)
    {
        return $query->where('assigned_to', $userId);
    }

    /**
     * Scope a query to filter by status.
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope a query to only include overdue tasks.
     */
    public function scopeOverdue($query)
    {
        return $query->where('due_date', '<', now())
            ->whereIn('status', ['pending', 'assigned', 'in_progress']);
    }

    /**
     * Check if the task is overdue.
     */
    public function getIsOverdueAttribute(): bool
    {
        return $this->due_date < now() && in_array($this->status, ['pending', 'assigned', 'in_progress']);
    }
}
