import { Head, Link, router } from '@inertiajs/react';
import {
    FileText,
    Clock,
    CheckCircle,
    XCircle,
    Eye,
    MoreHorizontal,
    Trash2,
    Search,
    BarChart3,
    Table2,
    ClipboardList,
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
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
import { KpiCard } from '@/components/agro-profiler/kpi-card';
import { SyncIndicator } from '@/components/agro-profiler/sync-indicator';
import { Pagination } from '@/components/agro-profiler/pagination';
import { FilterBar } from '@/components/agro-profiler/filter-bar';
import { NarrativeCard } from '@/components/agro-profiler/narrative-card';
import { ExportButtons } from '@/components/agro-profiler/export-buttons';
import { DashboardDateFilter, type DateRange } from '@/components/agro-profiler/dashboard-date-filter';
import { useChartColors } from '@/hooks/use-chart-colors';
import { exportToCsv, exportToPdf } from '@/lib/export';
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
} from 'recharts';
import type { BreadcrumbItem } from '@/types';
import { useState, useMemo } from 'react';

// ─── Interfaces ──────────────────────────────────────────────
interface Technician {
    id: number;
    full_name: string;
    email: string;
}

interface Report {
    id: number;
    report_type: string;
    status: string;
    technician: { id: number; full_name: string };
    reference_model_type: string;
    reference_model_id: number;
    verified_by: { id: number; full_name: string } | null;
    submitted_at: string;
    verified_at: string | null;
}

interface Analytics {
    status_counts: { total: number; pending: number; submitted: number; verified: number; rejected: number };
    type_counts: Record<string, number>;
    submission_trend: { date: string; count: number }[];
    technician_performance: {
        technician_id: number;
        full_name: string;
        total_reports: number;
        verified_count: number;
        verification_rate: number;
    }[];
    recent_activity: {
        id: number;
        report_type: string;
        status: string;
        technician_name: string;
        created_at: string;
    }[];
    last_synced_at: string | null;
}

interface PaginatedReports {
    data: Report[];
    links: { url: string | null; label: string; active: boolean }[];
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
}

interface TechnicianReportsProps {
    reports: PaginatedReports;
    technicians: Technician[];
    filters: { status?: string; technician_id?: string; report_type?: string };
    analytics: Analytics;
}

// ─── Helpers ─────────────────────────────────────────────────
const breadcrumbs: BreadcrumbItem[] = [{ title: 'Technician Reports', href: '/admin/technician-reports' }];

const statusConfig: Record<string, { label: string; className: string }> = {
    pending: { label: 'Pending', className: 'bg-amber-500/10 text-amber-700 border-amber-500/20 dark:text-amber-400' },
    submitted: { label: 'Submitted', className: 'bg-blue-500/10 text-blue-700 border-blue-500/20 dark:text-blue-400' },
    verified: { label: 'Verified', className: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:text-emerald-400' },
    rejected: { label: 'Rejected', className: 'bg-red-500/10 text-red-700 border-red-500/20 dark:text-red-400' },
};

const reportTypeLabels: Record<string, string> = {
    farmer_registration: 'Farmer Registration',
    farm_creation: 'Farm Creation',
    crop_monitoring: 'Crop Monitoring',
    crop_damage: 'Crop Damage',
    distribution_record: 'Distribution Record',
};

function getStatusBadge(status: string) {
    const config = statusConfig[status] || statusConfig.pending;
    return (
        <Badge variant="outline" className={`font-medium ${config.className}`}>
            {config.label}
        </Badge>
    );
}

function getInitials(name: string) {
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

function generateNarrative(analytics: Analytics): string {
    const { status_counts, type_counts, technician_performance, submission_trend } = analytics;
    const total = status_counts.total;
    const pending = status_counts.pending;
    const verified = status_counts.verified;

    const topTech = technician_performance[0];
    const trendLast7 = submission_trend.slice(-7);
    const recentTotal = trendLast7.reduce((s, d) => s + d.count, 0);
    const prev7 = submission_trend.slice(-14, -7);
    const prevTotal = prev7.reduce((s, d) => s + d.count, 0);
    const trendPct = prevTotal > 0 ? Math.round(((recentTotal - prevTotal) / prevTotal) * 100) : 0;

    const topType = Object.entries(type_counts).sort((a, b) => b[1] - a[1])[0];
    const verificationRate = total > 0 ? Math.round((verified / total) * 100) : 0;

    let narrative = `The system has processed a total of ${total} technician reports. `;
    narrative += `Currently, ${pending} report${pending !== 1 ? 's' : ''} ${pending === 1 ? 'is' : 'are'} pending verification, `;
    narrative += `while the overall verification rate stands at ${verificationRate}%. `;

    if (trendPct !== 0) {
        narrative += `Submissions over the past 7 days ${trendPct > 0 ? 'increased' : 'decreased'} by ${Math.abs(trendPct)}% compared to the previous period, `;
        narrative += `with ${recentTotal} new report${recentTotal !== 1 ? 's' : ''} received. `;
    }

    if (topTech) {
        narrative += `${topTech.full_name} leads in submission volume with ${topTech.total_reports} report${topTech.total_reports !== 1 ? 's' : ''}. `;
    }

    if (topType) {
        narrative += `The most common report type is ${reportTypeLabels[topType[0]] || topType[0]} with ${topType[1]} entries.`;
    }

    return narrative;
}

// ─── Component ───────────────────────────────────────────────
export default function TechnicianReports({ reports, technicians, filters, analytics }: TechnicianReportsProps) {
    const [selectedReports, setSelectedReports] = useState<number[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('reports');
    const [perPage, setPerPage] = useState(reports.per_page || 10);
    const [dateRange, setDateRange] = useState<DateRange | null>(null);
    const chartColors = useChartColors();

    const activeFilters = useMemo(() => {
        const chips: { key: string; label: string; value: string }[] = [];
        if (filters.status && filters.status !== 'all') {
            chips.push({ key: 'status', label: 'Status', value: statusConfig[filters.status]?.label || filters.status });
        }
        if (filters.technician_id && filters.technician_id !== 'all') {
            const tech = technicians.find((t) => t.id === Number(filters.technician_id));
            chips.push({ key: 'technician_id', label: 'Technician', value: tech?.full_name || filters.technician_id });
        }
        if (filters.report_type && filters.report_type !== 'all') {
            chips.push({ key: 'report_type', label: 'Type', value: reportTypeLabels[filters.report_type] || filters.report_type });
        }
        return chips;
    }, [filters, technicians]);

    const filteredReports = useMemo(() => {
        if (!searchQuery) return reports.data;
        const q = searchQuery.toLowerCase();
        return reports.data.filter(
            (r) =>
                r.technician.full_name.toLowerCase().includes(q) ||
                r.report_type.toLowerCase().includes(q) ||
                r.status.toLowerCase().includes(q) ||
                String(r.reference_model_id).includes(q)
        );
    }, [reports.data, searchQuery]);

    const handleFilter = (key: string, value: string) => {
        const params = new URLSearchParams();
        if (value && value !== 'all') params.set(key, value);
        if (filters.status && key !== 'status') params.set('status', filters.status);
        if (filters.technician_id && key !== 'technician_id') params.set('technician_id', filters.technician_id);
        if (filters.report_type && key !== 'report_type') params.set('report_type', filters.report_type);
        if (perPage !== 10) params.set('per_page', String(perPage));

        router.get(route('admin.technician-reports'), Object.fromEntries(params), {
            preserveState: true,
            replace: true,
        });
    };

    const removeFilter = (key: string) => handleFilter(key, 'all');
    const clearAllFilters = () => {
        router.get(route('admin.technician-reports'), { per_page: perPage }, { preserveState: true, replace: true });
    };

    const handlePageChange = (page: number) => {
        const params = new URLSearchParams();
        params.set('page', String(page));
        if (perPage !== 10) params.set('per_page', String(perPage));
        if (filters.status) params.set('status', filters.status);
        if (filters.technician_id) params.set('technician_id', filters.technician_id);
        if (filters.report_type) params.set('report_type', filters.report_type);
        router.get(route('admin.technician-reports'), Object.fromEntries(params), { preserveState: true });
    };

    const handlePerPageChange = (newPerPage: number) => {
        setPerPage(newPerPage);
        const params = new URLSearchParams();
        params.set('per_page', String(newPerPage));
        if (filters.status) params.set('status', filters.status);
        if (filters.technician_id) params.set('technician_id', filters.technician_id);
        if (filters.report_type) params.set('report_type', filters.report_type);
        router.get(route('admin.technician-reports'), Object.fromEntries(params), { preserveState: true, replace: true });
    };

    const toggleSelectAll = () => {
        setSelectedReports(selectedReports.length === filteredReports.length ? [] : filteredReports.map((r) => r.id));
    };

    const toggleSelect = (reportId: number) => {
        setSelectedReports((prev) => (prev.includes(reportId) ? prev.filter((id) => id !== reportId) : [...prev, reportId]));
    };

    const handleBulkVerify = () => {
        if (selectedReports.length === 0) return;
        if (confirm(`Verify ${selectedReports.length} report(s)?`)) {
            router.post(route('admin.technician-reports.bulk-verify'), { report_ids: selectedReports });
        }
    };

    const handleRefresh = () => router.reload();

    const handleExportCsv = () => {
        const headers = ['ID', 'Report Type', 'Technician', 'Reference ID', 'Status', 'Submitted', 'Verified By'];
        const rows = filteredReports.map((r) => [
            r.id,
            reportTypeLabels[r.report_type] || r.report_type,
            r.technician.full_name,
            `#${r.reference_model_id}`,
            r.status,
            new Date(r.submitted_at).toLocaleDateString(),
            r.verified_by?.full_name || '-',
        ]);
        exportToCsv('technician-reports', headers, rows);
    };

    // ─── Date-filtered analytics ─────────────────────────────
    const filteredAnalytics = useMemo(() => {
        if (!dateRange) return analytics;
        const start = dateRange.start;
        const end = dateRange.end;
        const inRange = (dateStr: string) => {
            const d = dateStr.substring(0, 10);
            return d >= start && d <= end;
        };
        const filteredRecent = analytics.recent_activity.filter((a) => inRange(a.created_at));
        const filteredTrend = analytics.submission_trend.filter((d) => {
            const date = d.date.substring(0, 10);
            return date >= start && date <= end;
        });
        const filteredReportsData = reports.data.filter((r) => inRange(r.submitted_at));
        const statusCounts = { total: filteredReportsData.length, pending: 0, submitted: 0, verified: 0, rejected: 0 };
        const typeCounts: Record<string, number> = {};
        filteredReportsData.forEach((r) => {
            if (r.status === 'pending') statusCounts.pending++;
            else if (r.status === 'submitted') statusCounts.submitted++;
            else if (r.status === 'verified') statusCounts.verified++;
            else if (r.status === 'rejected') statusCounts.rejected++;
            typeCounts[r.report_type] = (typeCounts[r.report_type] || 0) + 1;
        });
        return {
            ...analytics,
            status_counts: statusCounts,
            type_counts: typeCounts,
            submission_trend: filteredTrend,
            recent_activity: filteredRecent,
        };
    }, [analytics, reports.data, dateRange]);

    // ─── Chart Data (theme-aware) ──────────────────────────
    const statusChartData = [
        { name: 'Pending', value: filteredAnalytics.status_counts.pending, fill: chartColors.chartColors[2] || 'hsl(38, 92%, 50%)' },
        { name: 'Verified', value: filteredAnalytics.status_counts.verified, fill: chartColors.chartColors[0] || 'hsl(142, 72%, 34%)' },
        { name: 'Rejected', value: filteredAnalytics.status_counts.rejected, fill: chartColors.chartColors[4] || 'hsl(0, 84%, 60%)' },
    ].filter((d) => d.value > 0);

    const typeChartData = Object.entries(filteredAnalytics.type_counts).map(([key, value], idx) => ({
        name: reportTypeLabels[key] || key,
        value,
        fill: chartColors.chartColors[idx % chartColors.chartColors.length],
    }));

    const trendChartData = filteredAnalytics.submission_trend.map((d) => ({
        date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        count: d.count,
    }));

    const perfChartData = filteredAnalytics.technician_performance.slice(0, 5).map((t) => ({
        name: t.full_name.split(' ')[0],
        reports: t.total_reports,
        verified: t.verified_count,
    }));

    // ─── Render ──────────────────────────────────────────────
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Technician Reports" />
            <div className="flex h-full flex-1 flex-col gap-5 rounded-xl p-4 md:p-6">
                {/* Sync Indicator */}
                <SyncIndicator lastSyncedAt={analytics.last_synced_at} onRefresh={handleRefresh} />

                {/* Page Header */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Technician Reports</h1>
                        <p className="text-sm text-muted-foreground">
                            Review, verify, and analyze field activities submitted by technicians
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <DashboardDateFilter dateRange={dateRange} onApply={setDateRange} />
                        <ExportButtons onExportCsv={handleExportCsv} onExportPdf={exportToPdf} />
                        {selectedReports.length > 0 && (
                            <Button onClick={handleBulkVerify} size="sm" className="gap-2">
                                <CheckCircle className="h-4 w-4" />
                                Verify ({selectedReports.length})
                            </Button>
                        )}
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    <KpiCard label="Total Reports" value={filteredAnalytics.status_counts.total} icon={ClipboardList} />
                    <KpiCard label="Pending Review" value={filteredAnalytics.status_counts.pending} icon={Clock} />
                    <KpiCard label="Verified" value={filteredAnalytics.status_counts.verified} icon={CheckCircle} />
                    <KpiCard label="Rejected" value={filteredAnalytics.status_counts.rejected} icon={XCircle} />
                </div>
                {dateRange && (
                    <p className="text-xs text-muted-foreground">Showing data within selected date range</p>
                )}

                {/* Tabbed Content */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                    <TabsList className="glass-surface rounded-xl p-1">
                        <TabsTrigger value="reports" className="gap-2 rounded-lg px-4">
                            <Table2 className="h-4 w-4" />
                            Reports
                        </TabsTrigger>
                        <TabsTrigger value="analytics" className="gap-2 rounded-lg px-4">
                            <BarChart3 className="h-4 w-4" />
                            Analytics
                        </TabsTrigger>
                    </TabsList>

                    {/* ─── Reports Tab ─────────────────────────── */}
                    <TabsContent value="reports" className="space-y-4">
                        <div className="glass-card rounded-2xl">
                            <div className="space-y-3 border-b p-4">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="relative max-w-sm flex-1">
                                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            placeholder="Search reports..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="h-9 pl-9"
                                        />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Select value={filters.status || 'all'} onValueChange={(v) => handleFilter('status', v)}>
                                            <SelectTrigger className="h-9 w-[140px]">
                                                <SelectValue placeholder="Status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Statuses</SelectItem>
                                                <SelectItem value="pending">Pending</SelectItem>
                                                <SelectItem value="submitted">Submitted</SelectItem>
                                                <SelectItem value="verified">Verified</SelectItem>
                                                <SelectItem value="rejected">Rejected</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Select value={filters.technician_id || 'all'} onValueChange={(v) => handleFilter('technician_id', v)}>
                                            <SelectTrigger className="h-9 w-[160px]">
                                                <SelectValue placeholder="Technician" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Technicians</SelectItem>
                                                {technicians.map((t) => (
                                                    <SelectItem key={t.id} value={t.id.toString()}>
                                                        {t.full_name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <Select value={filters.report_type || 'all'} onValueChange={(v) => handleFilter('report_type', v)}>
                                            <SelectTrigger className="h-9 w-[160px]">
                                                <SelectValue placeholder="Type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Types</SelectItem>
                                                {Object.entries(reportTypeLabels).map(([val, label]) => (
                                                    <SelectItem key={val} value={val}>{label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <FilterBar filters={activeFilters} onRemove={removeFilter} onClearAll={clearAllFilters} />
                            </div>

                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="hover:bg-transparent">
                                            <TableHead className="w-[44px]">
                                                <Checkbox
                                                    checked={selectedReports.length === filteredReports.length && filteredReports.length > 0}
                                                    onCheckedChange={toggleSelectAll}
                                                />
                                            </TableHead>
                                            <TableHead>Report Type</TableHead>
                                            <TableHead>Technician</TableHead>
                                            <TableHead>Ref ID</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Submitted</TableHead>
                                            <TableHead>Verified By</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredReports.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={8} className="h-32 text-center">
                                                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                                        <FileText className="h-8 w-8" />
                                                        <p>No reports found</p>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredReports.map((report) => (
                                                <TableRow key={report.id} className="group">
                                                    <TableCell>
                                                        <Checkbox
                                                            checked={selectedReports.includes(report.id)}
                                                            onCheckedChange={() => toggleSelect(report.id)}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className="font-normal">
                                                            {reportTypeLabels[report.report_type] || report.report_type}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2.5">
                                                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                                                                {getInitials(report.technician.full_name)}
                                                            </div>
                                                            <span className="font-medium">{report.technician.full_name}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="font-mono text-xs text-muted-foreground">
                                                        #{report.reference_model_id}
                                                    </TableCell>
                                                    <TableCell>{getStatusBadge(report.status)}</TableCell>
                                                    <TableCell className="text-sm text-muted-foreground">
                                                        {new Date(report.submitted_at).toLocaleDateString()}
                                                    </TableCell>
                                                    <TableCell className="text-sm text-muted-foreground">
                                                        {report.verified_by?.full_name || '\u2014'}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="h-8 w-8 p-0 text-muted-foreground/60 transition-colors hover:text-foreground hover:bg-muted"
                                                                >
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
                                                                            <CheckCircle className="mr-2 h-4 w-4 text-emerald-600" />
                                                                            <span className="text-emerald-600">Verify</span>
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem>
                                                                            <XCircle className="mr-2 h-4 w-4 text-red-600" />
                                                                            <span className="text-red-600">Reject</span>
                                                                        </DropdownMenuItem>
                                                                    </>
                                                                )}
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem className="text-destructive">
                                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                                    Delete
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

                            <div className="border-t p-4">
                                <Pagination
                                    currentPage={reports.current_page}
                                    lastPage={reports.last_page}
                                    total={reports.total}
                                    perPage={perPage}
                                    onPageChange={handlePageChange}
                                    onPerPageChange={handlePerPageChange}
                                />
                            </div>
                        </div>
                    </TabsContent>

                    {/* ─── Analytics Tab ───────────────────────── */}
                    <TabsContent value="analytics" className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                            <div className="glass-surface relative overflow-hidden rounded-2xl p-5">
                                <div className="absolute inset-0 bg-primary/[0.02] dark:bg-primary/[0.04]" />
                                <h3 className="relative mb-4 text-sm font-semibold">Submission Trend</h3>
                                <div className="relative h-[240px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={trendChartData}>
                                            <defs>
                                                <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor={chartColors.chartColors[0]} stopOpacity={0.3} />
                                                    <stop offset="100%" stopColor={chartColors.chartColors[0]} stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke={chartColors.gridColor} strokeOpacity={0.4} />
                                            <XAxis dataKey="date" tick={{ fontSize: 11, fill: chartColors.muted }} stroke={chartColors.gridColor} />
                                            <YAxis tick={{ fontSize: 11, fill: chartColors.muted }} stroke={chartColors.gridColor} />
                                            <Tooltip
                                                contentStyle={{
                                                    background: 'var(--popover)',
                                                    border: '1px solid var(--border)',
                                                    borderRadius: '12px',
                                                    fontSize: '12px',
                                                    color: 'var(--popover-foreground)',
                                                }}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="count"
                                                stroke={chartColors.chartColors[0]}
                                                strokeWidth={2}
                                                fill="url(#trendGradient)"
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div className="glass-surface relative overflow-hidden rounded-2xl p-5">
                                <div className="absolute inset-0 bg-primary/[0.02] dark:bg-primary/[0.04]" />
                                <h3 className="relative mb-4 text-sm font-semibold">Status Breakdown</h3>
                                <div className="relative flex items-center justify-center h-[240px]">
                                    {statusChartData.length > 0 ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={statusChartData}
                                                    innerRadius={60}
                                                    outerRadius={90}
                                                    dataKey="value"
                                                    nameKey="name"
                                                >
                                                    {statusChartData.map((entry, idx) => (
                                                        <Cell key={idx} fill={entry.fill} />
                                                    ))}
                                                </Pie>
                                                <Tooltip
                                                    contentStyle={{
                                                        background: 'var(--popover)',
                                                        border: '1px solid var(--border)',
                                                        borderRadius: '12px',
                                                        fontSize: '12px',
                                                        color: 'var(--popover-foreground)',
                                                    }}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">No data available</p>
                                    )}
                                </div>
                                <div className="relative mt-2 flex justify-center gap-4">
                                    {statusChartData.map((d) => (
                                        <div key={d.name} className="flex items-center gap-1.5">
                                            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.fill }} />
                                            <span className="text-xs text-muted-foreground">{d.name} ({d.value})</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                            <div className="glass-surface relative overflow-hidden rounded-2xl p-5">
                                <div className="absolute inset-0 bg-primary/[0.02] dark:bg-primary/[0.04]" />
                                <h3 className="relative mb-4 text-sm font-semibold">Reports by Type</h3>
                                <div className="relative h-[240px]">
                                    {typeChartData.length > 0 ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={typeChartData} layout="vertical">
                                                <CartesianGrid strokeDasharray="3 3" stroke={chartColors.gridColor} strokeOpacity={0.4} />
                                                <XAxis type="number" tick={{ fontSize: 11, fill: chartColors.muted }} stroke={chartColors.gridColor} />
                                                <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: chartColors.muted }} stroke={chartColors.gridColor} width={120} />
                                                <Tooltip
                                                    contentStyle={{
                                                        background: 'var(--popover)',
                                                        border: '1px solid var(--border)',
                                                        borderRadius: '12px',
                                                        fontSize: '12px',
                                                        color: 'var(--popover-foreground)',
                                                    }}
                                                />
                                                <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                                                    {typeChartData.map((entry, idx) => (
                                                        <Cell key={idx} fill={entry.fill} />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">No data available</p>
                                    )}
                                </div>
                            </div>

                            <div className="glass-surface relative overflow-hidden rounded-2xl p-5">
                                <div className="absolute inset-0 bg-primary/[0.02] dark:bg-primary/[0.04]" />
                                <h3 className="relative mb-4 text-sm font-semibold">Top Technicians</h3>
                                <div className="relative h-[240px]">
                                    {perfChartData.length > 0 ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={perfChartData}>
                                                <CartesianGrid strokeDasharray="3 3" stroke={chartColors.gridColor} strokeOpacity={0.4} />
                                                <XAxis dataKey="name" tick={{ fontSize: 11, fill: chartColors.muted }} stroke={chartColors.gridColor} />
                                                <YAxis tick={{ fontSize: 11, fill: chartColors.muted }} stroke={chartColors.gridColor} />
                                                <Tooltip
                                                    contentStyle={{
                                                        background: 'var(--popover)',
                                                        border: '1px solid var(--border)',
                                                        borderRadius: '12px',
                                                        fontSize: '12px',
                                                        color: 'var(--popover-foreground)',
                                                    }}
                                                />
                                                <Bar dataKey="reports" fill={chartColors.chartColors[0]} radius={[6, 6, 0, 0]} name="Total" />
                                                <Bar dataKey="verified" fill={chartColors.chartColors[1]} radius={[6, 6, 0, 0]} name="Verified" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">No data available</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <NarrativeCard
                            narrative={generateNarrative(filteredAnalytics)}
                            highlights={[
                                { text: 'total', value: filteredAnalytics.status_counts.total },
                                { text: 'pending', value: filteredAnalytics.status_counts.pending },
                                { text: 'verified', value: filteredAnalytics.status_counts.verified },
                            ]}
                        />
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}
