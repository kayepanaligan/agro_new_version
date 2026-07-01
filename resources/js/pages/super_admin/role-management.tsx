import { Head, Link, router } from '@inertiajs/react';
import { Plus, Eye, Edit, Trash2, Shield, Search, Users, Lock, Key } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { KpiCard } from '@/components/agro-profiler/kpi-card';
import { ExportButtons } from '@/components/agro-profiler/export-buttons';
import { Pagination } from '@/components/agro-profiler/pagination';
import { exportToCsv, exportToPdf } from '@/lib/export';
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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import type { BreadcrumbItem } from '@/types';
import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';

interface Role {
    id: number;
    name: string;
    description: string | null;
    users_count: number;
    permissions_count: number;
    created_at: string;
}

interface RoleManagementProps {
    roles: Role[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Role Management',
        href: '/super-admin/roles',
    },
];

export default function RoleManagement({ roles }: RoleManagementProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    const filteredRoles = useMemo(() => {
        if (!searchTerm) return roles;
        const term = searchTerm.toLowerCase();
        return roles.filter(
            (role) =>
                role.name.toLowerCase().includes(term) ||
                role.description?.toLowerCase().includes(term)
        );
    }, [roles, searchTerm]);

    const totalPages = Math.ceil(filteredRoles.length / itemsPerPage);
    const paginatedRoles = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredRoles.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredRoles, currentPage, itemsPerPage]);

    const handleDelete = (roleId: number, roleName: string) => {
        if (confirm(`Are you sure you want to delete the role "${roleName}"?`)) {
            router.delete(route('super-admin.roles.destroy', roleId));
        }
    };

    const handleExportCsv = () => {
        const headers = ['ID', 'Role Name', 'Description', 'Permissions', 'Users', 'Created'];
        const rows = filteredRoles.map((r) => [
            r.id,
            r.name,
            r.description || '',
            r.permissions_count,
            r.users_count,
            new Date(r.created_at).toLocaleDateString(),
        ]);
        exportToCsv('roles', headers, rows);
    };

    const getRoleBadgeColor = (roleName: string) => {
        switch (roleName) {
            case 'super admin':
                return 'bg-red-500';
            case 'admin':
                return 'bg-blue-500';
            case 'technician':
                return 'bg-green-500';
            case 'farmer':
                return 'bg-orange-500';
            default:
                return 'bg-gray-500';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Role Management" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">

                {/* Page Header */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Role Management</h1>
                        <p className="text-sm text-muted-foreground">Manage roles and permissions for system access control</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <ExportButtons onExportCsv={handleExportCsv} onExportPdf={exportToPdf} />
                        <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
                            <Link href={route('super-admin.roles.create')}>
                                <Plus className="mr-2 h-4 w-4" />
                                New Role
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    <KpiCard label="Total Roles" value={roles.length} icon={Shield} />
                    <KpiCard label="Super Admins" value={roles.filter((r) => r.name === 'super admin').length} icon={Lock} />
                    <KpiCard label="Total Permissions" value={roles.reduce((sum, r) => sum + r.permissions_count, 0)} icon={Key} />
                    <KpiCard label="Total Users" value={roles.reduce((sum, r) => sum + r.users_count, 0)} icon={Users} />
                </div>

                {/* Table Card */}
                <div className="glass-card rounded-2xl overflow-hidden">
                    {/* Toolbar */}
                    <div className="flex flex-col gap-3 border-b px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="relative w-full max-w-xs">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search roles..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 h-9 text-sm"
                            />
                        </div>
                        <span className="text-xs text-muted-foreground">
                            {filteredRoles.length === roles.length
                                ? `${roles.length} roles`
                                : `${filteredRoles.length} of ${roles.length} roles`}
                        </span>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/40 hover:bg-muted/40">
                                    <TableHead className="w-16 text-xs font-semibold uppercase tracking-wide text-muted-foreground">ID</TableHead>
                                    <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Role Name</TableHead>
                                    <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground max-w-xs">Description</TableHead>
                                    <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Permissions</TableHead>
                                    <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Users</TableHead>
                                    <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Created</TableHead>
                                    <TableHead className="w-16 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedRoles.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-40 text-center">
                                            <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                                <Shield className="h-8 w-8 opacity-30" />
                                                <p className="text-sm font-medium">No roles found</p>
                                                <p className="text-xs">
                                                    {searchTerm ? 'Try a different search term.' : 'Click "New Role" to get started.'}
                                                </p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    paginatedRoles.map((role) => (
                                        <TableRow key={role.id} className="hover:bg-muted/30 transition-colors">
                                            <TableCell className="text-xs text-muted-foreground font-mono">{role.id}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Badge className={getRoleBadgeColor(role.name)}>
                                                        {role.name}
                                                    </Badge>
                                                </div>
                                            </TableCell>
                                            <TableCell className="max-w-xs">
                                                <span className="text-sm text-muted-foreground line-clamp-2">
                                                    {role.description || '—'}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-sm text-muted-foreground">
                                                    {role.permissions_count} permission{role.permissions_count !== 1 ? 's' : ''}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-sm text-muted-foreground">
                                                    {role.users_count} user{role.users_count !== 1 ? 's' : ''}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {new Date(role.created_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </TableCell>
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
                                                    <DropdownMenuContent align="end" className="w-36">
                                                        <DropdownMenuItem asChild className="cursor-pointer">
                                                            <Link href={route('super-admin.roles.show', role.id)}>
                                                                <Eye className="mr-2 h-3.5 w-3.5" />
                                                                View
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem asChild className="cursor-pointer">
                                                            <Link href={route('super-admin.roles.edit', role.id)}>
                                                                <Edit className="mr-2 h-3.5 w-3.5" />
                                                                Edit
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            onClick={() => handleDelete(role.id, role.name)}
                                                            className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                                                        >
                                                            <Trash2 className="mr-2 h-3.5 w-3.5" />
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

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="border-t p-4">
                            <Pagination currentPage={currentPage} lastPage={totalPages} total={filteredRoles.length} perPage={itemsPerPage} onPageChange={setCurrentPage} />
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
