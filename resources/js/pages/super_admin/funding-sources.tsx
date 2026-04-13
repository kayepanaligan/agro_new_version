import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type FundingSource } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { ArrowUpDown, MoreHorizontal, Pencil, Search, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';

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

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Funding Sources',
        href: '/super-admin/funding-sources',
    },
];

type SortField = 'name' | 'created_at';
type SortOrder = 'asc' | 'desc';

export default function FundingSources() {
    const { fundingSources } = usePage<{ fundingSources: FundingSource[] }>().props;

    const [searchTerm, setSearchTerm] = useState('');
    const [sortField, setSortField] = useState<SortField>('name');
    const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedFundingSource, setSelectedFundingSource] = useState<FundingSource | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
    });

    // Filter and sort funding sources
    const filteredFundingSources = useMemo(() => {
        let result = [...fundingSources];

        // Search filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(
                (source) =>
                    source.name.toLowerCase().includes(term) ||
                    source.description?.toLowerCase().includes(term),
            );
        }

        // Sorting
        result.sort((a, b) => {
            let aValue: any = a[sortField];
            let bValue: any = b[sortField];

            if (sortField === 'name') {
                aValue = aValue.toLowerCase();
                bValue = bValue.toLowerCase();
            }

            if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });

        return result;
    }, [fundingSources, searchTerm, sortField, sortOrder]);

    // Pagination
    const totalPages = Math.ceil(filteredFundingSources.length / itemsPerPage);
    const paginatedFundingSources = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredFundingSources.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredFundingSources, currentPage, itemsPerPage]);

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
        router.post('/super-admin/funding-sources', formData, {
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
        if (!selectedFundingSource) return;

        router.put(`/super-admin/funding-sources/${selectedFundingSource.id}`, formData, {
            preserveScroll: false,
            onSuccess: () => {
                setIsEditModalOpen(false);
                resetForm();
                setSelectedFundingSource(null);
            },
            onError: (errors) => {
                console.error('Update error:', errors);
            },
        });
    };

    const handleDelete = () => {
        if (!selectedFundingSource) return;

        router.delete(`/super-admin/funding-sources/${selectedFundingSource.id}`, {
            preserveScroll: false,
            onSuccess: () => {
                setIsDeleteModalOpen(false);
                setSelectedFundingSource(null);
            },
            onError: (errors) => {
                console.error('Delete error:', errors);
            },
        });
    };

    const openEditModal = (source: FundingSource) => {
        setSelectedFundingSource(source);
        setFormData({
            name: source.name,
            description: source.description || '',
        });
        setIsEditModalOpen(true);
    };

    const openDeleteModal = (source: FundingSource) => {
        setSelectedFundingSource(source);
        setIsDeleteModalOpen(true);
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
        });
        setSelectedFundingSource(null);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Funding Sources" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="rounded-xl border bg-card shadow-sm">
                    <div className="p-6">
                        <h1 className="mb-2 text-3xl font-bold">Funding Sources</h1>
                        <p className="text-muted-foreground">Manage sources of funds for programs</p>
                    </div>

                    <div className="border-t p-6">
                        {/* Header with Add button */}
                        <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div className="relative flex-1 max-w-sm">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search funding sources..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9"
                                />
                            </div>

                            <Button onClick={() => setIsCreateModalOpen(true)}>
                                Add Funding Source
                            </Button>
                        </div>

                        {/* Results count */}
                        <div className="mb-4 text-sm text-muted-foreground">
                            Showing {paginatedFundingSources.length} of {filteredFundingSources.length} funding sources
                        </div>

                        {/* Table */}
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ID</TableHead>
                                        <TableHead>
                                            <Button variant="ghost" onClick={() => handleSort('name')} className="-ml-4">
                                                Name
                                                <ArrowUpDown className="ml-2 h-4 w-4" />
                                            </Button>
                                        </TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Created</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paginatedFundingSources.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-24 text-center">
                                                No funding sources found. Click "Add Funding Source" to create one.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        paginatedFundingSources.map((source) => (
                                            <TableRow key={source.id}>
                                                <TableCell className="font-medium">{source.id}</TableCell>
                                                <TableCell className="font-medium">{source.name}</TableCell>
                                                <TableCell>{source.description || '-'}</TableCell>
                                                <TableCell>{new Date(source.created_at).toLocaleDateString()}</TableCell>
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
                                                            <DropdownMenuItem onClick={() => openEditModal(source)}>
                                                                <Pencil className="mr-2 h-4 w-4" />
                                                                <span>Edit</span>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem 
                                                                onClick={() => openDeleteModal(source)}
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
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create Funding Source</DialogTitle>
                        <DialogDescription>
                            Add a new funding source. Fill in the details below.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="create-name">Funding Source Name <span className="text-red-500">*</span></Label>
                            <Input
                                id="create-name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g., Department of Agriculture"
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="create-description">Description</Label>
                            <textarea
                                id="create-description"
                                value={formData.description}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Brief description of the funding source"
                                rows={4}
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreate}>
                            Create Funding Source
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Modal */}
            <Dialog open={isEditModalOpen} onOpenChange={(open) => { setIsEditModalOpen(open); if (!open) resetForm(); }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Funding Source</DialogTitle>
                        <DialogDescription>
                            Update funding source information. Make your changes below.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-name">Funding Source Name <span className="text-red-500">*</span></Label>
                            <Input
                                id="edit-name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-description">Description</Label>
                            <textarea
                                id="edit-description"
                                value={formData.description}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, description: e.target.value })}
                                rows={4}
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleUpdate}>
                            Update Funding Source
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Modal */}
            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Funding Source</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "{selectedFundingSource?.name}"? This action cannot be undone.
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
