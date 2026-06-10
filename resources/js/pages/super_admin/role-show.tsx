import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Shield, Users, Key, Mail } from 'lucide-react';
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
import type { BreadcrumbItem } from '@/types';

interface Permission {
    id: number;
    name: string;
    display_name: string;
    module: string;
}

interface User {
    id: number;
    full_name: string;
    email: string;
}

interface Role {
    id: number;
    name: string;
    description: string | null;
    permissions: Permission[];
    users: User[];
    created_at: string;
}

interface RoleShowProps {
    role: Role;
}

const RoleShow = ({ role }: RoleShowProps) => {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Role Management',
            href: '/super-admin/roles',
        },
        {
            title: role.name,
            href: `/super-admin/roles/${role.id}`,
        },
    ];

    const handleDelete = () => {
        if (confirm(`Are you sure you want to delete the role "${role.name}"?`)) {
            router.delete(route('super-admin.roles.destroy', role.id));
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

    // Group permissions by module
    const permissionsByModule = role.permissions.reduce((acc, perm) => {
        if (!acc[perm.module]) {
            acc[perm.module] = [];
        }
        acc[perm.module].push(perm);
        return acc;
    }, {} as Record<string, Permission[]>);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Role: ${role.name}`} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" asChild>
                            <Link href={route('super-admin.roles')}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Roles
                            </Link>
                        </Button>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <Link href={route('super-admin.roles.edit', role.id)}>
                                Edit Role
                            </Link>
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            Delete Role
                        </Button>
                    </div>
                </div>

                {/* Role Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            Role Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <div className="text-sm text-muted-foreground">Role Name</div>
                                <div className="flex items-center gap-2 mt-1">
                                    <Badge className={getRoleBadgeColor(role.name)}>
                                        {role.name}
                                    </Badge>
                                </div>
                            </div>
                            <div>
                                <div className="text-sm text-muted-foreground">Created</div>
                                <div className="mt-1">
                                    {new Date(role.created_at).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })}
                                </div>
                            </div>
                        </div>
                        {role.description && (
                            <div>
                                <div className="text-sm text-muted-foreground">Description</div>
                                <div className="mt-1 text-sm">{role.description}</div>
                            </div>
                        )}
                        <div className="flex gap-4">
                            <div className="flex items-center gap-2">
                                <Key className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">
                                    {role.permissions.length} permission{role.permissions.length !== 1 ? 's' : ''}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">
                                    {role.users.length} user{role.users.length !== 1 ? 's' : ''}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Permissions */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Key className="h-5 w-5" />
                            Permissions
                        </CardTitle>
                        <CardDescription>
                            {role.permissions.length} permission{role.permissions.length !== 1 ? 's' : ''} across {Object.keys(permissionsByModule).length} module{Object.keys(permissionsByModule).length !== 1 ? 's' : ''}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {role.permissions.length === 0 ? (
                            <div className="text-center py-8">
                                <Key className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                                <p className="text-sm text-muted-foreground">No permissions assigned</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {Object.entries(permissionsByModule).map(([module, perms]) => (
                                    <div key={module}>
                                        <h4 className="font-semibold mb-3 text-sm uppercase tracking-wide text-muted-foreground">
                                            {module}
                                        </h4>
                                        <div className="rounded-md border">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Permission</TableHead>
                                                        <TableHead>Name</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {perms.map((perm) => (
                                                        <TableRow key={perm.id}>
                                                            <TableCell className="font-medium">
                                                                {perm.display_name}
                                                            </TableCell>
                                                            <TableCell className="text-muted-foreground text-sm">
                                                                {perm.name}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Users with this Role */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Users with this Role
                        </CardTitle>
                        <CardDescription>
                            {role.users.length} user{role.users.length !== 1 ? 's' : ''} assigned
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {role.users.length === 0 ? (
                            <div className="text-center py-8">
                                <Users className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                                <p className="text-sm text-muted-foreground">No users assigned to this role</p>
                            </div>
                        ) : (
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {role.users.map((user) => (
                                            <TableRow key={user.id}>
                                                <TableCell className="font-medium">
                                                    {user.full_name}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                                        {user.email}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="outline" size="sm" asChild>
                                                        <Link href={route('super-admin.users.show', user.id)}>
                                                            View Details
                                                        </Link>
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
};

export default RoleShow;
