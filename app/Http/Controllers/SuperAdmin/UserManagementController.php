<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UserManagementController extends Controller
{
    /**
     * Display user monitoring page.
     */
    public function index(): Response
    {
        $users = User::with('role')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($user) {
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
                    'role' => [
                        'id' => $user->role->id,
                        'name' => $user->role->name,
                    ],
                ];
            });

        return Inertia::render('super_admin/user-monitoring', [
            'users' => $users,
        ]);
    }

    /**
     * Display user profile page.
     */
    public function show(User $user): Response
    {
        $user->load('role');
        
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
}
