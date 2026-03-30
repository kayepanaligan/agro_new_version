<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FarmerSpouse extends Model
{
    use HasFactory;

    protected $fillable = [
        'farmer_id',
        'spouse_first_name',
        'spouse_middle_name',
        'spouse_surname',
        'spouse_extension_name',
    ];

    public function farmer()
    {
        return $this->belongsTo(Farmer::class);
    }
}
