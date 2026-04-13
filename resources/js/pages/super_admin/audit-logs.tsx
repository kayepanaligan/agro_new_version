import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { ArrowUpDown, Calendar, Eye, FileText, Filter, Search, User, X } from 'lucide-react';
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

    const getEventBadge = (event: string) => {
        const config: Record<string, { color: string; label: string }> = {
            created: { color: 'bg-green-500', label: 'Created' },
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
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="rounded-xl border bg-card shadow-sm">
                    <div className="p-6">
                        <h1 className="mb-2 text-3xl font-bold">Audit Logs</h1>
                        <p className="text-muted-foreground">Monitor all user activities and system transactions</p>
                    </div>

                    <div className="border-t p-6">
                        {/* Search and Filter Controls */}
                        <div className="mb-4 flex flex-col gap-4">
                            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                <div className="relative flex-1 max-w-sm">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        placeholder="Search logs..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        className="pl-9"
                                    />
                                </div>

                                <div className="flex gap-2">
                                    <Button 
                                        variant="outline" 
                                        onClick={() => setShowFilters(!showFilters)}
                                        className="flex items-center gap-2"
                                    >
                                        <Filter className="h-4 w-4" />
                                        Filters
                                        {hasActiveFilters && (
                                            <span className="h-2 w-2 rounded-full bg-blue-500" />
                                        )}
                                    </Button>
                                    <Button onClick={handleSearch}>
                                        Search
                                    </Button>
                                </div>
                            </div>

                            {/* Advanced Filters */}
                            {showFilters && (
                                <div className="rounded-lg border bg-muted/50 p-4 space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                        <div className="grid gap-2">
                                            <label className="text-sm font-medium">Event Type</label>
                                            <Select value={eventFilter} onValueChange={setEventFilter}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select event" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">All Events</SelectItem>
                                                    {events.map((event) => (
                                                        <SelectItem key={event} value={event}>
                                                            {getModuleName(event)}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="grid gap-2">
                                            <label className="text-sm font-medium">Module</label>
                                            <Select value={moduleFilter} onValueChange={setModuleFilter}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select module" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">All Modules</SelectItem>
                                                    {modules.map((module) => (
                                                        <SelectItem key={module} value={module}>
                                                            {getModuleName(module)}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="grid gap-2">
                                            <label className="text-sm font-medium">User</label>
                                            <Select value={userFilter} onValueChange={setUserFilter}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select user" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">All Users</SelectItem>
                                                    {users.map((user) => (
                                                        <SelectItem key={user.id} value={user.id.toString()}>
                                                            {user.first_name} {user.last_name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="grid gap-2">
                                            <label className="text-sm font-medium">Date Range</label>
                                            <div className="flex gap-2">
                                                <Input
                                                    type="date"
                                                    value={startDate}
                                                    onChange={(e) => setStartDate(e.target.value)}
                                                    placeholder="Start"
                                                />
                                                <Input
                                                    type="date"
                                                    value={endDate}
                                                    onChange={(e) => setEndDate(e.target.value)}
                                                    placeholder="End"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-2">
                                        <Button variant="outline" onClick={resetFilters} className="flex items-center gap-2">
                                            <X className="h-4 w-4" />
                                            Reset Filters
                                        </Button>
                                        <Button onClick={applyFilters}>Apply Filters</Button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Results count */}
                        <div className="mb-4 text-sm text-muted-foreground">
                            Showing {auditLogs.data.length} of {auditLogs.total} logs
                        </div>

                        {/* Table */}
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Timestamp</TableHead>
                                        <TableHead>User</TableHead>
                                        <TableHead>
                                            <Button variant="ghost" onClick={() => {}} className="-ml-4">
                                                Event
                                                <ArrowUpDown className="ml-2 h-4 w-4" />
                                            </Button>
                                        </TableHead>
                                        <TableHead>Module</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead>IP Address</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {auditLogs.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="h-24 text-center">
                                                No audit logs found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        auditLogs.data.map((log) => (
                                            <TableRow key={log.id}>
                                                <TableCell className="text-sm">
                                                    <div className="flex items-center gap-1 text-muted-foreground">
                                                        <Calendar className="h-3 w-3" />
                                                        {formatDate(log.created_at)}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {log.user ? (
                                                        <div className="flex items-center gap-2">
                                                            <Avatar className="h-8 w-8">
                                                                <AvatarImage src={log.user.avatar || undefined} />
                                                                <AvatarFallback>
                                                                    <User className="h-4 w-4" />
                                                                </AvatarFallback>
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
                                                    <Badge variant="outline">{getModuleName(log.module)}</Badge>
                                                </TableCell>
                                                <TableCell className="max-w-xs truncate text-sm">
                                                    {log.description}
                                                </TableCell>
                                                <TableCell className="text-sm font-mono">
                                                    {log.ip_address || '-'}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => viewDetails(log)}
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
                            <div className="border-t p-6">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-muted-foreground">
                                        Page {auditLogs.current_page} of {auditLogs.last_page}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                const page = auditLogs.current_page - 1;
                                                if (page >= 1) {
                                                    router.get(`/super-admin/audit-logs`, { ...filters, page }, {
                                                        preserveState: true,
                                                        preserveScroll: true,
                                                    });
                                                }
                                            }}
                                            disabled={auditLogs.current_page === 1}
                                        >
                                            Previous
                                        </Button>
                                        
                                        <div className="flex items-center gap-1">
                                            {Array.from({ length: Math.min(5, auditLogs.last_page) }, (_, i) => {
                                                let pageNum: number;
                                                if (auditLogs.last_page <= 5) {
                                                    pageNum = i + 1;
                                                } else if (auditLogs.current_page <= 3) {
                                                    pageNum = i + 1;
                                                } else if (auditLogs.current_page >= auditLogs.last_page - 2) {
                                                    pageNum = auditLogs.last_page - 4 + i;
                                                } else {
                                                    pageNum = auditLogs.current_page - 2 + i;
                                                }

                                                return (
                                                    <Button
                                                        key={pageNum}
                                                        variant={auditLogs.current_page === pageNum ? 'default' : 'outline'}
                                                        size="sm"
                                                        onClick={() => {
                                                            router.get(`/super-admin/audit-logs`, { ...filters, page: pageNum }, {
                                                                preserveState: true,
                                                                preserveScroll: true,
                                                            });
                                                        }}
                                                        className="h-8 w-8 p-0"
                                                    >
                                                        {pageNum}
                                                    </Button>
                                                );
                                            })}
                                        </div>

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                const page = auditLogs.current_page + 1;
                                                if (page <= auditLogs.last_page) {
                                                    router.get(`/super-admin/audit-logs`, { ...filters, page }, {
                                                        preserveState: true,
                                                        preserveScroll: true,
                                                    });
                                                }
                                            }}
                                            disabled={auditLogs.current_page === auditLogs.last_page}
                                        >
                                            Next
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
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
        </AppLayout>
    );
}
