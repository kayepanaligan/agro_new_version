<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FarmerOrganization extends Model
{
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
