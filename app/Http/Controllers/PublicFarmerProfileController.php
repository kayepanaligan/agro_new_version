<?php

namespace App\Http\Controllers;

use App\Models\Farmer;
use Inertia\Inertia;
use Inertia\Response;

class PublicFarmerProfileController extends Controller
{
    /**
     * Display a public farmer profile when QR code is scanned
     */
    public function show(string $lfid): Response
    {
        $farmer = Farmer::with([
            'profile',
            'address',
            'contact',
            'spouse',
            'household',
            'education',
            'emergencyContact',
            'mainLivelihood',
            'farmingActivities.commodity',
            'farmingActivities.variety',
            'farmworkerLivelihood',
            'fisherfolkLivelihood',
            'agriYouthLivelihood',
            'income',
            'farms',
            'documents',
            'memberships.organization',
            'cropRotations',
            'farmerAssignments',
            'organizationMemberships'
        ])
            ->where('lfid', $lfid)
            ->firstOrFail();

        // Calculate household members count from household table
        $householdMembersCount = 0;
        if ($farmer->household) {
            $householdMembersCount = $farmer->household->no_living_household_members;
        }

        // Get crops planted from farming activities
        $cropsPlanted = [];
        if ($farmer->farmingActivities && $farmer->farmingActivities->isNotEmpty()) {
            $cropsPlanted = $farmer->farmingActivities
                ->filter(fn($activity) => $activity->commodity)
                ->unique('commodity_id')
                ->pluck('commodity.name')
                ->filter()
                ->values()
                ->toArray();
        }

        return Inertia::render('public/farmer-profile', [
            'farmer' => array_merge($farmer->toArray(), [
                'household_members_count' => $householdMembersCount,
                'crops_planted' => $cropsPlanted,
            ]),
        ]);
    }
}
