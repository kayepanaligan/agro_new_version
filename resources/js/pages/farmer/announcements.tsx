import FarmerLayout from '@/layouts/farmer-layout';
import { type BreadcrumbItem, type Announcement } from '@/types';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Megaphone } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/farmer/dashboard' },
    { title: 'Announcements', href: '/farmer/announcements' },
];

interface FarmerAnnouncementsProps {
    announcements: Announcement[];
}

export default function FarmerAnnouncements({ announcements }: FarmerAnnouncementsProps) {
    return (
        <FarmerLayout breadcrumbs={breadcrumbs}>
            <Head title="Announcements" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <h1 className="text-3xl font-bold">Announcements</h1>

                <div className="space-y-4">
                    {announcements.map((announcement) => (
                        <Card key={announcement.id}>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <CardTitle className="flex items-center gap-2">
                                        <Megaphone className="h-5 w-5" />
                                        {announcement.title}
                                    </CardTitle>
                                    <Badge variant={
                                        announcement.priority === 'urgent' ? 'destructive' :
                                        announcement.priority === 'high' ? 'default' :
                                        announcement.priority === 'medium' ? 'secondary' : 'outline'
                                    }>
                                        {announcement.priority}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">{announcement.content}</p>
                                <p className="text-sm text-muted-foreground mt-4">
                                    Published: {new Date(announcement.published_at).toLocaleDateString()}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {announcements.length === 0 && (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <p className="text-muted-foreground">No announcements at this time</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </FarmerLayout>
    );
}
