<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FisherfolkLivelihood extends Model
{
    use HasFactory;

    protected $fillable = [
        'farmer_id',
        'fishing_activity',
        'fishing_specify',
    ];

    public function farmer()
    {
        return $this->belongsTo(Farmer::class);
    }
}
