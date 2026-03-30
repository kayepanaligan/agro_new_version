import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type User } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { ArrowUpDown, Check, Clock, Eye, MoreHorizontal, Pencil, Search, Trash2, X } from 'lucide-react';
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
        title: 'User Monitoring',
        href: '/super-admin/users',
    },
];

type SortField = 'first_name' | 'last_name' | 'email' | 'registration_status' | 'is_active_session' | 'created_at';
type SortOrder = 'asc' | 'desc';

interface UserWithFullDetails extends User {
    full_name: string;
}

export default function UserMonitoring() {
    const { users } = usePage<{ users: UserWithFullDetails[] }>().props;
    const [searchTerm, setSearchTerm] = useState('');
    const [sortField, setSortField] = useState<SortField>('created_at');
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [sessionFilter, setSessionFilter] = useState<string>('all');

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

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved':
                return <Badge className="bg-green-500">Approved</Badge>;
            case 'pending':
                return <Badge className="bg-yellow-500">Pending</Badge>;
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
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="rounded-xl border bg-card shadow-sm">
                    <div className="p-6">
                        <h1 className="mb-2 text-3xl font-bold">User Monitoring</h1>
                        <p className="text-muted-foreground">Review and manage user registrations and activities</p>
                    </div>

                    <div className="border-t p-6">
                        {/* Filters */}
                        <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div className="relative flex-1 max-w-sm">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search users..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9"
                                />
                            </div>

                            <div className="flex gap-2">
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Filter by status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="approved">Approved</SelectItem>
                                        <SelectItem value="rejected">Rejected</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Select value={sessionFilter} onValueChange={setSessionFilter}>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Filter by session" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Sessions</SelectItem>
                                        <SelectItem value="active">Active Now</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Results count */}
                        <div className="mb-4 text-sm text-muted-foreground">
                            Showing {filteredUsers.length} of {users.length} users
                        </div>

                        {/* Table */}
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[100px]">ID</TableHead>
                                        <TableHead>User</TableHead>
                                        <TableHead>
                                            <Button variant="ghost" onClick={() => handleSort('email')} className="-ml-4">
                                                Email
                                                <ArrowUpDown className="ml-2 h-4 w-4" />
                                            </Button>
                                        </TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead>
                                            <Button variant="ghost" onClick={() => handleSort('registration_status')} className="-ml-4">
                                                Registration Status
                                                <ArrowUpDown className="ml-2 h-4 w-4" />
                                            </Button>
                                        </TableHead>
                                        <TableHead>
                                            <Button variant="ghost" onClick={() => handleSort('is_active_session')} className="-ml-4">
                                                Session
                                                <ArrowUpDown className="ml-2 h-4 w-4" />
                                            </Button>
                                        </TableHead>
                                        <TableHead>
                                            <Button variant="ghost" onClick={() => handleSort('created_at')} className="-ml-4">
                                                Registered
                                                <ArrowUpDown className="ml-2 h-4 w-4" />
                                            </Button>
                                        </TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredUsers.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={8} className="h-24 text-center">
                                                No users found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredUsers.map((user) => (
                                            <TableRow 
                                                key={user.id}
                                                className="cursor-pointer hover:bg-muted/50"
                                                onClick={() => router.visit(route('super-admin.users.show', user.id))}
                                            >
                                                <TableCell className="font-medium">{user.id}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-10 w-10">
                                                            <AvatarImage src={user.avatar || undefined} alt={user.full_name} />
                                                            <AvatarFallback>
                                                                {user.first_name[0]}{user.last_name[0]}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="font-medium">{getFullName(user)}</div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{user.email}</TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary">{user.role?.name || 'No Role'}</Badge>
                                                </TableCell>
                                                <TableCell>{getStatusBadge(user.registration_status || 'pending')}</TableCell>
                                                <TableCell>{getSessionBadge(user.is_active_session || false)}</TableCell>
                                                <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                                                <TableCell className="text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button 
                                                                variant="ghost" 
                                                                size="sm" 
                                                                className="h-8 w-8 p-0"
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-[200px]">
                                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleViewDetails(user); }}>
                                                                <Eye className="mr-2 h-4 w-4" />
                                                                <span>View Details</span>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleUpdate(user); }}>
                                                                <Pencil className="mr-2 h-4 w-4" />
                                                                <span>Update</span>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            {user.registration_status !== 'approved' && (
                                                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleQuickApprove(user.id); }}>
                                                                    <Check className="mr-2 h-4 w-4 text-green-600" />
                                                                    <span>Quick Approve</span>
                                                                </DropdownMenuItem>
                                                            )}
                                                            {user.registration_status !== 'rejected' && (
                                                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleQuickReject(user.id); }}>
                                                                    <X className="mr-2 h-4 w-4 text-red-600" />
                                                                    <span>Quick Reject</span>
                                                                </DropdownMenuItem>
                                                            )}
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem 
                                                                onClick={(e) => { e.stopPropagation(); handleDelete(user); }}
                                                                className="text-red-600 focus:text-red-600"
                                                            >
                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                <span>Delete User</span>
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
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
