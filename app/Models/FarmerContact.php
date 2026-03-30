<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FarmerContact extends Model
{
    use HasFactory;

    protected $fillable = [
        'farmer_id',
        'mobile_number',
        'landline_number',
        'gmail',
    ];

    public function farmer()
    {
        return $this->belongsTo(Farmer::class);
    }
}
