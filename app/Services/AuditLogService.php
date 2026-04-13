<?php

namespace App\Services;

use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuditLogService
{
    /**
     * Log an activity.
     */
    public static function log(
        string $event,
        string $module,
        ?string $description = null,
        ?string $modelType = null,
        ?int $modelId = null,
        ?array $oldValues = null,
        ?array $newValues = null
    ): AuditLog {
        $user = Auth::user();
        $request = request();

        return AuditLog::create([
            'user_id' => $user?->id,
            'user_type' => $user?->role?->name,
            'event' => $event,
            'module' => $module,
            'model_type' => $modelType,
            'model_id' => $modelId,
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'ip_address' => $request?->ip(),
            'user_agent' => $request?->userAgent(),
            'description' => $description,
        ]);
    }

    /**
     * Log a create action.
     */
    public static function created(string $module, array $data, ?string $modelType = null, ?int $modelId = null, ?string $description = null): AuditLog
    {
        return self::log(
            'created',
            $module,
            $description,
            $modelType,
            $modelId,
            null,
            $data
        );
    }

    /**
     * Log an update action.
     */
    public static function updated(string $module, array $oldData, array $newData, ?string $modelType = null, ?int $modelId = null, ?string $description = null): AuditLog
    {
        return self::log(
            'updated',
            $module,
            $description,
            $modelType,
            $modelId,
            $oldData,
            $newData
        );
    }

    /**
     * Log a delete action.
     */
    public static function deleted(string $module, array $oldData, ?string $modelType = null, ?int $modelId = null, ?string $description = null): AuditLog
    {
        return self::log(
            'deleted',
            $module,
            $description,
            $modelType,
            $modelId,
            $oldData,
            null
        );
    }

    /**
     * Log a login action.
     */
    public static function login(?string $description = null): AuditLog
    {
        return self::log('logged_in', 'authentication', $description);
    }

    /**
     * Log a logout action.
     */
    public static function logout(?string $description = null): AuditLog
    {
        return self::log('logged_out', 'authentication', $description);
    }
}
