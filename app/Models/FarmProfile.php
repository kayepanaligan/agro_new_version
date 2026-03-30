<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FarmProfile extends Model
{
    protected $fillable = [
        'farmer_id',
        'main_livelihood',
        'farming_activity_type',
        'farming_commodity_category_id',
        'farming_commodity_id',
        'farming_variety_id',
        'farmworker_kind_of_work',
        'farmworker_other_specify',
        'fisherfolk_fishing_activity',
        'fisherfolk_other_specify',
        'agri_youth_involvement',
        'agri_youth_other_specify',
        'gross_annual_income_farming',
        'gross_annual_income_non_farming',
        'total_farm_size',
    ];

    protected $casts = [
        'gross_annual_income_farming' => 'decimal:2',
        'gross_annual_income_non_farming' => 'decimal:2',
        'total_farm_size' => 'decimal:4',
    ];

    public function farmer()
    {
        return $this->belongsTo(Farmer::class);
    }

    public function commodityCategory()
    {
        return $this->belongsTo(Category::class, 'farming_commodity_category_id');
    }

    public function commodity()
    {
        return $this->belongsTo(Commodity::class, 'farming_commodity_id');
    }

    public function variety()
    {
        return $this->belongsTo(Variety::class, 'farming_variety_id');
    }

    public function farmParcels()
    {
        return $this->hasMany(FarmParcel::class);
    }
}
