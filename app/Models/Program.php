<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Program extends Model
{
    protected $fillable = [
        'program_name',
        'program_description',
    ];

    public function eligibilities()
    {
        return $this->hasMany(Eligibility::class);
    }
}
