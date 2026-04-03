<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CropDamageRecordItem extends Model
{
    protected $primaryKey = 'crop_damage_record_item_id';

    protected $fillable = [
        'crop_damage_record_id',
        'photo_path',
        'farm_id',
        'commodity_name',
        'variety_name',
        'damage_type_id',
        'damage_severity',
        'status',
        'notes',
    ];

    protected $casts = [];

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
}
