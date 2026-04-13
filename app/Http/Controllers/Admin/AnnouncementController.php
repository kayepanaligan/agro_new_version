<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AnnouncementController extends Controller
{
    public function index()
    {
        $announcements = Announcement::with('creator')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('admin/announcements', [
            'announcements' => $announcements,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'priority' => 'required|in:low,medium,high,urgent',
            'published_at' => 'nullable|date',
            'expires_at' => 'nullable|date',
            'is_active' => 'boolean',
        ]);

        Announcement::create([
            ...$validated,
            'created_by' => auth()->id(),
            'published_at' => $validated['published_at'] ?? now(),
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return redirect()->route('admin.announcements')
            ->with('success', 'Announcement created successfully');
    }

    public function update(Request $request, Announcement $announcement)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'priority' => 'required|in:low,medium,high,urgent',
            'published_at' => 'nullable|date',
            'expires_at' => 'nullable|date',
            'is_active' => 'boolean',
        ]);

        $announcement->update($validated);

        return redirect()->route('admin.announcements')
            ->with('success', 'Announcement updated successfully');
    }

    public function destroy(Announcement $announcement)
    {
        $announcement->delete();

        return redirect()->route('admin.announcements')
            ->with('success', 'Announcement deleted successfully');
    }
}
