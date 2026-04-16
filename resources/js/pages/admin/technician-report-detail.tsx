import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, CheckCircle, XCircle, MapPin, Camera, Calendar, FileText, User } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import type { BreadcrumbItem } from '@/types';
import { useState } from 'react';

interface ReportDetailProps {
    report: {
        id: number;
        report_type: string;
        status: string;
        evidence_data: Record<string, any> | null;
        rejection_remarks: string | null;
        technician: {
            id: number;
            full_name: string;
            email: string;
        };
        verified_by: {
            id: number;
            full_name: string;
        } | null;
        reference_model: {
            type: string;
            id: number;
        } | null;
        submitted_at: string;
        verified_at: string | null;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Technician Reports',
        href: '/admin/technician-reports',
    },
    {
        title: 'Report Details',
        href: '/admin/technician-reports/1',
    },
];

export default function TechnicianReportDetail({ report }: ReportDetailProps) {
    const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false);

    const verifyForm = useForm({
        remarks: '',
    });

    const rejectForm = useForm({
        rejection_remarks: '',
    });

    const getStatusBadge = (status: string) => {
        const colors: Record<string, string> = {
            pending: 'bg-gray-500',
            submitted: 'bg-blue-500',
            verified: 'bg-green-500',
            rejected: 'bg-red-500',
        };
        return (
            <Badge className={colors[status] || 'bg-gray-500'}>
                {status.toUpperCase()}
            </Badge>
        );
    };

    const getReportTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            farmer_registration: 'Farmer Registration',
            farm_creation: 'Farm Creation',
            crop_monitoring: 'Crop Monitoring',
            crop_damage: 'Crop Damage',
            distribution_record: 'Distribution Record',
        };
        return labels[type] || type;
    };

    const getReferenceModelLabel = (type: string) => {
        const labels: Record<string, string> = {
            'App\\Models\\Farmer': 'Farmer',
            'App\\Models\\Farm': 'Farm',
            'App\\Models\\CropMonitoringItem': 'Crop Monitoring Entry',
            'App\\Models\\CropDamageRecord': 'Crop Damage Record',
            'App\\Models\\DistributionRecord': 'Distribution Record',
        };
        return labels[type] || 'Unknown';
    };

    const handleVerify = (e: React.FormEvent) => {
        e.preventDefault();
        router.post(route('admin.technician-reports.verify', report.id), verifyForm.data, {
            onSuccess: () => setVerifyDialogOpen(false),
        });
    };

    const handleReject = (e: React.FormEvent) => {
        e.preventDefault();
        router.post(route('admin.technician-reports.reject', report.id), rejectForm.data, {
            onSuccess: () => setRejectDialogOpen(false),
        });
    };

    const canVerify = ['submitted', 'pending'].includes(report.status);

    breadcrumbs[1] = {
        title: `${getReportTypeLabel(report.report_type)} #${report.id}`,
        href: `/admin/technician-reports/${report.id}`,
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Report: ${getReportTypeLabel(report.report_type)}`} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" asChild>
                            <Link href={route('admin.technician-reports')}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Reports
                            </Link>
                        </Button>
                    </div>
                    {canVerify && (
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                className="text-red-600 border-red-600 hover:bg-red-50"
                                onClick={() => setRejectDialogOpen(true)}
                            >
                                <XCircle className="mr-2 h-4 w-4" />
                                Reject Report
                            </Button>
                            <Button
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => setVerifyDialogOpen(true)}
                            >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Verify Report
                            </Button>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <CardTitle className="text-2xl mb-2">
                                            {getReportTypeLabel(report.report_type)}
                                        </CardTitle>
                                        <div className="flex flex-wrap gap-2">
                                            {getStatusBadge(report.status)}
                                            <Badge variant="outline">
                                                Report #{report.id}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Reference Information */}
                                {report.reference_model && (
                                    <div className="rounded-lg border p-4 bg-blue-50 dark:bg-blue-950/20">
                                        <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                                            <FileText className="h-4 w-4" />
                                            Reference Record
                                        </h4>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <div className="text-muted-foreground">Type</div>
                                                <div className="font-medium">
                                                    {getReferenceModelLabel(report.reference_model.type)}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-muted-foreground">Record ID</div>
                                                <div className="font-mono">#{report.reference_model.id}</div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Rejection Remarks */}
                                {report.rejection_remarks && (
                                    <div className="rounded-lg border p-4 bg-red-50 dark:bg-red-950/20">
                                        <h4 className="text-sm font-medium text-red-900 dark:text-red-100 mb-1 flex items-center gap-2">
                                            <XCircle className="h-4 w-4" />
                                            Rejection Remarks
                                        </h4>
                                        <p className="text-sm text-red-800 dark:text-red-200">
                                            {report.rejection_remarks}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Evidence Gallery */}
                        {report.evidence_data && Object.keys(report.evidence_data).length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Camera className="h-5 w-5" />
                                        Evidence & Activity Data
                                    </CardTitle>
                                    <CardDescription>
                                        GPS coordinates, timestamps, and attached media
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* GPS Coordinates */}
                                    {report.evidence_data.gps && (
                                        <div className="rounded-lg border p-4">
                                            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                                                <MapPin className="h-4 w-4 text-blue-600" />
                                                GPS Location
                                            </h4>
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <div className="text-muted-foreground">Latitude</div>
                                                    <div className="font-mono">{report.evidence_data.gps.lat}</div>
                                                </div>
                                                <div>
                                                    <div className="text-muted-foreground">Longitude</div>
                                                    <div className="font-mono">{report.evidence_data.gps.lng}</div>
                                                </div>
                                            </div>
                                            {report.evidence_data.gps.accuracy && (
                                                <div className="mt-2 text-xs text-muted-foreground">
                                                    Accuracy: ±{report.evidence_data.gps.accuracy}m
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Timestamps */}
                                    {report.evidence_data.timestamp && (
                                        <div className="rounded-lg border p-4">
                                            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-green-600" />
                                                Activity Timestamp
                                            </h4>
                                            <div className="text-sm">
                                                {new Date(report.evidence_data.timestamp).toLocaleString()}
                                            </div>
                                        </div>
                                    )}

                                    {/* Photos */}
                                    {report.evidence_data.photos && report.evidence_data.photos.length > 0 && (
                                        <div>
                                            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                                                <Camera className="h-4 w-4 text-purple-600" />
                                                Photos ({report.evidence_data.photos.length})
                                            </h4>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                                {report.evidence_data.photos.map((photo: string, idx: number) => {
                                                    // Ensure photo path has /storage/ prefix
                                                    const photoUrl = photo.startsWith('http') || photo.startsWith('/storage/') 
                                                        ? photo 
                                                        : `/storage/${photo}`;
                                                    
                                                    return (
                                                        <div key={idx} className="aspect-square bg-gray-100 rounded-lg overflow-hidden border">
                                                            <img 
                                                                src={photoUrl} 
                                                                alt={`Evidence photo ${idx + 1}`}
                                                                className="w-full h-full object-cover"
                                                                onError={(e) => {
                                                                    // Fallback for missing images
                                                                    (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22%3E%3Crect fill=%22%23ddd%22 width=%22100%22 height=%22100%22/%3E%3Ctext fill=%22%23999%22 font-family=%22sans-serif%22 font-size=%2214%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22%3EImage%3C/text%3E%3C/svg%3E';
                                                                }}
                                                            />
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* Signatures */}
                                    {report.evidence_data.signature && (
                                        <div>
                                            <h4 className="text-sm font-medium mb-3">Farmer Signature</h4>
                                            <div className="border rounded-lg p-4 bg-white">
                                                {(() => {
                                                    const signatureUrl = report.evidence_data.signature.startsWith('http') || report.evidence_data.signature.startsWith('/storage/') 
                                                        ? report.evidence_data.signature 
                                                        : `/storage/${report.evidence_data.signature}`;
                                                    
                                                    return (
                                                        <img 
                                                            src={signatureUrl} 
                                                            alt="Farmer signature"
                                                            className="max-w-full h-auto"
                                                            onError={(e) => {
                                                                (e.target as HTMLImageElement).style.display = 'none';
                                                            }}
                                                        />
                                                    );
                                                })()}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Technician Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                                        <User className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <div className="font-medium">{report.technician.full_name}</div>
                                        <div className="text-sm text-muted-foreground">
                                            {report.technician.email}
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 border-t space-y-3">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <div className="text-sm text-muted-foreground">Submitted</div>
                                            <div className="font-medium">
                                                {new Date(report.submitted_at).toLocaleString()}
                                            </div>
                                        </div>
                                    </div>

                                    {report.verified_at && (
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4 text-green-600" />
                                            <div>
                                                <div className="text-sm text-muted-foreground">Verified</div>
                                                <div className="font-medium">
                                                    {new Date(report.verified_at).toLocaleString()}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {report.verified_by && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Verification Details</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div>
                                        <div className="text-sm text-muted-foreground">Verified By</div>
                                        <div className="font-medium">{report.verified_by.full_name}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-muted-foreground">Verification Date</div>
                                        <div>{report.verified_at ? new Date(report.verified_at).toLocaleString() : '-'}</div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        <Card>
                            <CardHeader>
                                <CardTitle>Report Metadata</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <div>
                                    <div className="text-muted-foreground">Report ID</div>
                                    <div className="font-mono">#{report.id}</div>
                                </div>
                                <div>
                                    <div className="text-muted-foreground">Type</div>
                                    <div>{getReportTypeLabel(report.report_type)}</div>
                                </div>
                                <div>
                                    <div className="text-muted-foreground">Status</div>
                                    <div>{report.status.toUpperCase()}</div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Verify Dialog */}
                <Dialog open={verifyDialogOpen} onOpenChange={setVerifyDialogOpen}>
                    <DialogContent>
                        <form onSubmit={handleVerify}>
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                    Verify Report
                                </DialogTitle>
                                <DialogDescription>
                                    Mark this report as verified. This confirms the field activity meets quality standards.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="verify-remarks">Remarks (Optional)</Label>
                                    <Textarea
                                        id="verify-remarks"
                                        value={verifyForm.data.remarks}
                                        onChange={(e) => verifyForm.setData('remarks', e.target.value)}
                                        placeholder="Add any comments or notes..."
                                        rows={3}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setVerifyDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                                    Verify Report
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Reject Dialog */}
                <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
                    <DialogContent>
                        <form onSubmit={handleReject}>
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2 text-red-600">
                                    <XCircle className="h-5 w-5" />
                                    Reject Report
                                </DialogTitle>
                                <DialogDescription>
                                    This report will be sent back to the technician for correction. Please provide detailed reasons.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="reject-remarks">Rejection Remarks *</Label>
                                    <Textarea
                                        id="reject-remarks"
                                        value={rejectForm.data.rejection_remarks}
                                        onChange={(e) => rejectForm.setData('rejection_remarks', e.target.value)}
                                        placeholder="Explain why this report is being rejected..."
                                        rows={4}
                                        required
                                    />
                                    {rejectForm.errors.rejection_remarks && (
                                        <p className="text-sm text-red-500">{rejectForm.errors.rejection_remarks}</p>
                                    )}
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setRejectDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" variant="destructive">
                                    Reject Report
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
