<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FarmerDocument extends Model
{
    use HasFactory;

    protected $fillable = [
        'farmer_id',
        'id_type',
        'id_number',
        'file_path',
    ];

    public function farmer()
    {
        return $this->belongsTo(Farmer::class);
    }
}
