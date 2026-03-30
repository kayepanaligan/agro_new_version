<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FarmerEmergencyContact extends Model
{
    use HasFactory;

    protected $fillable = [
        'farmer_id',
        'emergency_contact_first_name',
        'emergency_contact_middle_name',
        'emergency_contact_last_name',
        'emergency_contact_extension_name',
        'contact_number',
        'email',
    ];

    public function farmer()
    {
        return $this->belongsTo(Farmer::class);
    }
}
