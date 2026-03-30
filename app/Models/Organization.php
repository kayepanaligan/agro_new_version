<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Organization extends Model
{
    protected $fillable = [
        'name',
        'type',
    ];

    public function farmers()
    {
        return $this->belongsToMany(Farmer::class, 'farmer_organizations');
    }
}
