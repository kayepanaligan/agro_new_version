<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FarmerOrganizationMembership extends Model
{
    protected $fillable = [
        'farmer_id',
        'organization_id',
        'program_id',
        'membership_date',
        'membership_status',
        'role_in_organization',
    ];

    protected $casts = [
        'membership_date' => 'date',
    ];

    public function farmer()
    {
        return $this->belongsTo(Farmer::class);
    }

    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }

    public function program()
    {
        return $this->belongsTo(Program::class);
    }
}
