import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Key, Search, User, Shield, RotateCcw, ChevronRight, CheckCircle2, AlertCircle } from 'lucide-react';

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

const AVATAR_COLORS = [
    { bg: 'bg-emerald-100', text: 'text-emerald-700' },
    { bg: 'bg-sky-100',     text: 'text-sky-700'     },
    { bg: 'bg-violet-100',  text: 'text-violet-700'  },
    { bg: 'bg-amber-100',   text: 'text-amber-700'   },
    { bg: 'bg-rose-100',    text: 'text-rose-700'    },
];

function getInitials(name: string) {
    return name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
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

    const totalPermissions = users.reduce(
        (sum, u) => sum + u.role_permissions_count + u.custom_privileges_count, 0
    );
    const withOverrides = users.filter((u) => u.custom_privileges_count > 0).length;
    const roleOnly     = users.filter((u) => u.custom_privileges_count === 0).length;

    return (
        <AppLayout>
            <Head title="User Privileges" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">

                {/* Page Header */}
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-sm">
                            <Key className="h-5 w-5" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-semibold tracking-tight">User Privileges</h1>
                            <p className="text-sm text-muted-foreground">Manage individual user permissions and access overrides</p>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    {[
                        { label: 'Total Users',          value: users.length,    accent: 'border-l-emerald-500' },
                        { label: 'Custom Overrides',     value: withOverrides,   accent: 'border-l-sky-400'     },
                        { label: 'Role-Only Access',     value: roleOnly,        accent: 'border-l-amber-400'   },
                        { label: 'Total Permissions',    value: totalPermissions,accent: 'border-l-violet-400'  },
                    ].map((s) => (
                        <div key={s.label} className={`rounded-lg border bg-card p-4 shadow-sm border-l-4 ${s.accent}`}>
                            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{s.label}</p>
                            <p className="mt-1 text-2xl font-bold">{s.value.toLocaleString()}</p>
                        </div>
                    ))}
                </div>

                {/* Main card */}
                <div className="rounded-xl border bg-card shadow-sm overflow-hidden">

                    {/* Toolbar */}
                    <div className="flex flex-col gap-3 border-b px-6 py-4 sm:flex-row sm:items-center">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by name or email..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                className="pl-9 h-9 text-sm"
                            />
                        </div>

                        <Select value={roleId || 'all'} onValueChange={(v) => setRoleId(v === 'all' ? '' : v)}>
                            <SelectTrigger className="h-9 w-full sm:w-[180px] text-sm">
                                <SelectValue placeholder="Filter by role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Roles</SelectItem>
                                {roles.map((r) => (
                                    <SelectItem key={r.id} value={r.id.toString()}>{r.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <div className="flex gap-2">
                            <Button onClick={handleSearch} className="h-9 bg-emerald-600 hover:bg-emerald-700 text-white">
                                <Search className="h-4 w-4 mr-1.5" />
                                Search
                            </Button>
                            <Button variant="outline" onClick={handleReset} className="h-9 px-3" title="Reset filters">
                                <RotateCcw className="h-4 w-4" />
                            </Button>
                        </div>

                        <span className="text-xs text-muted-foreground sm:ml-auto whitespace-nowrap">
                            {users.length} user{users.length !== 1 ? 's' : ''}
                        </span>
                    </div>

                    {/* User list */}
                    {users.length === 0 ? (
                        <div className="flex flex-col items-center gap-2 py-16 text-muted-foreground">
                            <Key className="h-9 w-9 opacity-25" />
                            <p className="text-sm font-semibold text-foreground">No users found</p>
                            <p className="text-xs">Try adjusting your search or filter.</p>
                        </div>
                    ) : (
                        <ul className="divide-y">
                            {users.map((user, i) => {
                                const color = AVATAR_COLORS[i % AVATAR_COLORS.length];
                                const hasOverrides = user.custom_privileges_count > 0;

                                return (
                                    <li key={user.id}>
                                        <Link
                                            href={`/super-admin/privileges/${user.id}`}
                                            className="flex items-center gap-4 px-6 py-4 hover:bg-muted/30 transition-colors group"
                                        >
                                            {/* Avatar */}
                                            <div className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${color.bg} ${color.text}`}>
                                                {getInitials(user.full_name)}
                                            </div>

                                            {/* Name + email */}
                                            <div className="flex-1 min-w-0">
                                                <div className="font-semibold text-sm truncate">{user.full_name}</div>
                                                <div className="text-xs text-muted-foreground truncate">{user.email}</div>
                                            </div>

                                            {/* Role badge */}
                                            <div className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-muted-foreground bg-muted/60 border rounded-full px-3 py-1 flex-shrink-0">
                                                <Shield className="h-3 w-3" />
                                                {user.role?.name ?? 'No role'}
                                            </div>

                                            {/* Permissions summary */}
                                            <div className="hidden md:flex flex-col items-end gap-0.5 flex-shrink-0 min-w-[140px]">
                                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                    <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                                                    <span>{user.role_permissions_count} role permission{user.role_permissions_count !== 1 ? 's' : ''}</span>
                                                </div>
                                                <div className={`flex items-center gap-1.5 text-xs ${hasOverrides ? 'text-sky-600 font-medium' : 'text-muted-foreground'}`}>
                                                    <AlertCircle className={`h-3 w-3 ${hasOverrides ? 'text-sky-500' : 'text-muted-foreground/50'}`} />
                                                    <span>{user.custom_privileges_count} custom override{user.custom_privileges_count !== 1 ? 's' : ''}</span>
                                                </div>
                                            </div>

                                            {/* Arrow */}
                                            <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors flex-shrink-0" />
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
