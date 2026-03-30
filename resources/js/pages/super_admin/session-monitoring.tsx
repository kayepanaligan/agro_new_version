import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { ArrowUpDown, Clock, Globe, Laptop, LogOut, MoreHorizontal, Monitor, Power, Search, ShieldCheck, Smartphone, Tablet } from 'lucide-react';
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

    const getStatusBadge = (isActive: boolean) => {
        return isActive ? (
            <Badge className="bg-green-500 flex items-center gap-1">
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
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="rounded-xl border bg-card shadow-sm">
                    <div className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="mb-2 text-3xl font-bold">Session Monitoring</h1>
                                <p className="text-muted-foreground">Monitor and manage active user sessions across the platform</p>
                            </div>
                            <Button 
                                variant="destructive" 
                                onClick={handleTerminateAllOtherSessions}
                                className="gap-2"
                            >
                                <Power className="h-4 w-4" />
                                Terminate All Other Sessions
                            </Button>
                        </div>
                    </div>

                    <div className="border-t p-6">
                        {/* Filters */}
                        <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div className="relative flex-1 max-w-sm">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search by user, email, or IP..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9"
                                />
                            </div>

                            <div className="flex gap-2">
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="w-[150px]">
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Select value={deviceFilter} onValueChange={setDeviceFilter}>
                                    <SelectTrigger className="w-[150px]">
                                        <SelectValue placeholder="Device" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Devices</SelectItem>
                                        {uniqueDevices.map((device) => (
                                            <SelectItem key={device} value={device}>{device}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select value={browserFilter} onValueChange={setBrowserFilter}>
                                    <SelectTrigger className="w-[150px]">
                                        <SelectValue placeholder="Browser" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Browsers</SelectItem>
                                        {uniqueBrowsers.map((browser) => (
                                            <SelectItem key={browser} value={browser}>{browser}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Results count */}
                        <div className="mb-4 text-sm text-muted-foreground">
                            Showing {filteredSessions.length} of {sessions.length} sessions
                        </div>

                        {/* Table */}
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>User</TableHead>
                                        <TableHead>
                                            <Button variant="ghost" onClick={() => handleSort('ip_address')} className="-ml-4">
                                                IP Address
                                                <ArrowUpDown className="ml-2 h-4 w-4" />
                                            </Button>
                                        </TableHead>
                                        <TableHead>
                                            <Button variant="ghost" onClick={() => handleSort('device')} className="-ml-4">
                                                Device
                                                <ArrowUpDown className="ml-2 h-4 w-4" />
                                            </Button>
                                        </TableHead>
                                        <TableHead>
                                            <Button variant="ghost" onClick={() => handleSort('browser')} className="-ml-4">
                                                Browser
                                                <ArrowUpDown className="ml-2 h-4 w-4" />
                                            </Button>
                                        </TableHead>
                                        <TableHead>
                                            <Button variant="ghost" onClick={() => handleSort('os')} className="-ml-4">
                                                OS
                                                <ArrowUpDown className="ml-2 h-4 w-4" />
                                            </Button>
                                        </TableHead>
                                        <TableHead>
                                            <Button variant="ghost" onClick={() => handleSort('last_activity')} className="-ml-4">
                                                Last Activity
                                                <ArrowUpDown className="ml-2 h-4 w-4" />
                                            </Button>
                                        </TableHead>
                                        <TableHead>
                                            <Button variant="ghost" onClick={() => handleSort('is_active')} className="-ml-4">
                                                Status
                                                <ArrowUpDown className="ml-2 h-4 w-4" />
                                            </Button>
                                        </TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredSessions.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={8} className="h-24 text-center">
                                                No sessions found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredSessions.map((session) => (
                                            <TableRow key={session.id}>
                                                <TableCell>
                                                    {session.user ? (
                                                        <div className="flex items-center gap-3">
                                                            <Avatar className="h-10 w-10">
                                                                <AvatarImage src={session.user.avatar || undefined} alt={session.user.full_name} />
                                                                <AvatarFallback>
                                                                    {session.user.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div>
                                                                <div className="font-medium">{session.user.full_name}</div>
                                                                <div className="text-sm text-muted-foreground">{session.user.email}</div>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted-foreground">Unknown User</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="font-mono text-sm">{session.ip_address || 'N/A'}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        {getDeviceIcon(session.device)}
                                                        <span>{session.device}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        {getBrowserIcon(session.browser)}
                                                        <span>{session.browser}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{session.os}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="h-3 w-3 text-muted-foreground" />
                                                        <span className="text-sm">{formatLastActivity(session.last_activity)}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{getStatusBadge(session.is_active)}</TableCell>
                                                <TableCell className="text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-[220px]">
                                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem 
                                                                onClick={() => handleTerminateSession(session.id)}
                                                                className="text-red-600 focus:text-red-600"
                                                            >
                                                                <LogOut className="mr-2 h-4 w-4" />
                                                                <span>Terminate Session</span>
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
                                                                        className="text-red-600 focus:text-red-600"
                                                                    >
                                                                        <Power className="mr-2 h-4 w-4" />
                                                                        <span>Terminate All User Sessions</span>
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuSeparator />
                                                                    <DropdownMenuItem asChild>
                                                                        <a href={route('super-admin.users.show', session.user_id)} className="block w-full">
                                                                            <ShieldCheck className="mr-2 h-4 w-4" />
                                                                            <span>View User Profile</span>
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
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
