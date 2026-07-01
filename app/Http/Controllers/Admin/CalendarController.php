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

        // ── Productivity data ──────────────────────────────────────────
        $tasksInMonth = Task::whereBetween('due_date', [$startDate, $endDate])->get();
        $reportsInMonth = TechnicianReport::whereBetween('created_at', [$startDate, $endDate])->get();

        // Task status distribution
        $taskStatusDist = $tasksInMonth->groupBy('status')->map(fn($g) => $g->count())->map(fn($count, $status) => [
            'name' => ucfirst(str_replace('_', ' ', $status)),
            'count' => $count,
        ])->values()->toArray();

        // Report status distribution
        $reportStatusDist = $reportsInMonth->groupBy('status')->map(fn($g) => $g->count())->map(fn($count, $status) => [
            'name' => ucfirst(str_replace('_', ' ', $status)),
            'count' => $count,
        ])->values()->toArray();

        // Weekly breakdown (4-5 weeks in month)
        $weeklyData = [];
        $weekStart = $startDate->copy();
        $weekNum = 1;
        while ($weekStart->lte($endDate)) {
            $weekEnd = $weekStart->copy()->addDays(6)->min($endDate);
            $weekTasks = Task::whereBetween('due_date', [$weekStart, $weekEnd])->count();
            $weekCompleted = Task::whereBetween('due_date', [$weekStart, $weekEnd])->where('status', 'verified')->count();
            $weekReports = TechnicianReport::whereBetween('created_at', [$weekStart, $weekEnd])->count();
            $weeklyData[] = [
                'name' => "Week {$weekNum}",
                'tasks' => $weekTasks,
                'completed' => $weekCompleted,
                'reports' => $weekReports,
            ];
            $weekStart = $weekEnd->copy()->addDay();
            $weekNum++;
        }

        // Task type distribution
        $taskTypeDist = $tasksInMonth->groupBy('task_type')->map(fn($g) => $g->count())->map(fn($count, $type) => [
            'name' => ucfirst(str_replace('_', ' ', $type ?? 'general')),
            'count' => $count,
        ])->values()->toArray();

        // Daily activity (tasks due per day)
        $dailyActivity = [];
        $dayCursor = $startDate->copy();
        while ($dayCursor->lte($endDate)) {
            $dateStr = $dayCursor->format('Y-m-d');
            $dailyActivity[] = [
                'name' => $dayCursor->format('M d'),
                'count' => Task::where('due_date', $dateStr)->count(),
            ];
            $dayCursor->addDay();
        }

        // Completion rate
        $completionRate = $stats['total_tasks'] > 0
            ? round(($stats['completed_tasks'] / $stats['total_tasks']) * 100)
            : 0;

        // Generate narrative
        $monthLabel = $startDate->format('F Y');
        $narrative = "In {$monthLabel}, ";
        $narrative .= "{$stats['total_tasks']} tasks were scheduled across the month with a {$completionRate}% completion rate. ";
        if ($stats['completed_tasks'] > 0) {
            $narrative .= "{$stats['completed_tasks']} tasks were successfully verified. ";
        }
        if ($stats['overdue_tasks'] > 0) {
            $narrative .= "There are {$stats['overdue_tasks']} overdue tasks requiring attention. ";
        }
        $narrative .= "Technicians filed {$stats['total_reports']} reports, of which {$stats['verified_reports']} were verified.";

        return Inertia::render('admin/calendar', [
            'events' => $events,
            'stats' => $stats,
            'currentMonth' => $month,
            'filters' => $request->only(['type', 'status', 'technician_id']),
            'productivity' => [
                'task_status_dist' => $taskStatusDist,
                'report_status_dist' => $reportStatusDist,
                'weekly_data' => $weeklyData,
                'task_type_dist' => $taskTypeDist,
                'daily_activity' => $dailyActivity,
                'completion_rate' => $completionRate,
                'narrative' => $narrative,
            ],
        ]);
    }
}
