<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Session;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SessionController extends Controller
{
    /**
     * Display session monitoring page.
     */
    public function index(): Response
    {
        $sessions = Session::with('user')
            ->orderBy('last_activity', 'desc')
            ->get()
            ->map(function ($session) {
                return [
                    'id' => $session->id,
                    'user_id' => $session->user_id,
                    'ip_address' => $session->ip_address,
                    'user_agent' => $session->user_agent,
                    'last_activity' => $session->last_activity?->toDateTimeString(),
                    'is_active' => $session->is_active,
                    'device' => $session->device,
                    'browser' => $session->browser,
                    'os' => $session->os,
                    'user' => $session->user ? [
                        'id' => $session->user->id,
                        'full_name' => $session->user->full_name,
                        'email' => $session->user->email,
                        'avatar' => $session->user->avatar,
                    ] : null,
                ];
            });

        return Inertia::render('super_admin/session-monitoring', [
            'sessions' => $sessions,
        ]);
    }

    /**
     * Terminate a specific user session.
     */
    public function destroy(string $sessionId): RedirectResponse
    {
        $session = Session::findOrFail($sessionId);
        
        // Delete the session from database
        $session->delete();
        
        return back()->with('success', 'Session terminated successfully.');
    }

    /**
     * Terminate all sessions for a specific user.
     */
    public function terminateUserSessions(int $userId): RedirectResponse
    {
        $deletedCount = Session::where('user_id', $userId)->delete();
        
        return back()->with('success', "Terminated {$deletedCount} session(s) for user.");
    }

    /**
     * Terminate all sessions except current one.
     */
    public function terminateAllOtherSessions(Request $request): RedirectResponse
    {
        $currentSessionId = $request->session()->getId();
        
        $deletedCount = Session::where('id', '!=', $currentSessionId)->delete();
        
        return back()->with('success', "Terminated {$deletedCount} other session(s).");
    }
}
