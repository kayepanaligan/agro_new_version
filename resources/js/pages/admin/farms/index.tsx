import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Farmer, type Farm } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowUpDown, MoreHorizontal, Pencil, Plus, Search, Filter, Trash2, Eye, QrCode, MapPin, LandPlot, Users, CalendarDays, BarChart3, PieChartIcon, Ruler, Leaf, Shield, FileText } from 'lucide-react';
import { useState, useMemo } from 'react';
import { QRCodeSVG } from 'qrcode.react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { KpiCard } from '@/components/agro-profiler/kpi-card';
import { Pagination } from '@/components/agro-profiler/pagination';
import { ExportButtons } from '@/components/agro-profiler/export-buttons';
import { NarrativeCard } from '@/components/agro-profiler/narrative-card';
import { DashboardDateFilter, type DateRange } from '@/components/agro-profiler/dashboard-date-filter';
import { exportToCsv, exportToPdf } from '@/lib/export';
import BarChart from '@/components/charts/BarChart';
import PieChart from '@/components/charts/PieChart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Farms',
        href: '/admin/farms',
    },
];

type SortField = 'farm_name' | 'farmer_name' | 'parcel_count' | 'created_at';
type SortOrder = 'asc' | 'desc';

interface FarmAnalytics {
    total_farms: number;
    total_parcels: number;
    total_area: number;
    unique_farmers: number;
    avg_parcel_area: number;
    parcel_count_dist: { name: string; count: number }[];
    area_size_dist: { name: string; count: number }[];
    barangay_dist: { name: string; count: number }[];
    ownership_dist: { name: string; count: number }[];
    farm_type_dist: { name: string; count: number }[];
    organic_dist: { name: string; count: number }[];
    ancestral_dist: { name: string; count: number }[];
    doc_type_dist: { name: string; count: number }[];
    narrative: string;
    date_range: DateRange | null;
}

interface FarmsProps {
    farms: any; // Laravel paginator with data property
    analytics: FarmAnalytics;
}

export default function FarmsIndex({ farms, analytics }: FarmsProps) {
    const [dateRange, setDateRange] = useState<DateRange | null>(analytics.date_range);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortField, setSortField] = useState<SortField>('farm_name');
    const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
    const [filterFarmer, setFilterFarmer] = useState<string>('all');
    const [isQrModalOpen, setIsQrModalOpen] = useState(false);
    const [selectedFarm, setSelectedFarm] = useState<any>(null);
    const [currentPage, setCurrentPage] = useState(farms.current_page || 1);

    // Convert farms.data to array (Laravel pagination)
    const farmsArray = farms.data || [];

    // Get unique farmers for filter
    const uniqueFarmers = useMemo(() => {
        const farmerMap = new Map();
        farmsArray.forEach((farm: any) => {
            if (!farmerMap.has(farm.farmer.id)) {
                farmerMap.set(farm.farmer.id, farm.farmer);
            }
        });
        return Array.from(farmerMap.values());
    }, [farms]);

    // Filter and sort farms (client-side filtering/sorting on current page)
    const filteredFarms = useMemo(() => {
        let result = [...farmsArray];

        // Search filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(
                (farm) =>
                    farm.farm_name.toLowerCase().includes(term) ||
                    farm.farmer.first_name.toLowerCase().includes(term) ||
                    farm.farmer.last_name.toLowerCase().includes(term)
            );
        }

        // Farmer filter
        if (filterFarmer !== 'all') {
            result = result.filter((farm) => farm.farmer.id.toString() === filterFarmer);
        }

        // Sort
        result.sort((a, b) => {
            let comparison = 0;
            
            switch (sortField) {
                case 'farm_name':
                    comparison = a.farm_name.localeCompare(b.farm_name);
                    break;
                case 'farmer_name':
                    const aName = `${a.farmer.first_name} ${a.farmer.last_name}`;
                    const bName = `${b.farmer.first_name} ${b.farmer.last_name}`;
                    comparison = aName.localeCompare(bName);
                    break;
                case 'parcel_count':
                    comparison = (a.farm_parcels_count || 0) - (b.farm_parcels_count || 0);
                    break;
                case 'created_at':
                    comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
                    break;
            }
            
            return sortOrder === 'asc' ? comparison : -comparison;
        });

        return result;
    }, [farmsArray, searchTerm, sortField, sortOrder, filterFarmer]);

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
        router.get('/admin/farms', { page: 1, search: searchTerm || undefined, farmer_id: filterFarmer !== 'all' ? filterFarmer : undefined, sort: field, order: sortOrder === 'asc' ? 'desc' : 'asc' }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const resetFilters = () => {
        setSearchTerm('');
        setFilterFarmer('all');
        router.get('/admin/farms', { page: 1 }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleDelete = (farmId: number) => {
        if (confirm('Are you sure you want to delete this farm? This action cannot be undone.')) {
            router.delete(`/admin/farms/${farmId}`, {
                preserveScroll: false,
            });
        }
    };

    const handleSearch = (value: string) => {
        setSearchTerm(value);
        setTimeout(() => {
            router.get('/admin/farms', { page: 1, search: value || undefined, farmer_id: filterFarmer !== 'all' ? filterFarmer : undefined, sort: sortField, order: sortOrder }, {
                preserveState: true,
                preserveScroll: true,
            });
        }, 300);
    };

    const handleFarmerFilter = (value: string) => {
        setFilterFarmer(value);
        router.get('/admin/farms', { page: 1, search: searchTerm || undefined, farmer_id: value !== 'all' ? value : undefined, sort: sortField, order: sortOrder }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    // KPI counts
    const totalParcels = farmsArray.reduce((sum: number, f: any) => sum + (f.farm_parcels_count || 0), 0);

    const handleDateFilterChange = (range: DateRange | null) => {
        setDateRange(range);
        const params: Record<string, string> = {};
        if (range) {
            params.date_start = range.start;
            params.date_end = range.end;
        }
        router.get('/admin/farms', params, { preserveState: true, replace: true });
    };

    const handleExportCsv = () => {
        const headers = ['ID', 'FID', 'Farm Name', 'Farmer', 'Parcels', 'Created'];
        const rows = filteredFarms.map((f: any) => [
            f.id, f.fid || '', f.farm_name, `${f.farmer.first_name} ${f.farmer.last_name}`,
            f.farm_parcels_count || 0, new Date(f.created_at).toLocaleDateString(),
        ]);
        exportToCsv('farms', headers, rows);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Farms" />
            <div className="flex h-full flex-1 flex-col gap-5 rounded-xl p-4 md:p-6">
                {/* Page Header */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Farms</h1>
                        <p className="text-sm text-muted-foreground">Manage farm profiles and land parcels</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <ExportButtons onExportCsv={handleExportCsv} onExportPdf={exportToPdf} />
                        <Button onClick={() => router.visit('/admin/farmers')}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Farm via Farmer
                        </Button>
                    </div>
                </div>

                {/* Tabs */}
                <Tabs defaultValue="farms" className="flex flex-col gap-4">
                    <TabsList className="glass-surface w-fit">
                        <TabsTrigger value="farms" className="gap-2"><MapPin className="h-4 w-4" />Farms</TabsTrigger>
                        <TabsTrigger value="analytics" className="gap-2"><BarChart3 className="h-4 w-4" />Reports & Analytics</TabsTrigger>
                    </TabsList>

                    {/* ─── Farms Tab ─────────────────────────────────────── */}
                    <TabsContent value="farms" className="flex flex-col gap-5">
                {/* KPI Cards */}
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    <KpiCard label="Total Farms" value={farms.total || farmsArray.length} icon={MapPin} />
                    <KpiCard label="Total Parcels" value={totalParcels} icon={LandPlot} />
                    <KpiCard label="Unique Farmers" value={uniqueFarmers.length} icon={Users} />
                    <KpiCard label="This Page" value={farmsArray.length} icon={CalendarDays} />
                </div>

                {/* Main Table Card */}
                <div className="glass-card rounded-2xl">
                    <div className="space-y-3 border-b p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="relative max-w-sm flex-1">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search farms or farmers..."
                                    value={searchTerm}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    className="h-9 pl-9"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <Select value={filterFarmer} onValueChange={handleFarmerFilter}>
                                    <SelectTrigger className="w-[220px]">
                                        <Filter className="mr-2 h-4 w-4" />
                                        <SelectValue placeholder="Filter by farmer" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Farmers</SelectItem>
                                        {uniqueFarmers.map((farmer) => (
                                            <SelectItem key={farmer.id} value={farmer.id.toString()}>
                                                {`${farmer.first_name} ${farmer.last_name}`}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                {(searchTerm || filterFarmer !== 'all') && (
                                    <Button variant="ghost" size="sm" onClick={resetFilters}>
                                        Clear
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent">
                                    <TableHead>FID</TableHead>
                                    <TableHead>
                                        <Button variant="ghost" onClick={() => handleSort('farm_name')} className="-ml-4">
                                            Farm Name
                                            <ArrowUpDown className="ml-2 h-4 w-4" />
                                        </Button>
                                    </TableHead>
                                    <TableHead>
                                        <Button variant="ghost" onClick={() => handleSort('farmer_name')} className="-ml-4">
                                            Farmer
                                            <ArrowUpDown className="ml-2 h-4 w-4" />
                                        </Button>
                                    </TableHead>
                                    <TableHead>
                                        <Button variant="ghost" onClick={() => handleSort('parcel_count')} className="-ml-4">
                                            Parcels
                                            <ArrowUpDown className="ml-2 h-4 w-4" />
                                        </Button>
                                    </TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredFarms.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-32 text-center">
                                            <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                                <MapPin className="h-8 w-8" />
                                                <p>No farms found</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredFarms.map((farm) => (
                                        <TableRow 
                                            key={farm.id} 
                                            className="group cursor-pointer hover:bg-muted/50"
                                            onClick={() => router.visit(`/admin/farms/${farm.id}`)}
                                        >
                                            <TableCell className="font-mono text-xs text-muted-foreground">{farm.fid || 'N/A'}</TableCell>
                                            <TableCell className="font-medium">{farm.farm_name}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2.5">
                                                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                                                        {farm.farmer.first_name[0]}{farm.farmer.last_name[0]}
                                                    </div>
                                                    <span className="font-medium">{farm.farmer.first_name} {farm.farmer.last_name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">
                                                    {farm.farm_parcels_count || 0} parcel{(farm.farm_parcels_count || 0) !== 1 ? 's' : ''}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {new Date(farm.created_at).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button 
                                                            variant="ghost" 
                                                            size="sm" 
                                                            className="h-8 w-8 p-0 text-muted-foreground/60 transition-colors hover:text-foreground hover:bg-muted"
                                                        >
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem onClick={() => router.visit(`/admin/farms/${farm.id}`)}>
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            <span>View</span>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => router.visit(`/admin/farms/${farm.id}/edit`)}>
                                                            <Pencil className="mr-2 h-4 w-4" />
                                                            <span>Edit</span>
                                                        </DropdownMenuItem>
                                                        {farm.fid && (
                                                            <DropdownMenuItem onClick={() => {
                                                                setSelectedFarm(farm);
                                                                setIsQrModalOpen(true);
                                                            }}>
                                                                <QrCode className="mr-2 h-4 w-4" />
                                                                <span>View QR</span>
                                                            </DropdownMenuItem>
                                                        )}
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem 
                                                            onClick={() => handleDelete(farm.id)}
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

                    {farms.last_page > 1 && (
                        <div className="border-t p-4">
                            <Pagination
                                currentPage={farms.current_page}
                                lastPage={farms.last_page}
                                total={farms.total}
                                perPage={10}
                                onPageChange={(page) => {
                                    setCurrentPage(page);
                                    router.get('/admin/farms', { page, search: searchTerm || undefined, farmer_id: filterFarmer !== 'all' ? filterFarmer : undefined, sort: sortField, order: sortOrder }, {
                                        preserveState: true,
                                        preserveScroll: true,
                                    });
                                }}
                            />
                        </div>
                    )}
                </div>
                    </TabsContent>

                    {/* ─── Reports & Analytics Tab ──────────────────────── */}
                    <TabsContent value="analytics" className="flex flex-col gap-5">
                        {/* Analytics Date Filter */}
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">
                                {dateRange
                                    ? `Showing data for ${analytics.total_farms} farms in selected period`
                                    : `Showing all ${analytics.total_farms} farms`}
                            </p>
                            <DashboardDateFilter
                                dateRange={dateRange}
                                onApply={handleDateFilterChange}
                            />
                        </div>

                        <NarrativeCard
                            narrative={analytics.narrative}
                            highlights={[
                                { text: 'farms', value: analytics.total_farms.toLocaleString() },
                                { text: 'parcels', value: analytics.total_parcels.toLocaleString() },
                                { text: 'area', value: `${analytics.total_area} ha` },
                            ]}
                        />

                        {/* KPI Summary Cards */}
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <KpiCard label="Total Farms" value={analytics.total_farms} icon={MapPin} />
                            <KpiCard label="Total Parcels" value={analytics.total_parcels} icon={LandPlot} />
                            <KpiCard label="Total Area" value={`${analytics.total_area} ha`} icon={Ruler} />
                            <KpiCard label="Unique Farmers" value={analytics.unique_farmers} icon={Users} />
                        </div>

                        {/* Parcel Distribution */}
                        <div className="glass-card rounded-2xl p-6">
                            <h2 className="mb-4 text-lg font-semibold">Parcel Distribution</h2>
                            <div className="grid gap-4 md:grid-cols-2">
                                <BarChart data={analytics.parcel_count_dist} title="Parcels per Farm" />
                                <BarChart data={analytics.area_size_dist} title="Area Size Categories" />
                            </div>
                        </div>

                        {/* Geographic & Ownership */}
                        <div className="glass-card rounded-2xl p-6">
                            <h2 className="mb-4 text-lg font-semibold">Geographic & Ownership Insights</h2>
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                <BarChart data={analytics.barangay_dist} title="Top 10 Barangays" />
                                <PieChart data={analytics.ownership_dist} title="Ownership Type" />
                                <PieChart data={analytics.doc_type_dist} title="Document Type" />
                            </div>
                        </div>

                        {/* Farm Characteristics */}
                        <div className="glass-card rounded-2xl p-6">
                            <h2 className="mb-4 text-lg font-semibold">Farm Characteristics</h2>
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                <PieChart data={analytics.farm_type_dist} title="Farm Type" />
                                <PieChart data={analytics.organic_dist} title="Organic Practices" />
                                <PieChart data={analytics.ancestral_dist} title="Ancestral Domain" />
                            </div>
                        </div>

                        {/* Summary Cards */}
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <div className="glass-surface rounded-xl p-4 text-center">
                                <Leaf className="mx-auto mb-2 h-5 w-5 text-primary" />
                                <p className="text-2xl font-bold text-primary">{analytics.organic_dist[0]?.count || 0}</p>
                                <p className="text-xs text-muted-foreground">Organic Parcels</p>
                            </div>
                            <div className="glass-surface rounded-xl p-4 text-center">
                                <Shield className="mx-auto mb-2 h-5 w-5 text-primary" />
                                <p className="text-2xl font-bold text-primary">{analytics.ancestral_dist[0]?.count || 0}</p>
                                <p className="text-xs text-muted-foreground">Within Ancestral Domain</p>
                            </div>
                            <div className="glass-surface rounded-xl p-4 text-center">
                                <Ruler className="mx-auto mb-2 h-5 w-5 text-primary" />
                                <p className="text-2xl font-bold text-primary">{analytics.avg_parcel_area} ha</p>
                                <p className="text-xs text-muted-foreground">Avg. Parcel Size</p>
                            </div>
                            <div className="glass-surface rounded-xl p-4 text-center">
                                <FileText className="mx-auto mb-2 h-5 w-5 text-primary" />
                                <p className="text-2xl font-bold text-primary">{analytics.ownership_dist.length}</p>
                                <p className="text-xs text-muted-foreground">Ownership Types</p>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>

            {/* QR Code Modal */}
            <Dialog open={isQrModalOpen} onOpenChange={setIsQrModalOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <QrCode className="h-5 w-5" />
                            Farm QR Code
                        </DialogTitle>
                        <DialogDescription>
                            Scan this QR code to view the farm's public profile
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col items-center gap-4 py-6">
                        {selectedFarm?.fid && (
                            <>
                                <div className="bg-white p-6 rounded-lg border-2 border-muted shadow-sm">
                                    <QRCodeSVG 
                                        value={`${window.location.origin}/farm/profile/${selectedFarm.fid}`}
                                        size={256}
                                        level="H"
                                    />
                                </div>
                                <div className="text-center space-y-2">
                                    <p className="font-semibold text-lg">
                                        {selectedFarm.farm_name}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        FID: {selectedFarm.fid}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Owner: {selectedFarm.farmer.first_name} {selectedFarm.farmer.last_name}
                                    </p>
                                </div>
                                <Button 
                                    variant="outline" 
                                    className="w-full"
                                    onClick={() => {
                                        const url = `${window.location.origin}/farm/profile/${selectedFarm.fid}`;
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
