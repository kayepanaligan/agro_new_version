<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FarmerHousehold extends Model
{
    use HasFactory;

    protected $fillable = [
        'farmer_id',
        'is_household_head',
        'household_head_first_name',
        'household_head_middle_name',
        'household_head_surname',
        'household_head_extension_name',
        'relationship_to_household_head',
        'no_male_household_members',
        'no_female_household_members',
        'no_living_household_members',
    ];

    protected $casts = [
        'is_household_head' => 'boolean',
    ];

    public function farmer()
    {
        return $this->belongsTo(Farmer::class);
    }
}
