import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Commodity, type Variety } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { ArrowUpDown, MoreHorizontal, Pencil, Search, Trash2, Sprout, Plus, Package, Calendar, TrendingUp } from 'lucide-react';
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
import { KpiCard } from '@/components/agro-profiler/kpi-card';
import { Pagination } from '@/components/agro-profiler/pagination';
import { ExportButtons } from '@/components/agro-profiler/export-buttons';
import { exportToCsv, exportToPdf } from '@/lib/export';

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

    const handleExportCsv = () => {
        const headers = ['ID', 'Name', 'Commodity', 'Description', 'Created'];
        const rows = filteredVarieties.map((v) => [
            v.id,
            v.name,
            v.commodity?.name || '',
            v.description || '',
            new Date(v.created_at).toLocaleDateString(),
        ]);
        exportToCsv('varieties', headers, rows);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Varieties" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">

                {/* Page Header */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Varieties</h1>
                        <p className="text-sm text-muted-foreground">Manage product varieties and cultivars</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <ExportButtons onExportCsv={handleExportCsv} onExportPdf={exportToPdf} />
                        <Button onClick={() => setIsCreateModalOpen(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                            <Plus className="mr-2 h-4 w-4" />
                            New Variety
                        </Button>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    <KpiCard label="Total Varieties" value={varieties.length} icon={Sprout} />
                    <KpiCard label="With Commodity" value={varieties.filter((v) => v.commodity).length} icon={Package} />
                    <KpiCard label="No Commodity" value={varieties.filter((v) => !v.commodity).length} icon={Calendar} />
                    <KpiCard label="Commodities" value={new Set(varieties.map((v) => v.commodity_id).filter(Boolean)).size} icon={TrendingUp} />
                </div>

                {/* Table Card */}
                <div className="glass-card rounded-2xl overflow-hidden">
                    {/* Toolbar */}
                    <div className="flex flex-col gap-3 border-b px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3 flex-1">
                            <div className="relative w-full max-w-xs">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search varieties..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9 h-9 text-sm"
                                />
                            </div>
                            <Select value={commodityFilter} onValueChange={setCommodityFilter}>
                                <SelectTrigger className="w-[180px] h-9 text-sm">
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
                        <span className="text-xs text-muted-foreground">
                            {filteredVarieties.length === varieties.length
                                ? `${varieties.length} varieties`
                                : `${filteredVarieties.length} of ${varieties.length} varieties`}
                        </span>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/40 hover:bg-muted/40">
                                    <TableHead className="w-16 text-xs font-semibold uppercase tracking-wide text-muted-foreground">ID</TableHead>
                                    <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                        <button
                                            onClick={() => handleSort('name')}
                                            className="flex items-center gap-1.5 hover:text-foreground transition-colors"
                                        >
                                            Name
                                            <ArrowUpDown className="h-3.5 w-3.5" />
                                        </button>
                                    </TableHead>
                                    <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                        <button
                                            onClick={() => handleSort('commodity')}
                                            className="flex items-center gap-1.5 hover:text-foreground transition-colors"
                                        >
                                            Commodity
                                            <ArrowUpDown className="h-3.5 w-3.5" />
                                        </button>
                                    </TableHead>
                                    <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground max-w-xs">Description</TableHead>
                                    <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Created</TableHead>
                                    <TableHead className="w-16 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedVarieties.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-40 text-center">
                                            <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                                <Sprout className="h-8 w-8 opacity-30" />
                                                <p className="text-sm font-medium">No varieties found</p>
                                                <p className="text-xs">
                                                    {searchTerm ? 'Try a different search term.' : 'Click "New Variety" to get started.'}
                                                </p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    paginatedVarieties.map((variety) => (
                                        <TableRow key={variety.id} className="hover:bg-muted/30 transition-colors">
                                            <TableCell className="text-xs text-muted-foreground font-mono">{variety.id}</TableCell>
                                            <TableCell className="font-medium text-sm">{variety.name}</TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" className="text-xs">{variety.commodity?.name || 'No Commodity'}</Badge>
                                            </TableCell>
                                            <TableCell className="max-w-xs">
                                                <span className="text-sm text-muted-foreground line-clamp-2">
                                                    {variety.description || '—'}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {new Date(variety.created_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                                                        >
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-36">
                                                        <DropdownMenuItem
                                                            onClick={() => openEditModal(variety)}
                                                            className="cursor-pointer"
                                                        >
                                                            <Pencil className="mr-2 h-3.5 w-3.5" />
                                                            Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            onClick={() => openDeleteModal(variety)}
                                                            className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                                                        >
                                                            <Trash2 className="mr-2 h-3.5 w-3.5" />
                                                            Delete
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

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="border-t p-4">
                            <Pagination currentPage={currentPage} lastPage={totalPages} total={filteredVarieties.length} perPage={itemsPerPage} onPageChange={setCurrentPage} />
                        </div>
                    )}
                </div>
            </div>

            {/* Create Modal */}
            <Dialog open={isCreateModalOpen} onOpenChange={(open) => { setIsCreateModalOpen(open); if (!open) resetForm(); }}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
                                <Sprout className="h-4 w-4" />
                            </span>
                            New Variety
                        </DialogTitle>
                        <DialogDescription>
                            Add a new product variety. Fields marked with <span className="text-red-500">*</span> are required.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="create-commodity">
                                Commodity <span className="text-red-500">*</span>
                            </Label>
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
                            <Label htmlFor="create-name">
                                Name <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="create-name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g., Nantes"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="create-description">Description</Label>
                            <textarea
                                id="create-description"
                                value={formData.description}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                                    setFormData({ ...formData, description: e.target.value })
                                }
                                placeholder="Brief description of the variety"
                                rows={3}
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleCreate}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground"
                            disabled={!formData.name.trim() || !formData.commodity_id}
                        >
                            Create Variety
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Modal */}
            <Dialog open={isEditModalOpen} onOpenChange={(open) => { setIsEditModalOpen(open); if (!open) resetForm(); }}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-100 text-slate-600">
                                <Pencil className="h-4 w-4" />
                            </span>
                            Edit Variety
                        </DialogTitle>
                        <DialogDescription>
                            Update the details for <span className="font-medium text-foreground">{selectedVariety?.name}</span>.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-commodity">
                                Commodity <span className="text-red-500">*</span>
                            </Label>
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
                            <Label htmlFor="edit-name">
                                Name <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="edit-name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-description">Description</Label>
                            <textarea
                                id="edit-description"
                                value={formData.description}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                                    setFormData({ ...formData, description: e.target.value })
                                }
                                placeholder="Brief description of the variety"
                                rows={3}
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleUpdate}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground"
                            disabled={!formData.name.trim() || !formData.commodity_id}
                        >
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Modal */}
            <Dialog open={isDeleteModalOpen} onOpenChange={(open) => { setIsDeleteModalOpen(open); if (!open) setSelectedVariety(null); }}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-red-100 text-red-600">
                                <Trash2 className="h-4 w-4" />
                            </span>
                            Delete Variety
                        </DialogTitle>
                        <DialogDescription className="pt-1">
                            This will permanently delete{' '}
                            <span className="font-medium text-foreground">"{selectedVariety?.name}"</span>.
                            This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            Delete Variety
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
