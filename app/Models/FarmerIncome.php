<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FarmerIncome extends Model
{
    use HasFactory;

    protected $fillable = [
        'farmer_id',
        'farming_income',
        'non_farming_income',
    ];

    protected $casts = [
        'farming_income' => 'decimal:2',
        'non_farming_income' => 'decimal:2',
    ];

    public function farmer()
    {
        return $this->belongsTo(Farmer::class);
    }
}
