import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type User } from '@/types';
import { Head, router, usePage, Link, useForm } from '@inertiajs/react';
import { ArrowUpDown, Check, Clock, Eye, MoreHorizontal, Pencil, Search, Trash2, X, Key, Shield, Plus, Users, UserCheck, UserX, Activity } from 'lucide-react';
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { getFullName } from '@/types';
import { KpiCard } from '@/components/agro-profiler/kpi-card';
import { ExportButtons } from '@/components/agro-profiler/export-buttons';
import { Pagination } from '@/components/agro-profiler/pagination';
import { exportToCsv, exportToPdf } from '@/lib/export';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'User Monitoring',
        href: '/super-admin/users',
    },
];

type SortField = 'first_name' | 'last_name' | 'email' | 'registration_status' | 'is_active_session' | 'created_at';
type SortOrder = 'asc' | 'desc';

interface UserWithFullDetails extends User {
    full_name: string;
    custom_privileges: Array<{
        id: number;
        name: string;
        display_name: string;
        module: string;
        granted: boolean;
    }>;
    role_permissions: Array<{
        id: number;
        name: string;
        display_name: string;
        module: string;
    }>;
    custom_privileges_count: number;
    role_permissions_count: number;
}

export default function UserMonitoring() {
    const { users, permissions } = usePage<{ users: UserWithFullDetails[]; permissions?: Record<string, Array<{id: number; name: string; display_name: string; description: string}>> }>().props;
    const [searchTerm, setSearchTerm] = useState('');
    const [sortField, setSortField] = useState<SortField>('created_at');
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [sessionFilter, setSessionFilter] = useState<string>('all');
    const [selectedUser, setSelectedUser] = useState<UserWithFullDetails | null>(null);
    const [showPrivilegesDialog, setShowPrivilegesDialog] = useState(false);
    const [newPrivilege, setNewPrivilege] = useState({ permission_id: '', granted: true, remarks: '' });
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    // Filter and sort users
    const filteredUsers = useMemo(() => {
        let result = [...users];

        // Search filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(
                (user) =>
                    user.first_name.toLowerCase().includes(term) ||
                    user.last_name.toLowerCase().includes(term) ||
                    user.email.toLowerCase().includes(term) ||
                    user.role?.name.toLowerCase().includes(term),
            );
        }

        // Status filter
        if (statusFilter !== 'all') {
            result = result.filter((user) => user.registration_status === statusFilter);
        }

        // Session filter
        if (sessionFilter !== 'all') {
            const isActive = sessionFilter === 'active';
            result = result.filter((user) => user.is_active_session === isActive);
        }

        // Sorting
        result.sort((a, b) => {
            let aValue: any = a[sortField];
            let bValue: any = b[sortField];

            // Handle special cases
            if (sortField === 'first_name' || sortField === 'last_name') {
                aValue = a[sortField].toLowerCase();
                bValue = b[sortField].toLowerCase();
            } else if (sortField === 'is_active_session') {
                aValue = aValue ? 1 : 0;
                bValue = bValue ? 1 : 0;
            }

            if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });

        return result;
    }, [users, searchTerm, sortField, sortOrder, statusFilter, sessionFilter]);

    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const paginatedUsers = useMemo(() => filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage), [filteredUsers, currentPage, itemsPerPage]);
    useMemo(() => setCurrentPage(1), [searchTerm, statusFilter, sessionFilter]);

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
    };

    const updateRegistrationStatus = (userId: number, status: 'pending' | 'approved' | 'rejected') => {
        router.post(`/super-admin/users/${userId}/status`, { registration_status: status }, {
            preserveScroll: true,
        });
    };

    const handleViewDetails = (user: UserWithFullDetails) => {
        router.visit(route('super-admin.users.show', user.id));
    };

    const handleQuickApprove = (userId: number) => {
        updateRegistrationStatus(userId, 'approved');
    };

    const handleQuickReject = (userId: number) => {
        updateRegistrationStatus(userId, 'rejected');
    };

    const handleUpdate = (user: UserWithFullDetails) => {
        // For now, navigate to the profile page where editing could be done
        // In a real app, you might want a separate edit page or modal
        router.visit(route('super-admin.users.show', user.id));
    };

    const handleDelete = (user: UserWithFullDetails) => {
        if (confirm(`Are you sure you want to delete ${getFullName(user)}? This action cannot be undone.`)) {
            router.delete(`/super-admin/users/${user.id}`, {
                preserveScroll: true,
            });
        }
    };

    const handleExportCsv = () => {
        const headers = ['ID', 'Name', 'Email', 'Role', 'Status', 'Session', 'Registered'];
        const rows = filteredUsers.map((u) => [
            u.id,
            getFullName(u),
            u.email,
            u.role?.name || 'No Role',
            u.registration_status || 'pending',
            u.is_active_session ? 'Active' : 'Inactive',
            new Date(u.created_at).toLocaleDateString(),
        ]);
        exportToCsv('users', headers, rows);
    };

    const handleViewPrivileges = (user: UserWithFullDetails) => {
        setSelectedUser(user);
        setNewPrivilege({ permission_id: '', granted: true, remarks: '' });
        setShowPrivilegesDialog(true);
    };

    const handleAssignPrivilege = () => {
        if (!selectedUser || !newPrivilege.permission_id) return;
        
        router.post(`/super-admin/privileges/${selectedUser.id}/assign`, {
            permission_id: parseInt(newPrivilege.permission_id),
            granted: newPrivilege.granted,
            remarks: newPrivilege.remarks,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setNewPrivilege({ permission_id: '', granted: true, remarks: '' });
                // Refresh the selected user data
                const updatedUser = users.find(u => u.id === selectedUser.id);
                if (updatedUser) {
                    setSelectedUser(updatedUser);
                }
            },
        });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved':
                return <Badge className="bg-emerald-600">Approved</Badge>;
            case 'pending':
                return <Badge className="bg-amber-500">Pending</Badge>;
            case 'rejected':
                return <Badge className="bg-red-500">Rejected</Badge>;
            default:
                return <Badge>Unknown</Badge>;
        }
    };

    const getSessionBadge = (isActive: boolean) => {
        return isActive ? (
            <Badge className="bg-blue-500 flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                Active
            </Badge>
        ) : (
            <Badge variant="outline">Inactive</Badge>
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="User Monitoring" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">

                {/* Page Header */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">User Monitoring</h1>
                        <p className="text-sm text-muted-foreground">Review and manage user registrations and activities</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <ExportButtons onExportCsv={handleExportCsv} onExportPdf={exportToPdf} />
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    <KpiCard label="Total Users" value={users.length} icon={Users} />
                    <KpiCard label="Approved" value={users.filter((u) => u.registration_status === 'approved').length} icon={UserCheck} />
                    <KpiCard label="Pending" value={users.filter((u) => u.registration_status === 'pending').length} icon={Clock} />
                    <KpiCard label="Active Now" value={users.filter((u) => u.is_active_session).length} icon={Activity} />
                </div>

                {/* Table Card */}
                <div className="glass-card rounded-2xl overflow-hidden">
                    {/* Toolbar */}
                    <div className="flex flex-col gap-3 border-b px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="relative w-full max-w-xs">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search users..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 h-9 text-sm"
                            />
                        </div>
                        <div className="flex gap-2">
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[150px] h-9"><SelectValue placeholder="Status" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="approved">Approved</SelectItem>
                                    <SelectItem value="rejected">Rejected</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={sessionFilter} onValueChange={setSessionFilter}>
                                <SelectTrigger className="w-[150px] h-9"><SelectValue placeholder="Session" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Sessions</SelectItem>
                                    <SelectItem value="active">Active Now</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <span className="text-xs text-muted-foreground">
                            {filteredUsers.length === users.length
                                ? `${users.length} users`
                                : `${filteredUsers.length} of ${users.length} users`}
                        </span>
                    </div>
            
                    {/* Table */}
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/40 hover:bg-muted/40">
                                    <TableHead className="w-16 text-xs font-semibold uppercase tracking-wide text-muted-foreground">ID</TableHead>
                                    <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">User</TableHead>
                                    <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                        <Button variant="ghost" size="sm" className="h-auto p-0 text-xs font-semibold uppercase tracking-wide" onClick={() => handleSort('email')}>
                                            Email <ArrowUpDown className="ml-1 h-3 w-3" />
                                        </Button>
                                    </TableHead>
                                    <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Role</TableHead>
                                    <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                        <Button variant="ghost" size="sm" className="h-auto p-0 text-xs font-semibold uppercase tracking-wide" onClick={() => handleSort('registration_status')}>
                                            Status <ArrowUpDown className="ml-1 h-3 w-3" />
                                        </Button>
                                    </TableHead>
                                    <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                        <Button variant="ghost" size="sm" className="h-auto p-0 text-xs font-semibold uppercase tracking-wide" onClick={() => handleSort('is_active_session')}>
                                            Session <ArrowUpDown className="ml-1 h-3 w-3" />
                                        </Button>
                                    </TableHead>
                                    <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                        <Button variant="ghost" size="sm" className="h-auto p-0 text-xs font-semibold uppercase tracking-wide" onClick={() => handleSort('created_at')}>
                                            Registered <ArrowUpDown className="ml-1 h-3 w-3" />
                                        </Button>
                                    </TableHead>
                                    <TableHead className="w-16 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedUsers.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="h-40 text-center">
                                            <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                                <Users className="h-8 w-8 opacity-30" />
                                                <p className="text-sm font-medium">No users found</p>
                                                <p className="text-xs">
                                                    {searchTerm || statusFilter !== 'all' || sessionFilter !== 'all'
                                                        ? 'Try adjusting your filters.'
                                                        : 'No users registered yet.'}
                                                </p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    paginatedUsers.map((user) => (
                                        <TableRow
                                            key={user.id}
                                            className="cursor-pointer hover:bg-muted/30 transition-colors"
                                            onClick={() => router.visit(route('super-admin.users.show', user.id))}
                                        >
                                            <TableCell className="text-xs text-muted-foreground font-mono">{user.id}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-9 w-9">
                                                        <AvatarImage src={user.avatar || undefined} alt={user.full_name} />
                                                        <AvatarFallback className="text-xs">
                                                            {user.first_name[0]}{user.last_name[0]}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="font-medium text-sm">{getFullName(user)}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">{user.email}</TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" className="text-xs">{user.role?.name || 'No Role'}</Badge>
                                            </TableCell>
                                            <TableCell>{getStatusBadge(user.registration_status || 'pending')}</TableCell>
                                            <TableCell>{getSessionBadge(user.is_active_session || false)}</TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {new Date(user.created_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-44">
                                                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleViewDetails(user); }} className="cursor-pointer">
                                                            <Eye className="mr-2 h-3.5 w-3.5" />
                                                            View Details
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleUpdate(user); }} className="cursor-pointer">
                                                            <Pencil className="mr-2 h-3.5 w-3.5" />
                                                            Update
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleViewPrivileges(user); }} className="cursor-pointer">
                                                            <Key className="mr-2 h-3.5 w-3.5" />
                                                            View Privileges
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        {user.registration_status !== 'approved' && (
                                                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleQuickApprove(user.id); }} className="cursor-pointer">
                                                                <Check className="mr-2 h-3.5 w-3.5 text-emerald-600" />
                                                                Quick Approve
                                                            </DropdownMenuItem>
                                                        )}
                                                        {user.registration_status !== 'rejected' && (
                                                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleQuickReject(user.id); }} className="cursor-pointer">
                                                                <X className="mr-2 h-3.5 w-3.5 text-red-600" />
                                                                Quick Reject
                                                            </DropdownMenuItem>
                                                        )}
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            onClick={(e) => { e.stopPropagation(); handleDelete(user); }}
                                                            className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                                                        >
                                                            <Trash2 className="mr-2 h-3.5 w-3.5" />
                                                            Delete User
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
                    {totalPages > 1 && (
                        <div className="border-t p-4">
                            <Pagination currentPage={currentPage} lastPage={totalPages} total={filteredUsers.length} perPage={itemsPerPage} onPageChange={setCurrentPage} />
                        </div>
                    )}
                </div>
            </div>

            {/* Privileges Dialog */}
            <Dialog open={showPrivilegesDialog} onOpenChange={setShowPrivilegesDialog}>
                <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Key className="h-5 w-5" />
                            Manage Privileges - {selectedUser?.full_name}
                        </DialogTitle>
                        <DialogDescription>
                            View and assign custom privileges to this user
                        </DialogDescription>
                    </DialogHeader>

                    {selectedUser && (
                        <div className="space-y-6 mt-4">
                            {/* User Info */}
                            <div className="flex items-center gap-4 p-4 bg-accent/50 rounded-lg">
                                <Avatar className="h-12 w-12">
                                    <AvatarImage src={selectedUser.avatar || undefined} />
                                    <AvatarFallback>
                                        {selectedUser.first_name[0]}{selectedUser.last_name[0]}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <div className="font-semibold text-lg">{selectedUser.full_name}</div>
                                    <div className="text-sm text-muted-foreground">{selectedUser.email}</div>
                                </div>
                                {selectedUser.role && (
                                    <Badge variant="outline" className="ml-auto">
                                        <Shield className="h-3 w-3 mr-1" />
                                        {selectedUser.role.name}
                                    </Badge>
                                )}
                            </div>

                            {/* Assign New Privilege Form */}
                            <div className="p-4 border rounded-lg bg-primary/5">
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <Plus className="h-5 w-5 text-primary" />
                                    Assign New Privilege
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div className="md:col-span-2">
                                        <Label htmlFor="permission-select">Permission</Label>
                                        <Select 
                                            value={newPrivilege.permission_id} 
                                            onValueChange={(value) => setNewPrivilege({...newPrivilege, permission_id: value})}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a permission" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {permissions && Object.entries(permissions).map(([module, perms]) => (
                                                    <div key={module}>
                                                        <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">{module}</div>
                                                        {perms.map((perm) => (
                                                            <SelectItem key={perm.id} value={perm.id.toString()}>
                                                                {perm.display_name}
                                                            </SelectItem>
                                                        ))}
                                                    </div>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label>Status</Label>
                                        <div className="flex items-center gap-2 h-10">
                                            <Switch 
                                                checked={newPrivilege.granted}
                                                onCheckedChange={(checked) => setNewPrivilege({...newPrivilege, granted: checked})}
                                            />
                                            <Label className="text-sm">
                                                {newPrivilege.granted ? 'Granted' : 'Denied'}
                                            </Label>
                                        </div>
                                    </div>
                                    <div className="md:col-span-2">
                                        <Label htmlFor="remarks">Remarks (Optional)</Label>
                                        <Textarea 
                                            id="remarks"
                                            placeholder="Add notes about this privilege..."
                                            value={newPrivilege.remarks}
                                            onChange={(e) => setNewPrivilege({...newPrivilege, remarks: e.target.value})}
                                            className="h-10"
                                        />
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <Button 
                                        onClick={handleAssignPrivilege}
                                        disabled={!newPrivilege.permission_id}
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Assign Privilege
                                    </Button>
                                </div>
                            </div>

                            <Separator />

                            {/* Current Custom Privileges */}
                            <div>
                                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                    <Key className="h-4 w-4 text-primary" />
                                    Current Custom Privileges ({selectedUser.custom_privileges.length})
                                </h3>
                                {selectedUser.custom_privileges.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                        {selectedUser.custom_privileges.map((priv) => (
                                            <div 
                                                key={priv.id} 
                                                className="flex items-center justify-between p-3 rounded-lg border"
                                            >
                                                <div className="flex-1">
                                                    <div className="font-medium text-sm">{priv.display_name}</div>
                                                    <div className="text-xs text-muted-foreground">{priv.module} • {priv.name}</div>
                                                </div>
                                                <Badge 
                                                    className={priv.granted ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}
                                                >
                                                    {priv.granted ? 'Granted' : 'Denied'}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 bg-accent/30 rounded-lg">
                                        <Key className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                                        <p className="text-sm text-muted-foreground mb-2">No custom privileges assigned</p>
                                        <p className="text-xs text-muted-foreground">Use the form above to assign privileges</p>
                                    </div>
                                )}
                            </div>

                            <Separator />

                            {/* Role Permissions */}
                            <div>
                                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                    <Shield className="h-4 w-4 text-blue-600" />
                                    Role Permissions ({selectedUser.role_permissions.length})
                                </h3>
                                {selectedUser.role_permissions.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                                        {selectedUser.role_permissions.map((perm) => (
                                            <div 
                                                key={perm.id} 
                                                className="flex items-center justify-between p-3 rounded-lg border bg-blue-50/50"
                                            >
                                                <div className="flex-1">
                                                    <div className="font-medium text-sm">{perm.display_name}</div>
                                                    <div className="text-xs text-muted-foreground">{perm.module}</div>
                                                </div>
                                                <Badge variant="outline" className="text-blue-600 border-blue-300">
                                                    Inherited
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 bg-accent/30 rounded-lg">
                                        <Shield className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                                        <p className="text-sm text-muted-foreground">No role permissions</p>
                                    </div>
                                )}
                            </div>

                            {/* Summary */}
                            <div className="p-4 bg-accent/50 rounded-lg">
                                <h4 className="font-semibold mb-3">Summary</h4>
                                <div className="grid grid-cols-3 gap-4 text-sm">
                                    <div>
                                        <div className="text-muted-foreground">Custom Privileges</div>
                                        <div className="text-2xl font-bold text-primary">{selectedUser.custom_privileges_count}</div>
                                    </div>
                                    <div>
                                        <div className="text-muted-foreground">Role Permissions</div>
                                        <div className="text-2xl font-bold text-blue-600">{selectedUser.role_permissions_count}</div>
                                    </div>
                                    <div>
                                        <div className="text-muted-foreground">Total Effective</div>
                                        <div className="text-2xl font-bold">{selectedUser.custom_privileges_count + selectedUser.role_permissions_count}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
