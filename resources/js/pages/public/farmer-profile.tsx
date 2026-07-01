import { type Farmer } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft, Calendar, MapPin, Phone, User, Users, Home, Briefcase, GraduationCap, Heart, Building2, FileText, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export default function PublicFarmerProfile() {
    const { farmer } = usePage<{
        farmer: Farmer & {
            household_members_count?: number;
            farm_area?: number;
            crops_planted?: string[];
            profile?: any;
            address?: any;
            contact?: any;
            spouse?: any;
            household?: any;
            education?: any;
            emergencyContact?: any;
            mainLivelihood?: any;
            farmingActivities?: any[];
            farmworkerLivelihood?: any;
            fisherfolkLivelihood?: any;
            agriYouthLivelihood?: any;
            income?: any;
            farms?: any[];
            documents?: any[];
            memberships?: any[];
        };
    }>().props;

    const profile = farmer.profile || farmer;
    const address = farmer.address || {};
    const contact = farmer.contact || {};
    const spouse = farmer.spouse;
    const household = farmer.household || {};
    const education = farmer.education || {};
    const emergencyContact = farmer.emergencyContact || {};
    const mainLivelihood = farmer.mainLivelihood || {};
    const income = farmer.income || {};
    const farms = farmer.farms || [];

    const fullName = `${profile.first_name || ''} ${profile.middle_name || ''} ${profile.last_name || ''}`.trim();

    // Helper function for clean date formatting
    const formatDate = (date: string | null) => {
        if (!date) return '—';
        return new Date(date).toLocaleDateString('en-PH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    // Helper for currency formatting
    const formatCurrency = (amount: string | number | null) => {
        if (!amount) return '—';
        return `₱${parseFloat(String(amount)).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Head title={`${fullName} - Farmer Profile`} />
            
            {/* Official Government Header */}
            <div className="bg-white border-b border-gray-200 shadow-sm">
                <div className="container mx-auto px-6 py-4 max-w-6xl">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-12 h-12 bg-emerald-700 rounded-lg">
                                <Building2 className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-lg font-semibold text-gray-900">Department of Agriculture</h1>
                                <p className="text-sm text-gray-500">Farmer Registry Information System</p>
                            </div>
                        </div>
                        <Link href="/">
                            <Button variant="outline" size="sm" className="gap-2">
                                <ArrowLeft className="h-4 w-4" />
                                Back
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-6 py-8 max-w-6xl">
                {/* Profile Header Card */}
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-6">
                    <div className="p-6">
                        <div className="flex items-start gap-6">
                            {/* Photo */}
                            <div className="flex-shrink-0">
                                <div className="w-28 h-28 rounded-lg bg-gray-100 border-2 border-gray-200 overflow-hidden">
                                    {farmer.picture_id ? (
                                        <img 
                                            src={farmer.picture_id} 
                                            alt={`${farmer.first_name} ${farmer.last_name}`}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <User className="h-12 w-12 text-gray-400" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Main Info */}
                            <div className="flex-1 min-w-0">
                                <h2 className="text-2xl font-bold text-gray-900 mb-1">{fullName}</h2>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-600 mb-3">
                                    <span className="font-mono">LFID: {farmer.lfid || 'Not assigned'}</span>
                                    {farmer.rsbsa_number && (
                                        <>
                                            <span className="text-gray-300">•</span>
                                            <span>RSBSA #{farmer.rsbsa_number}</span>
                                        </>
                                    )}
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <Badge variant="secondary" className="text-xs">{farmer.sex}</Badge>
                                    {farmer.civil_status && (
                                        <Badge variant="outline" className="text-xs capitalize">{farmer.civil_status}</Badge>
                                    )}
                                    {farmer.registration_status && (
                                        <Badge className="text-xs bg-emerald-100 text-emerald-800 border-emerald-200 capitalize">
                                            {farmer.registration_status.replace('_', ' ')}
                                        </Badge>
                                    )}
                                </div>
                            </div>

                            {/* QR Code */}
                            <div className="flex-shrink-0">
                                <div className="bg-white p-3 rounded-lg border border-gray-200">
                                    <QRCodeSVG 
                                        value={`${window.location.origin}/farmer/profile/${farmer.lfid}`}
                                        size={90}
                                        level="H"
                                    />
                                </div>
                                <p className="text-xs text-gray-500 text-center mt-1">Scan to verify</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Information Grid */}
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Personal Information */}
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                        <div className="p-5 border-b border-gray-100">
                            <div className="flex items-center gap-2">
                                <User className="h-5 w-5 text-gray-600" />
                                <h3 className="text-base font-semibold text-gray-900">Personal Information</h3>
                            </div>
                        </div>
                        <div className="p-5 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Full Name</p>
                                    <p className="text-sm font-medium text-gray-900">{fullName}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Sex</p>
                                    <p className="text-sm text-gray-900">{profile.sex || '—'}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Birthdate</p>
                                    <p className="text-sm text-gray-900">{formatDate(profile.birthdate)}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Civil Status</p>
                                    <p className="text-sm text-gray-900 capitalize">{profile.civil_status || '—'}</p>
                                </div>
                            </div>
                            {spouse && (
                                <>
                                    <Separator />
                                    <div>
                                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Spouse</p>
                                        <p className="text-sm text-gray-900">
                                            {[spouse.spouse_first_name, spouse.spouse_middle_name, spouse.spouse_surname].filter(Boolean).join(' ')}
                                            {spouse.spouse_extension_name && ` ${spouse.spouse_extension_name}`}
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Contact Information */}
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                        <div className="p-5 border-b border-gray-100">
                            <div className="flex items-center gap-2">
                                <Phone className="h-5 w-5 text-gray-600" />
                                <h3 className="text-base font-semibold text-gray-900">Contact Information</h3>
                            </div>
                        </div>
                        <div className="p-5 space-y-4">
                            {contact.mobile_number && (
                                <div>
                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Mobile Number</p>
                                    <p className="text-sm font-medium text-gray-900">{contact.mobile_number}</p>
                                </div>
                            )}
                            {contact.landline_number && (
                                <div>
                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Landline</p>
                                    <p className="text-sm text-gray-900">{contact.landline_number}</p>
                                </div>
                            )}
                            {contact.gmail && (
                                <div>
                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Email Address</p>
                                    <p className="text-sm text-gray-900">{contact.gmail}</p>
                                </div>
                            )}
                            {!contact.mobile_number && !contact.landline_number && !contact.gmail && (
                                <p className="text-sm text-gray-500 italic">No contact information provided</p>
                            )}
                        </div>
                    </div>

                    {/* Address Information */}
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                        <div className="p-5 border-b border-gray-100">
                            <div className="flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-gray-600" />
                                <h3 className="text-base font-semibold text-gray-900">Address</h3>
                            </div>
                        </div>
                        <div className="p-5 space-y-4">
                            {(address.house_lot_bldg_no_purok || address.street_sitio_subdv) && (
                                <div>
                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Street Address</p>
                                    <p className="text-sm text-gray-900">
                                        {[address.house_lot_bldg_no_purok, address.street_sitio_subdv].filter(Boolean).join(', ')}
                                    </p>
                                </div>
                            )}
                            <div>
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Location</p>
                                <p className="text-sm text-gray-900">
                                    {[address.barangay, address.municipality_city, address.province, address.region].filter(Boolean).join(', ') || '—'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Household Information */}
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                        <div className="p-5 border-b border-gray-100">
                            <div className="flex items-center gap-2">
                                <Home className="h-5 w-5 text-gray-600" />
                                <h3 className="text-base font-semibold text-gray-900">Household Information</h3>
                            </div>
                        </div>
                        <div className="p-5 space-y-4">
                            <div>
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Household Head</p>
                                <Badge variant={household.is_household_head ? 'default' : 'secondary'} className="text-xs">
                                    {household.is_household_head ? 'Yes' : 'No'}
                                </Badge>
                            </div>
                            {!household.is_household_head && household.household_head_first_name && (
                                <div>
                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Head of Household</p>
                                    <p className="text-sm text-gray-900">
                                        {[household.household_head_first_name, household.household_head_middle_name, household.household_head_surname].filter(Boolean).join(' ')}
                                        {household.household_head_extension_name && ` ${household.household_head_extension_name}`}
                                    </p>
                                    {household.relationship_to_household_head && (
                                        <p className="text-xs text-gray-500 mt-1">Relationship: {household.relationship_to_household_head}</p>
                                    )}
                                </div>
                            )}
                            <Separator />
                            <div className="grid grid-cols-3 gap-4 text-center">
                                <div className="bg-gray-50 rounded-lg p-3">
                                    <p className="text-xs text-gray-500 mb-1">Total</p>
                                    <p className="text-xl font-bold text-gray-900">{household.no_living_household_members || 0}</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-3">
                                    <p className="text-xs text-gray-500 mb-1">Male</p>
                                    <p className="text-xl font-bold text-gray-900">{household.no_male_household_members || 0}</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-3">
                                    <p className="text-xs text-gray-500 mb-1">Female</p>
                                    <p className="text-xl font-bold text-gray-900">{household.no_female_household_members || 0}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Education */}
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                        <div className="p-5 border-b border-gray-100">
                            <div className="flex items-center gap-2">
                                <GraduationCap className="h-5 w-5 text-gray-600" />
                                <h3 className="text-base font-semibold text-gray-900">Education</h3>
                            </div>
                        </div>
                        <div className="p-5 space-y-4">
                            <div>
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Highest Education Attained</p>
                                <p className="text-sm text-gray-900 capitalize">
                                    {education.highest_formal_education ? education.highest_formal_education.replace(/_/g, ' ') : '—'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Livelihood & Income */}
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                        <div className="p-5 border-b border-gray-100">
                            <div className="flex items-center gap-2">
                                <Briefcase className="h-5 w-5 text-gray-600" />
                                <h3 className="text-base font-semibold text-gray-900">Livelihood & Income</h3>
                            </div>
                        </div>
                        <div className="p-5 space-y-4">
                            <div>
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Main Livelihood</p>
                                <p className="text-sm text-gray-900 capitalize">
                                    {mainLivelihood.main_livelihood ? mainLivelihood.main_livelihood.replace(/_/g, ' ') : '—'}
                                </p>
                            </div>
                            {(income.farming_income || income.non_farming_income) && (
                                <>
                                    <Separator />
                                    <div className="space-y-2">
                                        {income.farming_income && (
                                            <div className="flex justify-between items-center">
                                                <p className="text-xs text-gray-500">Farming Income</p>
                                                <p className="text-sm font-semibold text-gray-900">{formatCurrency(income.farming_income)}</p>
                                            </div>
                                        )}
                                        {income.non_farming_income && (
                                            <div className="flex justify-between items-center">
                                                <p className="text-xs text-gray-500">Non-Farming Income</p>
                                                <p className="text-sm font-semibold text-gray-900">{formatCurrency(income.non_farming_income)}</p>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Special Classifications */}
                {(profile.is_4ps_beneficiary || profile.is_ip || profile.is_pwd) && (
                    <div className="mt-6 bg-white rounded-lg border border-gray-200 shadow-sm">
                        <div className="p-5 border-b border-gray-100">
                            <div className="flex items-center gap-2">
                                <Heart className="h-5 w-5 text-gray-600" />
                                <h3 className="text-base font-semibold text-gray-900">Special Classifications</h3>
                            </div>
                        </div>
                        <div className="p-5">
                            <div className="flex flex-wrap gap-2">
                                {profile.is_4ps_beneficiary && (
                                    <Badge variant="outline" className="text-xs">4Ps Beneficiary</Badge>
                                )}
                                {profile.is_ip && (
                                    <Badge variant="outline" className="text-xs">Indigenous Person (IP)</Badge>
                                )}
                                {profile.is_pwd && (
                                    <Badge variant="outline" className="text-xs">Person with Disability (PWD)</Badge>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                    <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                            <QrCode className="h-4 w-4" />
                            <span>Verified via QR Code • {farmer.lfid}</span>
                        </div>
                        <span>Department of Agriculture • Republic of the Philippines</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
