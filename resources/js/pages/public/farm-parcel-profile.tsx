import { type FarmParcel } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, MapPin, Calendar, Award, Home, FileText, QrCode, User } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { usePage } from '@inertiajs/react';

export default function PublicFarmParcelProfile() {
    const { parcel } = usePage<{
        parcel: FarmParcel & {
            farm: {
                id: number;
                farm_name: string;
                fid?: string | null;
                farmer: {
                    id: number;
                    first_name: string;
                    last_name: string;
                    rsbsa_number?: string | null;
                };
            };
        };
    }>().props;

    const p = parcel as any;

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950 dark:to-emerald-950">
            <Head title={`${parcel.farm?.farm_name || 'Farm'} - Parcel Profile`} />
            
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
                                    <MapPin className="h-8 w-8" />
                                    <h1 className="text-3xl font-bold">
                                        Parcel #{p.parcel_number || 'N/A'}
                                    </h1>
                                </div>
                                <p className="text-white/90">
                                    FPID: {parcel.fpid || 'Not assigned'}
                                </p>
                                <div className="mt-2 flex items-center gap-2">
                                    <Home className="h-4 w-4" />
                                    <span className="text-white/90">
                                        Farm: {parcel.farm?.farm_name || 'N/A'}
                                    </span>
                                </div>
                                <div className="mt-2 flex items-center gap-2">
                                    <User className="h-4 w-4" />
                                    <span className="text-white/90">
                                        Owner: {parcel.farm?.farmer?.first_name} {parcel.farm?.farmer?.last_name}
                                    </span>
                                </div>
                                <div className="mt-2 flex gap-2">
                                    {p.farm_type && (
                                        <Badge variant="secondary">
                                            {p.farm_type.replace(/_/g, ' ')}
                                        </Badge>
                                    )}
                                    {p.parcel_size && (
                                        <Badge variant="outline">
                                            {p.parcel_size} hectares
                                        </Badge>
                                    )}
                                </div>
                            </div>
                            <div className="bg-white p-3 rounded-lg">
                                <QRCodeSVG 
                                    value={`${window.location.origin}/farm-parcel/profile/${parcel.fpid}`}
                                    size={100}
                                    level="H"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-6 p-6 md:grid-cols-2">
                        {/* Parcel Information */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <MapPin className="h-5 w-5" />
                                    Parcel Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <p className="text-sm text-muted-foreground">Farm Parcel ID (FPID)</p>
                                    <p className="font-mono text-sm">{parcel.fpid || 'Not assigned'}</p>
                                </div>
                                <Separator />
                                <div>
                                    <p className="text-sm text-muted-foreground">Location</p>
                                    <p className="font-medium">
                                        {[p.barangay, p.city_municipality].filter(Boolean).join(', ') || 'Not specified'}
                                    </p>
                                </div>
                                <Separator />
                                <div>
                                    <p className="text-sm text-muted-foreground">Farm Type</p>
                                    <p className="font-medium">
                                        {p.farm_type ? p.farm_type.replace(/_/g, ' ') : 'Not specified'}
                                    </p>
                                </div>
                                <Separator />
                                <div>
                                    <p className="text-sm text-muted-foreground">Parcel Size</p>
                                    <p className="font-medium">{p.parcel_size || 'N/A'} hectares</p>
                                </div>
                                {p.total_farm_area && (
                                    <>
                                        <Separator />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Total Farm Area</p>
                                            <p className="font-medium">{p.total_farm_area} hectares</p>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        {/* Ownership Details */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <FileText className="h-5 w-5" />
                                    Ownership Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <p className="text-sm text-muted-foreground">Ownership Type</p>
                                    <p className="font-medium capitalize">
                                        {p.ownership_type ? p.ownership_type.replace(/_/g, ' ') : 'Not specified'}
                                    </p>
                                </div>
                                {p.ownership_document_type && (
                                    <>
                                        <Separator />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Document Type</p>
                                            <p className="font-medium">{p.ownership_document_type}</p>
                                        </div>
                                    </>
                                )}
                                {(p.landowner_first_name || p.landowner_surname) && (
                                    <>
                                        <Separator />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Landowner Name</p>
                                            <p className="font-medium">
                                                {[p.landowner_first_name, p.landowner_middle_name, p.landowner_surname, p.landowner_extension_name]
                                                    .filter(Boolean)
                                                    .join(' ')}
                                            </p>
                                        </div>
                                    </>
                                )}
                                {p.landowner_contact && (
                                    <>
                                        <Separator />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Landowner Contact</p>
                                            <p className="font-medium">{p.landowner_contact}</p>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        {/* Special Designations */}
                        <Card className="md:col-span-2">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Award className="h-5 w-5" />
                                    Special Designations
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {p.within_ancestral_domain && (
                                        <Badge variant="secondary" className="text-sm">
                                            Within Ancestral Domain
                                        </Badge>
                                    )}
                                    {p.agrarian_reform_beneficiary && (
                                        <Badge variant="secondary" className="text-sm">
                                            Agrarian Reform Beneficiary
                                        </Badge>
                                    )}
                                    {p.is_organic_practitioner && (
                                        <Badge variant="secondary" className="text-sm">
                                            Organic Practitioner
                                        </Badge>
                                    )}
                                    {!p.within_ancestral_domain && !p.agrarian_reform_beneficiary && !p.is_organic_practitioner && (
                                        <p className="text-muted-foreground">No special designations</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Farm & Owner Information */}
                        <Card className="md:col-span-2">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Home className="h-5 w-5" />
                                    Farm & Owner Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Farm Name</p>
                                        <p className="font-medium">{parcel.farm?.farm_name || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Farm ID (FID)</p>
                                        <p className="font-mono text-sm">{parcel.farm?.fid || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Owner Name</p>
                                        <p className="font-medium">
                                            {parcel.farm?.farmer?.first_name} {parcel.farm?.farmer?.last_name}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">RSBSA Number</p>
                                        <p className="font-medium">
                                            {parcel.farm?.farmer?.rsbsa_number || 'Not assigned'}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Remarks */}
                        {p.remarks && (
                            <Card className="md:col-span-2">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <FileText className="h-5 w-5" />
                                        Remarks
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground">{p.remarks}</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="border-t p-6 bg-muted/30">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="text-sm text-muted-foreground">
                                <p>Scanned QR Code for Farm Parcel</p>
                                <p className="font-mono text-xs mt-1">{parcel.fpid || 'N/A'}</p>
                            </div>
                            <div className="text-sm text-muted-foreground">
                                <p>Registered: {new Date(parcel.created_at).toLocaleDateString()}</p>
                                <p>Last Updated: {new Date(parcel.updated_at).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
