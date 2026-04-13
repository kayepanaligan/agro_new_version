<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AuditLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'user_type',
        'event',
        'module',
        'model_type',
        'model_id',
        'old_values',
        'new_values',
        'ip_address',
        'user_agent',
        'description',
    ];

    protected $casts = [
        'old_values' => 'array',
        'new_values' => 'array',
    ];

    /**
     * Get the user that performed the action.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope a query to filter by event type.
     */
    public function scopeEvent($query, $event)
    {
        return $query->where('event', $event);
    }

    /**
     * Scope a query to filter by module.
     */
    public function scopeModule($query, $module)
    {
        return $query->where('module', $module);
    }

    /**
     * Scope a query to filter by user.
     */
    public function scopeUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope a query to filter by date range.
     */
    public function scopeDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('created_at', [$startDate, $endDate]);
    }

    /**
     * Get formatted description of the action.
     */
    public function getFormattedDescriptionAttribute(): string
    {
        if ($this->description) {
            return $this->description;
        }

        $userName = $this->user?->full_name ?? 'Unknown User';
        $moduleName = ucfirst(str_replace('-', ' ', $this->module));
        
        return match($this->event) {
            'created' => "{$userName} created a new {$moduleName}",
            'updated' => "{$userName} updated {$moduleName}",
            'deleted' => "{$userName} deleted {$moduleName}",
            'logged_in' => "{$userName} logged in",
            'logged_out' => "{$userName} logged out",
            default => "{$userName} performed {$this->event} on {$moduleName}",
        };
    }
}
