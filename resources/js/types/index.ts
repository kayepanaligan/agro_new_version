import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    url: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    [key: string]: unknown;
}

export interface User {
    id: number;
    first_name: string;
    middle_name?: string | null;
    last_name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    role?: {
        id: number;
        name: string;
        description?: string | null;
    } | null;
    registration_status?: 'pending' | 'approved' | 'rejected';
    is_active_session?: boolean;
    last_activity_at?: string | null;
}

export interface Category {
    id: number;
    name: string;
    description?: string | null;
    created_at: string;
    updated_at: string;
}

export interface Commodity {
    id: number;
    category_id: number;
    name: string;
    description?: string | null;
    image_path?: string | null;
    created_at: string;
    updated_at: string;
    category?: {
        id: number;
        name: string;
    } | null;
}

export interface Variety {
    id: number;
    commodity_id: number;
    name: string;
    description?: string | null;
    created_at: string;
    updated_at: string;
    commodity?: {
        id: number;
        name: string;
    } | null;
}

// Farmer Module Types
export interface Farmer {
    id: number;
    rsbsa_number?: string | null;
    lfid?: string | null;
    registration_status?: 'not_registered' | 'for_submission' | 'submitted_to_da' | 'verified' | 'rejected' | null;
    first_name: string;
    last_name: string;
    middle_name?: string | null;
    extension_name?: string | null;
    sex: 'Male' | 'Female' | 'Other';
    birthdate?: string | null;
    contact_number?: string | null;
    civil_status?: 'single' | 'married' | 'widowed' | 'separated' | null;
    picture_id?: string | null;
    
    // Enrollment Information
    enrollment_type?: 'new' | 'updating';
    enrollment_updated_at?: string | null;
    
    // Address
    house_lot_bldg_no_purok?: string | null;
    street_sitio_subdv?: string | null;
    barangay?: string | null;
    municipality_city?: string | null;
    province?: string | null;
    region?: string | null;
    
    // Other Information
    landline_number?: string | null;
    place_of_birth_municipality?: string | null;
    place_of_birth_province?: string | null;
    place_of_birth_country?: string | null;
    religion?: 'christianity' | 'islam' | 'others' | null;
    
    // Spouse Information
    spouse_first_name?: string | null;
    spouse_middle_name?: string | null;
    spouse_surname?: string | null;
    spouse_extension_name?: string | null;
    
    // Household Information
    is_household_head?: boolean | null;
    household_head_first_name?: string | null;
    household_head_middle_name?: string | null;
    household_head_surname?: string | null;
    household_head_extension_name?: string | null;
    relationship_to_household_head?: string | null;
    no_living_household_members?: number | null;
    no_male_household_members?: number | null;
    no_female_household_members?: number | null;
    
    // Education
    highest_formal_education?: 'pre_school' | 'elementary' | 'high_school_non_k12' | 'junior_hs_k12' | 'senior_hs_k12' | 'college' | 'vocational' | 'post_graduate' | 'none' | null;
    
    // Special Fields
    is_pwd?: boolean;
    is_4ps_beneficiary?: boolean;
    is_ip?: boolean;
    ip_specify?: string | null;
    
    // Government ID
    government_id_type?: string | null;
    government_id_number?: string | null;
    
    // Emergency Contact
    emergency_contact_first_name?: string | null;
    emergency_contact_middle_name?: string | null;
    emergency_contact_last_name?: string | null;
    emergency_contact_extension_name?: string | null;
    emergency_contact_number?: string | null;
    
    created_at: string;
    updated_at: string;
    household?: Household | null;
    location?: FarmerLocation | null;
    crops?: FarmerCrop[];
    classifications?: FarmerClassification[];
    organizations?: Organization[];
    eligibilities?: Eligibility[];
    farm_profile?: FarmProfile | null;
    farms?: Farm[]; // Add farms relationship
    crop_rotations?: CropRotation[];
    farmer_assignments?: FarmerAssignment[];
    organization_memberships?: FarmerOrganizationMembership[];
}

export interface Household {
    id: number;
    farmer_id: number;
    household_size: number;
    income_range?: string | null;
    primary_livelihood?: string | null;
    created_at: string;
    updated_at: string;
}

export interface FarmerLocation {
    id: number;
    farmer_id: number;
    region: string;
    province: string;
    municipality: string;
    barangay: string;
    latitude?: number | null;
    longitude?: number | null;
    created_at: string;
    updated_at: string;
}

export interface FarmerCrop {
    id: number;
    farmer_id: number;
    commodity_id: number;
    variety_id: number;
    area_allocated?: number | null;
    created_at: string;
    updated_at: string;
    commodity?: Commodity | null;
    variety?: Variety | null;
}

export interface FarmerClassification {
    id: number;
    farmer_id: number;
    category: 'farmer' | 'fisherfolk' | 'livestock raiser';
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface Program {
    id: number;
    program_name: string;
    program_description?: string | null;
    start_date?: string | null;
    end_date?: string | null;
    funding_source_id?: number | null;
    created_at: string;
    updated_at: string;
    funding_source?: FundingSource | null;
}

export interface Eligibility {
    id: number;
    farmer_id: number;
    program_id: number;
    is_eligible: boolean;
    validation_date?: string | null;
    created_at: string;
    updated_at: string;
    program?: Program | null;
}

export interface Organization {
    id: number;
    name: string;
    type: 'coop' | 'association';
    created_at: string;
    updated_at: string;
}

// Farm Profile Types
export interface Farm {
    id: number;
    farmer_id: number;
    farm_name: string;
    created_at: string;
    updated_at: string;
    farmer?: Farmer | null;
    farm_parcels?: FarmParcel[];
}

export interface FarmProfile {
    id: number;
    farmer_id: number;
    main_livelihood: 'farmer' | 'farmworker_laborer' | 'fisherfolk' | 'agri_youth';
    farming_activity_type?: string | null;
    farming_commodity_category_id?: number | null;
    farming_commodity_id?: number | null;
    farming_variety_id?: number | null;
    farmworker_kind_of_work?: string | null;
    farmworker_other_specify?: string | null;
    fisherfolk_fishing_activity?: string | null;
    fisherfolk_other_specify?: string | null;
    agri_youth_involvement?: string | null;
    agri_youth_other_specify?: string | null;
    gross_annual_income_farming?: number | null;
    gross_annual_income_non_farming?: number | null;
    total_farm_size?: number | null;
    created_at: string;
    updated_at: string;
    commodity_category?: Category | null;
    commodity?: Commodity | null;
    variety?: Variety | null;
    farm_parcels?: FarmParcel[];
}

export interface FarmParcel {
    id: number;
    farm_profile_id: number;
    parcel_number?: string | null;
    barangay?: string | null;
    city_municipality?: string | null;
    total_farm_area?: number | null;
    within_ancestral_domain?: boolean;
    ownership_document_type?: string | null;
    ownership_document_number?: string | null;
    ownership_document_file_path?: string | null;
    is_agrarian_reform_beneficiary?: boolean;
    ownership_type?: 'registered_owner' | 'tenant' | 'lessee' | null;
    land_owner_first_name?: string | null;
    land_owner_middle_name?: string | null;
    land_owner_surname?: string | null;
    land_owner_extension_name?: string | null;
    commodity_category_id?: number | null;
    commodity_id?: number | null;
    variety_id?: number | null;
    parcel_size?: number | null;
    livestock_heads?: number | null;
    livestock_type?: string | null;
    farm_type?: 'irrigated' | 'rainfed_upland' | 'rainfed_lowland' | 'not_applicable' | null;
    is_organic_practitioner?: boolean;
    remarks?: string | null;
    created_at: string;
    updated_at: string;
    commodity_category?: Category | null;
    commodity?: Commodity | null;
    variety?: Variety | null;
    crop_rotations?: CropRotation[];
    farmer_assignments?: FarmerAssignment[];
}

export interface CropRotation {
    id: number;
    farm_parcel_id: number;
    farmer_id: number;
    season_identifier?: string | null;
    cycle_order?: number | null;
    commodity_id?: number | null;
    variety_id?: number | null;
    planting_date?: string | null;
    harvest_date?: string | null;
    area_planted?: number | null;
    yield_quantity?: number | null;
    yield_unit?: string | null;
    remarks?: string | null;
    created_at: string;
    updated_at: string;
    commodity?: Commodity | null;
    variety?: Variety | null;
    farm_parcel?: FarmParcel | null;
    farmer?: Farmer | null;
}

export interface FarmerAssignment {
    id: number;
    farm_parcel_id: number;
    farmer_id: number;
    start_date: string;
    end_date?: string | null;
    assignment_type?: string | null;
    status?: 'active' | 'completed' | 'terminated' | null;
    remarks?: string | null;
    created_at: string;
    updated_at: string;
    farm_parcel?: FarmParcel | null;
    farmer?: Farmer | null;
}

export interface FarmerOrganizationMembership {
    id: number;
    farmer_id: number;
    organization_id: number;
    program_id?: number | null;
    membership_date?: string | null;
    membership_status?: 'active' | 'inactive' | 'former' | null;
    role_in_organization?: string | null;
    created_at: string;
    updated_at: string;
    organization?: Organization | null;
    program?: Program | null;
}

// Damage Management Types
export interface DamageCategory {
    damage_category_id: number;
    damage_category_name: string;
    damage_category_description?: string | null;
    damage_types_count?: number;
    created_at: string;
    updated_at: string;
}

export interface DamageType {
    damage_type_id: number;
    damage_type_name: string;
    damage_category_id: number;
    damage_type_description?: string | null;
    image_path?: string | null;
    is_ai_generated: boolean;
    created_at: string;
    updated_at: string;
    damage_category?: DamageCategory | null;
}

export interface CropDamageRecord {
    crop_damage_record_id: number;
    name: string;
    recorded_date: string;
    notes?: string | null;
    created_at: string;
    updated_at: string;
    items_count?: number;
}

export interface CropDamageRecordItem {
    crop_damage_record_item_id: number;
    crop_damage_record_id: number;
    photo_path?: string | null;
    farm_id: number;
    commodity_name: string;
    variety_name: string;
    damage_type_id: number;
    damage_severity: 'low' | 'medium' | 'high';
    status: 'pending' | 'verified' | 'closed';
    notes?: string | null;
    created_at: string;
    updated_at: string;
    farm?: Farm | null;
    damage_type?: DamageType | null;
    crop_damage_record?: CropDamageRecord | null;
}

export interface CropMonitoringCategory {
    crop_monitoring_category_id: number;
    category_name: string;
    description?: string | null;
    created_at: string;
    updated_at: string;
    folders_count?: number;
}

export interface CropMonitoringFolder {
    crop_monitoring_folder_id: number;
    folder_name: string;
    description?: string | null;
    category_id: number;
    commodity_id: number;
    variety_id: number;
    created_at: string;
    updated_at: string;
    category?: CropMonitoringCategory;
    commodity?: Commodity;
    variety?: Variety;
    items_count?: number;
    updaters?: Array<{
        user: User;
        updated_at: string;
    }>;
}

export interface CropMonitoringItem {
    crop_monitoring_item_id: number;
    folder_id: number;
    item_name: string;
    description?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    temperature?: number | null;
    weather_condition?: string | null;
    humidity?: number | null;
    wind_speed?: number | null;
    weather_notes?: string | null;
    media_path?: string | null;
    updated_by: number;
    observation_date: string;
    created_at: string;
    updated_at: string;
    updater?: User;
    folder?: CropMonitoringFolder;
}

export interface UnitOfMeasure {
    id: number;
    name: string;
    code: string;
    description?: string | null;
    created_at: string;
    updated_at: string;
}

export interface Barangay {
    id: number;
    name: string;
    description?: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface FarmerEligibility {
    id: number;
    name: string;
    description?: string | null;
    attribute_field: string;
    required_value: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface AllocationType {
    id: number;
    name: string;
    description?: string | null;
    amount: number;
    unit_of_measurement_id: number;
    program_id: number;
    category_ids: number[] | null;
    commodity_ids: number[] | null;
    variety_ids: number[] | null;
    barangay_ids: number[] | null;
    farmer_eligibility_criteria: Record<string, any> | null;
    created_at: string;
    updated_at: string;
    unit_of_measurement?: UnitOfMeasure | null;
    program?: Program | null;
}

export interface FundingSource {
    id: number;
    name: string;
    description?: string | null;
    created_at: string;
    updated_at: string;
}

export interface AssistanceCategory {
    id: number;
    name: string;
    description?: string | null;
    program_id: number;
    barangay_ids: number[] | null;
    created_at: string;
    updated_at: string;
    program?: Program | null;
}

export interface EligibleBarangay {
    id: number;
    allocation_type_id: number;
    barangay_id: number;
    created_at: string;
    updated_at: string;
    allocation_type?: AllocationType | null;
    barangay?: Barangay | null;
}

export interface EligibilityRule {
    id: number;
    allocation_type_id: number;
    field_name: string;
    operator: string;
    value: string;
    score: number;
    created_at: string;
    updated_at: string;
    allocation_type?: AllocationType | null;
}

export interface DistributionRecord {
    id: number;
    distribution_name: string;
    allocation_type_id: number;
    source_type: 'dss_generated' | 'manual';
    total_quantity: number;
    release_date: string;
    note?: string | null;
    allocation_policy_id?: number | null;
    created_at: string;
    updated_at: string;
    allocation_type?: AllocationType | null;
    allocation_policy?: AllocationPolicy | null;
}

export interface DistributionRecordItem {
    id: number;
    distribution_record_id: number;
    farmer_lfid: string;
    quantity_allocated: number;
    allocation_policy_id?: number | null;
    status: 'pending' | 'received';
    created_at: string;
    updated_at: string;
    allocation_policy?: AllocationPolicy | null;
    acknowledgement?: Acknowledgement | null;
}

export interface Acknowledgement {
    id: number;
    distribution_record_item_id: number;
    farmer_lfid: string;
    received_at: string;
    photo_proof?: string | null;
    notes?: string | null;
    created_at: string;
    updated_at: string;
    distribution_record_item?: DistributionRecordItem | null;
}

export interface AllocationPolicy {
    id: number;
    allocation_type_id: number;
    allocation_inputs?: any | null;
    eligible_rules?: number[] | null;
    eligible_barangays?: number[] | null;
    policy_type: 'equal' | 'proportional' | 'priority' | 'weighted' | 'hybrid';
    policy_config?: any | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    allocation_type?: AllocationType | null;
}

// Offline-First Types
export type OnlineStatus = 'online' | 'offline' | 'syncing';

export type QueueActionType = 'create' | 'update' | 'delete';

export interface OfflineQueueItem {
    id?: number;
    operation_id: string; // UUID for idempotency
    action_type: QueueActionType;
    entity_type: 'farmer' | 'farm' | 'farm_parcel' | 'crop_damage' | 'allocation';
    payload: any;
    timestamp: string;
    retry_count: number;
    synced_at?: string | null;
    error_message?: string | null;
}

export interface SyncStatus {
    is_online: boolean;
    is_syncing: boolean;
    last_sync_time?: string | null;
    unsynced_count: number;
}

export interface CachedFarmer extends Farmer {
    _cached_at: string;
    _is_dirty: boolean;
}

export interface CachedFarm extends Farm {
    _cached_at: string;
    _is_dirty: boolean;
    farm_parcels?: CachedFarmParcel[];
}

export interface CachedFarmParcel extends FarmParcel {
    _cached_at: string;
    _is_dirty: boolean;
}

export interface ReferenceDataCache {
    id?: number;
    data_type: 'commodities' | 'varieties' | 'damage_types' | 'barangays' | 'programs';
    data: any[];
    cached_at: string;
    expires_at?: string | null;
}

export function getFullName(user: User): string {
    const parts = [user.first_name, user.middle_name, user.last_name].filter(Boolean);
    return parts.join(' ');
}
