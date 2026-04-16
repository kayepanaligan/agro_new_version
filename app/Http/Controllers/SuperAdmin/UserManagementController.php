<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class UserManagementController extends Controller
{
    /**
     * Display user monitoring page.
     */
    public function index(): Response
    {
        $users = User::with(['role', 'userPrivileges.permission'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($user) {
                // Get custom privileges
                $customPrivileges = $user->userPrivileges->map(function ($priv) {
                    return [
                        'id' => $priv->permission->id,
                        'name' => $priv->permission->name,
                        'display_name' => $priv->permission->display_name,
                        'module' => $priv->permission->module,
                        'granted' => $priv->granted,
                    ];
                });
                
                // Get role permissions
                $rolePermissions = $user->role ? $user->role->permissions->map(function ($perm) {
                    return [
                        'id' => $perm->id,
                        'name' => $perm->name,
                        'display_name' => $perm->display_name,
                        'module' => $perm->module,
                    ];
                }) : collect();
                
                return [
                    'id' => $user->id,
                    'first_name' => $user->first_name,
                    'middle_name' => $user->middle_name,
                    'last_name' => $user->last_name,
                    'full_name' => $user->full_name,
                    'email' => $user->email,
                    'avatar' => $user->avatar,
                    'registration_status' => $user->registration_status,
                    'is_active_session' => $user->is_active_session,
                    'last_activity_at' => $user->last_activity_at,
                    'created_at' => $user->created_at,
                    'role' => $user->role ? [
                        'id' => $user->role->id,
                        'name' => $user->role->name,
                    ] : null,
                    'assigned_barangays' => $user->assigned_barangays,
                    'custom_privileges' => $customPrivileges,
                    'role_permissions' => $rolePermissions,
                    'custom_privileges_count' => $customPrivileges->count(),
                    'role_permissions_count' => $rolePermissions->count(),
                ];
            });

        // Get all permissions grouped by module for the assignment form
        $permissions = \App\Models\Permission::orderBy('module')->orderBy('display_name')
            ->get()
            ->groupBy('module')
            ->map(function ($perms) {
                return $perms->map(function ($perm) {
                    return [
                        'id' => $perm->id,
                        'name' => $perm->name,
                        'display_name' => $perm->display_name,
                        'description' => $perm->description,
                    ];
                });
            });

        return Inertia::render('super_admin/user-monitoring', [
            'users' => $users,
            'permissions' => $permissions,
        ]);
    }

    /**
     * Display user profile page.
     */
    public function show(User $user): Response
    {
        $user->load(['role.permissions', 'userPrivileges.permission']);
        
        // Get custom privileges
        $customPrivileges = $user->userPrivileges->map(function ($priv) {
            return [
                'id' => $priv->permission->id,
                'name' => $priv->permission->name,
                'display_name' => $priv->permission->display_name,
                'module' => $priv->permission->module,
                'granted' => $priv->granted,
            ];
        });
        
        // Get role permissions
        $rolePermissions = $user->role ? $user->role->permissions->map(function ($perm) {
            return [
                'id' => $perm->id,
                'name' => $perm->name,
                'display_name' => $perm->display_name,
                'module' => $perm->module,
            ];
        }) : collect();
        
        $userData = [
            'id' => $user->id,
            'first_name' => $user->first_name,
            'middle_name' => $user->middle_name,
            'last_name' => $user->last_name,
            'full_name' => $user->full_name,
            'email' => $user->email,
            'avatar' => $user->avatar,
            'registration_status' => $user->registration_status,
            'is_active_session' => $user->is_active_session,
            'last_activity_at' => $user->last_activity_at,
            'created_at' => $user->created_at,
            'updated_at' => $user->updated_at,
            'role' => [
                'id' => $user->role->id,
                'name' => $user->role->name,
                'description' => $user->role->description,
            ],
            'custom_privileges' => $customPrivileges,
            'role_permissions' => $rolePermissions,
            'custom_privileges_count' => $customPrivileges->count(),
            'role_permissions_count' => $rolePermissions->count(),
        ];

        return Inertia::render('super_admin/user-profile', [
            'user' => $userData,
        ]);
    }

    /**
     * Update user registration status.
     */
    public function updateStatus(User $user, Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'registration_status' => 'required|in:pending,approved,rejected',
        ]);

        $user->update([
            'registration_status' => $validated['registration_status'],
        ]);

        return back()->with('success', 'User status updated successfully.');
    }

    /**
     * Update user role.
     */
    public function updateRole(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'role_id' => 'required|exists:roles,id',
        ]);

        $user->update([
            'role_id' => $validated['role_id'],
        ]);

        return redirect()->route('super-admin.users.show', $user)->with('success', 'User role updated successfully.');
    }

    /**
     * Assign territory (barangays) to technician.
     */
    public function assignTerritory(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'assigned_barangays' => 'nullable|array',
            'assigned_barangays.*' => 'string',
        ]);

        $user->update([
            'assigned_barangays' => $validated['assigned_barangays'] ?? [],
        ]);

        return redirect()->route('super-admin.users.show', $user)->with('success', 'Territory assigned successfully.');
    }

    /**
     * Show the form for creating a new user.
     */
    public function create(): Response
    {
        $roles = Role::orderBy('name')->get();

        return Inertia::render('super_admin/user-create', [
            'roles' => $roles,
        ]);
    }

    /**
     * Store a newly created user.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'role_id' => 'required|exists:roles,id',
            'assigned_barangays' => 'nullable|array',
            'assigned_barangays.*' => 'string',
        ]);

        $user = User::create([
            'first_name' => $validated['first_name'],
            'middle_name' => $validated['middle_name'] ?? null,
            'last_name' => $validated['last_name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role_id' => $validated['role_id'],
            'assigned_barangays' => $validated['assigned_barangays'] ?? [],
            'is_active' => true,
        ]);

        return redirect()->route('super-admin.users')->with('success', 'User created successfully.');
    }

    /**
     * Update the specified user.
     */
    public function update(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'password' => 'nullable|string|min:8|confirmed',
            'role_id' => 'required|exists:roles,id',
            'assigned_barangays' => 'nullable|array',
            'assigned_barangays.*' => 'string',
            'is_active' => 'required|boolean',
        ]);

        $updateData = [
            'first_name' => $validated['first_name'],
            'middle_name' => $validated['middle_name'] ?? null,
            'last_name' => $validated['last_name'],
            'email' => $validated['email'],
            'role_id' => $validated['role_id'],
            'assigned_barangays' => $validated['assigned_barangays'] ?? [],
            'is_active' => $validated['is_active'],
        ];

        if (!empty($validated['password'])) {
            $updateData['password'] = Hash::make($validated['password']);
        }

        $user->update($updateData);

        return redirect()->route('super-admin.users')->with('success', 'User updated successfully.');
    }
}
