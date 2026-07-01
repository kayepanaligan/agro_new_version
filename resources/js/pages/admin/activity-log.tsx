import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Download, Filter } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Activity Log', href: '/admin/activity-log' },
];

interface Activity {
    id: number;
    farmer_name: string;
    farmer_lfid: string;
    activity_name: string;
    description: string | null;
    category: string;
    points: number;
    status: string;
    is_manual: boolean;
    awarded_by: string | null;
    admin_notes: string | null;
    created_at: string;
    verified_at: string | null;
}

export default function ActivityLog() {
    const { activities, stats, categories } = usePage<{
        activities: Activity[];
        stats: {
            total_activities: number;
            this_week: number;
            this_month: number;
            manual_count: number;
            auto_count: number;
        };
        categories: string[];
    }>().props;

    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [sourceFilter, setSourceFilter] = useState<string>('all');

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'verified':
                return <Badge className="bg-green-100 text-green-800 border-green-200">Verified</Badge>;
            case 'pending':
                return <Badge className="bg-amber-100 text-amber-800 border-amber-200">Pending</Badge>;
            case 'rejected':
                return <Badge variant="destructive">Rejected</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const filteredActivities = (activities || []).filter(activity => {
        const matchesSearch = `${activity.farmer_name} ${activity.farmer_lfid} ${activity.activity_name}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === 'all' || activity.category === categoryFilter;
        const matchesSource = sourceFilter === 'all' || 
            (sourceFilter === 'manual' && activity.is_manual) ||
            (sourceFilter === 'auto' && !activity.is_manual);
        return matchesSearch && matchesCategory && matchesSource;
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Activity Log" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6">
                {/* Page Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Activity Log</h1>
                        <p className="text-muted-foreground mt-1">
                            Monitor all point-earning activities and engagement
                        </p>
                    </div>
                    <Button variant="outline" onClick={() => router.get('/admin/activity-log/export')}>
                        <Download className="mr-2 h-4 w-4" />
                        Export CSV
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-sm text-muted-foreground">Total Activities</p>
                            <p className="text-2xl font-bold mt-1">{stats?.total_activities || 0}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-sm text-muted-foreground">This Week</p>
                            <p className="text-2xl font-bold mt-1">{stats?.this_week || 0}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-sm text-muted-foreground">This Month</p>
                            <p className="text-2xl font-bold mt-1">{stats?.this_month || 0}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-sm text-muted-foreground">Manual / Auto</p>
                            <p className="text-2xl font-bold mt-1">
                                {stats?.manual_count || 0} / {stats?.auto_count || 0}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Activity Table */}
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="relative flex-1 max-w-sm">
                                <input
                                    type="text"
                                    placeholder="Search activities..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full h-9 px-3 py-1 text-sm border rounded-md"
                                />
                            </div>
                            <select
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                className="h-9 px-3 text-sm border rounded-md"
                            >
                                <option value="all">All Categories</option>
                                {(categories || []).map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                            <select
                                value={sourceFilter}
                                onChange={(e) => setSourceFilter(e.target.value)}
                                className="h-9 px-3 text-sm border rounded-md"
                            >
                                <option value="all">All Sources</option>
                                <option value="manual">Manual Only</option>
                                <option value="auto">Automatic Only</option>
                            </select>
                            <p className="text-sm text-muted-foreground ml-auto">
                                {filteredActivities.length} activit{filteredActivities.length !== 1 ? 'ies' : 'y'}
                            </p>
                        </div>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date/Time</TableHead>
                                    <TableHead>Farmer</TableHead>
                                    <TableHead>Activity</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead className="text-right">Points</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Source</TableHead>
                                    <TableHead>Awarded By</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredActivities.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                            No activities found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredActivities.map((activity) => (
                                        <TableRow key={activity.id}>
                                            <TableCell className="text-sm">
                                                {new Date(activity.created_at).toLocaleString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium text-sm">{activity.farmer_name}</p>
                                                    <p className="text-xs text-muted-foreground font-mono">
                                                        {activity.farmer_lfid}
                                                    </p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <p className="text-sm font-medium">{activity.activity_name}</p>
                                                    {activity.description && (
                                                        <p className="text-xs text-muted-foreground truncate max-w-xs">
                                                            {activity.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="capitalize">
                                                    {activity.category}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className={`text-right font-bold ${
                                                activity.points > 0 ? 'text-emerald-600' : 'text-red-600'
                                            }`}>
                                                {activity.points > 0 ? '+' : ''}{activity.points}
                                            </TableCell>
                                            <TableCell>
                                                {getStatusBadge(activity.status)}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={activity.is_manual ? 'default' : 'secondary'}>
                                                    {activity.is_manual ? 'Manual' : 'Auto'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {activity.awarded_by || 'System'}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
