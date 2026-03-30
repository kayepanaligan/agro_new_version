import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Farmer, type Farm } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowUpDown, Plus, Search, Filter } from 'lucide-react';
import { useState, useMemo } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Farms',
        href: '/admin/farms',
    },
];

type SortField = 'farm_name' | 'farmer_name' | 'parcel_count' | 'created_at';
type SortOrder = 'asc' | 'desc';

interface FarmsProps {
    farms: any; // Laravel paginator with data property
}

export default function FarmsIndex({ farms }: FarmsProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortField, setSortField] = useState<SortField>('farm_name');
    const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
    const [filterFarmer, setFilterFarmer] = useState<string>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

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

    // Filter and sort farms
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

    // Pagination
    const totalPages = Math.ceil(filteredFarms.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedFarms = filteredFarms.slice(startIndex, startIndex + itemsPerPage);

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
    };

    const resetFilters = () => {
        setSearchTerm('');
        setFilterFarmer('all');
        setCurrentPage(1);
    };

    // Handle server-side pagination navigation
    const goToPage = (page: number) => {
        if (page >= 1 && page <= farms.last_page) {
            setCurrentPage(page);
            // Optionally redirect to URL with page parameter
            // router.visit(`/admin/farms?page=${page}`);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Farms" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Farms</h1>
                        <p className="text-muted-foreground">Manage farm profiles and land parcels</p>
                    </div>
                    <Button onClick={() => router.visit('/admin/farmers/create')}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Farm
                    </Button>
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div className="flex items-center gap-2 flex-1">
                                <div className="relative flex-1 max-w-sm">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        placeholder="Search farms or farmers..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-9"
                                    />
                                </div>
                                
                                <Select value={filterFarmer} onValueChange={setFilterFarmer}>
                                    <SelectTrigger className="w-[250px]">
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
                                        Clear Filters
                                    </Button>
                                )}
                            </div>

                            <div className="text-sm text-muted-foreground">
                                {filteredFarms.length} farm{filteredFarms.length !== 1 ? 's' : ''} found
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Table */}
                <div className="rounded-md border bg-card shadow-sm">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
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
                                <TableHead>RSBSA Number</TableHead>
                                <TableHead>Created At</TableHead>
                                <TableHead className="w-[70px]">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedFarms.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center">
                                        No farms found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedFarms.map((farm) => (
                                    <TableRow 
                                        key={farm.id} 
                                        className="cursor-pointer hover:bg-muted/50"
                                        onClick={() => router.visit(`/admin/farms/${farm.id}`)}
                                    >
                                        <TableCell className="font-medium">{farm.id}</TableCell>
                                        <TableCell className="font-medium">{farm.farm_name}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold">
                                                    {farm.farmer.first_name[0]}{farm.farmer.last_name[0]}
                                                </div>
                                                <div>
                                                    <div className="font-medium">
                                                        {farm.farmer.first_name} {farm.farmer.last_name}
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">
                                                {farm.farm_parcels_count || 0} parcel{(farm.farm_parcels_count || 0) !== 1 ? 's' : ''}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {farm.farmer.rsbsa_number || 'Not assigned'}
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {new Date(farm.created_at).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>
                                            <Button variant="ghost" size="sm" asChild>
                                                <Link href={`/admin/farms/${farm.id}`}>View</Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                {farms.last_page > 1 && (
                    <div className="flex items-center justify-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => goToPage(farms.current_page - 1)}
                            disabled={farms.current_page === 1}
                        >
                            Previous
                        </Button>
                        <span className="text-sm text-muted-foreground">
                            Page {farms.current_page} of {farms.last_page}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => goToPage(farms.current_page + 1)}
                            disabled={farms.current_page === farms.last_page}
                        >
                            Next
                        </Button>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
