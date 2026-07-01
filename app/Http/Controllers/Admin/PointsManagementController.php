<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Farmer;
use App\Models\FarmerPoint;
use App\Models\PointRule;
use App\Models\RewardRedemption;
use App\Models\TierConfig;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PointsManagementController extends Controller
{
    /**
     * Display points management dashboard.
     */
    public function index(): Response
    {
        // Get all farmers with points summary
        $farmers = Farmer::with(['profile', 'address'])
            ->orderBy('last_name', 'asc')
            ->get()
            ->map(function ($farmer) {
                $totalPoints = $farmer->farmerPoints()->verified()->sum('points');
                $currentTier = $this->getTier($totalPoints);
                
                return [
                    'id' => $farmer->id,
                    'lfid' => $farmer->lfid,
                    'first_name' => $farmer->first_name,
                    'last_name' => $farmer->last_name,
                    'barangay' => $farmer->barangay,
                    'total_points' => $totalPoints,
                    'current_tier' => $currentTier,
                    'activities_count' => $farmer->farmerPoints()->verified()->count(),
                ];
            });

        // Get leaderboard (top farmers by points)
        $leaderboard = $farmers
            ->sortByDesc('total_points')
            ->take(50)
            ->values()
            ->map(function ($farmer, $index) {
                return array_merge($farmer, ['rank' => $index + 1]);
            });

        // Get stats
        $totalPointsAll = FarmerPoint::verified()->sum('points');
        $activeFarmers = Farmer::has('farmerPoints')->count();
        $pendingRedemptions = RewardRedemption::pending()->count();
        $thisMonthPoints = FarmerPoint::verified()
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->sum('points');

        // Get tier distribution
        $tierDistribution = [
            'Seedling' => $farmers->filter(fn($f) => $f['total_points'] < 200)->count(),
            'Bronze' => $farmers->filter(fn($f) => $f['total_points'] >= 200 && $f['total_points'] < 500)->count(),
            'Silver' => $farmers->filter(fn($f) => $f['total_points'] >= 500 && $f['total_points'] < 1000)->count(),
            'Gold' => $farmers->filter(fn($f) => $f['total_points'] >= 1000)->count(),
        ];

        // Get farmers nearing promotion
        $nearingPromotion = $farmers
            ->filter(fn($f) => in_array($f['total_points'], [180, 450, 900]))
            ->take(10)
            ->values();

        return Inertia::render('admin/points-management', [
            'farmers' => $farmers,
            'pointRules' => PointRule::orderBy('name')->get(),
            'leaderboard' => $leaderboard,
            'tierConfigs' => TierConfig::ordered()->get(),
            'stats' => [
                'total_points' => $totalPointsAll,
                'active_farmers' => $activeFarmers,
                'pending_redemptions' => $pendingRedemptions,
                'this_month_points' => $thisMonthPoints,
            ],
            'tierDistribution' => $tierDistribution,
            'nearingPromotion' => $nearingPromotion,
        ]);
    }

    /**
     * Manually award points to a farmer.
     */
    public function awardPoints(Request $request)
    {
        $validated = $request->validate([
            'farmer_id' => 'required|exists:farmers,id',
            'point_rule_id' => 'nullable|exists:point_rules,id',
            'points' => 'required|integer|min:1',
            'category' => 'required|string',
            'activity_name' => 'required|string',
            'description' => 'nullable|string',
            'admin_notes' => 'nullable|string',
        ]);

        FarmerPoint::create([
            'farmer_id' => $validated['farmer_id'],
            'point_rule_id' => $validated['point_rule_id'] ?? null,
            'activity_name' => $validated['activity_name'],
            'description' => $validated['description'] ?? null,
            'category' => $validated['category'],
            'points' => $validated['points'],
            'status' => 'verified',
            'awarded_by' => auth()->user()->name ?? 'Admin',
            'admin_notes' => $validated['admin_notes'] ?? null,
            'is_manual' => true,
            'verified_at' => now(),
            'verified_by' => auth()->user()->name ?? 'Admin',
        ]);

        return back()->with('success', 'Points awarded successfully.');
    }

    /**
     * Determine tier based on points.
     */
    private function getTier(int $points): string
    {
        if ($points >= 1000) {
            return 'Gold';
        } elseif ($points >= 500) {
            return 'Silver';
        } elseif ($points >= 200) {
            return 'Bronze';
        }
        return 'Seedling';
    }
}
