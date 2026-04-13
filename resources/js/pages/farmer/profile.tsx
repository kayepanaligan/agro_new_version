import FarmerLayout from '@/layouts/farmer-layout';
import { type BreadcrumbItem, type Farmer } from '@/types';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Phone, Mail, MapPin, Calendar } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/farmer/dashboard' },
    { title: 'My Profile', href: '/farmer/profile' },
];

interface FarmerProfileProps {
    farmer: Farmer;
}

export default function FarmerProfile({ farmer }: FarmerProfileProps) {
    return (
        <FarmerLayout breadcrumbs={breadcrumbs}>
            <Head title="My Profile" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <h1 className="text-3xl font-bold">My Profile</h1>

                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Personal Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                                <p className="text-lg">{farmer.first_name} {farmer.middle_name} {farmer.last_name}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Sex</label>
                                <p>{farmer.sex}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Birthdate</label>
                                <p>{farmer.birthdate || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Civil Status</label>
                                <p>{farmer.civil_status || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">LFID</label>
                                <Badge variant="secondary">{farmer.lfid}</Badge>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Registration Status</label>
                                <Badge>{farmer.registration_status || 'N/A'}</Badge>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Phone className="h-5 w-5" />
                                Contact Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Contact Number</label>
                                <p>{farmer.contact_number || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Address</label>
                                <p>{farmer.house_lot_bldg_no_purok && `${farmer.house_lot_bldg_no_purok}, `}{farmer.street_sitio_subdv && `${farmer.street_sitio_subdv}, `}{farmer.barangay && `${farmer.barangay}, `}{farmer.municipality_city && `${farmer.municipality_city}, `}{farmer.province}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </FarmerLayout>
    );
}
