import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Commodity, type Farmer, type Organization, type Program, type Variety } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { ArrowUpDown, MoreHorizontal, Pencil, Search, Trash2, User, List, LayoutGrid, QrCode, Users, UserCheck, UserX, Clock, BarChart3, PieChart as PieChartIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
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
import { KpiCard } from '@/components/agro-profiler/kpi-card';
import { Pagination } from '@/components/agro-profiler/pagination';
import { ExportButtons } from '@/components/agro-profiler/export-buttons';
import { NarrativeCard } from '@/components/agro-profiler/narrative-card';
import { DashboardDateFilter, type DateRange } from '@/components/agro-profiler/dashboard-date-filter';
import { exportToCsv, exportToPdf } from '@/lib/export';
import BarChart from '@/components/charts/BarChart';
import PieChart from '@/components/charts/PieChart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
    const { farmers, categories, commodities, varieties, organizations, programs } = usePage<{
        farmers: Farmer[];
        categories: any[];
        commodities: Commodity[];
        varieties: Variety[];
        organizations: Organization[];
        programs: Program[];
    }>().props;

    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState<'list' | 'card'>(() => {
        // Initialize from localStorage if available
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('farmerViewMode');
            if (saved === 'card' || saved === 'list') {
                return saved;
            }
        }
        return 'list'; // Default to list view
    });
    const [sortField, setSortField] = useState<SortField>('last_name');
    const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isQrModalOpen, setIsQrModalOpen] = useState(false);
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
            preserveScroll: false,
            onSuccess: () => {
                setIsCreateModalOpen(false);
                resetForm();
            },
            onError: (errors) => {
                console.error('Create error:', errors);
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
            preserveScroll: false,
            onSuccess: () => {
                setIsEditModalOpen(false);
                resetForm();
                setSelectedFarmer(null);
            },
            onError: (errors) => {
                console.error('Update error:', errors);
            },
        });
    };

    const handleDelete = () => {
        if (!selectedFarmer) return;

        router.delete(`/admin/farmers/${selectedFarmer.id}`, {
            preserveScroll: false,
            onSuccess: () => {
                setIsDeleteModalOpen(false);
                setSelectedFarmer(null);
            },
            onError: (errors) => {
                console.error('Delete error:', errors);
            },
        });
    };

    const openEditModal = (farmer: Farmer) => {
        setSelectedFarmer(farmer);
        
        const farmerFarms = farmer.farms || [];
        
        setFormData({
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

    // KPI counts
    const kpiCounts = useMemo(() => {
        const total = farmers.length;
        const verified = farmers.filter(f => f.registration_status === 'verified').length;
        const pending = farmers.filter(f => f.registration_status === 'for_submission' || f.registration_status === 'submitted_to_da').length;
        const rejected = farmers.filter(f => f.registration_status === 'rejected').length;
        return { total, verified, pending, rejected };
    }, [farmers]);

    const handleExportCsv = () => {
        const headers = ['LFID', 'Last Name', 'First Name', 'Middle Name', 'Sex', 'RSBSA', 'Contact', 'Status'];
        const rows = filteredFarmers.map(f => [
            f.lfid || '', f.last_name, f.first_name, f.middle_name || '', f.sex, f.rsbsa_number || '',
            f.contact_number || '', f.registration_status || 'not registered',
        ]);
        exportToCsv('farmers', headers, rows);
    };

    // Analytics date filter
    const [analyticsDateRange, setAnalyticsDateRange] = useState<DateRange | null>(null);

    // Analytics computed from farmer data (filtered by date range)
    const farmerAnalytics = useMemo(() => {
        // Filter farmers by date range if set
        const filtered = analyticsDateRange
            ? farmers.filter(f => {
                const created = f.created_at ? f.created_at.substring(0, 10) : '';
                return created >= analyticsDateRange.start && created <= analyticsDateRange.end;
            })
            : farmers;

        const gender = filtered.reduce((acc, f) => {
            const key = f.sex || 'Unknown';
            const existing = acc.find(a => a.name === key);
            if (existing) existing.count++;
            else acc.push({ name: key, count: 1 });
            return acc;
        }, [] as { name: string; count: number }[]);

        const civilStatus = filtered.reduce((acc, f) => {
            const key = f.civil_status || 'Unknown';
            const existing = acc.find(a => a.name === key);
            if (existing) existing.count++;
            else acc.push({ name: key, count: 1 });
            return acc;
        }, [] as { name: string; count: number }[]);

        const p4ps = [
            { name: '4Ps Beneficiary', count: filtered.filter(f => f.is_4ps_beneficiary).length },
            { name: 'Non-Beneficiary', count: filtered.filter(f => !f.is_4ps_beneficiary).length },
        ];

        const ipStatus = [
            { name: 'Indigenous Peoples', count: filtered.filter(f => f.is_ip).length },
            { name: 'Non-IP', count: filtered.filter(f => !f.is_ip).length },
        ];

        const registrationStatus = [
            { name: 'Verified', count: filtered.filter(f => f.registration_status === 'verified').length },
            { name: 'For Submission', count: filtered.filter(f => f.registration_status === 'for_submission').length },
            { name: 'Submitted to DA', count: filtered.filter(f => f.registration_status === 'submitted_to_da').length },
            { name: 'Rejected', count: filtered.filter(f => f.registration_status === 'rejected').length },
        ].filter(d => d.count > 0);

        // Barangay distribution
        const barangayDist = filtered.reduce((acc, f) => {
            const key = f.barangay || 'Unknown';
            const existing = acc.find(a => a.name === key);
            if (existing) existing.count++;
            else acc.push({ name: key, count: 1 });
            return acc;
        }, [] as { name: string; count: number }[]).sort((a, b) => b.count - a.count);

        // Age distribution (approximate from birthdate)
        const now = new Date();
        const ageGroups = { '18-25': 0, '26-35': 0, '36-45': 0, '46-55': 0, '56-65': 0, '65+': 0 };
        filtered.forEach(f => {
            if (!f.birthdate) return;
            const age = Math.floor((now.getTime() - new Date(f.birthdate).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
            if (age <= 25) ageGroups['18-25']++;
            else if (age <= 35) ageGroups['26-35']++;
            else if (age <= 45) ageGroups['36-45']++;
            else if (age <= 55) ageGroups['46-55']++;
            else if (age <= 65) ageGroups['56-65']++;
            else ageGroups['65+']++;
        });
        const ageDistribution = Object.entries(ageGroups).map(([name, count]) => ({ name, count }));

        // Livelihood from household primary_livelihood
        const livelihoodDist = filtered.reduce((acc, f) => {
            const key = f.household?.primary_livelihood || 'Not specified';
            const existing = acc.find(a => a.name === key);
            if (existing) existing.count++;
            else acc.push({ name: key, count: 1 });
            return acc;
        }, [] as { name: string; count: number }[]).sort((a, b) => b.count - a.count);

        // Narrative
        const total = filtered.length;
        const verifiedCount = filtered.filter(f => f.registration_status === 'verified').length;
        const femaleCount = filtered.filter(f => f.sex === 'Female').length;
        const ipCount = filtered.filter(f => f.is_ip).length;
        const p4psCount = filtered.filter(f => f.is_4ps_beneficiary).length;
        const topBarangay = barangayDist[0];
        const topLivelihood = livelihoodDist[0];
        let narrative = `The farmer registry contains ${total.toLocaleString()} registered farmers. `;
        narrative += `${verifiedCount} farmers have been verified (${Math.round((verifiedCount / Math.max(total, 1)) * 100)}% verification rate). `;
        narrative += `${femaleCount} (${Math.round((femaleCount / Math.max(total, 1)) * 100)}%) are female. `;
        if (ipCount > 0) narrative += `${ipCount} belong to indigenous peoples communities. `;
        if (p4psCount > 0) narrative += `${p4psCount} are 4Ps beneficiaries. `;
        if (topBarangay) narrative += `The barangay with the most farmers is ${topBarangay.name} with ${topBarangay.count} registered. `;
        if (topLivelihood) narrative += `The predominant livelihood is ${topLivelihood.name}.`;

        return { gender, civilStatus, p4ps, ipStatus, registrationStatus, barangayDist, ageDistribution, livelihoodDist, narrative, filteredCount: filtered.length };
    }, [farmers, analyticsDateRange]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Farmers" />
            <div className="flex h-full flex-1 flex-col gap-5 rounded-xl p-4 md:p-6">
                {/* Page Header */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Farmers</h1>
                        <p className="text-sm text-muted-foreground">Manage farmer registry and information</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <ExportButtons onExportCsv={handleExportCsv} onExportPdf={exportToPdf} />
                        <Button onClick={() => setIsCreateModalOpen(true)}>
                            Add Farmer
                        </Button>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    <KpiCard label="Total Farmers" value={kpiCounts.total} icon={Users} />
                    <KpiCard label="Verified" value={kpiCounts.verified} icon={UserCheck} />
                    <KpiCard label="Pending" value={kpiCounts.pending} icon={Clock} />
                    <KpiCard label="Rejected" value={kpiCounts.rejected} icon={UserX} />
                </div>

                {/* Tabs */}
                <Tabs defaultValue="farmers" className="flex flex-col gap-4">
                    <TabsList className="glass-surface w-fit">
                        <TabsTrigger value="farmers" className="gap-2"><Users className="h-4 w-4" />Farmers</TabsTrigger>
                        <TabsTrigger value="analytics" className="gap-2"><BarChart3 className="h-4 w-4" />Reports & Analytics</TabsTrigger>
                    </TabsList>

                    {/* Farmers Tab */}
                    <TabsContent value="farmers" className="flex flex-col gap-5">
                <div className="glass-card rounded-2xl">
                    <div className="space-y-3 border-b p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="relative max-w-sm flex-1">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search farmers..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="h-9 pl-9"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant={viewMode === 'card' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => { setViewMode('card'); localStorage.setItem('farmerViewMode', 'card'); }}
                                    className="h-9 w-9 p-0"
                                >
                                    <LayoutGrid className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant={viewMode === 'list' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => { setViewMode('list'); localStorage.setItem('farmerViewMode', 'list'); }}
                                    className="h-9 w-9 p-0"
                                >
                                    <List className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>

                        {/* Card View */}
                        {viewMode === 'card' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {paginatedFarmers.map((farmer) => (
                                    <div key={farmer.lfid} className="glass-surface group relative cursor-pointer overflow-hidden rounded-xl transition-all hover:shadow-lg hover:border-primary/50">
                                        <div className="absolute inset-0 bg-primary/[0.02] dark:bg-primary/[0.05]" />
                                        <div className="relative p-4 space-y-4">
                                            {/* Header with Photo and Actions */}
                                            <div className="flex items-start justify-between">
                                                <div 
                                                    className="flex items-center gap-3 flex-1 cursor-pointer"
                                                    onClick={() => router.get(`/admin/farmers/${farmer.id}`)}
                                                >
                                                    <div className="relative h-16 w-16 rounded-xl overflow-hidden bg-muted border-2 border-muted group-hover:border-primary/30 transition-colors">
                                                        {farmer.picture_id ? (
                                                            <img 
                                                                src={farmer.picture_id} 
                                                                alt={`${farmer.first_name} ${farmer.last_name}`}
                                                                className="h-full w-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="h-full w-full flex items-center justify-center">
                                                                <User className="h-8 w-8 text-muted-foreground" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-semibold text-base truncate group-hover:text-primary transition-colors">{farmer.last_name}, {farmer.first_name}</h3>
                                                        <p className="text-xs text-muted-foreground truncate">{farmer.lfid}</p>
                                                    </div>
                                                </div>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); router.get(`/admin/farmers/${farmer.id}`); }}>
                                                            <User className="mr-2 h-4 w-4" />
                                                            View Profile
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openEditModal(farmer); }}>
                                                            <Pencil className="mr-2 h-4 w-4" />
                                                            Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem 
                                                            onClick={(e) => { e.stopPropagation(); openDeleteModal(farmer); }}
                                                            className="text-destructive focus:text-destructive"
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>

                                            {/* Information Grid */}
                                            <div className="space-y-2 text-sm">
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div>
                                                        <span className="text-xs text-muted-foreground">RSBSA No</span>
                                                        <p className="font-medium text-xs truncate">{farmer.rsbsa_number || '-'}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-xs text-muted-foreground">Sex</span>
                                                        <div className="mt-0.5">
                                                            <Badge variant="outline" className="text-xs">{farmer.sex}</Badge>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div>
                                                        <span className="text-xs text-muted-foreground">Contact</span>
                                                        <p className="font-medium text-xs truncate">{farmer.contact_number || '-'}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-xs text-muted-foreground">Civil Status</span>
                                                        <p className="font-medium text-xs capitalize truncate">{farmer.civil_status || '-'}</p>
                                                    </div>
                                                </div>

                                                <div className="pt-2 border-t">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs text-muted-foreground">Registration Status</span>
                                                        <Badge 
                                                            variant={
                                                                farmer.registration_status === 'verified' ? 'default' :
                                                                farmer.registration_status === 'for_submission' ? 'secondary' :
                                                                farmer.registration_status === 'submitted_to_da' ? 'outline' :
                                                                farmer.registration_status === 'rejected' ? 'destructive' :
                                                                'outline'
                                                            }
                                                            className="text-xs"
                                                        >
                                                            {farmer.registration_status?.replace('_', ' ') || 'not registered'}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex gap-2 pt-2 border-t">
                                                <Button 
                                                    size="sm" 
                                                    variant="outline" 
                                                    className="flex-1 text-xs"
                                                    onClick={(e) => { e.stopPropagation(); router.get(`/admin/farmers/${farmer.id}`); }}
                                                >
                                                    <User className="h-3 w-3 mr-1" />
                                                    View Profile
                                                </Button>
                                                <Button 
                                                    size="sm" 
                                                    variant="secondary" 
                                                    className="flex-1 text-xs"
                                                    onClick={(e) => { e.stopPropagation(); openEditModal(farmer); }}
                                                >
                                                    <Pencil className="h-3 w-3 mr-1" />
                                                    Edit
                                                </Button>
                                                <Button 
                                                    size="sm" 
                                                    variant="outline" 
                                                    className="text-xs"
                                                    onClick={(e) => { 
                                                        e.stopPropagation();
                                                        if (farmer.lfid) {
                                                            setSelectedFarmer(farmer);
                                                            setIsQrModalOpen(true);
                                                        }
                                                    }}
                                                >
                                                    <QrCode className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Table View (List) */}
                        {viewMode === 'list' && (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                      
                                        <TableHead>LFID</TableHead>
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
                                        <TableHead>Registration Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paginatedFarmers.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={9} className="h-24 text-center">
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
                                                <TableCell className="font-[12px]">{farmer.lfid || 'Not generated'}</TableCell>
                                                <TableCell>
                                                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted overflow-hidden border border-muted">
                                                        {farmer.picture_id ? (
                                                            <img 
                                                                src={farmer.picture_id} 
                                                                alt={`${farmer.first_name} ${farmer.last_name}`}
                                                                className="h-full w-full object-cover"
                                                            />
                                                        ) : (
                                                            <User className="h-6 w-6 text-muted-foreground" />
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
                                                <TableCell>
                                                    <Badge 
                                                        variant={
                                                            farmer.registration_status === 'verified' ? 'default' :
                                                            farmer.registration_status === 'for_submission' ? 'secondary' :
                                                            farmer.registration_status === 'submitted_to_da' ? 'outline' :
                                                            farmer.registration_status === 'rejected' ? 'destructive' :
                                                            'outline'
                                                        }
                                                    >
                                                        {farmer.registration_status?.replace('_', ' ') || 'not registered'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground/60 hover:text-foreground hover:bg-muted">
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
                                                            {farmer.lfid && (
                                                                <DropdownMenuItem onClick={() => {
                                                                    setSelectedFarmer(farmer);
                                                                    setIsQrModalOpen(true);
                                                                }}>
                                                                    <QrCode className="mr-2 h-4 w-4" />
                                                                    <span>View QR</span>
                                                                </DropdownMenuItem>
                                                            )}
                                                            <DropdownMenuItem 
                                                                onClick={() => openDeleteModal(farmer)}
                                                                className="text-destructive focus:text-destructive"
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
                        )}

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="border-t p-4">
                            <Pagination
                                currentPage={currentPage}
                                lastPage={totalPages}
                                total={filteredFarmers.length}
                                perPage={itemsPerPage}
                                onPageChange={setCurrentPage}
                            />
                        </div>
                    )}
                </div>
                    </TabsContent>

                    {/* Reports & Analytics Tab */}
                    <TabsContent value="analytics" className="flex flex-col gap-5">
                        {/* Analytics Date Filter */}
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">
                                {analyticsDateRange
                                    ? `Showing ${farmerAnalytics.filteredCount} of ${farmers.length} farmers in selected period`
                                    : `Showing all ${farmers.length} farmers`}
                            </p>
                            <DashboardDateFilter
                                dateRange={analyticsDateRange}
                                onApply={setAnalyticsDateRange}
                            />
                        </div>
                        <NarrativeCard
                            narrative={farmerAnalytics.narrative}
                            highlights={[
                                { text: 'total', value: farmerAnalytics.filteredCount.toLocaleString() },
                                { text: 'verified', value: farmers.filter(f => f.registration_status === 'verified').length.toString() },
                            ]}
                        />
                        <div className="glass-card rounded-2xl p-6">
                            <h2 className="mb-4 text-lg font-semibold">Demographics Overview</h2>
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                <BarChart data={farmerAnalytics.livelihoodDist} title="Main Livelihood" />
                                <PieChart data={farmerAnalytics.gender} title="Gender Distribution" />
                                <PieChart data={farmerAnalytics.civilStatus} title="Civil Status" />
                                <PieChart data={farmerAnalytics.p4ps} title="4Ps Beneficiaries" />
                                <PieChart data={farmerAnalytics.ipStatus} title="IP vs Non-IP" />
                                <BarChart data={farmerAnalytics.ageDistribution} title="Age Distribution" />
                            </div>
                        </div>
                        <div className="glass-card rounded-2xl p-6">
                            <h2 className="mb-4 text-lg font-semibold">Registration & Location</h2>
                            <div className="grid gap-4 md:grid-cols-2">
                                <BarChart data={farmerAnalytics.registrationStatus} title="Registration Status" />
                                <BarChart data={farmerAnalytics.barangayDist.slice(0, 10)} title="Top 10 Barangays" />
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
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
                            categories={categories}
                            commodities={commodities}
                            varieties={varieties}
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
                            categories={categories}
                            commodities={commodities}
                            varieties={varieties}
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

            {/* QR Code Modal */}
            <Dialog open={isQrModalOpen} onOpenChange={setIsQrModalOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <QrCode className="h-5 w-5" />
                            Farmer QR Code
                        </DialogTitle>
                        <DialogDescription>
                            Scan this QR code to view the farmer's public profile
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col items-center gap-4 py-6">
                        {selectedFarmer?.lfid && (
                            <>
                                <div className="bg-white p-6 rounded-lg border-2 border-muted shadow-sm">
                                    <QRCodeSVG 
                                        value={`${window.location.origin}/farmer/profile/${selectedFarmer.lfid}`}
                                        size={256}
                                        level="H"
                                    />
                                </div>
                                <div className="text-center space-y-2">
                                    <p className="font-semibold text-lg">
                                        {selectedFarmer.first_name} {selectedFarmer.last_name}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        LFID: {selectedFarmer.lfid}
                                    </p>
                                    {selectedFarmer.rsbsa_number && (
                                        <p className="text-sm text-muted-foreground">
                                            RSBSA: {selectedFarmer.rsbsa_number}
                                        </p>
                                    )}
                                </div>
                                <Button 
                                    variant="outline" 
                                    className="w-full"
                                    onClick={() => {
                                        const url = `${window.location.origin}/farmer/profile/${selectedFarmer.lfid}`;
                                        window.open(url, '_blank');
                                    }}
                                >
                                    <QrCode className="h-4 w-4 mr-2" />
                                    Open Public Profile
                                </Button>
                            </>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
