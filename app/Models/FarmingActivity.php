<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FarmingActivity extends Model
{
    use HasFactory;

    protected $fillable = [
        'farmer_id',
        'activity_type',
        'category_id',
        'commodity_id',
        'variety_id',
    ];

    public function farmer()
    {
        return $this->belongsTo(Farmer::class);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function commodity()
    {
        return $this->belongsTo(Commodity::class);
    }

    public function variety()
    {
        return $this->belongsTo(Variety::class);
    }
}
