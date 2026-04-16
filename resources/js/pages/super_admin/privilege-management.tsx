import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Key, Search, User, Shield } from 'lucide-react';

interface User {
    id: number;
    full_name: string;
    email: string;
    role: {
        id: number;
        name: string;
    } | null;
    role_permissions_count: number;
    custom_privileges_count: number;
    created_at: string;
}

interface Role {
    id: number;
    name: string;
    description: string;
}

interface Props {
    users: User[];
    roles: Role[];
    filters: {
        role_id?: string;
        search?: string;
    };
}

export default function PrivilegeManagement({ users, roles, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [roleId, setRoleId] = useState(filters.role_id || '');

    const handleSearch = () => {
        router.get('/super-admin/privileges', { search, role_id: roleId || undefined }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleReset = () => {
        setSearch('');
        setRoleId('');
        router.get('/super-admin/privileges', {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    return (
        <AppLayout>
            <Head title="User Privileges" />
            
            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">User Privileges</h1>
                        <p className="text-muted-foreground mt-1">
                            Manage individual user permissions and overrides
                        </p>
                    </div>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle>Filter Users</CardTitle>
                        <CardDescription>
                            Search and filter users to manage their privileges
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-4 flex-wrap">
                            <div className="flex-1 min-w-[300px]">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search by name or email..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <div className="w-[250px]">
                                <Select value={roleId || 'all'} onValueChange={(value) => setRoleId(value === 'all' ? '' : value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Filter by role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Roles</SelectItem>
                                        {roles.map((role) => (
                                            <SelectItem key={role.id} value={role.id.toString()}>
                                                {role.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex gap-2">
                                <Button onClick={handleSearch}>
                                    <Search className="h-4 w-4 mr-2" />
                                    Search
                                </Button>
                                <Button variant="outline" onClick={handleReset}>
                                    Reset
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Users List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Users ({users.length})</CardTitle>
                        <CardDescription>
                            Click on a user to manage their individual privileges
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {users.map((user) => (
                                <Link
                                    key={user.id}
                                    href={`/super-admin/privileges/${user.id}`}
                                    className="block"
                                >
                                    <div className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent transition-colors cursor-pointer">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                                <User className="h-6 w-6 text-primary" />
                                            </div>
                                            <div>
                                                <div className="font-semibold text-lg">{user.full_name}</div>
                                                <div className="text-sm text-muted-foreground">{user.email}</div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            {user.role && (
                                                <Badge variant="outline" className="flex items-center gap-1">
                                                    <Shield className="h-3 w-3" />
                                                    {user.role.name}
                                                </Badge>
                                            )}
                                            
                                            <div className="text-right">
                                                <div className="text-sm font-medium">
                                                    {user.role_permissions_count} role permissions
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    {user.custom_privileges_count} custom overrides
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {users.length === 0 && (
                            <div className="text-center py-12">
                                <Key className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                <h3 className="text-lg font-semibold mb-2">No Users Found</h3>
                                <p className="text-muted-foreground">
                                    Try adjusting your search or filter criteria
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
