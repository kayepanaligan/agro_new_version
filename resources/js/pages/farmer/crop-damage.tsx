import FarmerLayout from '@/layouts/farmer-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/farmer/dashboard' },
    { title: 'Crop Damage Reports', href: '/farmer/crop-damage' },
];

export default function FarmerCropDamage() {
    return (
        <FarmerLayout breadcrumbs={breadcrumbs}>
            <Head title="Crop Damage Reports" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <h1 className="text-3xl font-bold">Crop Damage Reports</h1>
                <Card>
                    <CardContent className="py-12 text-center">
                        <p className="text-muted-foreground">Crop damage reporting form will be implemented here with camera capture and environmental data collection</p>
                    </CardContent>
                </Card>
            </div>
        </FarmerLayout>
    );
}
