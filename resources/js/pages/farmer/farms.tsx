import FarmerLayout from '@/layouts/farmer-layout';
import { type BreadcrumbItem, type Farm } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sprout, Map } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/farmer/dashboard' },
    { title: 'My Farms', href: '/farmer/farms' },
];

interface FarmerFarmsProps {
    farms: (Farm & { farm_parcels_count: number })[];
}

export default function FarmerFarms({ farms }: FarmerFarmsProps) {
    return (
        <FarmerLayout breadcrumbs={breadcrumbs}>
            <Head title="My Farms" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <h1 className="text-3xl font-bold">My Farms & Parcels</h1>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {farms.map((farm) => (
                        <Card key={farm.id}>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Sprout className="h-5 w-5" />
                                    {farm.farm_name}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Map className="h-4 w-4" />
                                        <span>{farm.farm_parcels_count} parcel(s)</span>
                                    </div>
                                    <p className="text-sm">FID: {farm.fid || 'N/A'}</p>
                                    <Button asChild variant="outline" className="w-full mt-4">
                                        <Link href={`/farmer/farms/${farm.id}`}>View Details</Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {farms.length === 0 && (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <p className="text-muted-foreground">No farms registered yet</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </FarmerLayout>
    );
}
