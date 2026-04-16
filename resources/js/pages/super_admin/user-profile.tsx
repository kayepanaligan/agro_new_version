import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type User } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft, BadgeCheck, Calendar, Camera, Clock, Mail, MapPin, Phone, UserRound, Users, Key, Shield } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'User Monitoring',
        href: '/super-admin/users',
    },
    {
        title: 'User Profile',
        href: '#',
    },
];

interface UserProfile extends User {
    full_name: string;
    role: {
        id: number;
        name: string;
        description?: string | null;
    };
    custom_privileges?: Array<{
        id: number;
        name: string;
        display_name: string;
        module: string;
        granted: boolean;
    }>;
    role_permissions?: Array<{
        id: number;
        name: string;
        display_name: string;
        module: string;
    }>;
    custom_privileges_count?: number;
    role_permissions_count?: number;
}

export default function UserProfilePage() {
    const { user } = usePage<{ user: UserProfile }>().props;

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
            <Head title={`${user.full_name} - Profile`} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                {/* Back Button */}
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/super-admin/users">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Users
                        </Link>
                    </Button>
                </div>

                <div className="rounded-xl border bg-card shadow-sm">
                    {/* Header Section */}
                    <div className="border-b p-6">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-6">
                                <Avatar className="h-24 w-24 overflow-hidden rounded-full border-4 border-border">
                                    <AvatarImage src={user.avatar || undefined} alt={user.full_name} />
                                    <AvatarFallback className="text-3xl">
                                        {user.first_name[0]}{user.last_name[0]}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="space-y-1">
                                    <h1 className="text-3xl font-bold">{user.full_name}</h1>
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Mail className="h-4 w-4" />
                                        <span>{user.email}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="secondary">{user.role.name}</Badge>
                                        {getStatusBadge(user.registration_status || 'pending')}
                                        {getSessionBadge(user.is_active_session || false)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-6 p-6 md:grid-cols-2">
                        {/* Personal Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <UserRound className="h-5 w-5" />
                                    Personal Information
                                </CardTitle>
                                <CardDescription>Basic details about the user</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-3 gap-2">
                                    <span className="text-sm text-muted-foreground">First Name:</span>
                                    <span className="col-span-2 font-medium">{user.first_name}</span>
                                </div>
                                <Separator />
                                <div className="grid grid-cols-3 gap-2">
                                    <span className="text-sm text-muted-foreground">Middle Name:</span>
                                    <span className="col-span-2 font-medium">{user.middle_name || 'N/A'}</span>
                                </div>
                                <Separator />
                                <div className="grid grid-cols-3 gap-2">
                                    <span className="text-sm text-muted-foreground">Last Name:</span>
                                    <span className="col-span-2 font-medium">{user.last_name}</span>
                                </div>
                                <Separator />
                                <div className="grid grid-cols-3 gap-2">
                                    <span className="text-sm text-muted-foreground">Full Name:</span>
                                    <span className="col-span-2 font-medium">{user.full_name}</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Contact Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Mail className="h-5 w-5" />
                                    Contact Information
                                </CardTitle>
                                <CardDescription>How to reach this user</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-3 gap-2">
                                    <span className="text-sm text-muted-foreground">Email:</span>
                                    <span className="col-span-2 font-medium">{user.email}</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Account Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BadgeCheck className="h-5 w-5" />
                                    Account Information
                                </CardTitle>
                                <CardDescription>Account status and role details</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-3 gap-2">
                                    <span className="text-sm text-muted-foreground">Role:</span>
                                    <span className="col-span-2 font-medium">{user.role.name}</span>
                                </div>
                                <Separator />
                                {user.role.description && (
                                    <>
                                        <div className="grid grid-cols-3 gap-2">
                                            <span className="text-sm text-muted-foreground">Description:</span>
                                            <span className="col-span-2 text-sm">{user.role.description}</span>
                                        </div>
                                        <Separator />
                                    </>
                                )}
                                <div className="grid grid-cols-3 gap-2">
                                    <span className="text-sm text-muted-foreground">Status:</span>
                                    <span className="col-span-2">{getStatusBadge(user.registration_status || 'pending')}</span>
                                </div>
                                <Separator />
                                <div className="grid grid-cols-3 gap-2">
                                    <span className="text-sm text-muted-foreground">Session:</span>
                                    <span className="col-span-2">{getSessionBadge(user.is_active_session || false)}</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Activity Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Clock className="h-5 w-5" />
                                    Activity & Timestamps
                                </CardTitle>
                                <CardDescription>Important dates and activity</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-3 gap-2">
                                    <span className="text-sm text-muted-foreground">User ID:</span>
                                    <span className="col-span-2 font-medium">#{user.id}</span>
                                </div>
                                <Separator />
                                <div className="grid grid-cols-3 gap-2">
                                    <span className="text-sm text-muted-foreground">Registered:</span>
                                    <span className="col-span-2 font-medium">
                                        <Calendar className="mr-1 inline h-3 w-3" />
                                        {new Date(user.created_at).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </span>
                                </div>
                                <Separator />
                                <div className="grid grid-cols-3 gap-2">
                                    <span className="text-sm text-muted-foreground">Last Updated:</span>
                                    <span className="col-span-2 font-medium">
                                        <Calendar className="mr-1 inline h-3 w-3" />
                                        {new Date(user.updated_at).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </span>
                                </div>
                                {user.last_activity_at && (
                                    <>
                                        <Separator />
                                        <div className="grid grid-cols-3 gap-2">
                                            <span className="text-sm text-muted-foreground">Last Activity:</span>
                                            <span className="col-span-2 font-medium">
                                                <Clock className="mr-1 inline h-3 w-3" />
                                                {new Date(user.last_activity_at).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </span>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Privileges Section */}
                    <div className="border-t p-6">
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                            <Key className="h-6 w-6 text-primary" />
                            Privileges & Permissions
                        </h2>
                        
                        <div className="grid gap-6 md:grid-cols-2">
                            {/* Custom Privileges */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        <Key className="h-5 w-5 text-primary" />
                                        Custom Privileges
                                        <Badge variant="outline" className="ml-auto">
                                            {user.custom_privileges?.length || 0}
                                        </Badge>
                                    </CardTitle>
                                    <CardDescription>
                                        User-specific privilege overrides
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {user.custom_privileges && user.custom_privileges.length > 0 ? (
                                        <div className="space-y-2 max-h-64 overflow-y-auto">
                                            {user.custom_privileges.map((priv) => (
                                                <div key={priv.id} className="flex items-center justify-between p-3 rounded-lg border">
                                                    <div className="flex-1">
                                                        <div className="font-medium text-sm">{priv.display_name}</div>
                                                        <div className="text-xs text-muted-foreground">{priv.module}</div>
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
                                        <div className="text-center py-8">
                                            <Key className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                                            <p className="text-sm text-muted-foreground mb-2">No custom privileges</p>
                                            <Button variant="outline" size="sm" asChild>
                                                <Link href="/super-admin/users">Manage Privileges</Link>
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Role Permissions */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        <Shield className="h-5 w-5 text-blue-600" />
                                        Role Permissions
                                        <Badge variant="outline" className="ml-auto">
                                            {user.role_permissions?.length || 0}
                                        </Badge>
                                    </CardTitle>
                                    <CardDescription>
                                        Inherited from {user.role.name} role
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {user.role_permissions && user.role_permissions.length > 0 ? (
                                        <div className="space-y-2 max-h-64 overflow-y-auto">
                                            {user.role_permissions.map((perm) => (
                                                <div key={perm.id} className="flex items-center justify-between p-3 rounded-lg border bg-blue-50/50">
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
                                        <div className="text-center py-8">
                                            <Shield className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                                            <p className="text-sm text-muted-foreground">No role permissions</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Summary Cards */}
                        <div className="mt-6 grid grid-cols-3 gap-4">
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="text-center">
                                        <div className="text-3xl font-bold text-primary">{user.custom_privileges_count || 0}</div>
                                        <div className="text-sm text-muted-foreground mt-1">Custom Privileges</div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="text-center">
                                        <div className="text-3xl font-bold text-blue-600">{user.role_permissions_count || 0}</div>
                                        <div className="text-sm text-muted-foreground mt-1">Role Permissions</div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="text-center">
                                        <div className="text-3xl font-bold">{(user.custom_privileges_count || 0) + (user.role_permissions_count || 0)}</div>
                                        <div className="text-sm text-muted-foreground mt-1">Total Effective</div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
