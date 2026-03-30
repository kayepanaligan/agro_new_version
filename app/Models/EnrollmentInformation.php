<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EnrollmentInformation extends Model
{
    use HasFactory;

    protected $fillable = [
        'farmer_id',
        'enrollment_type',
        'rsbsa_reference_number',
        'enrollment_updated_at',
    ];

    protected $casts = [
        'enrollment_updated_at' => 'datetime',
    ];

    public function farmer()
    {
        return $this->belongsTo(Farmer::class);
    }
}
