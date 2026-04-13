import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Commodity, type Variety } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { ArrowUpDown, MoreHorizontal, Pencil, Search, Trash2 } from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';

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

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Varieties',
        href: '/super-admin/varieties',
    },
];

type SortField = 'name' | 'commodity' | 'created_at';
type SortOrder = 'asc' | 'desc';

interface VarietyWithCommodity extends Variety {
    commodity?: { id: number; name: string } | null;
}

export default function Varieties() {
    const { varieties, commodities } = usePage<{ varieties: VarietyWithCommodity[]; commodities: Commodity[] }>().props;
    
    // CRITICAL: Force reset all modal states on page load/navigation
    const [key, setKey] = useState(0);
    const forceUpdate = () => setKey(k => k + 1);
    
    // Reset everything when page URL changes (Inertia navigation)
    useEffect(() => {
        forceUpdate();
    }, [varieties]); // varieties changes when page navigates
    
    const [searchTerm, setSearchTerm] = useState('');
    const [sortField, setSortField] = useState<SortField>('name');
    const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
    const [commodityFilter, setCommodityFilter] = useState<string>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedVariety, setSelectedVariety] = useState<VarietyWithCommodity | null>(null);
    const [formData, setFormData] = useState({
        commodity_id: '',
        name: '',
        description: '',
    });

    // Cleanup all dialogs on page navigation/unmount
    useEffect(() => {
        return () => {
            // Force close all dialogs when navigating away
            setIsCreateModalOpen(false);
            setIsEditModalOpen(false);
            setIsDeleteModalOpen(false);
            // Remove any leftover overlays from DOM
            const overlays = document.querySelectorAll('[data-radix-dialog-overlay], [data-state="open"]');
            overlays.forEach(overlay => overlay.remove());
        };
    }, []);

    // Filter and sort varieties
    const filteredVarieties = useMemo(() => {
        let result = [...varieties];

        // Search filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(
                (variety) =>
                    variety.name.toLowerCase().includes(term) ||
                    variety.description?.toLowerCase().includes(term) ||
                    variety.commodity?.name.toLowerCase().includes(term),
            );
        }

        // Commodity filter
        if (commodityFilter !== 'all') {
            result = result.filter((variety) => variety.commodity_id === parseInt(commodityFilter));
        }

        // Sorting
        result.sort((a, b) => {
            let aValue: any = a[sortField];
            let bValue: any = b[sortField];

            if (sortField === 'name') {
                aValue = aValue.toLowerCase();
                bValue = bValue.toLowerCase();
            } else if (sortField === 'commodity') {
                aValue = a.commodity?.name.toLowerCase() || '';
                bValue = b.commodity?.name.toLowerCase() || '';
            }

            if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });

        return result;
    }, [varieties, searchTerm, sortField, sortOrder, commodityFilter]);

    // Pagination
    const totalPages = Math.ceil(filteredVarieties.length / itemsPerPage);
    const paginatedVarieties = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredVarieties.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredVarieties, currentPage, itemsPerPage]);

    // Reset to page 1 when filters change
    useMemo(() => {
        setCurrentPage(1);
    }, [searchTerm, commodityFilter, sortField, sortOrder]);

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
    };

    const handleCreate = () => {
        // Validate unique name on client-side
        const nameExists = varieties.some(
            (v) => v.name.toLowerCase() === formData.name.toLowerCase()
        );
        
        if (nameExists) {
            alert(`A variety with the name "${formData.name}" already exists. Please use a unique name.`);
            return;
        }

        router.post('/super-admin/varieties', formData, {
            preserveScroll: false,
            preserveState: false,  // CRITICAL: Don't preserve React state
            onSuccess: () => {
                // Force close dialog IMMEDIATELY
                setIsCreateModalOpen(false);
                
                // Clean up other state after dialog closes
                setTimeout(() => {
                    setFormData({ commodity_id: '', name: '', description: '' });
                }, 0);
            },
            onError: (errors) => {
                console.error('Create error:', errors);
            },
        });
    };

    const handleUpdate = () => {
        if (!selectedVariety) return;

        // Validate unique name on client-side (excluding current variety)
        const nameExists = varieties.some(
            (v) => v.id !== selectedVariety.id && v.name.toLowerCase() === formData.name.toLowerCase()
        );
        
        if (nameExists) {
            alert(`A variety with the name "${formData.name}" already exists. Please use a unique name.`);
            return;
        }

        router.put(`/super-admin/varieties/${selectedVariety.id}`, formData, {
            preserveScroll: false,
            preserveState: false,  // CRITICAL: Don't preserve React state
            onSuccess: () => {
                // Force close dialog IMMEDIATELY
                setIsEditModalOpen(false);
                
                // Clean up other state after dialog closes
                setTimeout(() => {
                    setFormData({ commodity_id: '', name: '', description: '' });
                    setSelectedVariety(null);
                }, 0);
            },
            onError: (errors) => {
                console.error('Update error:', errors);
            },
        });
    };

    const handleDelete = () => {
        if (!selectedVariety) return;

        router.delete(`/super-admin/varieties/${selectedVariety.id}`, {
            preserveScroll: false,
            preserveState: false,  // CRITICAL: Don't preserve React state
            onSuccess: () => {
                // Force close dialog IMMEDIATELY
                setIsDeleteModalOpen(false);
                
                // Clean up other state after dialog closes
                setTimeout(() => {
                    setSelectedVariety(null);
                }, 0);
            },
            onError: (errors) => {
                console.error('Delete error:', errors);
            },
        });
    };

    const openEditModal = (variety: VarietyWithCommodity) => {
        setSelectedVariety(variety);
        setFormData({
            commodity_id: variety.commodity_id.toString(),
            name: variety.name,
            description: variety.description || '',
        });
        setIsEditModalOpen(true);
    };

    const openDeleteModal = (variety: VarietyWithCommodity) => {
        setSelectedVariety(variety);
        setIsDeleteModalOpen(true);
    };

    const resetForm = () => {
        setFormData({ commodity_id: '', name: '', description: '' });
        setSelectedVariety(null);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Varieties" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="rounded-xl border bg-card shadow-sm">
                    <div className="p-6">
                        <h1 className="mb-2 text-3xl font-bold">Varieties</h1>
                        <p className="text-muted-foreground">Manage product varieties and cultivars</p>
                    </div>

                    <div className="border-t p-6">
                        {/* Header with Add button */}
                        <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div className="relative flex-1 max-w-sm">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search varieties..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9"
                                />
                            </div>

                            <Button onClick={() => setIsCreateModalOpen(true)}>
                                Add Variety
                            </Button>
                        </div>

                        {/* Filters */}
                        <div className="mb-4 flex items-center gap-2">
                            <Select value={commodityFilter} onValueChange={setCommodityFilter}>
                                <SelectTrigger className="w-[200px]">
                                    <SelectValue placeholder="Filter by commodity" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Commodities</SelectItem>
                                    {commodities.map((commodity) => (
                                        <SelectItem key={commodity.id} value={commodity.id.toString()}>
                                            {commodity.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Results count */}
                        <div className="mb-4 text-sm text-muted-foreground">
                            Showing {paginatedVarieties.length} of {filteredVarieties.length} varieties
                        </div>

                        {/* Table */}
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[100px]">ID</TableHead>
                                        <TableHead>
                                            <Button variant="ghost" onClick={() => handleSort('name')} className="-ml-4">
                                                Name
                                                <ArrowUpDown className="ml-2 h-4 w-4" />
                                            </Button>
                                        </TableHead>
                                        <TableHead>
                                            <Button variant="ghost" onClick={() => handleSort('commodity')} className="-ml-4">
                                                Commodity
                                                <ArrowUpDown className="ml-2 h-4 w-4" />
                                            </Button>
                                        </TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Created</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredVarieties.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="h-24 text-center">
                                                No varieties found. Click "Add Variety" to create one.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        paginatedVarieties.map((variety) => (
                                            <TableRow key={variety.id}>
                                                <TableCell className="font-medium">{variety.id}</TableCell>
                                                <TableCell className="font-medium">{variety.name}</TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary">{variety.commodity?.name || 'No Commodity'}</Badge>
                                                </TableCell>
                                                <TableCell>{variety.description || '-'}</TableCell>
                                                <TableCell>{new Date(variety.created_at).toLocaleDateString()}</TableCell>
                                                <TableCell className="text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem onClick={() => openEditModal(variety)}>
                                                                <Pencil className="mr-2 h-4 w-4" />
                                                                <span>Edit</span>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem 
                                                                onClick={() => openDeleteModal(variety)}
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
                                    
                                    {/* Page number buttons */}
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
            <Dialog open={isCreateModalOpen} onOpenChange={(open) => { 
                setIsCreateModalOpen(open); 
                if (!open) {
                    resetForm();
                    // Clear any focused elements to prevent button lock
                    document.activeElement instanceof HTMLElement && document.activeElement.blur();
                }
            }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create Variety</DialogTitle>
                        <DialogDescription>
                            Add a new variety. Fill in the details below.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="create-commodity">Commodity</Label>
                            <Select value={formData.commodity_id} onValueChange={(value) => setFormData({ ...formData, commodity_id: value })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select commodity" />
                                </SelectTrigger>
                                <SelectContent>
                                    {commodities.map((commodity) => (
                                        <SelectItem key={commodity.id} value={commodity.id.toString()}>
                                            {commodity.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="create-name">Name</Label>
                            <Input
                                id="create-name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g., Nantes"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="create-description">Description</Label>
                            <Input
                                id="create-description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="e.g., Sweet, crisp carrots"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreate}>
                            Create Variety
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Modal */}
            <Dialog open={isEditModalOpen} onOpenChange={(open) => { 
                setIsEditModalOpen(open); 
                if (!open) {
                    resetForm();
                    // Clear any focused elements to prevent button lock
                    document.activeElement instanceof HTMLElement && document.activeElement.blur();
                }
            }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Variety</DialogTitle>
                        <DialogDescription>
                            Update variety information. Make your changes below.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-commodity">Commodity</Label>
                            <Select value={formData.commodity_id} onValueChange={(value) => setFormData({ ...formData, commodity_id: value })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select commodity" />
                                </SelectTrigger>
                                <SelectContent>
                                    {commodities.map((commodity) => (
                                        <SelectItem key={commodity.id} value={commodity.id.toString()}>
                                            {commodity.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-name">Name</Label>
                            <Input
                                id="edit-name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-description">Description</Label>
                            <Input
                                id="edit-description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleUpdate}>
                            Update Variety
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Modal */}
            <Dialog open={isDeleteModalOpen} onOpenChange={(open) => {
                setIsDeleteModalOpen(open);
                if (!open) {
                    setSelectedVariety(null);
                    // Clear any focused elements to prevent button lock
                    document.activeElement instanceof HTMLElement && document.activeElement.blur();
                }
            }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Variety</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "{selectedVariety?.name}"? This action cannot be undone.
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
