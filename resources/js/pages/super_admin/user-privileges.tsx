import { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Key, Shield, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface Permission {
    id: number;
    name: string;
    display_name: string;
    description: string;
    module: string;
}

interface UserPrivilege {
    id: number;
    permission_id: number;
    permission_name: string;
    permission_display: string;
    granted: boolean;
    remarks: string;
    granted_by: string;
    created_at: string;
}

interface Props {
    user: {
        id: number;
        full_name: string;
        email: string;
        role: {
            id: number;
            name: string;
        } | null;
    };
    permissions: Record<string, Permission[]>;
    userPrivileges: Record<number, boolean>;
    rolePermissions: number[];
    privilegeHistory: UserPrivilege[];
}

export default function UserPrivileges({ user, permissions, userPrivileges, rolePermissions, privilegeHistory }: Props) {
    const [selectedPermission, setSelectedPermission] = useState<number | null>(null);
    const [remarks, setRemarks] = useState('');
    const { data, setData, post, processing, errors } = useForm({
        permission_id: 0,
        granted: true,
        remarks: '',
    });

    const handleToggle = (permissionId: number, granted: boolean) => {
        setData('permission_id', permissionId);
        setData('granted', granted as true);
        setData('remarks', remarks);
        post(`/super-admin/privileges/${user.id}/assign`, {
            onSuccess: () => {
                setRemarks('');
                setSelectedPermission(null);
            },
        });
    };

    const getPermissionStatus = (permission: Permission) => {
        const hasUserOverride = userPrivileges.hasOwnProperty(permission.id);
        const userGranted = userPrivileges[permission.id];
        const hasRolePermission = rolePermissions.includes(permission.id);

        if (hasUserOverride) {
            return userGranted ? 'granted' : 'denied';
        }
        
        return hasRolePermission ? 'inherited' : 'none';
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'granted':
                return (
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Granted (Override)
                    </Badge>
                );
            case 'denied':
                return (
                    <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
                        <XCircle className="h-3 w-3 mr-1" />
                        Denied (Override)
                    </Badge>
                );
            case 'inherited':
                return (
                    <Badge variant="outline" className="text-blue-600 border-blue-300">
                        <Shield className="h-3 w-3 mr-1" />
                        Inherited from Role
                    </Badge>
                );
            default:
                return (
                    <Badge variant="secondary" className="text-muted-foreground">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        No Access
                    </Badge>
                );
        }
    };

    return (
        <AppLayout>
            <Head title={`Privileges - ${user.full_name}`} />
            
            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href="/super-admin/privileges">
                        <Button variant="outline" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold tracking-tight">{user.full_name}</h1>
                        <p className="text-muted-foreground mt-1">{user.email}</p>
                    </div>
                    {user.role && (
                        <Badge variant="outline" className="flex items-center gap-1 px-4 py-2">
                            <Shield className="h-4 w-4" />
                            {user.role.name}
                        </Badge>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Permission Assignment */}
                    <div className="lg:col-span-2 space-y-6">
                        {Object.entries(permissions).map(([module, modulePermissions]) => (
                            <Card key={module}>
                                <CardHeader>
                                    <CardTitle className="text-lg">{module}</CardTitle>
                                    <CardDescription>
                                        {modulePermissions.length} permissions
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {modulePermissions.map((permission) => {
                                            const status = getPermissionStatus(permission);
                                            return (
                                                <div key={permission.id} className="flex items-center justify-between p-4 rounded-lg border">
                                                    <div className="flex-1">
                                                        <div className="font-medium">{permission.display_name}</div>
                                                        <div className="text-sm text-muted-foreground mt-1">
                                                            {permission.description}
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="flex items-center gap-4 ml-4">
                                                        {getStatusBadge(status)}
                                                        
                                                        <div className="flex items-center gap-2">
                                                            <Switch
                                                                checked={status === 'granted' || (status === 'inherited')}
                                                                onCheckedChange={(checked) => handleToggle(permission.id, checked)}
                                                            />
                                                            <Label className="text-sm">
                                                                {status === 'granted' || (status === 'inherited') ? 'Granted' : 'Denied'}
                                                            </Label>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Right Column - Privilege History */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Key className="h-5 w-5" />
                                    Privilege History
                                </CardTitle>
                                <CardDescription>
                                    Recent privilege changes
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                                    {privilegeHistory.map((history) => (
                                        <div key={history.id} className="pb-4 border-b last:border-b-0 last:pb-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex-1">
                                                    <div className="font-medium text-sm">{history.permission_display}</div>
                                                    <div className="text-xs text-muted-foreground mt-1">
                                                        {history.permission_name}
                                                    </div>
                                                </div>
                                                {history.granted ? (
                                                    <Badge className="bg-green-100 text-green-700">Granted</Badge>
                                                ) : (
                                                    <Badge className="bg-red-100 text-red-700">Denied</Badge>
                                                )}
                                            </div>
                                            {history.remarks && (
                                                <div className="mt-2 text-xs text-muted-foreground bg-accent/50 p-2 rounded">
                                                    {history.remarks}
                                                </div>
                                            )}
                                            <div className="mt-2 text-xs text-muted-foreground">
                                                by {history.granted_by} • {new Date(history.created_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                    ))}
                                    
                                    {privilegeHistory.length === 0 && (
                                        <div className="text-center py-8 text-muted-foreground">
                                            <Key className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                            <p className="text-sm">No privilege changes yet</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Legend</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <Badge className="bg-green-100 text-green-700">Granted (Override)</Badge>
                                </div>
                                <p className="text-xs text-muted-foreground ml-1">
                                    Explicitly granted, overrides role permission
                                </p>
                                
                                <Separator />
                                
                                <div className="flex items-center gap-2">
                                    <Badge className="bg-red-100 text-red-700">Denied (Override)</Badge>
                                </div>
                                <p className="text-xs text-muted-foreground ml-1">
                                    Explicitly denied, overrides role permission
                                </p>
                                
                                <Separator />
                                
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-blue-600 border-blue-300">Inherited from Role</Badge>
                                </div>
                                <p className="text-xs text-muted-foreground ml-1">
                                    Inherited from {user.role?.name || 'No Role'} role
                                </p>
                                
                                <Separator />
                                
                                <div className="flex items-center gap-2">
                                    <Badge variant="secondary" className="text-muted-foreground">No Access</Badge>
                                </div>
                                <p className="text-xs text-muted-foreground ml-1">
                                    Not granted by role or override
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
