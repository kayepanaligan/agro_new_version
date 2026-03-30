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
    created_at: string;
    updated_at: string;
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

export function getFullName(user: User): string {
    const parts = [user.first_name, user.middle_name, user.last_name].filter(Boolean);
    return parts.join(' ');
}
