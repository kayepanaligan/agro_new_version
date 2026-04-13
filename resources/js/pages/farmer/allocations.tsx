import FarmerLayout from '@/layouts/farmer-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/farmer/dashboard' },
    { title: 'My Allocations', href: '/farmer/allocations' },
];

export default function FarmerAllocations() {
    return (
        <FarmerLayout breadcrumbs={breadcrumbs}>
            <Head title="My Allocations" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <h1 className="text-3xl font-bold">My Allocations</h1>
                <Card>
                    <CardContent className="py-12 text-center">
                        <p className="text-muted-foreground">Allocation history will be displayed here</p>
                    </CardContent>
                </Card>
            </div>
        </FarmerLayout>
    );
}
