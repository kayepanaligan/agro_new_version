import { type Farmer } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft, Calendar, MapPin, Phone, User, Users, Home, Briefcase, GraduationCap, Heart } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950 dark:to-emerald-950">
            <Head title={`${fullName} - Farmer Profile`} />
            
            <div className="container mx-auto px-4 py-8 max-w-6xl">
                {/* Header */}
                <div className="mb-6">
                    <Link href="/">
                        <Button variant="outline" size="sm" className="gap-2 mb-4">
                            <ArrowLeft className="h-4 w-4" />
                            Back to Login
                        </Button>
                    </Link>
                </div>

                <div className="rounded-xl border bg-card shadow-lg">
                    {/* Header Section */}
                    <div className="border-b p-6 bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                        <div className="flex items-start gap-4">
                            <div className="flex h-24 w-24 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm overflow-hidden border-2 border-white/30">
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
                            <div className="flex-1">
                                <h1 className="text-3xl font-bold">{fullName}</h1>
                                <p className="text-white/90">
                                    LFID: {farmer.lfid || 'Not assigned'}
                                </p>
                                {farmer.rsbsa_number && (
                                    <p className="text-white/90">
                                        RSBSA #{farmer.rsbsa_number}
                                    </p>
                                )}
                                <div className="mt-2 flex gap-2">
                                    <Badge variant="secondary">{farmer.sex}</Badge>
                                    {farmer.civil_status && (
                                        <Badge variant="outline">{farmer.civil_status}</Badge>
                                    )}
                                </div>
                            </div>
                            <div className="bg-white p-3 rounded-lg">
                                <QRCodeSVG 
                                    value={`${window.location.origin}/farmer/profile/${farmer.lfid}`}
                                    size={100}
                                    level="H"
                                />
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

                        {/* Address Information */}
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

                        {/* Household Information */}
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
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-6 text-center text-sm text-muted-foreground">
                    <p>Scanned from QR Code • {farmer.lfid}</p>
                </div>
            </div>
        </div>
    );
}
