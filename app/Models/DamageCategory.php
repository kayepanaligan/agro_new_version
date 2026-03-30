<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DamageCategory extends Model
{
    protected $primaryKey = 'damage_category_id';

    protected $fillable = [
        'damage_category_name',
        'damage_category_description',
    ];

    public function damageTypes(): HasMany
    {
        return $this->hasMany(DamageType::class, 'damage_category_id', 'damage_category_id');
    }
}
