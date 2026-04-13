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
}
