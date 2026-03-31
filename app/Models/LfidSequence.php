<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LfidSequence extends Model
{
    protected $fillable = [
        'year',
        'barangay_code',
        'last_sequence',
    ];

    protected $casts = [
        'year' => 'integer',
        'last_sequence' => 'integer',
    ];
}
