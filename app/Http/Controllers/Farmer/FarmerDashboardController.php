<?php

namespace App\Http\Controllers\Farmer;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use App\Models\CropDamageRecordItem;
use App\Models\DistributionRecordItem;
use App\Models\Farm;
use App\Models\FarmParcel;
use App\Models\Farmer;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FarmerDashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $farmer = Farmer::where('lfid', $user->lfid)->first();

        if (!$farmer) {
            abort(404, 'Farmer profile not found');
        }

        $stats = [
            'total_farms' => $farmer->farms()->count(),
            'total_parcels' => FarmParcel::whereHas('farm', function($q) use ($farmer) {
                $q->where('farmer_id', $farmer->id);
            })->count(),
            'pending_damage_reports' => CropDamageRecordItem::where('farmer_id', $farmer->id)
                ->where('status', 'pending')->count(),
            'total_allocations' => DistributionRecordItem::where('farmer_lfid', $farmer->lfid)->count(),
        ];

        $recentAnnouncements = Announcement::where('is_active', true)
            ->where('published_at', '<=', now())
            ->where(function($q) {
                $q->whereNull('expires_at')->orWhere('expires_at', '>', now());
            })
            ->orderBy('published_at', 'desc')
            ->limit(5)
            ->get();

        return Inertia::render('farmer/dashboard', [
            'farmer' => $farmer,
            'stats' => $stats,
            'recentAnnouncements' => $recentAnnouncements,
        ]);
    }
}
