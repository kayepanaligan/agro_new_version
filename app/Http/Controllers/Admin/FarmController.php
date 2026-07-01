<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Farm;
use App\Models\FarmParcel;
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

        // ── Analytics Data ──────────────────────────────────────────
        $dateStart = $request->get('date_start');
        $dateEnd = $request->get('date_end');

        $farmQuery = Farm::query();
        if ($dateStart && $dateEnd) {
            $farmQuery->whereDate('created_at', '>=', $dateStart)
                      ->whereDate('created_at', '<=', $dateEnd);
        }

        $filteredFarmIds = $farmQuery->pluck('id');
        $parcels = FarmParcel::whereIn('farm_id', $filteredFarmIds)->get();

        $totalFarms = $filteredFarmIds->count();
        $totalParcels = $parcels->count();
        $totalArea = round($parcels->sum('total_farm_area'), 2);
        $uniqueFarmers = Farm::whereIn('id', $filteredFarmIds)->distinct('farmer_id')->count('farmer_id');

        // Parcel count distribution (parcels per farm)
        $parcelsPerFarm = $parcels->groupBy('farm_id')->map->count();
        $parcelCountDist = [
            ['name' => '1 Parcel', 'count' => $parcelsPerFarm->filter(fn($c) => $c === 1)->count()],
            ['name' => '2 Parcels', 'count' => $parcelsPerFarm->filter(fn($c) => $c === 2)->count()],
            ['name' => '3 Parcels', 'count' => $parcelsPerFarm->filter(fn($c) => $c === 3)->count()],
            ['name' => '4+ Parcels', 'count' => $parcelsPerFarm->filter(fn($c) => $c >= 4)->count()],
        ];

        // Area size distribution
        $small = $parcels->filter(fn($p) => ($p->total_farm_area ?? 0) < 2)->count();
        $medium = $parcels->filter(fn($p) => ($p->total_farm_area ?? 0) >= 2 && ($p->total_farm_area ?? 0) < 5)->count();
        $large = $parcels->filter(fn($p) => ($p->total_farm_area ?? 0) >= 5)->count();
        $areaSizeDist = [
            ['name' => 'Small (<2 ha)', 'count' => $small],
            ['name' => 'Medium (2-5 ha)', 'count' => $medium],
            ['name' => 'Large (>5 ha)', 'count' => $large],
        ];

        // Barangay distribution
        $barangayDist = $parcels->groupBy('barangay')
            ->map->count()
            ->sortDesc()
            ->take(10)
            ->map(fn($count, $name) => ['name' => $name ?: 'Unknown', 'count' => $count])
            ->values()
            ->toArray();

        // Ownership type distribution
        $ownershipDist = $parcels->groupBy('ownership_type')
            ->map->count()
            ->map(fn($count, $name) => ['name' => $name ?: 'Not specified', 'count' => $count])
            ->values()
            ->toArray();

        // Farm type distribution
        $farmTypeDist = $parcels->groupBy('farm_type')
            ->map->count()
            ->map(fn($count, $name) => ['name' => $name ?: 'Not specified', 'count' => $count])
            ->values()
            ->toArray();

        // Organic vs non-organic
        $organicDist = [
            ['name' => 'Organic', 'count' => $parcels->where('is_organic_practitioner', true)->count()],
            ['name' => 'Non-Organic', 'count' => $parcels->where('is_organic_practitioner', false)->count()],
        ];

        // Ancestral domain
        $ancestralDist = [
            ['name' => 'Within Ancestral Domain', 'count' => $parcels->where('within_ancestral_domain', true)->count()],
            ['name' => 'Outside', 'count' => $parcels->where('within_ancestral_domain', false)->count()],
        ];

        // Ownership document type
        $docTypeDist = $parcels->groupBy('ownership_document_type')
            ->map->count()
            ->map(fn($count, $name) => ['name' => $name ?: 'No Document', 'count' => $count])
            ->values()
            ->toArray();

        // Narrative
        $avgArea = $totalParcels > 0 ? round($totalArea / $totalParcels, 2) : 0;
        $organicCount = $parcels->where('is_organic_practitioner', true)->count();
        $ancestralCount = $parcels->where('within_ancestral_domain', true)->count();
        $topBarangay = $barangayDist[0] ?? null;

        $narrative = "The farms module covers {$totalFarms} farms with {$totalParcels} parcels, ";
        $narrative .= "spanning a total of {$totalArea} hectares across {$uniqueFarmers} unique farmers. ";
        $narrative .= "The average parcel size is {$avgArea} hectares. ";
        if ($topBarangay) {
            $narrative .= "The top barangay by parcel count is {$topBarangay['name']} with {$topBarangay['count']} parcels. ";
        }
        if ($organicCount > 0) {
            $narrative .= "{$organicCount} parcels practice organic farming. ";
        }
        if ($ancestralCount > 0) {
            $narrative .= "{$ancestralCount} parcels are within ancestral domains.";
        }

        $analytics = [
            'total_farms' => $totalFarms,
            'total_parcels' => $totalParcels,
            'total_area' => $totalArea,
            'unique_farmers' => $uniqueFarmers,
            'avg_parcel_area' => $avgArea,
            'parcel_count_dist' => $parcelCountDist,
            'area_size_dist' => $areaSizeDist,
            'barangay_dist' => $barangayDist,
            'ownership_dist' => $ownershipDist,
            'farm_type_dist' => $farmTypeDist,
            'organic_dist' => $organicDist,
            'ancestral_dist' => $ancestralDist,
            'doc_type_dist' => $docTypeDist,
            'narrative' => $narrative,
            'date_range' => ($dateStart && $dateEnd) ? ['start' => $dateStart, 'end' => $dateEnd] : null,
        ];

        return Inertia::render('admin/farms/index', [
            'farms' => $farms,
            'analytics' => $analytics,
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
