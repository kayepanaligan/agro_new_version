import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { ArrowUpDown, Clock, Globe, Laptop, LogOut, MoreHorizontal, Monitor, Power, Search, ShieldCheck, Smartphone, Tablet, Activity, Users } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getFullName } from '@/types';
import { KpiCard } from '@/components/agro-profiler/kpi-card';
import { ExportButtons } from '@/components/agro-profiler/export-buttons';
import { Pagination } from '@/components/agro-profiler/pagination';
import { exportToCsv, exportToPdf } from '@/lib/export';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Session Monitoring',
        href: '/super-admin/sessions',
    },
];

interface SessionUser {
    id: number;
    full_name: string;
    email: string;
    avatar?: string | null;
}

interface Session {
    id: string;
    user_id: number;
    ip_address: string | null;
    user_agent: string | null;
    last_activity: string | null;
    is_active: boolean;
    device: string;
    browser: string;
    os: string;
    user: SessionUser | null;
}

type SortField = 'user' | 'ip_address' | 'device' | 'browser' | 'os' | 'last_activity' | 'is_active';
type SortOrder = 'asc' | 'desc';

export default function SessionMonitoring() {
    const { sessions } = usePage<{ sessions: Session[] }>().props;
    const [searchTerm, setSearchTerm] = useState('');
    const [sortField, setSortField] = useState<SortField>('last_activity');
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
    const [deviceFilter, setDeviceFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [browserFilter, setBrowserFilter] = useState<string>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    // Filter and sort sessions
    const filteredSessions = useMemo(() => {
        let result = [...sessions];

        // Search filter (by user name, email, or IP)
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(
                (session) =>
                    session.user?.full_name.toLowerCase().includes(term) ||
                    session.user?.email.toLowerCase().includes(term) ||
                    session.ip_address?.toLowerCase().includes(term),
            );
        }

        // Device filter
        if (deviceFilter !== 'all') {
            result = result.filter((session) => session.device.toLowerCase() === deviceFilter.toLowerCase());
        }

        // Status filter
        if (statusFilter !== 'all') {
            const isActive = statusFilter === 'active';
            result = result.filter((session) => session.is_active === isActive);
        }

        // Browser filter
        if (browserFilter !== 'all') {
            result = result.filter((session) => session.browser.toLowerCase() === browserFilter.toLowerCase());
        }

        // Sorting
        result.sort((a, b) => {
            let aValue: any = a[sortField];
            let bValue: any = b[sortField];

            // Handle special cases
            if (sortField === 'user' && a.user && b.user) {
                aValue = a.user.full_name.toLowerCase();
                bValue = b.user.full_name.toLowerCase();
            } else if (sortField === 'is_active') {
                aValue = aValue ? 1 : 0;
                bValue = bValue ? 1 : 0;
            } else if (sortField === 'last_activity' && aValue && bValue) {
                aValue = new Date(aValue).getTime();
                bValue = new Date(bValue).getTime();
            }

            if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });

        return result;
    }, [sessions, searchTerm, sortField, sortOrder, deviceFilter, statusFilter, browserFilter]);

    const totalPages = Math.ceil(filteredSessions.length / itemsPerPage);
    const paginatedSessions = useMemo(() => filteredSessions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage), [filteredSessions, currentPage, itemsPerPage]);
    useMemo(() => setCurrentPage(1), [searchTerm, deviceFilter, statusFilter, browserFilter]);

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
    };

    const handleTerminateSession = (sessionId: string) => {
        if (confirm('Are you sure you want to terminate this session? The user will be logged out from this device.')) {
            router.delete(route('super-admin.sessions.destroy', sessionId), {
                preserveScroll: true,
            });
        }
    };

    const handleTerminateUserSessions = (userId: number, userName: string) => {
        if (confirm(`Are you sure you want to terminate ALL sessions for ${userName}? This will log them out from all devices.`)) {
            router.post(route('super-admin.sessions.terminate-user', userId), {
                preserveScroll: true,
            });
        }
    };

    const handleTerminateAllOtherSessions = () => {
        if (confirm('Are you sure you want to terminate all sessions except your current one? This will log out all other users.')) {
            router.post(route('super-admin.sessions.terminate-others'), {
                preserveScroll: true,
            });
        }
    };

    const handleExportCsv = () => {
        const headers = ['User', 'Email', 'IP Address', 'Device', 'Browser', 'OS', 'Last Activity', 'Status'];
        const rows = filteredSessions.map((s) => [
            s.user?.full_name || 'Unknown',
            s.user?.email || '',
            s.ip_address || 'N/A',
            s.device,
            s.browser,
            s.os,
            formatLastActivity(s.last_activity),
            s.is_active ? 'Active' : 'Inactive',
        ]);
        exportToCsv('sessions', headers, rows);
    };

    const getStatusBadge = (isActive: boolean) => {
        return isActive ? (
            <Badge className="bg-emerald-600 flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                Active
            </Badge>
        ) : (
            <Badge variant="outline" className="text-muted-foreground">
                Inactive
            </Badge>
        );
    };

    const getDeviceIcon = (device: string) => {
        switch (device) {
            case 'Mobile':
                return <Smartphone className="h-4 w-4" />;
            case 'Tablet':
                return <Tablet className="h-4 w-4" />;
            default:
                return <Laptop className="h-4 w-4" />;
        }
    };

    const getBrowserIcon = (browser: string) => {
        return <Globe className="h-4 w-4" />;
    };

    const formatLastActivity = (lastActivity: string | null) => {
        if (!lastActivity) return 'Unknown';
        
        const date = new Date(lastActivity);
        const now = new Date();
        const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
        
        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours}h ago`;
        
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) return `${diffInDays}d ago`;
        
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    // Get unique values for filters
    const uniqueDevices = Array.from(new Set(sessions.map((s) => s.device)));
    const uniqueBrowsers = Array.from(new Set(sessions.map((s) => s.browser)));

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Session Monitoring" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">

                {/* Page Header */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Session Monitoring</h1>
                        <p className="text-sm text-muted-foreground">Monitor and manage active user sessions across the platform</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <ExportButtons onExportCsv={handleExportCsv} onExportPdf={exportToPdf} />
                        <Button
                            variant="outline"
                            onClick={handleTerminateAllOtherSessions}
                            className="text-red-600 border-red-200 hover:bg-red-50"
                        >
                            <Power className="mr-2 h-4 w-4" />
                            Terminate Others
                        </Button>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    <KpiCard label="Total Sessions" value={sessions.length} icon={Monitor} />
                    <KpiCard label="Active Sessions" value={sessions.filter((s) => s.is_active).length} icon={Activity} />
                    <KpiCard label="Unique Users" value={new Set(sessions.map((s) => s.user_id)).size} icon={Users} />
                    <KpiCard label="Mobile Devices" value={sessions.filter((s) => s.device === 'Mobile').length} icon={Smartphone} />
                </div>

                {/* Table Card */}
                <div className="glass-card rounded-2xl overflow-hidden">
                    {/* Toolbar */}
                    <div className="flex flex-col gap-3 border-b px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="relative w-full max-w-xs">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search sessions..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 h-9 text-sm"
                            />
                        </div>
                        <div className="flex gap-2">
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[130px] h-9"><SelectValue placeholder="Status" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={deviceFilter} onValueChange={setDeviceFilter}>
                                <SelectTrigger className="w-[130px] h-9"><SelectValue placeholder="Device" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Devices</SelectItem>
                                    {uniqueDevices.map((device) => (<SelectItem key={device} value={device}>{device}</SelectItem>))}
                                </SelectContent>
                            </Select>
                            <Select value={browserFilter} onValueChange={setBrowserFilter}>
                                <SelectTrigger className="w-[130px] h-9"><SelectValue placeholder="Browser" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Browsers</SelectItem>
                                    {uniqueBrowsers.map((browser) => (<SelectItem key={browser} value={browser}>{browser}</SelectItem>))}
                                </SelectContent>
                            </Select>
                        </div>
                        <span className="text-xs text-muted-foreground">
                            {filteredSessions.length === sessions.length
                                ? `${sessions.length} sessions`
                                : `${filteredSessions.length} of ${sessions.length} sessions`}
                        </span>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/40 hover:bg-muted/40">
                                    <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">User</TableHead>
                                    <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                        <Button variant="ghost" size="sm" className="h-auto p-0 text-xs font-semibold uppercase tracking-wide" onClick={() => handleSort('ip_address')}>
                                            IP <ArrowUpDown className="ml-1 h-3 w-3" />
                                        </Button>
                                    </TableHead>
                                    <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                        <Button variant="ghost" size="sm" className="h-auto p-0 text-xs font-semibold uppercase tracking-wide" onClick={() => handleSort('device')}>
                                            Device <ArrowUpDown className="ml-1 h-3 w-3" />
                                        </Button>
                                    </TableHead>
                                    <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Browser</TableHead>
                                    <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">OS</TableHead>
                                    <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                        <Button variant="ghost" size="sm" className="h-auto p-0 text-xs font-semibold uppercase tracking-wide" onClick={() => handleSort('last_activity')}>
                                            Last Activity <ArrowUpDown className="ml-1 h-3 w-3" />
                                        </Button>
                                    </TableHead>
                                    <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                        <Button variant="ghost" size="sm" className="h-auto p-0 text-xs font-semibold uppercase tracking-wide" onClick={() => handleSort('is_active')}>
                                            Status <ArrowUpDown className="ml-1 h-3 w-3" />
                                        </Button>
                                    </TableHead>
                                    <TableHead className="w-16 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedSessions.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="h-40 text-center">
                                            <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                                <Activity className="h-8 w-8 opacity-30" />
                                                <p className="text-sm font-medium">No sessions found</p>
                                                <p className="text-xs">
                                                    {searchTerm || deviceFilter !== 'all' || statusFilter !== 'all' || browserFilter !== 'all'
                                                        ? 'Try adjusting your filters.'
                                                        : 'No active sessions at the moment.'}
                                                </p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    paginatedSessions.map((session) => (
                                        <TableRow key={session.id} className="hover:bg-muted/30 transition-colors">
                                            <TableCell>
                                                {session.user ? (
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-9 w-9">
                                                            <AvatarImage src={session.user.avatar || undefined} alt={session.user.full_name} />
                                                            <AvatarFallback className="text-xs">
                                                                {session.user.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <div className="font-medium text-sm">{session.user.full_name}</div>
                                                            <div className="text-xs text-muted-foreground">{session.user.email}</div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground text-sm">Unknown User</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="font-mono text-xs text-muted-foreground">{session.ip_address || 'N/A'}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2 text-sm">
                                                    {getDeviceIcon(session.device)}
                                                    <span>{session.device}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2 text-sm">
                                                    {getBrowserIcon(session.browser)}
                                                    <span>{session.browser}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">{session.os}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <Clock className="h-3 w-3" />
                                                    <span>{formatLastActivity(session.last_activity)}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>{getStatusBadge(session.is_active)}</TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                                                        >
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-48">
                                                        <DropdownMenuItem
                                                            onClick={() => handleTerminateSession(session.id)}
                                                            className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                                                        >
                                                            <LogOut className="mr-2 h-3.5 w-3.5" />
                                                            Terminate Session
                                                        </DropdownMenuItem>
                                                        {session.user && (
                                                            <>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        if (session.user) {
                                                                            handleTerminateUserSessions(session.user_id, session.user.full_name);
                                                                        }
                                                                    }}
                                                                    className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                                                                >
                                                                    <Power className="mr-2 h-3.5 w-3.5" />
                                                                    Terminate All
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem asChild>
                                                                    <a href={route('super-admin.users.show', session.user_id)} className="cursor-pointer">
                                                                        <ShieldCheck className="mr-2 h-3.5 w-3.5" />
                                                                        View Profile
                                                                    </a>
                                                                </DropdownMenuItem>
                                                            </>
                                                        )}
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
                    {totalPages > 1 && (
                        <div className="border-t p-4">
                            <Pagination currentPage={currentPage} lastPage={totalPages} total={filteredSessions.length} perPage={itemsPerPage} onPageChange={setCurrentPage} />
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
