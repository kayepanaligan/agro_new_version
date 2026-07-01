<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\FarmerPoint;
use App\Models\RewardRedemption;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class RewardRedemptionsController extends Controller
{
    /**
     * Display reward redemptions.
     */
    public function index(): Response
    {
        $redemptions = RewardRedemption::with('farmer')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($redemption) {
                return [
                    'id' => $redemption->id,
                    'farmer_id' => $redemption->farmer_id,
                    'farmer_name' => $redemption->farmer->first_name . ' ' . $redemption->farmer->last_name,
                    'farmer_lfid' => $redemption->farmer->lfid,
                    'reward_type' => $redemption->reward_type,
                    'reward_name' => $redemption->reward_name,
                    'points_cost' => $redemption->points_cost,
                    'status' => $redemption->status,
                    'notes' => $redemption->notes,
                    'voucher_code' => $redemption->voucher_code,
                    'valid_until' => $redemption->valid_until,
                    'approved_at' => $redemption->approved_at,
                    'approved_by' => $redemption->approved_by,
                    'created_at' => $redemption->created_at,
                ];
            });

        return Inertia::render('admin/reward-redemptions', [
            'redemptions' => $redemptions,
        ]);
    }

    /**
     * Show redemption details.
     */
    public function show(RewardRedemption $rewardRedemption): Response
    {
        $rewardRedemption->load('farmer');

        return Inertia::render('admin/reward-redemptions/show', [
            'redemption' => $rewardRedemption,
        ]);
    }

    /**
     * Approve a redemption request.
     */
    public function approve(RewardRedemption $rewardRedemption): RedirectResponse
    {
        DB::transaction(function () use ($rewardRedemption) {
            // Deduct points from farmer
            FarmerPoint::create([
                'farmer_id' => $rewardRedemption->farmer_id,
                'activity_name' => 'Reward Redemption - ' . $rewardRedemption->reward_name,
                'description' => 'Points deducted for reward redemption',
                'category' => 'redemption',
                'points' => -$rewardRedemption->points_cost,
                'status' => 'verified',
                'awarded_by' => auth()->user()->name ?? 'Admin',
                'is_manual' => true,
                'verified_at' => now(),
                'verified_by' => auth()->user()->name ?? 'Admin',
            ]);

            // Update redemption status
            $rewardRedemption->update([
                'status' => 'approved',
                'approved_at' => now(),
                'approved_by' => auth()->user()->name ?? 'Admin',
            ]);
        });

        return back()->with('success', 'Redemption approved and points deducted.');
    }

    /**
     * Reject a redemption request.
     */
    public function reject(Request $request, RewardRedemption $rewardRedemption): RedirectResponse
    {
        $validated = $request->validate([
            'notes' => 'nullable|string',
        ]);

        $rewardRedemption->update([
            'status' => 'rejected',
            'notes' => $validated['notes'] ?? $rewardRedemption->notes,
        ]);

        return back()->with('success', 'Redemption rejected.');
    }
}
