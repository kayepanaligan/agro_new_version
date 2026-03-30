<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Eligibility extends Model
{
    protected $fillable = [
        'farmer_id',
        'program_id',
        'is_eligible',
        'validation_date',
    ];

    protected $casts = [
        'is_eligible' => 'boolean',
        'validation_date' => 'date',
    ];

    public function farmer()
    {
        return $this->belongsTo(Farmer::class);
    }

    public function program()
    {
        return $this->belongsTo(Program::class);
    }
}
