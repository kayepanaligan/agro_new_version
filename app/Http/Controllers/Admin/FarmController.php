<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Farm;
use App\Models\Farmer;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FarmController extends Controller
{
    /**
     * Display a listing of farms.
     */
    public function index(Request $request)
    {
        $query = Farm::with(['farmer', 'farmParcels']);

        // Search filter
        if ($search = $request->get('search')) {
            $query->where(function($q) use ($search) {
                $q->where('farm_name', 'like', "%{$search}%")
                  ->orWhereHas('farmer', function($q) use ($search) {
                      $q->where('first_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%");
                  });
            });
        }

        // Farmer filter
        if ($farmerId = $request->get('farmer_id')) {
            $query->where('farmer_id', $farmerId);
        }

        // Sorting
        $sortField = $request->get('sort', 'farm_name');
        $sortOrder = $request->get('order', 'asc');
        
        if (in_array($sortField, ['farm_name', 'created_at'])) {
            $query->orderBy($sortField, $sortOrder);
        } elseif ($sortField === 'farmer_name') {
            $query->join('farmers', 'farms.farmer_id', '=', 'farmers.id')
                  ->orderByRaw("CONCAT(farmers.first_name, ' ', farmers.last_name) {$sortOrder}")
                  ->select('farms.*');
        }

        $farms = $query->paginate(10)->withQueryString();

        // Add farm parcels count
        $farms->getCollection()->transform(function($farm) {
            $farm->farm_parcels_count = $farm->farmParcels ? $farm->farmParcels->count() : 0;
            return $farm;
        });

        return Inertia::render('admin/farms/index', [
            'farms' => $farms
        ]);
    }

    /**
     * Display the specified farm with its details.
     */
    public function show(Farm $farm)
    {
        $farm->load(['farmer', 'farmParcels']);

        return Inertia::render('admin/farms/show', [
            'farm' => $farm
        ]);
    }
}
