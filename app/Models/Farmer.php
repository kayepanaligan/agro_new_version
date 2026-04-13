<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Farmer extends Model
{
    use HasFactory;

    protected $fillable = [
        'rsbsa_number',
        'picture_id',
        'lfid',
        'registration_status',
        'qr_code',
    ];

    // Relationships to new normalized tables
    public function enrollmentInformation()
    {
        return $this->hasOne(EnrollmentInformation::class);
    }

    public function address()
    {
        return $this->hasOne(FarmerAddress::class);
    }

    public function contact()
    {
        return $this->hasOne(FarmerContact::class);
    }

    public function spouse()
    {
        return $this->hasOne(FarmerSpouse::class);
    }

    public function household()
    {
        return $this->hasOne(FarmerHousehold::class);
    }

    public function profile()
    {
        return $this->hasOne(FarmerProfile::class);
    }

    public function education()
    {
        return $this->hasOne(FarmerEducation::class);
    }

    public function emergencyContact()
    {
        return $this->hasOne(FarmerEmergencyContact::class);
    }

    public function documents()
    {
        return $this->hasMany(FarmerDocument::class);
    }

    public function memberships()
    {
        return $this->hasMany(FarmerMembership::class);
    }

    public function mainLivelihood()
    {
        return $this->hasOne(FarmerMainLivelihood::class);
    }

    public function farmingActivities()
    {
        return $this->hasMany(FarmingActivity::class);
    }

    public function farmworkerLivelihood()
    {
        return $this->hasOne(FarmworkerLivelihood::class);
    }

    public function fisherfolkLivelihood()
    {
        return $this->hasOne(FisherfolkLivelihood::class);
    }

    public function agriYouthLivelihood()
    {
        return $this->hasOne(AgriYouthLivelihood::class);
    }

    public function income()
    {
        return $this->hasOne(FarmerIncome::class);
    }

    public function farms()
    {
        return $this->hasMany(Farm::class);
    }

    // Keep existing relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function cropRotations()
    {
        return $this->hasMany(CropRotation::class);
    }

    public function farmerAssignments()
    {
        return $this->hasMany(FarmerAssignment::class);
    }

    public function organizationMemberships()
    {
        return $this->hasMany(FarmerOrganizationMembership::class);
    }
}
