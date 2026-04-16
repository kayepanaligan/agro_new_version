<?php

namespace App\Services;

use App\Models\TechnicianReport;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;

class TechnicianReportGenerator
{
    /**
     * Create a technician report from a field activity.
     *
     * @param User $technician The technician who performed the activity
     * @param string $activityType The type of activity (farmer_registration, farm_creation, etc.)
     * @param Model $model The created/updated model
     * @param array $evidenceData Optional evidence data (GPS, photos, etc.)
     * @return TechnicianReport
     */
    public static function createFromActivity(
        User $technician,
        string $activityType,
        Model $model,
        array $evidenceData = []
    ): TechnicianReport {

        $reportTypeMap = [
            'App\\Models\\Farmer' => 'farmer_registration',
            'App\\Models\\Farm' => 'farm_creation',
            'App\\Models\\CropMonitoringItem' => 'crop_monitoring',
            'App\\Models\\CropDamageRecord' => 'crop_damage',
            'App\\Models\\DistributionRecord' => 'distribution_record',
        ];

        $reportType = $reportTypeMap[get_class($model)] ?? $activityType;

        // Capture GPS and timestamp if not provided
        if (empty($evidenceData)) {
            $evidenceData = [
                'timestamp' => now()->toISOString(),
                'auto_generated' => true,
            ];
        }

        return TechnicianReport::create([
            'technician_id' => $technician->id,
            'report_type' => $reportType,
            'reference_model_type' => get_class($model),
            'reference_model_id' => $model->id,
            'status' => 'submitted',
            'evidence_data' => $evidenceData,
        ]);
    }

    /**
     * Create reports in bulk for multiple activities.
     *
     * @param User $technician
     * @param array $activities Array of ['type' => string, 'model' => Model, 'evidence' => array]
     * @return array
     */
    public static function createBulk(User $technician, array $activities): array
    {
        $reports = [];

        foreach ($activities as $activity) {
            $reports[] = self::createFromActivity(
                $technician,
                $activity['type'],
                $activity['model'],
                $activity['evidence'] ?? []
            );
        }

        return $reports;
    }
}
