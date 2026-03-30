<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FarmerEducation extends Model
{
    use HasFactory;

    protected $fillable = [
        'farmer_id',
        'highest_formal_education',
    ];

    public function farmer()
    {
        return $this->belongsTo(Farmer::class);
    }
}
