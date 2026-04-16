import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, Check } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { BreadcrumbItem } from '@/types';

interface Permission {
    id: number;
    name: string;
    display_name: string;
    description: string | null;
    module: string;
}

interface RoleFormProps {
    role?: {
        id: number;
        name: string;
        description: string | null;
    } | null;
    permissions: Record<string, Permission[]>;
    rolePermissions?: number[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Role Management',
        href: '/super-admin/roles',
    },
    {
        title: 'Create Role',
        href: '/super-admin/roles/create',
    },
];

export default function RoleCreate({ permissions, role = null, rolePermissions = [] }: RoleFormProps) {
    const { data, setData, post, put, processing, errors } = useForm({
        name: role?.name || '',
        description: role?.description || '',
        permissions: rolePermissions,
    });

    const isEdit = role !== null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (isEdit) {
            put(route('super-admin.roles.update', role.id));
        } else {
            post(route('super-admin.roles.store'));
        }
    };

    const togglePermission = (permissionId: number) => {
        const currentPermissions = data.permissions || [];
        if (currentPermissions.includes(permissionId)) {
            setData('permissions', currentPermissions.filter((id: number) => id !== permissionId));
        } else {
            setData('permissions', [...currentPermissions, permissionId]);
        }
    };

    const toggleModulePermissions = (modulePermissions: Permission[]) => {
        const currentPermissions = data.permissions || [];
        const moduleIds = modulePermissions.map(p => p.id);
        const allSelected = moduleIds.every(id => currentPermissions.includes(id));
        
        if (allSelected) {
            setData('permissions', currentPermissions.filter((id: number) => !moduleIds.includes(id)));
        } else {
            const newPermissions = [...currentPermissions];
            moduleIds.forEach(id => {
                if (!newPermissions.includes(id)) {
                    newPermissions.push(id);
                }
            });
            setData('permissions', newPermissions);
        }
    };

    const isModuleFullySelected = (modulePermissions: Permission[]) => {
        const currentPermissions = data.permissions || [];
        return modulePermissions.every(p => currentPermissions.includes(p.id));
    };

    const getModuleDisplayName = (module: string) => {
        return module
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    if (isEdit) {
        breadcrumbs[1] = {
            title: 'Edit Role',
            href: `/super-admin/roles/${role.id}/edit`,
        };
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={isEdit ? 'Edit Role' : 'Create Role'} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={route('super-admin.roles')}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Roles
                        </Link>
                    </Button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>{isEdit ? 'Edit Role' : 'Create New Role'}</CardTitle>
                            <CardDescription>
                                {isEdit 
                                    ? 'Update role information and permissions'
                                    : 'Define a new role with specific permissions'
                                }
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Role Name</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="e.g., admin, technician, custom_role"
                                    required
                                />
                                {errors.name && (
                                    <p className="text-sm text-red-500">{errors.name}</p>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="description">Description (Optional)</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Describe the purpose of this role..."
                                    rows={3}
                                />
                                {errors.description && (
                                    <p className="text-sm text-red-500">{errors.description}</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Permissions</CardTitle>
                            <CardDescription>
                                Select the permissions this role should have. Permissions are grouped by module.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {Object.entries(permissions).map(([module, modulePermissions]) => (
                                <div key={module} className="space-y-3">
                                    <div className="flex items-center justify-between border-b pb-2">
                                        <h3 className="font-semibold">
                                            {getModuleDisplayName(module)}
                                        </h3>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => toggleModulePermissions(modulePermissions)}
                                        >
                                            <Check className="mr-1 h-3 w-3" />
                                            {isModuleFullySelected(modulePermissions) ? 'Deselect All' : 'Select All'}
                                        </Button>
                                    </div>
                                    <div className="grid gap-3 pl-4">
                                        {modulePermissions.map((permission) => (
                                            <div
                                                key={permission.id}
                                                className="flex items-center justify-between rounded-lg border p-3"
                                            >
                                                <div className="flex-1">
                                                    <div className="font-medium">
                                                        {permission.display_name}
                                                    </div>
                                                    {permission.description && (
                                                        <div className="text-sm text-muted-foreground">
                                                            {permission.description}
                                                        </div>
                                                    )}
                                                </div>
                                                <Switch
                                                    checked={(data.permissions || []).includes(permission.id)}
                                                    onCheckedChange={() => togglePermission(permission.id)}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-2">
                        <Button variant="outline" type="button" asChild>
                            <Link href={route('super-admin.roles')}>Cancel</Link>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            <Save className="mr-2 h-4 w-4" />
                            {isEdit ? 'Update Role' : 'Create Role'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
