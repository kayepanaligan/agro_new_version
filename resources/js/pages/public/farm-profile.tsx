import { type Farm, type Farmer, type FarmParcel } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft, User, MapPin, Calendar, Award, Home, FileText, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function PublicFarmProfile() {
    const { farm } = usePage<{
        farm: Farm & {
            farmer: Farmer;
            farm_parcels: (FarmParcel & {})[];
            farm_parcels_count?: number;
            total_farm_area?: number;
        };
    }>().props;

    const farmParcels = farm.farm_parcels || [];
    const parcelsCount = farm.farm_parcels_count || farmParcels.length;
    const totalArea = farm.total_farm_area || 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950 dark:to-emerald-950">
            <Head title={`${farm.farm_name} - Farm Profile`} />
            
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
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <Home className="h-8 w-8" />
                                    <h1 className="text-3xl font-bold">{farm.farm_name}</h1>
                                </div>
                                <p className="text-white/90">
                                    FID: {farm.fid || 'Not assigned'}
                                </p>
                                <div className="mt-2 flex items-center gap-2">
                                    <User className="h-4 w-4" />
                                    <span className="text-white/90">
                                        Owner: {farm.farmer.first_name} {farm.farmer.last_name}
                                    </span>
                                </div>
                                <div className="mt-2 flex gap-2">
                                    <Badge variant="secondary">
                                        {parcelsCount} parcel{parcelsCount !== 1 ? 's' : ''}
                                    </Badge>
                                    {totalArea > 0 && (
                                        <Badge variant="outline">
                                            {totalArea} hectares
                                        </Badge>
                                    )}
                                </div>
                            </div>
                            <div className="bg-white p-3 rounded-lg">
                                <QRCodeSVG 
                                    value={`${window.location.origin}/farm/profile/${farm.fid}`}
                                    size={100}
                                    level="H"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-6 p-6 md:grid-cols-2">
                        {/* Farm Information */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Award className="h-5 w-5" />
                                    Farm Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <p className="text-sm text-muted-foreground">Farm Name</p>
                                    <p className="font-medium">{farm.farm_name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Farm ID (FID)</p>
                                    <p className="font-mono text-sm">{farm.fid || 'Not assigned'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Parcels</p>
                                    <Badge variant="outline">{parcelsCount} parcel{parcelsCount !== 1 ? 's' : ''}</Badge>
                                </div>
                                {totalArea > 0 && (
                                    <div>
                                        <p className="text-sm text-muted-foreground">Total Farm Area</p>
                                        <p className="font-medium">{totalArea} hectares</p>
                                    </div>
                                )}
                                <div>
                                    <p className="text-sm text-muted-foreground">Created At</p>
                                    <p className="font-medium">
                                        {new Date(farm.created_at).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Farmer Information */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    Farmer Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <p className="text-sm text-muted-foreground">Full Name</p>
                                    <p className="font-medium">
                                        {farm.farmer.first_name} {farm.farmer.middle_name || ''} {farm.farmer.last_name}
                                    </p>
                                </div>
                                {farm.farmer.lfid && (
                                    <div>
                                        <p className="text-sm text-muted-foreground">LFID (Farmer ID)</p>
                                        <p className="font-mono text-sm">{farm.farmer.lfid}</p>
                                    </div>
                                )}
                                {farm.farmer.rsbsa_number && (
                                    <div>
                                        <p className="text-sm text-muted-foreground">RSBSA Number</p>
                                        <p className="font-medium">{farm.farmer.rsbsa_number}</p>
                                    </div>
                                )}
                                <div>
                                    <p className="text-sm text-muted-foreground">Sex</p>
                                    <Badge variant="outline">{farm.farmer.sex}</Badge>
                                </div>
                                {farm.farmer.contact_number && (
                                    <div>
                                        <p className="text-sm text-muted-foreground">Contact Number</p>
                                        <p className="font-medium">{farm.farmer.contact_number}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Farm Parcels */}
                        {farmParcels.length > 0 && (
                            <Card className="md:col-span-2">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <MapPin className="h-5 w-5" />
                                        Farm Parcels ({parcelsCount})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {farmParcels.map((parcel, index) => {
                                            const p = parcel as any;
                                            return (
                                            <div key={parcel.id} className="border rounded-lg p-4 bg-muted/30">
                                                <h4 className="font-semibold mb-3 flex items-center gap-2">
                                                    <FileText className="h-4 w-4" />
                                                    Parcel #{parcel.parcel_number || index + 1}
                                                </h4>
                                                
                                                <div className="grid gap-3 md:grid-cols-3">
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
                                                
                                                <div className="grid gap-3 md:grid-cols-3 mt-3">
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
                                                    {p.livestock_count !== undefined && p.livestock_count > 0 && (
                                                        <div>
                                                            <p className="text-xs text-muted-foreground">Livestock Count</p>
                                                            <p className="text-sm font-medium">{p.livestock_count}</p>
                                                        </div>
                                                    )}
                                                </div>
                                                
                                                {(parcel.within_ancestral_domain || p.is_agrarian_reform_beneficiary || p.is_organic_practitioner) && (
                                                    <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t">
                                                        {parcel.within_ancestral_domain && (
                                                            <Badge variant="outline">Ancestral Domain</Badge>
                                                        )}
                                                        {p.is_agrarian_reform_beneficiary && (
                                                            <Badge variant="outline">Agrarian Reform</Badge>
                                                        )}
                                                        {p.is_organic_practitioner && (
                                                            <Badge variant="outline">Organic</Badge>
                                                        )}
                                                    </div>
                                                )}
                                                
                                                {parcel.remarks && (
                                                    <div className="mt-3 pt-3 border-t">
                                                        <p className="text-xs text-muted-foreground">Remarks</p>
                                                        <p className="text-sm">{parcel.remarks}</p>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                        })}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-6 text-center text-sm text-muted-foreground">
                    <p>Scanned from QR Code • {farm.fid}</p>
                </div>
            </div>
        </div>
    );
}
