<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CropMonitoringUpdater extends Model
{
    protected $primaryKey = 'updater_id';
    public $timestamps = false;

    protected $fillable = [
        'folder_id',
        'user_id',
        'updated_at',
    ];

    protected $casts = [
        'updated_at' => 'datetime',
    ];

    public function folder(): BelongsTo
    {
        return $this->belongsTo(CropMonitoringFolder::class, 'folder_id', 'crop_monitoring_folder_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
