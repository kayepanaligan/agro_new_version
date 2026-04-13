import FarmerLayout from '@/layouts/farmer-layout';
import { type BreadcrumbItem, type Farmer, type Announcement } from '@/types';
import { Head } from '@inertiajs/react';
import { Sprout, Map, AlertTriangle, Package, Megaphone, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/farmer/dashboard' },
];

interface FarmerDashboardProps {
    farmer: Farmer;
    stats: {
        total_farms: number;
        total_parcels: number;
        pending_damage_reports: number;
        total_allocations: number;
    };
    recentAnnouncements: Announcement[];
}

export default function FarmerDashboard({ farmer, stats, recentAnnouncements }: FarmerDashboardProps) {
    return (
        <FarmerLayout breadcrumbs={breadcrumbs}>
            <Head title="Farmer Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Welcome, {farmer.first_name} {farmer.last_name}!</h1>
                        <p className="text-muted-foreground">LFID: {farmer.lfid}</p>
                    </div>
                    <Button asChild>
                        <Link href="/farmer/crop-damage">
                            <Plus className="mr-2 h-4 w-4" />
                            Report Crop Damage
                        </Link>
                    </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Farms</CardTitle>
                            <Sprout className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_farms}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Farm Parcels</CardTitle>
                            <Map className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_parcels}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending Reports</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.pending_damage_reports}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Allocations</CardTitle>
                            <Package className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_allocations}</div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Megaphone className="h-5 w-5" />
                            Recent Announcements
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {recentAnnouncements.length > 0 ? (
                            <div className="space-y-4">
                                {recentAnnouncements.map((announcement) => (
                                    <div key={announcement.id} className="rounded-lg border p-4">
                                        <div className="flex items-start justify-between">
                                            <div className="space-y-1">
                                                <h3 className="font-medium">{announcement.title}</h3>
                                                <p className="text-sm text-muted-foreground line-clamp-2">{announcement.content}</p>
                                            </div>
                                            <Badge variant={
                                                announcement.priority === 'urgent' ? 'destructive' :
                                                announcement.priority === 'high' ? 'default' :
                                                announcement.priority === 'medium' ? 'secondary' : 'outline'
                                            }>
                                                {announcement.priority}
                                            </Badge>
                                        </div>
                                        <p className="mt-2 text-xs text-muted-foreground">
                                            {new Date(announcement.published_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                ))}
                                <Button variant="outline" asChild className="w-full">
                                    <Link href="/farmer/announcements">View All Announcements</Link>
                                </Button>
                            </div>
                        ) : (
                            <p className="text-muted-foreground text-center py-8">No announcements at this time</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </FarmerLayout>
    );
}
