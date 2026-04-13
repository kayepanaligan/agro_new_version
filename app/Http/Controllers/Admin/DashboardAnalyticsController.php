<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CropDamageRecordItem;
use App\Models\DistributionRecordItem;
use App\Models\Farm;
use App\Models\FarmParcel;
use App\Models\Farmer;
use App\Models\FarmerMainLivelihood;
use App\Models\FarmerProfile;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardAnalyticsController extends Controller
{
    /**
     * Display the admin dashboard with analytics data.
     */
    public function index()
    {
        return Inertia::render('admin/dashboard', [
            'analytics' => [
                'kpis' => $this->getKpis(),
                'demographics' => $this->getDemographicsData(),
                'geographic' => $this->getGeographicData(),
                'farm_size_distribution' => $this->getFarmSizeDistribution(),
                'crop_distribution' => $this->getCropDistribution(),
                'parcel_insights' => $this->getParcelInsights(),
                'registration_status' => $this->getRegistrationStatus(),
                'allocation_coverage' => $this->getAllocationCoverage(),
                'crop_damage' => $this->getCropDamageInsights(),
                'registration_trends' => $this->getRegistrationTrends(),
            ]
        ]);
    }

    /**
     * Get KPI data.
     */
    private function getKpis(): array
    {
        return [
            'total_farmers' => Farmer::count(),
            'total_farms' => Farm::count(),
            'total_parcels' => FarmParcel::count(),
            'total_farm_area' => FarmParcel::sum('total_farm_area') ?? 0,
        ];
    }

    /**
     * Get farmer demographics data.
     */
    private function getDemographicsData(): array
    {
        // Main livelihood distribution
        $livelihood = FarmerMainLivelihood::select('main_livelihood as name', DB::raw('count(*) as count'))
            ->groupBy('main_livelihood')
            ->get()
            ->toArray();

        // 4Ps beneficiaries
        $fps = FarmerProfile::select(
            DB::raw('CASE WHEN is_4ps_beneficiary = 1 THEN "4Ps Beneficiary" ELSE "Non-4Ps" END as name'),
            DB::raw('count(*) as count')
        )
            ->groupBy('is_4ps_beneficiary')
            ->get()
            ->toArray();

        // Gender distribution
        $gender = FarmerProfile::select('sex as name', DB::raw('count(*) as count'))
            ->groupBy('sex')
            ->get()
            ->toArray();

        // Civil status distribution
        $civilStatus = FarmerProfile::select('civil_status as name', DB::raw('count(*) as count'))
            ->groupBy('civil_status')
            ->get()
            ->toArray();

        // IP distribution
        $ip = FarmerProfile::select(
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
    private function getGeographicData(): array
    {
        // Farmers per barangay with total area
        $byBarangay = FarmParcel::select(
            'barangay',
            DB::raw('count(distinct farm_id) as farmer_count'),
            DB::raw('sum(total_farm_area) as total_area')
        )
            ->groupBy('barangay')
            ->orderBy('farmer_count', 'desc')
            ->get()
            ->toArray();

        // Top barangays
        $topBarangays = array_slice($byBarangay, 0, 10);

        return [
            'by_barangay' => $byBarangay,
            'top_barangays' => $topBarangays,
        ];
    }

    /**
     * Get farm size distribution.
     */
    private function getFarmSizeDistribution(): array
    {
        $small = FarmParcel::where('total_farm_area', '<', 2)->count();
        $medium = FarmParcel::whereBetween('total_farm_area', [2, 5])->count();
        $large = FarmParcel::where('total_farm_area', '>', 5)->count();

        return [
            ['name' => 'Small (<2 ha)', 'count' => $small],
            ['name' => 'Medium (2-5 ha)', 'count' => $medium],
            ['name' => 'Large (>5 ha)', 'count' => $large],
        ];
    }

    /**
     * Get crop/commodity distribution.
     */
    private function getCropDistribution(): array
    {
        // By commodity
        $byCommodity = DB::table('farmer_crops')
            ->select('commodity_id as name', DB::raw('count(*) as count'))
            ->groupBy('commodity_id')
            ->get()
            ->toArray();

        // Per barangay (top commodities)
        $perBarangay = DB::table('farmer_crops')
            ->join('farms', 'farmer_crops.farmer_id', '=', 'farms.farmer_id')
            ->join('farm_parcels', 'farms.id', '=', 'farm_parcels.farm_id')
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
    private function getParcelInsights(): array
    {
        // Average parcel size per farmer
        $avgParcelSize = FarmParcel::select(
            'farm_id',
            DB::raw('avg(total_farm_area) as avg_size')
        )
            ->groupBy('farm_id')
            ->get()
            ->avg('avg_size') ?? 0;

        // Parcels per farmer distribution
        $parcelsPerFarmer = FarmParcel::select(
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
    private function getRegistrationStatus(): array
    {
        $status = Farmer::select('registration_status as name', DB::raw('count(*) as count'))
            ->groupBy('registration_status')
            ->get()
            ->toArray();

        return $status;
    }

    /**
     * Get allocation coverage data.
     */
    private function getAllocationCoverage(): array
    {
        // Farmers who received assistance vs not
        $totalFarmers = Farmer::count();
        $receivedAssistance = DistributionRecordItem::distinct('farmer_lfid')->count('farmer_lfid');
        $notReceived = $totalFarmers - $receivedAssistance;

        $received = [
            ['name' => 'Received', 'count' => $receivedAssistance],
            ['name' => 'Not Received', 'count' => $notReceived],
        ];

        // Trend over time
        $trend = DistributionRecordItem::join('distribution_records', 'distribution_record_items.distribution_record_id', '=', 'distribution_records.id')
            ->select(
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
    private function getCropDamageInsights(): array
    {
        // Severity distribution
        $severity = CropDamageRecordItem::select('damage_severity as name', DB::raw('count(*) as count'))
            ->groupBy('damage_severity')
            ->get()
            ->toArray();

        // Trend over time
        $trend = CropDamageRecordItem::join('crop_damage_records', 'crop_damage_record_items.crop_damage_record_id', '=', 'crop_damage_records.crop_damage_record_id')
            ->select(
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
    private function getRegistrationTrends(): array
    {
        $trends = Farmer::select(
            DB::raw('DATE_FORMAT(created_at, "%Y-%m") as month'),
            DB::raw('count(*) as count')
        )
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->toArray();

        return $trends;
    }
}
