<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasApiTokens;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'role_id',
        'first_name',
        'middle_name',
        'last_name',
        'gender',
        'dob',
        'email',
        'lfid',
        'avatar',
        'contact_number',
        'street',
        'barangay',
        'municipality',
        'province',
        'postal_code',
        'id_document_path',
        'password',
        'registration_status',
        'is_active_session',
        'is_active',
        'last_activity_at',
        'assigned_barangays',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'dob' => 'date',
            'is_active_session' => 'boolean',
            'is_active' => 'boolean',
            'last_activity_at' => 'datetime',
            'assigned_barangays' => 'array',
        ];
    }

    /**
     * Get the role for the user.
     */
    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class);
    }

    /**
     * Get the farmer record associated with this user.
     */
    public function farmer(): BelongsTo
    {
        return $this->belongsTo(Farmer::class, 'lfid', 'lfid');
    }

    /**
     * Get the user's full name.
     */
    public function getFullNameAttribute(): string
    {
        $fullName = trim("{$this->first_name} {$this->middle_name} {$this->last_name}");
        return preg_replace('/\s+/', ' ', $fullName);
    }

    /**
     * Get tasks assigned to this user (as technician).
     */
    public function assignedTasks()
    {
        return $this->hasMany(Task::class, 'assigned_to');
    }

    /**
     * Get tasks created by this user (as admin).
     */
    public function createdTasks()
    {
        return $this->hasMany(Task::class, 'assigned_by');
    }

    /**
     * Get user-specific privilege overrides.
     */
    public function userPrivileges()
    {
        return $this->hasMany(UserPrivilege::class);
    }

    /**
     * Get technician reports submitted by this user.
     */
    public function technicianReports()
    {
        return $this->hasMany(TechnicianReport::class, 'technician_id');
    }

    /**
     * Get technician reports verified by this user.
     */
    public function verifiedReports()
    {
        return $this->hasMany(TechnicianReport::class, 'verified_by');
    }

    /**
     * Check if user has a specific permission.
     */
    public function hasPermission(string $permission): bool
    {
        if (!$this->role) {
            return false;
        }
        
        // Check for user-specific privilege override first
        $userPrivilege = $this->userPrivileges()
            ->whereHas('permission', function ($query) use ($permission) {
                $query->where('name', $permission);
            })
            ->first();
        
        // If user has explicit privilege override, use that
        if ($userPrivilege) {
            return $userPrivilege->granted;
        }
        
        // Otherwise, fall back to role permissions
        return $this->role->hasPermission($permission);
    }

    /**
     * Check if user has a specific role.
     */
    public function hasRole(string $roleName): bool
    {
        return $this->role && $this->role->name === $roleName;
    }

    /**
     * Check if user can assign tasks.
     */
    public function canAssignTasks(): bool
    {
        return $this->hasPermission('tasks.assign');
    }
}
