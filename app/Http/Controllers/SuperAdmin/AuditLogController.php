<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AuditLogController extends Controller
{
    /**
     * Display audit logs page.
     */
    public function index(Request $request): Response
    {
        $query = AuditLog::with('user:id,first_name,last_name,email,avatar')
            ->orderBy('created_at', 'desc');

        // Filter by event type
        if ($request->filled('event')) {
            $query->where('event', $request->event);
        }

        // Filter by module
        if ($request->filled('module')) {
            $query->where('module', $request->module);
        }

        // Filter by user
        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        // Filter by date range
        if ($request->filled('start_date')) {
            $query->whereDate('created_at', '>=', $request->start_date);
        }
        if ($request->filled('end_date')) {
            $query->whereDate('created_at', '<=', $request->end_date);
        }

        // Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('description', 'like', "%{$search}%")
                  ->orWhere('module', 'like', "%{$search}%")
                  ->orWhere('event', 'like', "%{$search}%");
            });
        }

        $auditLogs = $query->paginate(20)->withQueryString();

        // Transform data
        $auditLogs->getCollection()->transform(function ($log) {
            return [
                'id' => $log->id,
                'user_id' => $log->user_id,
                'user_type' => $log->user_type,
                'event' => $log->event,
                'module' => $log->module,
                'model_type' => $log->model_type,
                'model_id' => $log->model_id,
                'old_values' => $log->old_values,
                'new_values' => $log->new_values,
                'ip_address' => $log->ip_address,
                'user_agent' => $log->user_agent,
                'description' => $log->formatted_description,
                'created_at' => $log->created_at,
                'user' => $log->user ? [
                    'id' => $log->user->id,
                    'full_name' => $log->user->full_name,
                    'email' => $log->user->email,
                    'avatar' => $log->user->avatar,
                ] : null,
            ];
        });

        // Get unique modules and events for filters
        $modules = AuditLog::distinct()->pluck('module')->sort()->values();
        $events = AuditLog::distinct()->pluck('event')->sort()->values();
        $users = User::orderBy('first_name')->get(['id', 'first_name', 'last_name', 'email']);

        return Inertia::render('super_admin/audit-logs', [
            'auditLogs' => $auditLogs,
            'modules' => $modules,
            'events' => $events,
            'users' => $users,
            'filters' => $request->only(['event', 'module', 'user_id', 'start_date', 'end_date', 'search']),
        ]);
    }

    /**
     * Get audit log details.
     */
    public function show(AuditLog $auditLog): array
    {
        $auditLog->load('user:id,first_name,last_name,email,avatar');
        
        return [
            'id' => $auditLog->id,
            'user_id' => $auditLog->user_id,
            'user_type' => $auditLog->user_type,
            'event' => $auditLog->event,
            'module' => $auditLog->module,
            'model_type' => $auditLog->model_type,
            'model_id' => $auditLog->model_id,
            'old_values' => $auditLog->old_values,
            'new_values' => $auditLog->new_values,
            'ip_address' => $auditLog->ip_address,
            'user_agent' => $auditLog->user_agent,
            'description' => $auditLog->formatted_description,
            'created_at' => $auditLog->created_at,
            'user' => $auditLog->user ? [
                'id' => $auditLog->user->id,
                'full_name' => $auditLog->user->full_name,
                'email' => $auditLog->user->email,
                'avatar' => $auditLog->user->avatar,
                'role' => $auditLog->user->role,
            ] : null,
        ];
    }
}
