<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CropMonitoringFolder extends Model
{
    protected $primaryKey = 'crop_monitoring_folder_id';

    protected $fillable = [
        'folder_name',
        'description',
        'category_id',
        'commodity_id',
        'variety_id',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(CropMonitoringCategory::class, 'category_id', 'crop_monitoring_category_id');
    }

    public function commodity(): BelongsTo
    {
        return $this->belongsTo(Commodity::class);
    }

    public function variety(): BelongsTo
    {
        return $this->belongsTo(Variety::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(CropMonitoringItem::class, 'folder_id', 'crop_monitoring_folder_id');
    }

    public function updaters(): HasMany
    {
        return $this->hasMany(CropMonitoringUpdater::class, 'folder_id', 'crop_monitoring_folder_id');
    }
}
