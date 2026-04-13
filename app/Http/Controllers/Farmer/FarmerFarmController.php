<?php

namespace App\Http\Controllers\Farmer;

use App\Http\Controllers\Controller;
use App\Models\Farm;
use App\Models\Farmer;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FarmerFarmController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $farmer = Farmer::where('lfid', $user->lfid)->first();

        if (!$farmer) {
            abort(404, 'Farmer profile not found');
        }

        $farms = Farm::where('farmer_id', $farmer->id)
            ->withCount('farm_parcels')
            ->with(['farm_parcels' => function($query) {
                $query->select('id', 'farm_id', 'parcel_number', 'barangay', 'total_farm_area');
            }])
            ->get();

        return Inertia::render('farmer/farms', [
            'farms' => $farms,
        ]);
    }

    public function show(Farm $farm)
    {
        $user = auth()->user();
        $farmer = Farmer::where('lfid', $user->lfid)->first();

        // Ensure farmer owns this farm
        if ($farm->farmer_id !== $farmer->id) {
            abort(403, 'Unauthorized access');
        }

        $farm->load(['farm_parcels', 'farm_parcels.cropRotations', 'farm_parcels.farmerAssignments']);

        return Inertia::render('farmer/farms/show', [
            'farm' => $farm,
        ]);
    }
}
