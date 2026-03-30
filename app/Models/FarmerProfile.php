<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FarmerProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'farmer_id',
        'first_name',
        'middle_name',
        'last_name',
        'extension_name',
        'sex',
        'birthdate',
        'civil_status',
        'religion',
        'religion_specify',
        'is_4ps_beneficiary',
        'is_ip',
        'ip_specify',
    ];

    protected $casts = [
        'birthdate' => 'date',
        'is_4ps_beneficiary' => 'boolean',
        'is_ip' => 'boolean',
    ];

    public function farmer()
    {
        return $this->belongsTo(Farmer::class);
    }
}
