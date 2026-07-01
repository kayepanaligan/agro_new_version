<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\TechnicianReport;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class TechnicianReportController extends Controller
{
    /**
     * Display a listing of technician reports.
     */
    public function index(Request $request): Response
    {
        $query = TechnicianReport::with(['technician', 'verifiedBy'])
            ->orderBy('created_at', 'desc');

        // Apply filters
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('technician_id')) {
            $query->where('technician_id', $request->technician_id);
        }
        if ($request->filled('report_type')) {
            $query->where('report_type', $request->report_type);
        }

        $perPage = $request->input('per_page', 10);
        $reports = $query->paginate($perPage)->through(function ($report) {
            return [
                'id' => $report->id,
                'report_type' => $report->report_type,
                'status' => $report->status,
                'technician' => [
                    'id' => $report->technician->id,
                    'full_name' => $report->technician->full_name,
                ],
                'reference_model_type' => $report->reference_model_type,
                'reference_model_id' => $report->reference_model_id,
                'verified_by' => $report->verifiedBy ? [
                    'id' => $report->verifiedBy->id,
                    'full_name' => $report->verifiedBy->full_name,
                ] : null,
                'submitted_at' => $report->created_at,
                'verified_at' => $report->verified_at,
            ];
        });

        $technicians = User::whereHas('role', function ($q) {
            $q->where('name', 'technician');
        })->get()->map(fn ($t) => [
            'id' => $t->id,
            'full_name' => $t->full_name,
            'email' => $t->email,
        ]);

        return Inertia::render('admin/technician-reports', [
            'reports' => $reports,
            'technicians' => $technicians,
            'filters' => $request->only(['status', 'technician_id', 'report_type']),
            'analytics' => $this->computeAnalytics(),
        ]);
    }

    /**
     * Display the specified report.
     */
    public function show(TechnicianReport $report): Response
    {
        $report->load(['technician', 'verifiedBy', 'referenceModel']);

        return Inertia::render('admin/technician-report-detail', [
            'report' => [
                'id' => $report->id,
                'report_type' => $report->report_type,
                'status' => $report->status,
                'evidence_data' => $report->evidence_data,
                'rejection_remarks' => $report->rejection_remarks,
                'technician' => [
                    'id' => $report->technician->id,
                    'full_name' => $report->technician->full_name,
                    'email' => $report->technician->email,
                ],
                'verified_by' => $report->verifiedBy ? [
                    'id' => $report->verifiedBy->id,
                    'full_name' => $report->verifiedBy->full_name,
                ] : null,
                'reference_model' => $report->referenceModel ? [
                    'type' => get_class($report->referenceModel),
                    'id' => $report->referenceModel->id,
                ] : null,
                'submitted_at' => $report->created_at,
                'verified_at' => $report->verified_at,
            ],
        ]);
    }

    /**
     * Verify a technician report.
     */
    public function verify(Request $request, TechnicianReport $report): RedirectResponse
    {
        $validated = $request->validate([
            'remarks' => 'nullable|string',
        ]);

        $report->update([
            'status' => 'verified',
            'verified_by' => Auth::id(),
            'verified_at' => now(),
            'rejection_remarks' => null,
        ]);

        return redirect()->route('admin.technician-reports.show', $report)
            ->with('success', 'Report verified successfully.');
    }

    /**
     * Reject a technician report with remarks.
     */
    public function reject(Request $request, TechnicianReport $report): RedirectResponse
    {
        $validated = $request->validate([
            'rejection_remarks' => 'required|string',
        ]);

        $report->update([
            'status' => 'rejected',
            'rejection_remarks' => $validated['rejection_remarks'],
            'verified_by' => Auth::id(),
            'verified_at' => now(),
        ]);

        return redirect()->route('admin.technician-reports.show', $report)
            ->with('success', 'Report rejected. Technician can resubmit.');
    }

    /**
     * Display analytics dashboard for technician reports.
     */
    public function analytics(): Response
    {
        return Inertia::render('admin/technician-reports', [
            'analytics' => $this->computeAnalytics(),
        ]);
    }

    /**
     * Bulk verify multiple reports.
     */
    public function bulkVerify(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'report_ids' => 'required|array',
            'report_ids.*' => 'exists:technician_reports,id',
        ]);

        TechnicianReport::whereIn('id', $validated['report_ids'])
            ->update([
                'status' => 'verified',
                'verified_by' => Auth::id(),
                'verified_at' => now(),
            ]);

        return redirect()->route('admin.technician-reports')
            ->with('success', count($validated['report_ids']) . ' reports verified successfully.');
    }

    /**
     * Compute analytics data for technician reports.
     */
    private function computeAnalytics(): array
    {
        $statusCounts = [
            'pending' => TechnicianReport::whereIn('status', ['pending', 'submitted'])->count(),
            'submitted' => TechnicianReport::where('status', 'submitted')->count(),
            'verified' => TechnicianReport::where('status', 'verified')->count(),
            'rejected' => TechnicianReport::where('status', 'rejected')->count(),
        ];
        $statusCounts['total'] = TechnicianReport::count();

        $typeCounts = TechnicianReport::select('report_type', DB::raw('count(*) as count'))
            ->groupBy('report_type')
            ->pluck('count', 'report_type')
            ->toArray();

        $submissionTrend = TechnicianReport::select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('count(*) as count')
            )
            ->where('created_at', '>=', now()->subDays(30))
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->map(fn ($row) => [
                'date' => $row->date,
                'count' => (int) $row->count,
            ])
            ->values()
            ->toArray();

        $technicianPerformance = TechnicianReport::select(
                'technician_id',
                DB::raw('count(*) as total_reports'),
                DB::raw("sum(case when status = 'verified' then 1 else 0 end) as verified_count")
            )
            ->groupBy('technician_id')
            ->orderByDesc('total_reports')
            ->limit(10)
            ->get()
            ->map(function ($row) {
                $tech = User::find($row->technician_id);
                return [
                    'technician_id' => $row->technician_id,
                    'full_name' => $tech?->full_name ?? 'Unknown',
                    'total_reports' => (int) $row->total_reports,
                    'verified_count' => (int) $row->verified_count,
                    'verification_rate' => $row->total_reports > 0
                        ? round(($row->verified_count / $row->total_reports) * 100, 1)
                        : 0,
                ];
            })
            ->values()
            ->toArray();

        $recentActivity = TechnicianReport::with('technician:id,first_name,middle_name,last_name')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(fn ($r) => [
                'id' => $r->id,
                'report_type' => $r->report_type,
                'status' => $r->status,
                'technician_name' => $r->technician?->full_name ?? 'Unknown',
                'created_at' => $r->created_at->toISOString(),
            ])
            ->values()
            ->toArray();

        $lastSyncedAt = TechnicianReport::max('created_at');

        return [
            'status_counts' => $statusCounts,
            'type_counts' => $typeCounts,
            'submission_trend' => $submissionTrend,
            'technician_performance' => $technicianPerformance,
            'recent_activity' => $recentActivity,
            'last_synced_at' => $lastSyncedAt ? \Carbon\Carbon::parse($lastSyncedAt)->toISOString() : null,
        ];
    }
}
