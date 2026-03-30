<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DamageType extends Model
{
    protected $primaryKey = 'damage_type_id';

    protected $fillable = [
        'damage_type_name',
        'damage_category_id',
        'damage_type_description',
        'image_path',
        'is_ai_generated',
    ];

    protected $casts = [
        'is_ai_generated' => 'boolean',
    ];

    public function damageCategory(): BelongsTo
    {
        return $this->belongsTo(DamageCategory::class, 'damage_category_id', 'damage_category_id');
    }
}
