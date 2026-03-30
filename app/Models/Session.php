<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Session extends Model
{
    /**
     * Indicates if the model should be timestamped.
     */
    public $timestamps = false;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'id',
        'user_id',
        'ip_address',
        'user_agent',
        'payload',
        'last_activity',
    ];

    /**
     * Get the user that owns the session.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the last activity as a datetime instance.
     */
    public function getLastActivityAttribute($value)
    {
        return $value ? now()->createFromTimestamp($value) : null;
    }

    /**
     * Check if the session is active (activity within last 30 minutes).
     */
    public function getIsActiveAttribute(): bool
    {
        return $this->last_activity && $this->last_activity->diffInMinutes(now()) < 30;
    }

    /**
     * Get parsed device information from user agent.
     */
    public function getDeviceAttribute(): string
    {
        $userAgent = $this->user_agent ?? '';
        
        if (stripos($userAgent, 'mobile') !== false) {
            return 'Mobile';
        } elseif (stripos($userAgent, 'tablet') !== false) {
            return 'Tablet';
        }
        
        return 'Desktop';
    }

    /**
     * Get parsed browser information from user agent.
     */
    public function getBrowserAttribute(): string
    {
        $userAgent = $this->user_agent ?? '';
        
        if (stripos($userAgent, 'Chrome') !== false) {
            return 'Chrome';
        } elseif (stripos($userAgent, 'Firefox') !== false) {
            return 'Firefox';
        } elseif (stripos($userAgent, 'Safari') !== false) {
            return 'Safari';
        } elseif (stripos($userAgent, 'Edge') !== false) {
            return 'Edge';
        } elseif (stripos($userAgent, 'MSIE') !== false || stripos($userAgent, 'Trident') !== false) {
            return 'Internet Explorer';
        }
        
        return 'Unknown';
    }

    /**
     * Get parsed OS information from user agent.
     */
    public function getOsAttribute(): string
    {
        $userAgent = $this->user_agent ?? '';
        
        if (stripos($userAgent, 'Windows') !== false) {
            return 'Windows';
        } elseif (stripos($userAgent, 'Mac') !== false) {
            return 'macOS';
        } elseif (stripos($userAgent, 'Linux') !== false) {
            return 'Linux';
        } elseif (stripos($userAgent, 'Android') !== false) {
            return 'Android';
        } elseif (stripos($userAgent, 'iOS') !== false || stripos($userAgent, 'iPhone') !== false) {
            return 'iOS';
        }
        
        return 'Unknown';
    }
}
