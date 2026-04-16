<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\TechnicianReport;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
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

        $reports = $query->paginate(20)->through(function ($report) {
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
        })->get();

        return Inertia::render('admin/technician-reports', [
            'reports' => $reports,
            'technicians' => $technicians,
            'filters' => $request->only(['status', 'technician_id', 'report_type']),
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
}
