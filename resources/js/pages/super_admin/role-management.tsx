import { Head, Link, router } from '@inertiajs/react';
import { Plus, Eye, Edit, Trash2, Shield } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
    const handleDelete = (roleId: number, roleName: string) => {
        if (confirm(`Are you sure you want to delete the role "${roleName}"?`)) {
            router.delete(route('super-admin.roles.destroy', roleId));
        }
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
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Role Management</h1>
                        <p className="text-muted-foreground">
                            Manage roles and permissions for system access control
                        </p>
                    </div>
                    <Button asChild>
                        <Link href={route('super-admin.roles.create')}>
                            <Plus className="mr-2 h-4 w-4" />
                            Create Role
                        </Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Roles</CardTitle>
                        <CardDescription>
                            {roles.length} role{roles.length !== 1 ? 's' : ''} configured
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Role Name</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Permissions</TableHead>
                                        <TableHead>Users</TableHead>
                                        <TableHead>Created</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {roles.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="h-24 text-center">
                                                No roles found. Create your first role to get started.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        roles.map((role) => (
                                            <TableRow key={role.id}>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Shield className="h-4 w-4 text-muted-foreground" />
                                                        <Badge className={getRoleBadgeColor(role.name)}>
                                                            {role.name}
                                                        </Badge>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="max-w-xs truncate">
                                                    {role.description || '-'}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary">
                                                        {role.permissions_count} permission{role.permissions_count !== 1 ? 's' : ''}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">
                                                        {role.users_count} user{role.users_count !== 1 ? 's' : ''}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {new Date(role.created_at).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem asChild>
                                                                <Link href={route('super-admin.roles.show', role.id)}>
                                                                    <Eye className="mr-2 h-4 w-4" />
                                                                    View Details
                                                                </Link>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem asChild>
                                                                <Link href={route('super-admin.roles.edit', role.id)}>
                                                                    <Edit className="mr-2 h-4 w-4" />
                                                                    Edit Role
                                                                </Link>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                onClick={() => handleDelete(role.id, role.name)}
                                                                className="text-red-600"
                                                            >
                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                Delete Role
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
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
