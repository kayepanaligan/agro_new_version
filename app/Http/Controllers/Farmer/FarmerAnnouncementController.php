<?php

namespace App\Http\Controllers\Farmer;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FarmerAnnouncementController extends Controller
{
    public function index()
    {
        $announcements = Announcement::where('is_active', true)
            ->where('published_at', '<=', now())
            ->where(function($q) {
                $q->whereNull('expires_at')->orWhere('expires_at', '>', now());
            })
            ->with('creator')
            ->orderBy('published_at', 'desc')
            ->get();

        return Inertia::render('farmer/announcements', [
            'announcements' => $announcements,
        ]);
    }
}
