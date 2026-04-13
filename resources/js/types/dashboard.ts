export interface KpiData {
  total_farmers: number;
  total_farms: number;
  total_parcels: number;
  total_farm_area: number;
}

export interface ChartDataPoint {
  name: string;
  count: number;
}

export interface DemographicsData {
  livelihood: ChartDataPoint[];
  is_4ps: ChartDataPoint[];
  gender: ChartDataPoint[];
  civil_status: ChartDataPoint[];
  is_ip: ChartDataPoint[];
}

export interface GeographicDataPoint {
  barangay: string;
  farmer_count: number;
  total_area: number;
}

export interface GeographicData {
  by_barangay: GeographicDataPoint[];
  top_barangays: GeographicDataPoint[];
}

export interface CropDistributionData {
  by_commodity: ChartDataPoint[];
  per_barangay: Array<{
    barangay: string;
    commodity: string;
    count: number;
  }>;
}

export interface ParcelInsightsData {
  avg_size: number;
  count_distribution: Array<{
    parcels: number;
    farmers: number;
  }>;
}

export interface AllocationCoverageData {
  received: ChartDataPoint[];
  trend: Array<{
    month: string;
    count: number;
  }>;
}

export interface CropDamageData {
  severity: ChartDataPoint[];
  trend: Array<{
    month: string;
    count: number;
  }>;
}

export interface AnalyticsData {
  kpis: KpiData;
  demographics: DemographicsData;
  geographic: GeographicData;
  farm_size_distribution: ChartDataPoint[];
  crop_distribution: CropDistributionData;
  parcel_insights: ParcelInsightsData;
  registration_status: ChartDataPoint[];
  allocation_coverage: AllocationCoverageData;
  crop_damage: CropDamageData;
  registration_trends: Array<{
    month: string;
    count: number;
  }>;
}
