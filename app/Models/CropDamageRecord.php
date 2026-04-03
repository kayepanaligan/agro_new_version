<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CropDamageRecord extends Model
{
    protected $primaryKey = 'crop_damage_record_id';

    protected $fillable = [
        'name',
        'recorded_date',
        'notes',
    ];

    protected $casts = [
        'recorded_date' => 'date',
    ];

    public function items(): HasMany
    {
        return $this->hasMany(CropDamageRecordItem::class, 'crop_damage_record_id', 'crop_damage_record_id');
    }
}
