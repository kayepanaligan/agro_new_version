import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Farmer } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft, Calendar, Mail, MapPin, Phone, User, Users, Home, FileText, Briefcase, GraduationCap, Heart, Shield, Award, Package, Sprout, TrendingDown } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Farmers',
        href: '/admin/farmers',
    },
];

export default function FarmerProfile() {
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
            allocation_history?: any[];
            crop_damage_history?: any[];
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
    const documents = farmer.documents || [];
    const memberships = farmer.memberships || [];

    const fullName = `${profile.first_name || ''} ${profile.middle_name || ''} ${profile.last_name || ''}`.trim();

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${fullName} - Profile`} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                {/* Back Button */}
                <div>
                    <Link href="/admin/farmers">
                        <Button variant="ghost" size="sm" className="gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            Back to Farmers
                        </Button>
                    </Link>
                </div>

                <div className="rounded-xl border bg-card shadow-sm">
                    {/* Header Section */}
                    <div className="border-b p-6">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-4">
                                <div className="flex h-24 w-24 items-center justify-center rounded-xl bg-primary text-primary-foreground overflow-hidden border-2 border-primary/20">
                                    {farmer.picture_id ? (
                                        <img 
                                            src={farmer.picture_id} 
                                            alt={`${farmer.first_name} ${farmer.last_name}`}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <User className="h-12 w-12" />
                                    )}
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold">{fullName}</h1>
                                    <p className="text-muted-foreground">
                                        RSBSA #{farmer.rsbsa_number || 'Not assigned'}
                                    </p>
                                    <div className="mt-2 flex gap-2">
                                        <Badge variant="outline">{farmer.sex}</Badge>
                                        {farmer.civil_status && (
                                            <Badge variant="secondary">{farmer.civil_status}</Badge>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Link href={`/admin/farmers/${farmer.id}/edit`}>
                                    <Button>Edit Profile</Button>
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-6 p-6 md:grid-cols-2 lg:grid-cols-3">
                        {/* Personal Information */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    Personal Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <p className="text-sm text-muted-foreground">Full Name</p>
                                    <p className="font-medium">{fullName}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Sex</p>
                                    <Badge variant="outline">{profile.sex || 'Not specified'}</Badge>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Birthdate</p>
                                    <p className="font-medium">
                                        {profile.birthdate 
                                            ? new Date(profile.birthdate).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                            })
                                            : 'Not provided'
                                        }
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Civil Status</p>
                                    <Badge variant="secondary">{profile.civil_status || 'Not specified'}</Badge>
                                </div>
                                {spouse && (
                                    <>
                                        <Separator />
                                        <div>
                                            <p className="text-sm text-muted-foreground font-semibold">Spouse Information</p>
                                            <p className="font-medium">
                                                {[spouse.spouse_first_name, spouse.spouse_middle_name, spouse.spouse_surname].filter(Boolean).join(' ')}
                                                {spouse.spouse_extension_name && `, ${spouse.spouse_extension_name}`}
                                            </p>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        {/* Contact Information */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Phone className="h-5 w-5" />
                                    Contact Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {contact.mobile_number && (
                                    <div>
                                        <p className="text-sm text-muted-foreground">Mobile Number</p>
                                        <p className="font-medium">{contact.mobile_number}</p>
                                    </div>
                                )}
                                {contact.landline_number && (
                                    <div>
                                        <p className="text-sm text-muted-foreground">Landline Number</p>
                                        <p className="font-medium">{contact.landline_number}</p>
                                    </div>
                                )}
                                {contact.gmail && (
                                    <div>
                                        <p className="text-sm text-muted-foreground">Email</p>
                                        <p className="font-medium">{contact.gmail}</p>
                                    </div>
                                )}
                                {!contact.mobile_number && !contact.landline_number && !contact.gmail && (
                                    <p className="text-muted-foreground">No contact information provided</p>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <MapPin className="h-5 w-5" />
                                    Address Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {(address.house_lot_bldg_no_purok || address.street_sitio_subdv) && (
                                    <div>
                                        <p className="text-sm text-muted-foreground">Street Address</p>
                                        <p className="font-medium">
                                            {[address.house_lot_bldg_no_purok, address.street_sitio_subdv].filter(Boolean).join(', ')}
                                        </p>
                                    </div>
                                )}
                                {(address.barangay || address.municipality_city) && (
                                    <div>
                                        <p className="text-sm text-muted-foreground">Location</p>
                                        <p className="font-medium">
                                            {[address.barangay, address.municipality_city, address.province, address.region].filter(Boolean).join(', ')}
                                        </p>
                                    </div>
                                )}
                                {!address.house_lot_bldg_no_purok && !address.street_sitio_subdv && !address.barangay && (
                                    <p className="text-muted-foreground">No address provided</p>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Home className="h-5 w-5" />
                                    Household Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {household.is_household_head !== undefined && (
                                    <div>
                                        <p className="text-sm text-muted-foreground">Household Head</p>
                                        <Badge variant={household.is_household_head ? 'default' : 'secondary'}>
                                            {household.is_household_head ? 'Yes' : 'No'}
                                        </Badge>
                                    </div>
                                )}
                                {!household.is_household_head && household.household_head_first_name && (
                                    <div>
                                        <p className="text-sm text-muted-foreground">Head of Household</p>
                                        <p className="font-medium">
                                            {[household.household_head_first_name, household.household_head_middle_name, household.household_head_surname].filter(Boolean).join(' ')}
                                            {household.household_head_extension_name && `, ${household.household_head_extension_name}`}
                                        </p>
                                        {household.relationship_to_household_head && (
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Relationship: {household.relationship_to_household_head}
                                            </p>
                                        )}
                                    </div>
                                )}
                                <Separator />
                                <div className="grid grid-cols-3 gap-2 text-center">
                                    <div>
                                        <p className="text-xs text-muted-foreground">Total</p>
                                        <p className="font-semibold text-lg">{household.no_living_household_members || 0}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Male</p>
                                        <p className="font-semibold text-lg">{household.no_male_household_members || 0}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Female</p>
                                        <p className="font-semibold text-lg">{household.no_female_household_members || 0}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Education & Special Fields */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <GraduationCap className="h-5 w-5" />
                                    Education & Special Fields
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {education.highest_formal_education && (
                                    <div>
                                        <p className="text-sm text-muted-foreground">Highest Formal Education</p>
                                        <p className="font-medium capitalize">{education.highest_formal_education.replace(/_/g, ' ')}</p>
                                    </div>
                                )}
                                {(profile.is_4ps_beneficiary || profile.is_ip || profile.is_pwd) && (
                                    <>
                                        <Separator />
                                        <div className="space-y-2">
                                            {profile.is_4ps_beneficiary && (
                                                <Badge variant="outline">4Ps Beneficiary</Badge>
                                            )}
                                            {profile.is_ip && (
                                                <Badge variant="outline">Indigenous Person (IP)</Badge>
                                            )}
                                            {profile.is_pwd && (
                                                <Badge variant="outline">PWD</Badge>
                                            )}
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        {/* Livelihood & Income */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Briefcase className="h-5 w-5" />
                                    Livelihood & Income
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {mainLivelihood.main_livelihood && (
                                    <div>
                                        <p className="text-sm text-muted-foreground">Main Livelihood</p>
                                        <Badge>{mainLivelihood.main_livelihood.replace(/_/g, ' ')}</Badge>
                                    </div>
                                )}
                                {(income.farming_income || income.non_farming_income) && (
                                    <>
                                        <Separator />
                                        <div className="space-y-2">
                                            {income.farming_income && (
                                                <div>
                                                    <p className="text-xs text-muted-foreground">Farming Income</p>
                                                    <p className="font-medium">₱{parseFloat(income.farming_income).toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                                                </div>
                                            )}
                                            {income.non_farming_income && (
                                                <div>
                                                    <p className="text-xs text-muted-foreground">Non-Farming Income</p>
                                                    <p className="font-medium">₱{parseFloat(income.non_farming_income).toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        {/* Emergency Contact */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Heart className="h-5 w-5" />
                                    Emergency Contact
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {emergencyContact.emergency_contact_first_name ? (
                                    <>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Contact Person</p>
                                            <p className="font-medium">
                                                {[emergencyContact.emergency_contact_first_name, emergencyContact.emergency_contact_middle_name, emergencyContact.emergency_contact_last_name].filter(Boolean).join(' ')}
                                                {emergencyContact.emergency_contact_extension_name && `, ${emergencyContact.emergency_contact_extension_name}`}
                                            </p>
                                        </div>
                                        {emergencyContact.contact_number && (
                                            <div>
                                                <p className="text-sm text-muted-foreground">Contact Number</p>
                                                <p className="font-medium">{emergencyContact.contact_number}</p>
                                            </div>
                                        )}
                                        {emergencyContact.email && (
                                            <div>
                                                <p className="text-sm text-muted-foreground">Email</p>
                                                <p className="font-medium">{emergencyContact.email}</p>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <p className="text-muted-foreground">No emergency contact provided</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Additional Information */}
                        <Card className="md:col-span-2 lg:col-span-3">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg">Farm & Parcel Details</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {farms && farms.length > 0 ? (
                                    <div className="space-y-6">
                                        {farms.map((farm, farmIndex) => (
                                            <div key={farm.id} className="border rounded-lg p-4 bg-muted/30">
                                                <h4 className="font-semibold mb-3 flex items-center gap-2">
                                                    <Award className="h-5 w-5" />
                                                    {farm.farm_name || `Farm #${farmIndex + 1}`}
                                                </h4>
                                                
                                                {farm.farm_parcels && farm.farm_parcels.length > 0 && (
                                                    <div className="space-y-3">
                                                        <p className="text-sm text-muted-foreground mb-2">
                                                            Farm Parcels ({farm.farm_parcels.length})
                                                        </p>
                                                        {farm.farm_parcels.map((parcel: any, parcelIndex: number) => (
                                                            <div key={parcel.id} className="bg-background p-3 rounded border space-y-2">
                                                                <div className="flex items-center justify-between">
                                                                    <h5 className="font-medium text-sm">
                                                                        Parcel #{parcel.parcel_number || parcelIndex + 1}
                                                                    </h5>
                                                                </div>
                                                                <div className="grid gap-2 md:grid-cols-3">
                                                                    {parcel.barangay && (
                                                                        <div>
                                                                            <p className="text-xs text-muted-foreground">Barangay</p>
                                                                            <p className="text-sm font-medium">{parcel.barangay}</p>
                                                                        </div>
                                                                    )}
                                                                    {parcel.city_municipality && (
                                                                        <div>
                                                                            <p className="text-xs text-muted-foreground">City/Municipality</p>
                                                                            <p className="text-sm font-medium">{parcel.city_municipality}</p>
                                                                        </div>
                                                                    )}
                                                                    {(parcel.total_farm_area || parcel.parcel_size) && (
                                                                        <div>
                                                                            <p className="text-xs text-muted-foreground">Area</p>
                                                                            <p className="text-sm font-medium">
                                                                                {[parcel.total_farm_area, parcel.parcel_size].filter(Boolean).join(' / ')} hectares
                                                                            </p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className="grid gap-2 md:grid-cols-3">
                                                                    {parcel.farm_type && (
                                                                        <div>
                                                                            <p className="text-xs text-muted-foreground">Farm Type</p>
                                                                            <Badge variant="outline">{parcel.farm_type.replace(/_/g, ' ')}</Badge>
                                                                        </div>
                                                                    )}
                                                                    {parcel.ownership_type && (
                                                                        <div>
                                                                            <p className="text-xs text-muted-foreground">Ownership</p>
                                                                            <Badge variant="secondary">{parcel.ownership_type.replace(/_/g, ' ')}</Badge>
                                                                        </div>
                                                                    )}
                                                                    {parcel.livestock_count !== undefined && parcel.livestock_count > 0 && (
                                                                        <div>
                                                                            <p className="text-xs text-muted-foreground">Livestock Count</p>
                                                                            <p className="text-sm font-medium">{parcel.livestock_count}</p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                {(parcel.within_ancestral_domain || parcel.agrarian_reform_beneficiary || parcel.is_organic_practitioner) && (
                                                                    <div className="flex flex-wrap gap-2 pt-2">
                                                                        {parcel.within_ancestral_domain && (
                                                                            <Badge variant="outline">Ancestral Domain</Badge>
                                                                        )}
                                                                        {parcel.agrarian_reform_beneficiary && (
                                                                            <Badge variant="outline">Agrarian Reform</Badge>
                                                                        )}
                                                                        {parcel.is_organic_practitioner && (
                                                                            <Badge variant="outline">Organic</Badge>
                                                                        )}
                                                                    </div>
                                                                )}
                                                                {parcel.remarks && (
                                                                    <div className="pt-2">
                                                                        <p className="text-xs text-muted-foreground">Remarks</p>
                                                                        <p className="text-sm">{parcel.remarks}</p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-muted-foreground">No farm information provided</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Allocation History */}
                        <Card className="col-span-full">
                            <CardHeader className="pb-3 border-b">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Package className="h-5 w-5" />
                                    Allocation History
                                    {farmer.allocation_history && farmer.allocation_history.length > 0 && (
                                        <Badge variant="secondary">{farmer.allocation_history.length} records</Badge>
                                    )}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4">
                                {farmer.allocation_history && farmer.allocation_history.length > 0 ? (
                                    <div className="space-y-4">
                                        {farmer.allocation_history.map((allocation) => (
                                            <div key={allocation.id} className="rounded-lg border p-4 space-y-3">
                                                <div className="flex items-start justify-between">
                                                    <div className="space-y-1">
                                                        <p className="font-semibold text-base">{allocation.distribution_name}</p>
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <Badge variant="outline">{allocation.allocation_type}</Badge>
                                                            <Badge variant="secondary">{allocation.program_name}</Badge>
                                                            {allocation.status === 'received' && (
                                                                <Badge variant="default" className="bg-green-600">Received</Badge>
                                                            )}
                                                            {allocation.status === 'pending' && (
                                                                <Badge variant="outline">Pending</Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-2xl font-bold text-primary">
                                                            {parseFloat(allocation.quantity_allocated).toLocaleString()}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">{allocation.unit}</p>
                                                    </div>
                                                </div>
                                                
                                                <Separator />
                                                
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                                    <div>
                                                        <p className="text-xs text-muted-foreground">Release Date</p>
                                                        <p className="font-medium">
                                                            {allocation.release_date 
                                                                ? new Date(allocation.release_date).toLocaleDateString('en-US', {
                                                                    year: 'numeric',
                                                                    month: 'short',
                                                                    day: 'numeric',
                                                                })
                                                                : 'N/A'
                                                            }
                                                        </p>
                                                    </div>
                                                    {allocation.received_at && (
                                                        <div>
                                                            <p className="text-xs text-muted-foreground">Received On</p>
                                                            <p className="font-medium">
                                                                {new Date(allocation.received_at).toLocaleDateString('en-US', {
                                                                    year: 'numeric',
                                                                    month: 'short',
                                                                    day: 'numeric',
                                                                })}
                                                            </p>
                                                        </div>
                                                    )}
                                                    {allocation.received_by && (
                                                        <div>
                                                            <p className="text-xs text-muted-foreground">Received By</p>
                                                            <p className="font-medium">{allocation.received_by}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3 text-muted-foreground py-8">
                                        <Package className="h-8 w-8" />
                                        <p>No allocation records found for this farmer</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Crop Damage History */}
                        <Card className="col-span-full">
                            <CardHeader className="pb-3 border-b">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Sprout className="h-5 w-5" />
                                    Crop Damage History
                                    {farmer.crop_damage_history && farmer.crop_damage_history.length > 0 && (
                                        <Badge variant="secondary">{farmer.crop_damage_history.length} records</Badge>
                                    )}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4">
                                {farmer.crop_damage_history && farmer.crop_damage_history.length > 0 ? (
                                    <div className="space-y-4">
                                        {farmer.crop_damage_history.map((damage) => (
                                            <div key={damage.id} className="rounded-lg border p-4 space-y-3">
                                                <div className="flex items-start justify-between">
                                                    <div className="space-y-1">
                                                        <p className="font-semibold text-base">{damage.commodity_name || 'Unknown Crop'}</p>
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <Badge variant="outline">{damage.damage_category}</Badge>
                                                            <Badge variant="secondary">{damage.damage_type}</Badge>
                                                            {damage.status === 'validated' && (
                                                                <Badge variant="default" className="bg-blue-600">Validated</Badge>
                                                            )}
                                                            {damage.status === 'for_review' && (
                                                                <Badge variant="secondary">For Review</Badge>
                                                            )}
                                                            {damage.status === 'rejected' && (
                                                                <Badge variant="destructive">Rejected</Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm font-medium">Severity</p>
                                                        <p className="text-lg font-bold capitalize text-orange-600">
                                                            {damage.severity?.replace('_', ' ') || 'N/A'}
                                                        </p>
                                                    </div>
                                                </div>
                                                
                                                <Separator />
                                                
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                                    {damage.variety_name && (
                                                        <div>
                                                            <p className="text-xs text-muted-foreground">Variety</p>
                                                            <p className="font-medium">{damage.variety_name}</p>
                                                        </div>
                                                    )}
                                                    {damage.area_affected && (
                                                        <div>
                                                            <p className="text-xs text-muted-foreground">Area Affected</p>
                                                            <p className="font-medium">{damage.area_affected} has</p>
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="text-xs text-muted-foreground">Date Reported</p>
                                                        <p className="font-medium">
                                                            {damage.date_reported 
                                                                ? new Date(damage.date_reported).toLocaleDateString('en-US', {
                                                                    year: 'numeric',
                                                                    month: 'short',
                                                                    day: 'numeric',
                                                                })
                                                                : 'N/A'
                                                            }
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-muted-foreground">Location</p>
                                                        <p className="font-medium truncate">
                                                            {damage.barangay}, {damage.municipality}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3 text-muted-foreground py-8">
                                        <TrendingDown className="h-8 w-8" />
                                        <p>No crop damage records found for this farmer's farms</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
