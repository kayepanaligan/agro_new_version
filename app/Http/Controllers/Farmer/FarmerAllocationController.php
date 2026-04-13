<?php

namespace App\Http\Controllers\Farmer;

use App\Http\Controllers\Controller;
use App\Models\AllocationType;
use App\Models\DistributionRecordItem;
use App\Models\Farmer;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FarmerAllocationController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $farmer = Farmer::where('lfid', $user->lfid)->first();

        if (!$farmer) {
            abort(404, 'Farmer profile not found');
        }

        $allocations = DistributionRecordItem::where('farmer_lfid', $farmer->lfid)
            ->with(['distributionRecord', 'allocationPolicy', 'acknowledgement'])
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('farmer/allocations', [
            'allocations' => $allocations,
        ]);
    }

    public function eligible()
    {
        $user = auth()->user();
        $farmer = Farmer::where('lfid', $user->lfid)
            ->with(['profile', 'address', 'crops'])
            ->first();

        if (!$farmer) {
            abort(404, 'Farmer profile not found');
        }

        // Get all active allocation types
        $allocationTypes = AllocationType::with(['program', 'unitOfMeasurement'])->get();

        // Filter based on farmer's eligibility (simplified logic)
        $eligibleAllocations = $allocationTypes->filter(function($allocationType) use ($farmer) {
            // Check barangay eligibility
            if ($allocationType->barangay_ids && $farmer->address) {
                // This is a simplified check - you may need to adjust based on your barangay structure
                return true;
            }

            // Check farmer eligibility criteria
            if ($allocationType->farmer_eligibility_criteria) {
                // Implement your eligibility checking logic here
                return true;
            }

            return true;
        });

        return Inertia::render('farmer/eligible-allocations', [
            'eligibleAllocations' => $eligibleAllocations->values(),
            'farmer' => $farmer,
        ]);
    }
}
