<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RoleManagementController extends Controller
{
    /**
     * Display a listing of roles.
     */
    public function index(): Response
    {
        $roles = Role::withCount(['users', 'permissions'])
            ->orderBy('name')
            ->get()
            ->map(function ($role) {
                return [
                    'id' => $role->id,
                    'name' => $role->name,
                    'description' => $role->description,
                    'users_count' => $role->users_count,
                    'permissions_count' => $role->permissions_count,
                    'created_at' => $role->created_at,
                ];
            });

        return Inertia::render('super_admin/role-management', [
            'roles' => $roles,
        ]);
    }

    /**
     * Show the form for creating a new role.
     */
    public function create(): Response
    {
        $permissions = Permission::orderBy('module')->orderBy('display_name')->get()->groupBy('module');

        return Inertia::render('super_admin/role-create', [
            'permissions' => $permissions,
        ]);
    }

    /**
     * Store a newly created role.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:roles,name',
            'description' => 'nullable|string',
            'permissions' => 'array',
            'permissions.*' => 'exists:permissions,id',
        ]);

        $role = Role::create([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
        ]);

        if (!empty($validated['permissions'])) {
            $role->permissions()->attach($validated['permissions']);
        }

        return redirect()->route('super-admin.roles')->with('success', 'Role created successfully.');
    }

    /**
     * Display the specified role.
     */
    public function show(Role $role): Response
    {
        $role->load(['permissions', 'users']);

        return Inertia::render('super_admin/role-show', [
            'role' => [
                'id' => $role->id,
                'name' => $role->name,
                'description' => $role->description,
                'permissions' => $role->permissions->map(fn($p) => [
                    'id' => $p->id,
                    'name' => $p->name,
                    'display_name' => $p->display_name,
                    'module' => $p->module,
                ]),
                'users' => $role->users->map(fn($u) => [
                    'id' => $u->id,
                    'full_name' => $u->full_name,
                    'email' => $u->email,
                ]),
                'created_at' => $role->created_at,
            ],
        ]);
    }

    /**
     * Show the form for editing the specified role.
     */
    public function edit(Role $role): Response
    {
        $permissions = Permission::orderBy('module')->orderBy('display_name')->get()->groupBy('module');
        $rolePermissions = $role->permissions->pluck('id')->toArray();

        return Inertia::render('super_admin/role-edit', [
            'role' => [
                'id' => $role->id,
                'name' => $role->name,
                'description' => $role->description,
            ],
            'permissions' => $permissions,
            'rolePermissions' => $rolePermissions,
        ]);
    }

    /**
     * Update the specified role.
     */
    public function update(Request $request, Role $role): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:roles,name,' . $role->id,
            'description' => 'nullable|string',
            'permissions' => 'array',
            'permissions.*' => 'exists:permissions,id',
        ]);

        $role->update([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
        ]);

        $role->permissions()->sync($validated['permissions'] ?? []);

        return redirect()->route('super-admin.roles')->with('success', 'Role updated successfully.');
    }

    /**
     * Remove the specified role.
     */
    public function destroy(Role $role): RedirectResponse
    {
        // Prevent deletion if users are assigned to this role
        if ($role->users()->count() > 0) {
            return redirect()->route('super-admin.roles')->with('error', 'Cannot delete role with assigned users.');
        }

        $role->delete();

        return redirect()->route('super-admin.roles')->with('success', 'Role deleted successfully.');
    }
}
