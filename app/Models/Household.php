<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Household extends Model
{
    protected $fillable = [
        'farmer_id',
        'household_size',
        'income_range',
        'primary_livelihood',
    ];

    public function farmer()
    {
        return $this->belongsTo(Farmer::class);
    }
}
