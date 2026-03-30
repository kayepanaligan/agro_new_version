<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FarmerAssignment extends Model
{
    protected $fillable = [
        'farm_parcel_id',
        'farmer_id',
        'start_date',
        'end_date',
        'assignment_type',
        'status',
        'remarks',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    public function farmParcel()
    {
        return $this->belongsTo(FarmParcel::class);
    }

    public function farmer()
    {
        return $this->belongsTo(Farmer::class);
    }
}
