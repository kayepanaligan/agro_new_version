<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AgriYouthLivelihood extends Model
{
    use HasFactory;

    protected $fillable = [
        'farmer_id',
        'type_of_involvement',
    ];

    public function farmer()
    {
        return $this->belongsTo(Farmer::class);
    }
}
