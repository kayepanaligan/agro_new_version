<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FarmworkerLivelihood extends Model
{
    use HasFactory;

    protected $fillable = [
        'farmer_id',
        'kind_of_work',
        'work_specify',
    ];

    public function farmer()
    {
        return $this->belongsTo(Farmer::class);
    }
}
