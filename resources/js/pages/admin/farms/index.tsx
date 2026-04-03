import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Farmer, type Farm } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowUpDown, MoreHorizontal, Pencil, Plus, Search, Filter, Trash2, Eye } from 'lucide-react';
import { useState, useMemo } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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
    const paginatedFarms = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredFarms.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredFarms, currentPage, itemsPerPage]);

    // Reset to page 1 when filters change
    useMemo(() => {
        setCurrentPage(1);
    }, [searchTerm, filterFarmer]);

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

    const handleDelete = (farmId: number) => {
        if (confirm('Are you sure you want to delete this farm? This action cannot be undone.')) {
            router.delete(`/admin/farms/${farmId}`, {
                preserveScroll: false,
                onSuccess: () => {
                    console.log('Farm deleted successfully');
                },
                onError: (errors) => {
                    console.error('Delete error:', errors);
                },
            });
        }
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
                {/* Header */}
                <Card>
                    <CardContent className="pt-6">
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
                    </CardContent>
                </Card>

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
                                {paginatedFarms.length} of {filteredFarms.length} farm{filteredFarms.length !== 1 ? 's' : ''}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Table */}
                <Card>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
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
                                        <TableHead>Created At</TableHead>
                                        <TableHead className="w-[70px]">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paginatedFarms.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="h-24 text-center">
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
                                                <TableCell className="text-sm text-muted-foreground">
                                                    {new Date(farm.created_at).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
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
                                                            <DropdownMenuItem 
                                                                onClick={() => handleDelete(farm.id)}
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
                    </CardContent>
                </Card>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <Card>
                        <CardContent className="pt-6">
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
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
