import { Head, Link, router } from '@inertiajs/react';
import { Eye, CheckCircle, XCircle, Filter, MoreHorizontal, Trash2, Pencil } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { BreadcrumbItem } from '@/types';
import { useState } from 'react';

interface Technician {
    id: number;
    full_name: string;
    email: string;
}

interface Report {
    id: number;
    report_type: string;
    status: string;
    technician: {
        id: number;
        full_name: string;
    };
    reference_model_type: string;
    reference_model_id: number;
    verified_by: {
        id: number;
        full_name: string;
    } | null;
    submitted_at: string;
    verified_at: string | null;
}

interface PaginatedReports {
    data: Report[];
    links: { url: string | null; label: string; active: boolean }[];
    current_page: number;
    last_page: number;
}

interface TechnicianReportsProps {
    reports: PaginatedReports;
    technicians: Technician[];
    filters: {
        status?: string;
        technician_id?: string;
        report_type?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Technician Reports',
        href: '/admin/technician-reports',
    },
];

export default function TechnicianReports({ reports, technicians, filters }: TechnicianReportsProps) {
    const [selectedReports, setSelectedReports] = useState<number[]>([]);

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

    const handleFilter = (key: string, value: string) => {
        const params = new URLSearchParams();
        if (value && value !== 'all') {
            params.set(key, value);
        }
        if (filters.status && key !== 'status') params.set('status', filters.status);
        if (filters.technician_id && key !== 'technician_id') params.set('technician_id', filters.technician_id);
        if (filters.report_type && key !== 'report_type') params.set('report_type', filters.report_type);
        
        router.get(route('admin.technician-reports'), Object.fromEntries(params), {
            preserveState: true,
            replace: true,
        });
    };

    const handlePageChange = (url: string | null) => {
        if (url) {
            router.get(url, {}, { preserveState: true });
        }
    };

    const toggleSelectAll = () => {
        if (selectedReports.length === reports.data.length) {
            setSelectedReports([]);
        } else {
            setSelectedReports(reports.data.map(r => r.id));
        }
    };

    const toggleSelect = (reportId: number) => {
        if (selectedReports.includes(reportId)) {
            setSelectedReports(selectedReports.filter(id => id !== reportId));
        } else {
            setSelectedReports([...selectedReports, reportId]);
        }
    };

    const handleBulkVerify = () => {
        if (selectedReports.length === 0) {
            alert('Please select reports to verify');
            return;
        }
        
        if (confirm(`Verify ${selectedReports.length} report(s)?`)) {
            router.post(route('admin.technician-reports.bulk-verify'), {
                report_ids: selectedReports,
            });
        }
    };

    const pendingReports = reports.data.filter(r => r.status === 'submitted' || r.status === 'pending');

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Technician Reports" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Technician Reports</h1>
                        <p className="text-muted-foreground">
                            Review and verify field activities submitted by technicians
                        </p>
                    </div>
                    {selectedReports.length > 0 && (
                        <Button onClick={handleBulkVerify}>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Verify Selected ({selectedReports.length})
                        </Button>
                    )}
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Reports</CardTitle>
                                <CardDescription>
                                    {reports.data.length} report{reports.data.length !== 1 ? 's' : ''} found
                                    {pendingReports.length > 0 && (
                                        <span className="ml-2 text-blue-600">
                                            ({pendingReports.length} pending verification)
                                        </span>
                                    )}
                                </CardDescription>
                            </div>
                            <Filter className="h-5 w-5 text-muted-foreground" />
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Status</label>
                                <Select 
                                    value={filters.status || 'all'} 
                                    onValueChange={(value) => handleFilter('status', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Statuses" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Statuses</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="submitted">Submitted</SelectItem>
                                        <SelectItem value="verified">Verified</SelectItem>
                                        <SelectItem value="rejected">Rejected</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Technician</label>
                                <Select 
                                    value={filters.technician_id || 'all'} 
                                    onValueChange={(value) => handleFilter('technician_id', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Technicians" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Technicians</SelectItem>
                                        {technicians.map((tech) => (
                                            <SelectItem key={tech.id} value={tech.id.toString()}>
                                                {tech.full_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Report Type</label>
                                <Select 
                                    value={filters.report_type || 'all'} 
                                    onValueChange={(value) => handleFilter('report_type', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Types" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Types</SelectItem>
                                        <SelectItem value="farmer_registration">Farmer Registration</SelectItem>
                                        <SelectItem value="farm_creation">Farm Creation</SelectItem>
                                        <SelectItem value="crop_monitoring">Crop Monitoring</SelectItem>
                                        <SelectItem value="crop_damage">Crop Damage</SelectItem>
                                        <SelectItem value="distribution_record">Distribution Record</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[50px]">
                                            <Checkbox
                                                checked={selectedReports.length === reports.data.length && reports.data.length > 0}
                                                onCheckedChange={toggleSelectAll}
                                            />
                                        </TableHead>
                                        <TableHead>Report Type</TableHead>
                                        <TableHead>Technician</TableHead>
                                        <TableHead>Reference ID</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Submitted</TableHead>
                                        <TableHead>Verified By</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {reports.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={8} className="h-24 text-center">
                                                No reports found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        reports.data.map((report) => (
                                            <TableRow key={report.id}>
                                                <TableCell>
                                                    <Checkbox
                                                        checked={selectedReports.includes(report.id)}
                                                        onCheckedChange={() => toggleSelect(report.id)}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">
                                                        {getReportTypeLabel(report.report_type)}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{report.technician.full_name}</TableCell>
                                                <TableCell className="font-mono text-sm">
                                                    #{report.reference_model_id}
                                                </TableCell>
                                                <TableCell>
                                                    {getStatusBadge(report.status)}
                                                </TableCell>
                                                <TableCell>
                                                    {new Date(report.submitted_at).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell>
                                                    {report.verified_by ? report.verified_by.full_name : '-'}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem asChild>
                                                                <Link href={route('admin.technician-reports.show', report.id)}>
                                                                    <Eye className="mr-2 h-4 w-4" />
                                                                    View Details
                                                                </Link>
                                                            </DropdownMenuItem>
                                                            {(report.status === 'submitted' || report.status === 'pending') && (
                                                                <>
                                                                    <DropdownMenuSeparator />
                                                                    <DropdownMenuItem>
                                                                        <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                                                                        <span className="text-green-600">Verify Report</span>
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem>
                                                                        <XCircle className="mr-2 h-4 w-4 text-red-600" />
                                                                        <span className="text-red-600">Reject Report</span>
                                                                    </DropdownMenuItem>
                                                                </>
                                                            )}
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem className="text-destructive">
                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                Delete Report
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination */}
                        {reports.links.length > 3 && (
                            <div className="flex items-center justify-center gap-2">
                                {reports.links.map((link, index) => (
                                    <Button
                                        key={index}
                                        variant={link.active ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => handlePageChange(link.url)}
                                        disabled={!link.url}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
