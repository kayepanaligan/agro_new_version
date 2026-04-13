<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CropDamageRecordItem extends Model
{
    protected $primaryKey = 'crop_damage_record_item_id';

    protected $fillable = [
        'crop_damage_record_id',
        'farmer_id',
        'farm_id',
        'photo_path',
        'commodity_name',
        'variety_name',
        'damage_type_id',
        'damage_severity',
        'status',
        'latitude',
        'longitude',
        'temperature',
        'humidity',
        'weather_condition',
        'wind_speed',
        'notes',
    ];

    protected $casts = [
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
        'temperature' => 'decimal:2',
        'humidity' => 'decimal:2',
        'wind_speed' => 'decimal:2',
    ];

    public function cropDamageRecord(): BelongsTo
    {
        return $this->belongsTo(CropDamageRecord::class, 'crop_damage_record_id', 'crop_damage_record_id');
    }

    public function farm(): BelongsTo
    {
        return $this->belongsTo(Farm::class);
    }

    public function damageType(): BelongsTo
    {
        return $this->belongsTo(DamageType::class, 'damage_type_id', 'damage_type_id');
    }

    public function farmer(): BelongsTo
    {
        return $this->belongsTo(Farmer::class);
    }
}
