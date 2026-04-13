import FarmerLayout from '@/layouts/farmer-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/farmer/dashboard' },
    { title: 'Eligible Allocations', href: '/farmer/allocations/eligible' },
];

export default function FarmerEligibleAllocations() {
    return (
        <FarmerLayout breadcrumbs={breadcrumbs}>
            <Head title="Eligible Allocations" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <h1 className="text-3xl font-bold">Eligible Allocations</h1>
                <Card>
                    <CardContent className="py-12 text-center">
                        <p className="text-muted-foreground">Eligible allocations based on your profile will be shown here</p>
                    </CardContent>
                </Card>
            </div>
        </FarmerLayout>
    );
}
