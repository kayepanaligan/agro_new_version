<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Models\TechnicianReport;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CalendarController extends Controller
{
    /**
     * Display the calendar view.
     */
    public function index(Request $request): Response
    {
        $month = $request->get('month', now()->format('Y-m'));
        $startDate = \Carbon\Carbon::parse($month . '-01')->startOfMonth();
        $endDate = $startDate->copy()->endOfMonth();

        // Get all tasks for the month
        $tasks = Task::with(['assignedTo'])
            ->whereBetween('due_date', [$startDate, $endDate])
            ->get()
            ->map(function ($task) {
                return [
                    'id' => $task->id,
                    'title' => $task->title,
                    'type' => 'task',
                    'task_type' => $task->task_type,
                    'status' => $task->status,
                    'priority' => $task->priority,
                    'date' => $task->due_date->format('Y-m-d'),
                    'start_time' => null,
                    'end_time' => null,
                    'assigned_to' => $task->assignedTo->full_name ?? 'Unassigned',
                    'url' => route('admin.tasks.show', $task->id),
                ];
            });

        // Get technician reports for the month
        $reports = TechnicianReport::with(['technician'])
            ->whereBetween('created_at', [$startDate, $endDate])
            ->get()
            ->map(function ($report) {
                return [
                    'id' => $report->id,
                    'title' => ucfirst(str_replace('_', ' ', $report->report_type)) . ' Report',
                    'type' => 'report',
                    'report_type' => $report->report_type,
                    'status' => $report->status,
                    'date' => $report->created_at->format('Y-m-d'),
                    'start_time' => $report->evidence_data['activity_started_at'] ?? null,
                    'end_time' => $report->evidence_data['activity_completed_at'] ?? null,
                    'assigned_to' => $report->technician->full_name ?? 'Unknown',
                    'url' => route('admin.technician-reports.show', $report->id),
                ];
            });

        // Combine and sort all events
        $events = $tasks->concat($reports)->sortBy('date')->values();

        // Get statistics for the month
        $stats = [
            'total_tasks' => Task::whereBetween('due_date', [$startDate, $endDate])->count(),
            'completed_tasks' => Task::whereBetween('due_date', [$startDate, $endDate])
                ->where('status', 'verified')
                ->count(),
            'pending_tasks' => Task::whereBetween('due_date', [$startDate, $endDate])
                ->whereIn('status', ['pending', 'assigned', 'in_progress'])
                ->count(),
            'overdue_tasks' => Task::where('due_date', '<', now())
                ->whereIn('status', ['pending', 'assigned', 'in_progress'])
                ->count(),
            'total_reports' => TechnicianReport::whereBetween('created_at', [$startDate, $endDate])->count(),
            'verified_reports' => TechnicianReport::whereBetween('created_at', [$startDate, $endDate])
                ->where('status', 'verified')
                ->count(),
        ];

        return Inertia::render('admin/calendar', [
            'events' => $events,
            'stats' => $stats,
            'currentMonth' => $month,
            'filters' => $request->only(['type', 'status', 'technician_id']),
        ]);
    }
}
