<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CropDamageRecordItem;
use App\Models\DistributionRecordItem;
use App\Models\Farm;
use App\Models\FarmParcel;
use App\Models\Farmer;
use App\Models\FarmerMainLivelihood;
use App\Models\FarmerPoint;
use App\Models\FarmerProfile;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardAnalyticsController extends Controller
{
    /**
     * Display the admin dashboard with analytics data.
     */
    public function index(Request $request, string $view = 'admin/dashboard')
    {
        $dateStart = $request->input('date_start');
        $dateEnd = $request->input('date_end');

        return Inertia::render($view, [
            'analytics' => [
                'kpis' => $this->getKpis($dateStart, $dateEnd),
                'demographics' => $this->getDemographicsData($dateStart, $dateEnd),
                'geographic' => $this->getGeographicData($dateStart, $dateEnd),
                'farm_size_distribution' => $this->getFarmSizeDistribution($dateStart, $dateEnd),
                'crop_distribution' => $this->getCropDistribution($dateStart, $dateEnd),
                'parcel_insights' => $this->getParcelInsights($dateStart, $dateEnd),
                'registration_status' => $this->getRegistrationStatus($dateStart, $dateEnd),
                'allocation_coverage' => $this->getAllocationCoverage($dateStart, $dateEnd),
                'crop_damage' => $this->getCropDamageInsights($dateStart, $dateEnd),
                'registration_trends' => $this->getRegistrationTrends($dateStart, $dateEnd),
                'points_summary' => $this->getPointsSummary($dateStart, $dateEnd),
                'last_synced_at' => now()->toISOString(),
                'date_range' => $dateStart && $dateEnd ? ['start' => $dateStart, 'end' => $dateEnd] : null,
            ]
        ]);
    }

    /**
     * Get KPI data.
     */
    private function getKpis(?string $start, ?string $end): array
    {
        $farmerQuery = Farmer::query();
        $farmQuery = Farm::query();
        $parcelQuery = FarmParcel::query();

        if ($start && $end) {
            $farmerQuery->whereBetween('created_at', [$start . ' 00:00:00', $end . ' 23:59:59']);
            $farmQuery->whereBetween('created_at', [$start . ' 00:00:00', $end . ' 23:59:59']);
            $parcelQuery->whereBetween('created_at', [$start . ' 00:00:00', $end . ' 23:59:59']);
        }

        return [
            'total_farmers' => $farmerQuery->count(),
            'total_farms' => $farmQuery->count(),
            'total_parcels' => $parcelQuery->count(),
            'total_farm_area' => $parcelQuery->sum('total_farm_area') ?? 0,
        ];
    }

    /**
     * Get farmer demographics data.
     */
    private function getDemographicsData(?string $start, ?string $end): array
    {
        // Build farmer ID filter subquery
        $farmerIds = Farmer::query();
        if ($start && $end) {
            $farmerIds->whereBetween('created_at', [$start . ' 00:00:00', $end . ' 23:59:59']);
        }
        $ids = $farmerIds->pluck('id');

        // Main livelihood distribution
        $livelihood = FarmerMainLivelihood::whereIn('farmer_id', $ids)
            ->select('main_livelihood as name', DB::raw('count(*) as count'))
            ->groupBy('main_livelihood')
            ->get()
            ->toArray();

        // 4Ps beneficiaries
        $fps = FarmerProfile::whereIn('farmer_id', $ids)
            ->select(
                DB::raw('CASE WHEN is_4ps_beneficiary = 1 THEN "4Ps Beneficiary" ELSE "Non-4Ps" END as name'),
                DB::raw('count(*) as count')
            )
            ->groupBy('is_4ps_beneficiary')
            ->get()
            ->toArray();

        // Gender distribution
        $gender = FarmerProfile::whereIn('farmer_id', $ids)
            ->select('sex as name', DB::raw('count(*) as count'))
            ->groupBy('sex')
            ->get()
            ->toArray();

        // Civil status distribution
        $civilStatus = FarmerProfile::whereIn('farmer_id', $ids)
            ->select('civil_status as name', DB::raw('count(*) as count'))
            ->groupBy('civil_status')
            ->get()
            ->toArray();

        // IP distribution
        $ip = FarmerProfile::whereIn('farmer_id', $ids)
            ->select(
                DB::raw('CASE WHEN is_ip = 1 THEN "IP" ELSE "Non-IP" END as name'),
                DB::raw('count(*) as count')
            )
            ->groupBy('is_ip')
            ->get()
            ->toArray();

        return [
            'livelihood' => $livelihood,
            'is_4ps' => $fps,
            'gender' => $gender,
            'civil_status' => $civilStatus,
            'is_ip' => $ip,
        ];
    }

    /**
     * Get geographic distribution data.
     */
    private function getGeographicData(?string $start, ?string $end): array
    {
        $query = FarmParcel::query();
        if ($start && $end) {
            $query->whereBetween('created_at', [$start . ' 00:00:00', $end . ' 23:59:59']);
        }

        $byBarangay = $query->select(
            'barangay',
            DB::raw('count(distinct farm_id) as farmer_count'),
            DB::raw('sum(total_farm_area) as total_area')
        )
            ->groupBy('barangay')
            ->orderBy('farmer_count', 'desc')
            ->get()
            ->toArray();

        $topBarangays = array_slice($byBarangay, 0, 10);

        return [
            'by_barangay' => $byBarangay,
            'top_barangays' => $topBarangays,
        ];
    }

    /**
     * Get farm size distribution.
     */
    private function getFarmSizeDistribution(?string $start, ?string $end): array
    {
        $query = FarmParcel::query();
        if ($start && $end) {
            $query->whereBetween('created_at', [$start . ' 00:00:00', $end . ' 23:59:59']);
        }

        $small = (clone $query)->where('total_farm_area', '<', 2)->count();
        $medium = (clone $query)->whereBetween('total_farm_area', [2, 5])->count();
        $large = (clone $query)->where('total_farm_area', '>', 5)->count();

        return [
            ['name' => 'Small (<2 ha)', 'count' => $small],
            ['name' => 'Medium (2-5 ha)', 'count' => $medium],
            ['name' => 'Large (>5 ha)', 'count' => $large],
        ];
    }

    /**
     * Get crop/commodity distribution.
     */
    private function getCropDistribution(?string $start, ?string $end): array
    {
        $farmerIds = Farmer::query();
        if ($start && $end) {
            $farmerIds->whereBetween('created_at', [$start . ' 00:00:00', $end . ' 23:59:59']);
        }
        $ids = $farmerIds->pluck('id');

        // By commodity
        $byCommodity = DB::table('farmer_crops')
            ->whereIn('farmer_id', $ids)
            ->select('commodity_id as name', DB::raw('count(*) as count'))
            ->groupBy('commodity_id')
            ->get()
            ->toArray();

        // Per barangay
        $perBarangay = DB::table('farmer_crops')
            ->join('farms', 'farmer_crops.farmer_id', '=', 'farms.farmer_id')
            ->join('farm_parcels', 'farms.id', '=', 'farm_parcels.farm_id')
            ->whereIn('farmer_crops.farmer_id', $ids)
            ->select(
                'farm_parcels.barangay',
                'farmer_crops.commodity_id as commodity',
                DB::raw('count(*) as count')
            )
            ->groupBy('farm_parcels.barangay', 'farmer_crops.commodity_id')
            ->orderBy('farm_parcels.barangay')
            ->get()
            ->toArray();

        return [
            'by_commodity' => $byCommodity,
            'per_barangay' => $perBarangay,
        ];
    }

    /**
     * Get parcel-level insights.
     */
    private function getParcelInsights(?string $start, ?string $end): array
    {
        $query = FarmParcel::query();
        if ($start && $end) {
            $query->whereBetween('created_at', [$start . ' 00:00:00', $end . ' 23:59:59']);
        }

        $avgParcelSize = (clone $query)->select(
            'farm_id',
            DB::raw('avg(total_farm_area) as avg_size')
        )
            ->groupBy('farm_id')
            ->get()
            ->avg('avg_size') ?? 0;

        $parcelsPerFarmer = (clone $query)->select(
            'farms.farmer_id',
            DB::raw('count(farm_parcels.id) as parcel_count')
        )
            ->join('farms', 'farm_parcels.farm_id', '=', 'farms.id')
            ->groupBy('farms.farmer_id')
            ->get()
            ->groupBy('parcel_count')
            ->map(function ($group, $count) {
                return ['parcels' => (int) $count, 'farmers' => $group->count()];
            })
            ->values()
            ->toArray();

        return [
            'avg_size' => round($avgParcelSize, 2),
            'count_distribution' => $parcelsPerFarmer,
        ];
    }

    /**
     * Get registration status distribution.
     */
    private function getRegistrationStatus(?string $start, ?string $end): array
    {
        $query = Farmer::query();
        if ($start && $end) {
            $query->whereBetween('created_at', [$start . ' 00:00:00', $end . ' 23:59:59']);
        }

        return $query->select('registration_status as name', DB::raw('count(*) as count'))
            ->groupBy('registration_status')
            ->get()
            ->toArray();
    }

    /**
     * Get allocation coverage data.
     */
    private function getAllocationCoverage(?string $start, ?string $end): array
    {
        $farmerQuery = Farmer::query();
        if ($start && $end) {
            $farmerQuery->whereBetween('created_at', [$start . ' 00:00:00', $end . ' 23:59:59']);
        }
        $totalFarmers = $farmerQuery->count();

        $distQuery = DistributionRecordItem::query();
        if ($start && $end) {
            $distQuery->whereHas('distributionRecord', function ($q) use ($start, $end) {
                $q->whereBetween('release_date', [$start, $end]);
            });
        }
        $receivedAssistance = (clone $distQuery)->distinct('farmer_lfid')->count('farmer_lfid');
        $notReceived = max(0, $totalFarmers - $receivedAssistance);

        $received = [
            ['name' => 'Received', 'count' => $receivedAssistance],
            ['name' => 'Not Received', 'count' => $notReceived],
        ];

        // Trend over time
        $trendQuery = DistributionRecordItem::join('distribution_records', 'distribution_record_items.distribution_record_id', '=', 'distribution_records.id');
        if ($start && $end) {
            $trendQuery->whereBetween('distribution_records.release_date', [$start, $end]);
        }
        $trend = $trendQuery->select(
                DB::raw('DATE_FORMAT(distribution_records.release_date, "%Y-%m") as month'),
                DB::raw('count(distinct distribution_record_items.farmer_lfid) as count')
            )
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->toArray();

        return [
            'received' => $received,
            'trend' => $trend,
        ];
    }

    /**
     * Get crop damage insights.
     */
    private function getCropDamageInsights(?string $start, ?string $end): array
    {
        $query = CropDamageRecordItem::query();
        if ($start && $end) {
            $query->whereHas('cropDamageRecord', function ($q) use ($start, $end) {
                $q->whereBetween('recorded_date', [$start, $end]);
            });
        }

        $severity = (clone $query)->select('damage_severity as name', DB::raw('count(*) as count'))
            ->groupBy('damage_severity')
            ->get()
            ->toArray();

        // Trend over time
        $trendQuery = CropDamageRecordItem::join('crop_damage_records', 'crop_damage_record_items.crop_damage_record_id', '=', 'crop_damage_records.crop_damage_record_id');
        if ($start && $end) {
            $trendQuery->whereBetween('crop_damage_records.recorded_date', [$start, $end]);
        }
        $trend = $trendQuery->select(
                DB::raw('DATE_FORMAT(crop_damage_records.recorded_date, "%Y-%m") as month'),
                DB::raw('count(*) as count')
            )
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->toArray();

        return [
            'severity' => $severity,
            'trend' => $trend,
        ];
    }

    /**
     * Get registration trends over time.
     */
    private function getRegistrationTrends(?string $start, ?string $end): array
    {
        $query = Farmer::query();
        if ($start && $end) {
            $query->whereBetween('created_at', [$start . ' 00:00:00', $end . ' 23:59:59']);
        }

        return $query->select(
            DB::raw('DATE_FORMAT(created_at, "%Y-%m") as month'),
            DB::raw('count(*) as count')
        )
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->toArray();
    }

    /**
     * Get points summary for the points overview tab.
     */
    private function getPointsSummary(?string $start, ?string $end): array
    {
        $pointsQuery = FarmerPoint::where('status', 'verified');
        if ($start && $end) {
            $pointsQuery->whereBetween('created_at', [$start . ' 00:00:00', $end . ' 23:59:59']);
        }

        $totalPoints = (clone $pointsQuery)->sum('points');

        $farmerQuery = Farmer::has('farmerPoints');
        if ($start && $end) {
            $farmerQuery->whereHas('farmerPoints', function ($q) use ($start, $end) {
                $q->where('status', 'verified')->whereBetween('created_at', [$start . ' 00:00:00', $end . ' 23:59:59']);
            });
        }
        $activeFarmers = $farmerQuery->count();

        $thisMonthPoints = (clone $pointsQuery)
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->sum('points');

        // Tier distribution
        $tierFarmers = Farmer::withCount(['farmerPoints as total_points' => function ($q) use ($start, $end) {
            $q->select(DB::raw('COALESCE(SUM(points), 0)'))->where('status', 'verified');
            if ($start && $end) {
                $q->whereBetween('created_at', [$start . ' 00:00:00', $end . ' 23:59:59']);
            }
        }])->get();

        $tierDistribution = [
            ['name' => 'Seedling', 'count' => $tierFarmers->filter(fn($f) => $f->total_points < 200)->count()],
            ['name' => 'Bronze', 'count' => $tierFarmers->filter(fn($f) => $f->total_points >= 200 && $f->total_points < 500)->count()],
            ['name' => 'Silver', 'count' => $tierFarmers->filter(fn($f) => $f->total_points >= 500 && $f->total_points < 1000)->count()],
            ['name' => 'Gold', 'count' => $tierFarmers->filter(fn($f) => $f->total_points >= 1000)->count()],
        ];

        // Points trend
        $trendQuery = FarmerPoint::select(
            DB::raw('DATE_FORMAT(created_at, "%Y-%m") as month'),
            DB::raw('COALESCE(SUM(points), 0) as count')
        )
            ->where('status', 'verified');
        if ($start && $end) {
            $trendQuery->whereBetween('created_at', [$start . ' 00:00:00', $end . ' 23:59:59']);
        }
        $pointsTrend = $trendQuery->groupBy('month')
            ->orderBy('month')
            ->get()
            ->toArray();

        // Category breakdown
        $catQuery = FarmerPoint::select('category', DB::raw('COALESCE(SUM(points), 0) as count'))
            ->where('status', 'verified');
        if ($start && $end) {
            $catQuery->whereBetween('created_at', [$start . ' 00:00:00', $end . ' 23:59:59']);
        }
        $categoryBreakdown = $catQuery->groupBy('category')
            ->orderByDesc('count')
            ->get()
            ->toArray();

        return [
            'total_points' => $totalPoints,
            'active_farmers' => $activeFarmers,
            'this_month_points' => $thisMonthPoints,
            'tier_distribution' => $tierDistribution,
            'points_trend' => $pointsTrend,
            'category_breakdown' => $categoryBreakdown,
        ];
    }
}
