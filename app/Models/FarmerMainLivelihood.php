<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FarmerMainLivelihood extends Model
{
    use HasFactory;

    protected $fillable = [
        'farmer_id',
        'main_livelihood',
    ];

    public function farmer()
    {
        return $this->belongsTo(Farmer::class);
    }
}
