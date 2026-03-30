import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Commodity, type Farmer, type Organization, type Program, type Variety } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { ArrowUpDown, MoreHorizontal, Pencil, Search, Trash2, User } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ComprehensiveFarmerForm from './farmers/forms/comprehensive-farmer-form';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Farmers',
        href: '/admin/farmers',
    },
];

type SortField = 'last_name' | 'first_name' | 'rsbsa_number' | 'created_at';
type SortOrder = 'asc' | 'desc';

export default function Farmers() {
    const { farmers, commodities, varieties, organizations, programs } = usePage<{
        farmers: Farmer[];
        commodities: Commodity[];
        varieties: Variety[];
        organizations: Organization[];
        programs: Program[];
    }>().props;

    const [searchTerm, setSearchTerm] = useState('');
    const [sortField, setSortField] = useState<SortField>('last_name');
    const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedFarmer, setSelectedFarmer] = useState<Farmer | null>(null);
    const [formData, setFormData] = useState<{
        rsbsa_number: string;
        first_name: string;
        last_name: string;
        middle_name: string;
        extension_name: string;
        sex: 'Male' | 'Female' | 'Other';
        birthdate: string;
        picture_id: string;
        enrollment_type: 'new' | 'updating';
        enrollment_updated_at: string;
        contact_number: string;
        landline_number: string;
        civil_status: 'single' | 'married' | 'widowed' | 'separated' | '';
        spouse_first_name: string;
        spouse_middle_name: string;
        spouse_surname: string;
        spouse_extension_name: string;
        house_lot_bldg_no_purok: string;
        street_sitio_subdv: string;
        barangay: string;
        municipality_city: string;
        province: string;
        region: string;
        place_of_birth_municipality: string;
        place_of_birth_province: string;
        place_of_birth_country: string;
        religion: 'christianity' | 'islam' | 'others' | '';
        is_household_head: boolean;
        household_head_first_name: string;
        household_head_middle_name: string;
        household_head_surname: string;
        household_head_extension_name: string;
        relationship_to_household_head: string;
        no_living_household_members: number;
        no_male_household_members: number;
        no_female_household_members: number;
        highest_formal_education: string;
        is_pwd: boolean;
        is_4ps_beneficiary: boolean;
        is_ip: boolean;
        ip_specify: string;
        government_id_type: string;
        government_id_number: string;
        government_ids: Array<{ id_type: string; id_number: string }>;
        farm_name: string;
        farm_parcels: any[];
        emergency_contact_first_name: string;
        emergency_contact_middle_name: string;
        emergency_contact_last_name: string;
        emergency_contact_extension_name: string;
        emergency_contact_number: string;
    }>({
        // Basic Info
        rsbsa_number: '',
        first_name: '',
        last_name: '',
        middle_name: '',
        extension_name: '',
        sex: 'Male' as 'Male' | 'Female' | 'Other',
        birthdate: '',
        picture_id: '',
        
        // Enrollment
        enrollment_type: 'new' as 'new' | 'updating',
        enrollment_updated_at: '',
        
        // Contact
        contact_number: '',
        landline_number: '',
        
        // Civil Status & Spouse
        civil_status: '' as 'single' | 'married' | 'widowed' | 'separated' | '',
        spouse_first_name: '',
        spouse_middle_name: '',
        spouse_surname: '',
        spouse_extension_name: '',
        
        // Address
        house_lot_bldg_no_purok: '',
        street_sitio_subdv: '',
        barangay: '',
        municipality_city: '',
        province: '',
        region: '',
        
        // Birthplace & Religion
        place_of_birth_municipality: '',
        place_of_birth_province: '',
        place_of_birth_country: 'Philippines',
        religion: '' as 'christianity' | 'islam' | 'others' | '',
        
        // Household
        is_household_head: false,
        household_head_first_name: '',
        household_head_middle_name: '',
        household_head_surname: '',
        household_head_extension_name: '',
        relationship_to_household_head: '',
        no_living_household_members: 0,
        no_male_household_members: 0,
        no_female_household_members: 0,
        
        // Education
        highest_formal_education: '' as 'pre_school' | 'elementary' | 'high_school_non_k12' | 'junior_hs_k12' | 'senior_hs_k12' | 'college' | 'vocational' | 'post_graduate' | 'none' | '',
        
        // Special Fields
        is_pwd: false,
        is_4ps_beneficiary: false,
        is_ip: false,
        ip_specify: '',
        
        // Government ID
        government_id_type: '',
        government_id_number: '',
        government_ids: [], // Array for multiple IDs
        
        // Farm Profile
        farm_name: '',
        farm_parcels: [], // Array of farm parcels
        
        // Emergency Contact
        emergency_contact_first_name: '',
        emergency_contact_middle_name: '',
        emergency_contact_last_name: '',
        emergency_contact_extension_name: '',
        emergency_contact_number: '',
    });

    // Filter and sort farmers
    const filteredFarmers = useMemo(() => {
        let result = [...farmers];

        // Search filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(
                (farmer) =>
                    farmer.first_name.toLowerCase().includes(term) ||
                    farmer.last_name.toLowerCase().includes(term) ||
                    farmer.middle_name?.toLowerCase().includes(term) ||
                    farmer.rsbsa_number?.toLowerCase().includes(term) ||
                    farmer.contact_number?.includes(term),
            );
        }

        // Sorting
        result.sort((a, b) => {
            let aValue: any = a[sortField];
            let bValue: any = b[sortField];

            if (sortField === 'last_name' || sortField === 'first_name') {
                aValue = aValue.toLowerCase();
                bValue = bValue.toLowerCase();
            } else if (sortField === 'rsbsa_number') {
                aValue = aValue || '';
                bValue = bValue || '';
            }

            if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });

        return result;
    }, [farmers, searchTerm, sortField, sortOrder]);

    // Pagination
    const totalPages = Math.ceil(filteredFarmers.length / itemsPerPage);
    const paginatedFarmers = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredFarmers.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredFarmers, currentPage, itemsPerPage]);

    // Reset to page 1 when filters change
    useMemo(() => {
        setCurrentPage(1);
    }, [searchTerm, sortField, sortOrder]);

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
    };

    const handleCreate = () => {
        // Validate farm name if farm parcels are provided
        if (formData.farm_parcels && formData.farm_parcels.length > 0 && (!formData.farm_name || formData.farm_name.trim() === '')) {
            alert('Please enter a farm name before adding farm parcels.');
            return;
        }

        router.post('/admin/farmers', formData, {
            preserveScroll: true,
            onSuccess: () => {
                setIsCreateModalOpen(false);
                resetForm();
            },
        });
    };

    const handleUpdate = () => {
        if (!selectedFarmer) return;

        // Validate farm name if farm parcels are provided
        if (formData.farm_parcels && formData.farm_parcels.length > 0 && (!formData.farm_name || formData.farm_name.trim() === '')) {
            alert('Please enter a farm name before adding farm parcels.');
            return;
        }

        router.put(`/admin/farmers/${selectedFarmer.id}`, formData, {
            preserveScroll: true,
            onSuccess: () => {
                setIsEditModalOpen(false);
                resetForm();
                setSelectedFarmer(null);
            },
        });
    };

    const handleDelete = () => {
        if (!selectedFarmer) return;

        router.delete(`/admin/farmers/${selectedFarmer.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setIsDeleteModalOpen(false);
                setSelectedFarmer(null);
            },
        });
    };

    const openEditModal = (farmer: Farmer) => {
        setSelectedFarmer(farmer);
        
        // Get existing farms for this farmer
        const farmerFarms = farmer.farms || [];
        
        setFormData({
            // Basic Info
            rsbsa_number: farmer.rsbsa_number || '',
            first_name: farmer.first_name,
            last_name: farmer.last_name,
            middle_name: farmer.middle_name || '',
            extension_name: farmer.extension_name || '',
            sex: farmer.sex,
            birthdate: farmer.birthdate || '',
            picture_id: farmer.picture_id || '',
            
            // Enrollment
            enrollment_type: farmer.enrollment_type || 'new',
            enrollment_updated_at: farmer.enrollment_updated_at || '',
            
            // Contact
            contact_number: farmer.contact_number || '',
            landline_number: farmer.landline_number || '',
            
            // Civil Status & Spouse
            civil_status: farmer.civil_status || '',
            spouse_first_name: farmer.spouse_first_name || '',
            spouse_middle_name: farmer.spouse_middle_name || '',
            spouse_surname: farmer.spouse_surname || '',
            spouse_extension_name: farmer.spouse_extension_name || '',
            
            // Address
            house_lot_bldg_no_purok: farmer.house_lot_bldg_no_purok || '',
            street_sitio_subdv: farmer.street_sitio_subdv || '',
            barangay: farmer.barangay || '',
            municipality_city: farmer.municipality_city || '',
            province: farmer.province || '',
            region: farmer.region || '',
            
            // Birthplace & Religion
            place_of_birth_municipality: farmer.place_of_birth_municipality || '',
            place_of_birth_province: farmer.place_of_birth_province || '',
            place_of_birth_country: farmer.place_of_birth_country || 'Philippines',
            religion: farmer.religion || '',
            
            // Household
            is_household_head: farmer.is_household_head || false,
            household_head_first_name: farmer.household_head_first_name || '',
            household_head_middle_name: farmer.household_head_middle_name || '',
            household_head_surname: farmer.household_head_surname || '',
            household_head_extension_name: farmer.household_head_extension_name || '',
            relationship_to_household_head: farmer.relationship_to_household_head || '',
            no_living_household_members: farmer.no_living_household_members || 0,
            no_male_household_members: farmer.no_male_household_members || 0,
            no_female_household_members: farmer.no_female_household_members || 0,
            
            // Education
            highest_formal_education: farmer.highest_formal_education || '',
            
            // Special Fields
            is_pwd: farmer.is_pwd || false,
            is_4ps_beneficiary: farmer.is_4ps_beneficiary || false,
            is_ip: farmer.is_ip || false,
            ip_specify: farmer.ip_specify || '',
            
            // Government ID
            government_id_type: farmer.government_id_type || '',
            government_id_number: farmer.government_id_number || '',
            government_ids: [], // Initialize as empty array for new form
            
            // Farm Profile
            farm_name: farmer.farm_name || '',
            farm_parcels: [], // Initialize as empty array for new form
            
            // Emergency Contact
            emergency_contact_first_name: farmer.emergency_contact_first_name || '',
            emergency_contact_middle_name: farmer.emergency_contact_middle_name || '',
            emergency_contact_last_name: farmer.emergency_contact_last_name || '',
            emergency_contact_extension_name: farmer.emergency_contact_extension_name || '',
            emergency_contact_number: farmer.emergency_contact_number || '',
        });
        setIsEditModalOpen(true);
    };

    const openDeleteModal = (farmer: Farmer) => {
        setSelectedFarmer(farmer);
        setIsDeleteModalOpen(true);
    };

    const resetForm = () => {
        setFormData({
            // Basic Info
            rsbsa_number: '',
            first_name: '',
            last_name: '',
            middle_name: '',
            extension_name: '',
            sex: 'Male',
            birthdate: '',
            picture_id: '',
            
            // Enrollment
            enrollment_type: 'new',
            enrollment_updated_at: '',
            
            // Contact
            contact_number: '',
            landline_number: '',
            
            // Civil Status & Spouse
            civil_status: '',
            spouse_first_name: '',
            spouse_middle_name: '',
            spouse_surname: '',
            spouse_extension_name: '',
            
            // Address
            house_lot_bldg_no_purok: '',
            street_sitio_subdv: '',
            barangay: '',
            municipality_city: '',
            province: '',
            region: '',
            
            // Birthplace & Religion
            place_of_birth_municipality: '',
            place_of_birth_province: '',
            place_of_birth_country: 'Philippines',
            religion: '',
            
            // Household
            is_household_head: false,
            household_head_first_name: '',
            household_head_middle_name: '',
            household_head_surname: '',
            household_head_extension_name: '',
            relationship_to_household_head: '',
            no_living_household_members: 0,
            no_male_household_members: 0,
            no_female_household_members: 0,
            
            // Education
            highest_formal_education: '',
            
            // Special Fields
            is_pwd: false,
            is_4ps_beneficiary: false,
            is_ip: false,
            ip_specify: '',
            
            // Government ID
            government_id_type: '',
            government_id_number: '',
            government_ids: [], // Initialize as empty array
            
            // Farm Profile
            farm_name: '',
            farm_parcels: [], // Initialize as empty array
            
            // Emergency Contact
            emergency_contact_first_name: '',
            emergency_contact_middle_name: '',
            emergency_contact_last_name: '',
            emergency_contact_extension_name: '',
            emergency_contact_number: '',
        });
        setSelectedFarmer(null);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Farmers" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="rounded-xl border bg-card shadow-sm">
                    <div className="p-6">
                        <h1 className="mb-2 text-3xl font-bold">Farmers</h1>
                        <p className="text-muted-foreground">Manage farmer registry and information</p>
                    </div>

                    <div className="border-t p-6">
                        {/* Header with Add button */}
                        <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div className="relative flex-1 max-w-sm">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search farmers..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9"
                                />
                            </div>

                            <Button onClick={() => setIsCreateModalOpen(true)}>
                                Add Farmer
                            </Button>
                        </div>

                        {/* Results count */}
                        <div className="mb-4 text-sm text-muted-foreground">
                            Showing {paginatedFarmers.length} of {filteredFarmers.length} farmers
                        </div>

                        {/* Table */}
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                      
                                        <TableHead>ID</TableHead>
                                          <TableHead>Picture</TableHead>
                                        <TableHead>RSBSA No.</TableHead>
                                        <TableHead>
                                            <Button variant="ghost" onClick={() => handleSort('last_name')} className="-ml-4">
                                                Last Name
                                                <ArrowUpDown className="ml-2 h-4 w-4" />
                                            </Button>
                                        </TableHead>
                                        <TableHead>
                                            <Button variant="ghost" onClick={() => handleSort('first_name')} className="-ml-4">
                                                First Name
                                                <ArrowUpDown className="ml-2 h-4 w-4" />
                                            </Button>
                                        </TableHead>
                                        <TableHead>Middle Name</TableHead>
                                        <TableHead>Sex</TableHead>
                                        <TableHead>Contact</TableHead>
                                        <TableHead>Civil Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paginatedFarmers.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={10} className="h-24 text-center">
                                                No farmers found. Click "Add Farmer" to create one.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        paginatedFarmers.map((farmer) => (
                                            <TableRow 
                                                key={farmer.id}
                                                className="cursor-pointer hover:bg-muted/50"
                                                onClick={() => router.visit(`/admin/farmers/${farmer.id}`)}
                                            >
                                                 <TableCell className="font-medium">{farmer.id}</TableCell>
                                                <TableCell>
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted overflow-hidden">
                                                        {farmer.picture_id ? (
                                                            <img 
                                                                src={farmer.picture_id} 
                                                                alt={`${farmer.first_name} ${farmer.last_name}`}
                                                                className="h-full w-full object-cover"
                                                            />
                                                        ) : (
                                                            <User className="h-5 w-5 text-muted-foreground" />
                                                        )}
                                                    </div>
                                                </TableCell>
                                               
                                                <TableCell>{farmer.rsbsa_number || '-'}</TableCell>
                                                <TableCell className="font-medium">{farmer.last_name}</TableCell>
                                                <TableCell>{farmer.first_name}</TableCell>
                                                <TableCell>{farmer.middle_name || '-'}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">{farmer.sex}</Badge>
                                                </TableCell>
                                                <TableCell>{farmer.contact_number || '-'}</TableCell>
                                                <TableCell>{farmer.civil_status || '-'}</TableCell>
                                                <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem onClick={() => openEditModal(farmer)}>
                                                                <Pencil className="mr-2 h-4 w-4" />
                                                                <span>Edit</span>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem 
                                                                onClick={() => openDeleteModal(farmer)}
                                                                className="text-red-600 focus:text-red-600"
                                                            >
                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                <span>Delete</span>
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="border-t p-6">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-muted-foreground">
                                    Page {currentPage} of {totalPages}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                    >
                                        Previous
                                    </Button>
                                    
                                    <div className="flex items-center gap-1">
                                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                            let pageNum;
                                            if (totalPages <= 5) {
                                                pageNum = i + 1;
                                            } else if (currentPage <= 3) {
                                                pageNum = i + 1;
                                            } else if (currentPage >= totalPages - 2) {
                                                pageNum = totalPages - 4 + i;
                                            } else {
                                                pageNum = currentPage - 2 + i;
                                            }
                                            
                                            return (
                                                <Button
                                                    key={pageNum}
                                                    variant={currentPage === pageNum ? 'default' : 'outline'}
                                                    size="sm"
                                                    onClick={() => setCurrentPage(pageNum)}
                                                    className="w-10"
                                                >
                                                    {pageNum}
                                                </Button>
                                            );
                                        })}
                                    </div>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Create Modal */}
            <Dialog open={isCreateModalOpen} onOpenChange={(open) => { setIsCreateModalOpen(open); if (!open) resetForm(); }}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Create Farmer</DialogTitle>
                        <DialogDescription>
                            Add a new farmer to the registry. Fill in the details below.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <ComprehensiveFarmerForm 
                            formData={formData} 
                            setFormData={setFormData} 
                            mode="create"
                            existingFarms={[]}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreate}>
                            Create Farmer
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Modal */}
            <Dialog open={isEditModalOpen} onOpenChange={(open) => { setIsEditModalOpen(open); if (!open) resetForm(); }}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Farmer</DialogTitle>
                        <DialogDescription>
                            Update farmer information. Fill in the details below.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <ComprehensiveFarmerForm 
                            formData={formData} 
                            setFormData={setFormData} 
                            mode="edit"
                            existingFarms={selectedFarmer?.farms || []}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleUpdate}>
                            Update Farmer
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Modal */}
            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Farmer</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "{selectedFarmer?.first_name} {selectedFarmer?.last_name}"? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
