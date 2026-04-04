<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CropMonitoringItem extends Model
{
    protected $primaryKey = 'crop_monitoring_item_id';

    protected $fillable = [
        'folder_id',
        'item_name',
        'description',
        'latitude',
        'longitude',
        'temperature',
        'weather_condition',
        'humidity',
        'wind_speed',
        'weather_notes',
        'media_path',
        'updated_by',
        'observation_date',
    ];

    protected $casts = [
        'observation_date' => 'datetime',
        'latitude' => 'decimal:7',
        'longitude' => 'decimal:7',
        'temperature' => 'decimal:2',
        'humidity' => 'integer',
        'wind_speed' => 'decimal:2',
    ];

    public function folder(): BelongsTo
    {
        return $this->belongsTo(CropMonitoringFolder::class, 'folder_id', 'crop_monitoring_folder_id');
    }

    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}
