<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class TaskManagementController extends Controller
{
    /**
     * Display a listing of tasks.
     */
    public function index(Request $request): Response
    {
        $query = Task::with(['assignedTo', 'assignedBy'])
            ->orderBy('due_date', 'asc');

        // Apply filters
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('technician_id')) {
            $query->where('assigned_to', $request->technician_id);
        }
        if ($request->filled('priority')) {
            $query->where('priority', $request->priority);
        }

        $tasks = $query->paginate(20)->through(function ($task) {
            return [
                'id' => $task->id,
                'title' => $task->title,
                'task_type' => $task->task_type,
                'status' => $task->status,
                'priority' => $task->priority,
                'due_date' => $task->due_date,
                'is_overdue' => $task->is_overdue,
                'assigned_to' => [
                    'id' => $task->assignedTo->id,
                    'full_name' => $task->assignedTo->full_name,
                ],
                'assigned_by' => [
                    'id' => $task->assignedBy->id,
                    'full_name' => $task->assignedBy->full_name,
                ],
                'target_barangay' => $task->target_barangay,
            ];
        });

        $technicians = User::whereHas('role', function ($q) {
            $q->where('name', 'technician');
        })->get();

        return Inertia::render('admin/tasks', [
            'tasks' => $tasks,
            'technicians' => $technicians,
            'filters' => $request->only(['status', 'technician_id', 'priority']),
        ]);
    }

    /**
     * Show the form for creating a new task.
     */
    public function create(): Response
    {
        $technicians = User::whereHas('role', function ($q) {
            $q->where('name', 'technician');
        })->get();

        return Inertia::render('admin/task-form', [
            'technicians' => $technicians,
            'task' => null,
        ]);
    }

    /**
     * Show the form for editing the specified task.
     */
    public function edit(Task $task): Response
    {
        $technicians = User::whereHas('role', function ($q) {
            $q->where('name', 'technician');
        })->get();

        return Inertia::render('admin/task-form', [
            'technicians' => $technicians,
            'task' => [
                'id' => $task->id,
                'title' => $task->title,
                'description' => $task->description,
                'task_type' => $task->task_type,
                'target_barangay' => $task->target_barangay,
                'due_date' => $task->due_date->format('Y-m-d'),
                'assigned_to' => $task->assigned_to,
                'priority' => $task->priority,
                'status' => $task->status,
            ],
        ]);
    }

    /**
     * Update the specified task.
     */
    public function update(Request $request, Task $task): RedirectResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'task_type' => 'required|in:monitor_crops,verify_farmers,distribute_allocation,register_farmers,crop_damage_assessment',
            'target_barangay' => 'nullable|array',
            'target_barangay.*' => 'string',
            'due_date' => 'required|date',
            'assigned_to' => 'required|exists:users,id',
            'priority' => 'required|in:low,medium,high',
        ]);

        $task->update([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'task_type' => $validated['task_type'],
            'target_barangay' => $validated['target_barangay'] ?? null,
            'due_date' => $validated['due_date'],
            'assigned_to' => $validated['assigned_to'],
            'priority' => $validated['priority'],
        ]);

        return redirect()->route('admin.tasks')
            ->with('success', 'Task updated successfully.');
    }

    /**
     * Store a newly created task.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'task_type' => 'required|in:monitor_crops,verify_farmers,distribute_allocation,register_farmers,crop_damage_assessment',
            'target_barangay' => 'nullable|array',
            'target_barangay.*' => 'string',
            'due_date' => 'required|date',
            'assigned_to' => 'required|exists:users,id',
            'priority' => 'required|in:low,medium,high',
        ]);

        Task::create([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'task_type' => $validated['task_type'],
            'target_barangay' => $validated['target_barangay'] ?? [],
            'due_date' => $validated['due_date'],
            'status' => 'assigned',
            'assigned_by' => Auth::id(),
            'assigned_to' => $validated['assigned_to'],
            'priority' => $validated['priority'],
        ]);

        return redirect()->route('admin.tasks')->with('success', 'Task created and assigned successfully.');
    }

    /**
     * Display the specified task.
     */
    public function show(Task $task): Response
    {
        $task->load(['assignedTo', 'assignedBy', 'attachments.uploadedBy']);

        return Inertia::render('admin/task-detail', [
            'task' => [
                'id' => $task->id,
                'title' => $task->title,
                'description' => $task->description,
                'task_type' => $task->task_type,
                'status' => $task->status,
                'priority' => $task->priority,
                'due_date' => $task->due_date,
                'completed_at' => $task->completed_at,
                'remarks' => $task->remarks,
                'is_overdue' => $task->is_overdue,
                'target_barangay' => $task->target_barangay,
                'assigned_to' => [
                    'id' => $task->assignedTo->id,
                    'full_name' => $task->assignedTo->full_name,
                    'email' => $task->assignedTo->email,
                ],
                'assigned_by' => [
                    'id' => $task->assignedBy->id,
                    'full_name' => $task->assignedBy->full_name,
                ],
                'attachments' => $task->attachments->map(fn($att) => [
                    'id' => $att->id,
                    'file_path' => $att->file_path,
                    'file_type' => $att->file_type,
                    'uploaded_by' => $att->uploadedBy->full_name,
                    'created_at' => $att->created_at,
                ]),
                'created_at' => $task->created_at,
                'updated_at' => $task->updated_at,
            ],
        ]);
    }

    /**
     * Verify a completed task.
     */
    public function verify(Request $request, Task $task): RedirectResponse
    {
        $validated = $request->validate([
            'remarks' => 'nullable|string',
        ]);

        $task->update([
            'status' => 'verified',
            'remarks' => $validated['remarks'] ?? $task->remarks,
            'completed_at' => $task->completed_at ?? now(),
        ]);

        return redirect()->route('admin.tasks.show', $task)->with('success', 'Task verified successfully.');
    }

    /**
     * Reject a task with remarks.
     */
    public function reject(Request $request, Task $task): RedirectResponse
    {
        $validated = $request->validate([
            'remarks' => 'required|string',
        ]);

        $task->update([
            'status' => 'rejected',
            'remarks' => $validated['remarks'],
        ]);

        return redirect()->route('admin.tasks.show', $task)->with('success', 'Task rejected. Technician can resubmit.');
    }
}
