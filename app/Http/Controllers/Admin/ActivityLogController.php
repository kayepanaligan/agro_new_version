<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\FarmerPoint;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ActivityLogController extends Controller
{
    /**
     * Display activity log.
     */
    public function index(Request $request): Response
    {
        $query = FarmerPoint::with(['farmer', 'pointRule'])
            ->orderBy('created_at', 'desc');

        // Apply filters
        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('farmer_id')) {
            $query->where('farmer_id', $request->farmer_id);
        }

        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        if ($request->filled('is_manual')) {
            $query->where('is_manual', $request->is_manual === 'true');
        }

        $activities = $query->limit(500)->get()->map(function ($activity) {
            return [
                'id' => $activity->id,
                'farmer_id' => $activity->farmer_id,
                'farmer_name' => $activity->farmer->first_name . ' ' . $activity->farmer->last_name,
                'farmer_lfid' => $activity->farmer->lfid,
                'activity_name' => $activity->activity_name,
                'description' => $activity->description,
                'category' => $activity->category,
                'points' => $activity->points,
                'status' => $activity->status,
                'icon' => $activity->icon,
                'is_manual' => $activity->is_manual,
                'awarded_by' => $activity->awarded_by,
                'admin_notes' => $activity->admin_notes,
                'created_at' => $activity->created_at,
                'verified_at' => $activity->verified_at,
            ];
        });

        // Get stats
        $stats = [
            'total_activities' => FarmerPoint::count(),
            'this_week' => FarmerPoint::whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()])->count(),
            'this_month' => FarmerPoint::thisMonth()->count(),
            'manual_count' => FarmerPoint::where('is_manual', true)->count(),
            'auto_count' => FarmerPoint::where('is_manual', false)->count(),
        ];

        // Get unique categories for filter
        $categories = FarmerPoint::distinct()->pluck('category');

        return Inertia::render('admin/activity-log', [
            'activities' => $activities,
            'stats' => $stats,
            'categories' => $categories,
        ]);
    }

    /**
     * Export activity log to CSV.
     */
    public function exportCsv(Request $request)
    {
        $query = FarmerPoint::with(['farmer', 'pointRule'])
            ->orderBy('created_at', 'desc');

        // Apply same filters as index
        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $activities = $query->get();

        $csvData = "Date,Farmer Name,LFID,Activity,Category,Points,Status,Source,Awarded By,Notes\n";

        foreach ($activities as $activity) {
            $csvData .= sprintf(
                "%s,%s,%s,%s,%s,%d,%s,%s,%s,%s\n",
                $activity->created_at->format('Y-m-d H:i:s'),
                $activity->farmer->first_name . ' ' . $activity->farmer->last_name,
                $activity->farmer->lfid,
                $activity->activity_name,
                $activity->category,
                $activity->points,
                $activity->status,
                $activity->is_manual ? 'Manual' : 'Automatic',
                $activity->awarded_by ?? 'System',
                $activity->admin_notes ?? ''
            );
        }

        return response($csvData)
            ->header('Content-Type', 'text/csv')
            ->header('Content-Disposition', 'attachment; filename="activity_log_' . now()->format('Y-m-d') . '.csv"');
    }
}
