<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CropMonitoringCategory extends Model
{
    protected $primaryKey = 'crop_monitoring_category_id';

    protected $fillable = [
        'category_name',
        'description',
    ];

    public function folders(): HasMany
    {
        return $this->hasMany(CropMonitoringFolder::class, 'category_id', 'crop_monitoring_category_id');
    }
}
