import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { ArrowUpDown, Calendar, Eye, FileText, Filter, Search, User, X, ClipboardList, RefreshCw, Users } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { KpiCard } from '@/components/agro-profiler/kpi-card';
import { ExportButtons } from '@/components/agro-profiler/export-buttons';
import { Pagination } from '@/components/agro-profiler/pagination';
import { exportToCsv, exportToPdf } from '@/lib/export';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Audit Logs',
        href: '/super-admin/audit-logs',
    },
];

interface AuditUser {
    id: number;
    full_name: string;
    email: string;
    avatar?: string | null;
}

interface AuditLog {
    id: number;
    user_id: number | null;
    user_type: string | null;
    event: string;
    module: string;
    model_type: string | null;
    model_id: number | null;
    old_values: Record<string, any> | null;
    new_values: Record<string, any> | null;
    ip_address: string | null;
    user_agent: string | null;
    description: string;
    created_at: string;
    user: AuditUser | null;
}

interface User {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
}

interface AuditLogsPage {
    auditLogs: {
        data: AuditLog[];
        links: any[];
        current_page: number;
        last_page: number;
        total: number;
    };
    modules: string[];
    events: string[];
    users: User[];
    filters: {
        event?: string;
        module?: string;
        user_id?: string;
        start_date?: string;
        end_date?: string;
        search?: string;
    };
}

export default function AuditLogs() {
    const { auditLogs, modules, events, users, filters } = usePage<AuditLogsPage>().props;
    
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [eventFilter, setEventFilter] = useState(filters.event || 'all');
    const [moduleFilter, setModuleFilter] = useState(filters.module || 'all');
    const [userFilter, setUserFilter] = useState(filters.user_id || 'all');
    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
    const [showFilters, setShowFilters] = useState(false);

    const handleSearch = () => {
        applyFilters();
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const applyFilters = () => {
        const params: Record<string, string> = {};
        
        if (searchTerm) params.search = searchTerm;
        if (eventFilter !== 'all') params.event = eventFilter;
        if (moduleFilter !== 'all') params.module = moduleFilter;
        if (userFilter !== 'all') params.user_id = userFilter;
        if (startDate) params.start_date = startDate;
        if (endDate) params.end_date = endDate;

        router.get('/super-admin/audit-logs', params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const resetFilters = () => {
        setSearchTerm('');
        setEventFilter('all');
        setModuleFilter('all');
        setUserFilter('all');
        setStartDate('');
        setEndDate('');
        
        router.get('/super-admin/audit-logs', {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const viewDetails = (log: AuditLog) => {
        setSelectedLog(log);
        setIsDetailModalOpen(true);
    };

    const handleExportCsv = () => {
        const headers = ['Timestamp', 'User', 'Event', 'Module', 'Description', 'IP Address'];
        const rows = auditLogs.data.map((log) => [
            formatDate(log.created_at),
            log.user?.full_name || 'Unknown',
            log.event,
            getModuleName(log.module),
            log.description,
            log.ip_address || '-',
        ]);
        exportToCsv('audit-logs', headers, rows);
    };

    const handlePageChange = (page: number) => {
        router.get('/super-admin/audit-logs', { ...filters, page }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const getEventBadge = (event: string) => {
        const config: Record<string, { color: string; label: string }> = {
            created: { color: 'bg-emerald-600', label: 'Created' },
            updated: { color: 'bg-blue-500', label: 'Updated' },
            deleted: { color: 'bg-red-500', label: 'Deleted' },
            logged_in: { color: 'bg-purple-500', label: 'Logged In' },
            logged_out: { color: 'bg-gray-500', label: 'Logged Out' },
        };

        const { color, label } = config[event] || { color: 'bg-gray-500', label: event };
        
        return <Badge className={color}>{label}</Badge>;
    };

    const getModuleName = (module: string) => {
        return module.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const hasActiveFilters = searchTerm || eventFilter !== 'all' || moduleFilter !== 'all' || 
                            userFilter !== 'all' || startDate || endDate;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Audit Logs" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">

                {/* Page Header */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Audit Logs</h1>
                        <p className="text-sm text-muted-foreground">Monitor all user activities and system transactions</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <ExportButtons onExportCsv={handleExportCsv} onExportPdf={exportToPdf} />
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    <KpiCard label="Total Logs" value={auditLogs.total} icon={ClipboardList} />
                    <KpiCard label="Created" value={auditLogs.data.filter((l) => l.event === 'created').length} icon={FileText} />
                    <KpiCard label="Updated" value={auditLogs.data.filter((l) => l.event === 'updated').length} icon={RefreshCw} />
                    <KpiCard label="Unique Users" value={new Set(auditLogs.data.filter((l) => l.user).map((l) => l.user!.id)).size} icon={Users} />
                </div>
                
                {/* Table Card */}
                <div className="glass-card rounded-2xl overflow-hidden">
                    {/* Toolbar */}
                    <div className="flex flex-col gap-3 border-b px-6 py-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="relative w-full max-w-xs">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search logs..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    className="pl-9 h-9 text-sm"
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowFilters(!showFilters)}
                                    className="h-9 flex items-center gap-2"
                                >
                                    <Filter className="h-4 w-4" />
                                    Filters
                                    {hasActiveFilters && (
                                        <span className="h-2 w-2 rounded-full bg-emerald-600" />
                                    )}
                                </Button>
                                <Button onClick={handleSearch} className="h-9 bg-emerald-600 hover:bg-emerald-700 text-white">
                                    Search
                                </Button>
                            </div>
                        </div>
                
                        {/* Advanced Filters */}
                        {showFilters && (
                            <div className="rounded-lg border bg-muted/50 p-4 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div className="grid gap-2">
                                        <Label className="text-sm font-medium">Event Type</Label>
                                        <Select value={eventFilter} onValueChange={setEventFilter}>
                                            <SelectTrigger className="h-9"><SelectValue placeholder="Select event" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Events</SelectItem>
                                                {events.map((event) => (
                                                    <SelectItem key={event} value={event}>{getModuleName(event)}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                
                                    <div className="grid gap-2">
                                        <Label className="text-sm font-medium">Module</Label>
                                        <Select value={moduleFilter} onValueChange={setModuleFilter}>
                                            <SelectTrigger className="h-9"><SelectValue placeholder="Select module" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Modules</SelectItem>
                                                {modules.map((module) => (
                                                    <SelectItem key={module} value={module}>{getModuleName(module)}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                
                                    <div className="grid gap-2">
                                        <Label className="text-sm font-medium">User</Label>
                                        <Select value={userFilter} onValueChange={setUserFilter}>
                                            <SelectTrigger className="h-9"><SelectValue placeholder="Select user" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Users</SelectItem>
                                                {users.map((user) => (
                                                    <SelectItem key={user.id} value={user.id.toString()}>{user.first_name} {user.last_name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                
                                    <div className="grid gap-2">
                                        <Label className="text-sm font-medium">Date Range</Label>
                                        <div className="flex gap-2">
                                            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="h-9 text-sm" />
                                            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="h-9 text-sm" />
                                        </div>
                                    </div>
                                </div>
                
                                <div className="flex justify-end gap-2">
                                    <Button variant="outline" onClick={resetFilters} className="flex items-center gap-2 h-9">
                                        <X className="h-4 w-4" />
                                        Reset Filters
                                    </Button>
                                    <Button onClick={applyFilters} className="h-9">Apply Filters</Button>
                                </div>
                            </div>
                        )}
                
                        <span className="text-xs text-muted-foreground">
                            {auditLogs.data.length} of {auditLogs.total} logs
                        </span>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/40 hover:bg-muted/40">
                                    <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Timestamp</TableHead>
                                    <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">User</TableHead>
                                    <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Event</TableHead>
                                    <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Module</TableHead>
                                    <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Description</TableHead>
                                    <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">IP Address</TableHead>
                                    <TableHead className="w-20 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {auditLogs.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-40 text-center">
                                            <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                                <ClipboardList className="h-8 w-8 opacity-30" />
                                                <p className="text-sm font-medium">No audit logs found</p>
                                                <p className="text-xs">Try adjusting your search or filter criteria.</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    auditLogs.data.map((log) => (
                                        <TableRow key={log.id} className="hover:bg-muted/30 transition-colors">
                                            <TableCell className="text-sm text-muted-foreground">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {formatDate(log.created_at)}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {log.user ? (
                                                    <div className="flex items-center gap-2">
                                                        <Avatar className="h-8 w-8">
                                                            <AvatarImage src={log.user.avatar || undefined} />
                                                            <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <div className="text-sm font-medium">{log.user.full_name}</div>
                                                            <div className="text-xs text-muted-foreground">{log.user_type}</div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-muted-foreground">Unknown</span>
                                                )}
                                            </TableCell>
                                            <TableCell>{getEventBadge(log.event)}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="text-xs">{getModuleName(log.module)}</Badge>
                                            </TableCell>
                                            <TableCell className="max-w-xs truncate text-sm text-muted-foreground line-clamp-2">
                                                {log.description}
                                            </TableCell>
                                            <TableCell className="text-sm font-mono text-muted-foreground">
                                                {log.ip_address || '-'}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => viewDetails(log)}
                                                    className="h-8"
                                                >
                                                    <Eye className="h-4 w-4 mr-1" />
                                                    View
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    {auditLogs.last_page > 1 && (
                        <div className="border-t p-4">
                            <Pagination currentPage={auditLogs.current_page} lastPage={auditLogs.last_page} total={auditLogs.total} perPage={auditLogs.data.length} onPageChange={handlePageChange} />
                        </div>
                    )}
                </div>

                {/* Detail Modal */}
            <Dialog open={isDetailModalOpen} onOpenChange={(open) => {
                setIsDetailModalOpen(open);
                if (!open) setSelectedLog(null);
            }}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Audit Log Details
                        </DialogTitle>
                        <DialogDescription>
                            Detailed information about this audit log entry
                        </DialogDescription>
                    </DialogHeader>

                    {selectedLog && (
                        <div className="space-y-6 py-4">
                            {/* Basic Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Basic Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Event</label>
                                            <div className="mt-1">{getEventBadge(selectedLog.event)}</div>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Module</label>
                                            <div className="mt-1">
                                                <Badge variant="outline">{getModuleName(selectedLog.module)}</Badge>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Description</label>
                                        <p className="mt-1 text-sm">{selectedLog.description}</p>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Timestamp</label>
                                        <p className="mt-1 text-sm">{formatDate(selectedLog.created_at)}</p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* User Information */}
                            {selectedLog.user && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">User Information</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-12 w-12">
                                                <AvatarImage src={selectedLog.user.avatar || undefined} />
                                                <AvatarFallback>
                                                    <User className="h-6 w-6" />
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="font-medium">{selectedLog.user.full_name}</div>
                                                <div className="text-sm text-muted-foreground">{selectedLog.user.email}</div>
                                                <div className="text-sm text-muted-foreground">Role: {selectedLog.user_type}</div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Technical Details */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Technical Details</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">IP Address</label>
                                            <p className="mt-1 text-sm font-mono">{selectedLog.ip_address || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">User Agent</label>
                                            <p className="mt-1 text-sm">{selectedLog.user_agent || 'N/A'}</p>
                                        </div>
                                    </div>

                                    {selectedLog.model_type && (
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Model</label>
                                            <p className="mt-1 text-sm font-mono">{selectedLog.model_type} (ID: {selectedLog.model_id})</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Data Changes */}
                            {(selectedLog.old_values || selectedLog.new_values) && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Data Changes</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {selectedLog.old_values && (
                                            <div>
                                                <label className="text-sm font-medium text-muted-foreground">Old Values</label>
                                                <pre className="mt-2 p-3 bg-muted rounded-lg text-xs overflow-auto">
                                                    {JSON.stringify(selectedLog.old_values, null, 2)}
                                                </pre>
                                            </div>
                                        )}
                                        
                                        {selectedLog.new_values && (
                                            <div>
                                                <label className="text-sm font-medium text-muted-foreground">New Values</label>
                                                <pre className="mt-2 p-3 bg-muted rounded-lg text-xs overflow-auto">
                                                    {JSON.stringify(selectedLog.new_values, null, 2)}
                                                </pre>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
            </div>
        </AppLayout>
    );
}
