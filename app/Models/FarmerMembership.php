<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FarmerMembership extends Model
{
    use HasFactory;

    protected $fillable = [
        'farmer_id',
        'organization_id',
    ];

    public function farmer()
    {
        return $this->belongsTo(Farmer::class);
    }

    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }
}
