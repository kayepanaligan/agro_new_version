import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Farm, type Farmer, type FarmParcel } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft, User, MapPin, Calendar, Award, Home, FileText } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Farms',
        href: '/admin/farms',
    },
];

export default function FarmProfile() {
    const { farm } = usePage<{
        farm: Farm & {
            farmer: Farmer;
            farm_parcels: (FarmParcel & {})[];
        };
    }>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${farm.farm_name} - Farm Profile`} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                {/* Back Button */}
                <div>
                    <Link href="/admin/farms">
                        <Button variant="ghost" size="sm" className="gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            Back to Farms
                        </Button>
                    </Link>
                </div>

                <div className="rounded-xl border bg-card shadow-sm">
                    {/* Header Section */}
                    <div className="border-b p-6">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-4">
                                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-primary-foreground overflow-hidden">
                                    <Award className="h-10 w-10" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold">{farm.farm_name}</h1>
                                    <p className="text-muted-foreground">
                                        Farm ID: #{farm.id}
                                    </p>
                                    <div className="mt-2 flex gap-2">
                                        <Badge variant="outline">
                                            {farm.farm_parcels?.length || 0} Parcel{(farm.farm_parcels?.length || 0) !== 1 ? 's' : ''}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-6 p-6 md:grid-cols-2">
                        {/* Farmer Information */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    Farmer Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-semibold">
                                        {farm.farmer.first_name[0]}{farm.farmer.last_name[0]}
                                    </div>
                                    <div>
                                        <p className="font-medium">
                                            {farm.farmer.first_name} {farm.farmer.last_name}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            RSBSA #{farm.farmer.rsbsa_number || 'Not assigned'}
                                        </p>
                                    </div>
                                </div>
                                <Separator />
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">Contact:</span>
                                        <span className="text-sm font-medium">{farm.farmer.contact_number || 'Not provided'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">Location:</span>
                                        <span className="text-sm font-medium">
                                            {[farm.farmer.barangay, farm.farmer.municipality_city].filter(Boolean).join(', ') || 'Not provided'}
                                        </span>
                                    </div>
                                </div>
                                <Button variant="outline" size="sm" className="w-full mt-2" asChild>
                                    <Link href={`/admin/farmers/${farm.farmer.id}`}>View Farmer Profile</Link>
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Farm Statistics */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <FileText className="h-5 w-5" />
                                    Farm Statistics
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="text-center p-3 rounded-lg bg-muted/30">
                                        <p className="text-2xl font-bold">{farm.farm_parcels?.length || 0}</p>
                                        <p className="text-xs text-muted-foreground">Total Parcels</p>
                                    </div>
                                    <div className="text-center p-3 rounded-lg bg-muted/30">
                                        <p className="text-2xl font-bold">
                                            {farm.farm_parcels?.reduce((sum, parcel) => sum + (Number(parcel.parcel_size) || 0), 0).toFixed(2) || '0.00'}
                                        </p>
                                        <p className="text-xs text-muted-foreground">Total Area (ha)</p>
                                    </div>
                                </div>
                                <Separator />
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">Created:</span>
                                        <span className="text-sm font-medium">
                                            {new Date(farm.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">Last Updated:</span>
                                        <span className="text-sm font-medium">
                                            {new Date(farm.updated_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Farm Parcels */}
                        <Card className="md:col-span-2">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <MapPin className="h-5 w-5" />
                                    Farm Parcels ({farm.farm_parcels?.length || 0})
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {farm.farm_parcels && farm.farm_parcels.length > 0 ? (
                                    <div className="grid gap-4 md:grid-cols-2">
                                        {farm.farm_parcels.map((parcel, index) => (
                                            <div key={parcel.id} className="border rounded-lg p-4 space-y-2 bg-muted/30">
                                                <div className="flex items-center justify-between mb-2">
                                                    <h4 className="font-semibold">
                                                        Parcel #{parcel.parcel_number || index + 1}
                                                    </h4>
                                                    <Badge variant="outline">
                                                        {parcel.farm_type ? parcel.farm_type.replace(/_/g, ' ') : 'Not specified'}
                                                    </Badge>
                                                </div>
                                                
                                                <div className="space-y-1 text-sm">
                                                    {(parcel.barangay || parcel.city_municipality) && (
                                                        <div className="flex items-center gap-2 text-muted-foreground">
                                                            <MapPin className="h-4 w-4" />
                                                            <span>
                                                                {[parcel.barangay, parcel.city_municipality].filter(Boolean).join(', ')}
                                                            </span>
                                                        </div>
                                                    )}
                                                    
                                                    {parcel.parcel_size && (
                                                        <div className="flex items-center gap-2 text-muted-foreground">
                                                            <FileText className="h-4 w-4" />
                                                            <span>{parcel.parcel_size} hectares</span>
                                                        </div>
                                                    )}

                                                    {parcel.total_farm_area && (
                                                        <div className="flex items-center gap-2 text-muted-foreground">
                                                            <Award className="h-4 w-4" />
                                                            <span>Total Area: {parcel.total_farm_area} hectares</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {(parcel.within_ancestral_domain || parcel.is_agrarian_reform_beneficiary || parcel.is_organic_practitioner) && (
                                                    <div className="flex flex-wrap gap-1 pt-2">
                                                        {parcel.within_ancestral_domain && (
                                                            <Badge variant="secondary" className="text-xs">Ancestral Domain</Badge>
                                                        )}
                                                        {parcel.is_agrarian_reform_beneficiary && (
                                                            <Badge variant="secondary" className="text-xs">Agrarian Reform</Badge>
                                                        )}
                                                        {parcel.is_organic_practitioner && (
                                                            <Badge variant="secondary" className="text-xs">Organic</Badge>
                                                        )}
                                                    </div>
                                                )}

                                                {parcel.remarks && (
                                                    <div className="pt-2 text-xs text-muted-foreground">
                                                        <p><strong>Remarks:</strong> {parcel.remarks}</p>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                        <p>No farm parcels registered yet</p>
                                        <p className="text-sm">Add farm parcels to provide detailed land information</p>
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
