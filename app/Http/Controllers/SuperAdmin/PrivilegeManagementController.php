<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Permission;
use App\Models\User;
use App\Models\UserPrivilege;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class PrivilegeManagementController extends Controller
{
    /**
     * Display privilege management page.
     */
    public function index(Request $request): Response
    {
        $query = User::with(['role', 'userPrivileges.permission'])
            ->orderBy('last_name')
            ->orderBy('first_name');

        // Filter by role
        if ($request->filled('role_id')) {
            $query->where('role_id', $request->role_id);
        }

        // Filter by search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $users = $query->get()->map(function ($user) {
            $rolePermissions = $user->role ? $user->role->permissions->pluck('id')->toArray() : [];
            $userPrivileges = $user->userPrivileges->pluck('granted', 'permission_id')->toArray();
            
            return [
                'id' => $user->id,
                'full_name' => $user->full_name,
                'email' => $user->email,
                'role' => $user->role ? [
                    'id' => $user->role->id,
                    'name' => $user->role->name,
                ] : null,
                'role_permissions_count' => count($rolePermissions),
                'custom_privileges_count' => count($user->userPrivileges),
                'created_at' => $user->created_at,
            ];
        });

        $roles = \App\Models\Role::orderBy('name')->get();

        return Inertia::render('super_admin/privilege-management', [
            'users' => $users,
            'roles' => $roles,
            'filters' => $request->only(['role_id', 'search']),
        ]);
    }

    /**
     * Show user privilege assignment page.
     */
    public function show(User $user): Response
    {
        $user->load(['role.permissions', 'userPrivileges.permission', 'userPrivileges.grantedBy']);

        $permissions = Permission::orderBy('module')->orderBy('display_name')->get()->groupBy('module');
        
        $userPrivileges = $user->userPrivileges->pluck('granted', 'permission_id')->toArray();
        $rolePermissions = $user->role ? $user->role->permissions->pluck('id')->toArray() : [];

        return Inertia::render('super_admin/user-privileges', [
            'user' => [
                'id' => $user->id,
                'full_name' => $user->full_name,
                'email' => $user->email,
                'role' => $user->role ? [
                    'id' => $user->role->id,
                    'name' => $user->role->name,
                ] : null,
            ],
            'permissions' => $permissions,
            'userPrivileges' => $userPrivileges,
            'rolePermissions' => $rolePermissions,
            'privilegeHistory' => $user->userPrivileges->map(function ($priv) {
                return [
                    'id' => $priv->id,
                    'permission_name' => $priv->permission->name,
                    'permission_display' => $priv->permission->display_name,
                    'granted' => $priv->granted,
                    'remarks' => $priv->remarks,
                    'granted_by' => $priv->grantedBy->full_name,
                    'created_at' => $priv->created_at,
                ];
            })->sortByDesc('created_at')->values(),
        ]);
    }

    /**
     * Assign privilege to user.
     */
    public function assign(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'permission_id' => 'required|exists:permissions,id',
            'granted' => 'required|boolean',
            'remarks' => 'nullable|string',
        ]);

        // Check if privilege already exists
        $privilege = UserPrivilege::where('user_id', $user->id)
            ->where('permission_id', $validated['permission_id'])
            ->first();

        if ($privilege) {
            // Update existing privilege
            $privilege->update([
                'granted' => $validated['granted'],
                'remarks' => $validated['remarks'] ?? $privilege->remarks,
            ]);
        } else {
            // Create new privilege
            UserPrivilege::create([
                'user_id' => $user->id,
                'permission_id' => $validated['permission_id'],
                'granted' => $validated['granted'],
                'remarks' => $validated['remarks'] ?? null,
                'granted_by' => Auth::id(),
            ]);
        }

        return redirect()->route('super-admin.privileges.show', $user)
            ->with('success', 'Privilege assigned successfully.');
    }

    /**
     * Bulk assign privileges to user.
     */
    public function bulkAssign(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'permissions' => 'required|array',
            'permissions.*.permission_id' => 'required|exists:permissions,id',
            'permissions.*.granted' => 'required|boolean',
        ]);

        foreach ($validated['permissions'] as $permData) {
            $privilege = UserPrivilege::where('user_id', $user->id)
                ->where('permission_id', $permData['permission_id'])
                ->first();

            if ($privilege) {
                $privilege->update([
                    'granted' => $permData['granted'],
                ]);
            } else {
                UserPrivilege::create([
                    'user_id' => $user->id,
                    'permission_id' => $permData['permission_id'],
                    'granted' => $permData['granted'],
                    'granted_by' => Auth::id(),
                ]);
            }
        }

        return redirect()->route('super-admin.privileges.show', $user)
            ->with('success', 'Privileges assigned successfully.');
    }

    /**
     * Remove user-specific privilege (revert to role default).
     */
    public function remove(User $user, UserPrivilege $privilege): RedirectResponse
    {
        if ($privilege->user_id !== $user->id) {
            abort(403, 'Unauthorized');
        }

        $privilege->delete();

        return redirect()->route('super-admin.privileges.show', $user)
            ->with('success', 'Privilege removed. User will now inherit role permissions.');
    }
}
