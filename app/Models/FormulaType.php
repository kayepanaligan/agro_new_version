<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FormulaType extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'type',
        'name',
        'is_default',
        'base_algorithm',
        'factors',
        'expression_mode',
        'short_description',
        'formula_expression',
        'logic_notes',
        'example',
        'use_case',
        'edge_cases',
        'is_active',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'is_default'  => 'boolean',
        'factors'     => 'array',
        'logic_notes' => 'array',
        'example'     => 'array',
        'edge_cases'  => 'array',
        'is_active'   => 'boolean',
    ];
}
