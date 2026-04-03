import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type EligibleBarangay, type AllocationType, type Barangay } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { ArrowUpDown, MoreHorizontal, Search, Trash2 } from 'lucide-react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Eligible Barangays',
        href: '/admin/eligible-barangays',
    },
];

type SortField = 'created_at';
type SortOrder = 'asc' | 'desc';

export default function EligibleBarangays() {
    const { eligibleBarangays, allocationTypes, barangays } = usePage<{
        eligibleBarangays: EligibleBarangay[];
        allocationTypes: AllocationType[];
        barangays: Barangay[];
    }>().props;

    const [searchTerm, setSearchTerm] = useState('');
    const [sortField, setSortField] = useState<SortField>('created_at');
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<EligibleBarangay | null>(null);
    const [formData, setFormData] = useState({
        allocation_type_id: 0,
        barangay_id: 0,
    });

    const filteredRecords = useMemo(() => {
        let result = [...eligibleBarangays];

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(
                (record) =>
                    record.allocation_type?.name.toLowerCase().includes(term) ||
                    record.barangay?.name.toLowerCase().includes(term),
            );
        }

        result.sort((a, b) => {
            const aValue = new Date(a.created_at).getTime();
            const bValue = new Date(b.created_at).getTime();
            return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
        });

        return result;
    }, [eligibleBarangays, searchTerm, sortOrder]);

    const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
    const paginatedRecords = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredRecords.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredRecords, currentPage, itemsPerPage]);

    useMemo(() => {
        setCurrentPage(1);
    }, [searchTerm, sortField, sortOrder]);

    const handleCreate = () => {
        router.post('/admin/eligible-barangays', formData, {
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

    const handleDelete = () => {
        if (!selectedRecord) return;

        router.delete(`/admin/eligible-barangays/${selectedRecord.id}`, {
            preserveScroll: false,
            onSuccess: () => {
                setIsDeleteModalOpen(false);
                setSelectedRecord(null);
            },
            onError: (errors) => {
                console.error('Delete error:', errors);
            },
        });
    };

    const openDeleteModal = (record: EligibleBarangay) => {
        setSelectedRecord(record);
        setIsDeleteModalOpen(true);
    };

    const resetForm = () => {
        setFormData({
            allocation_type_id: 0,
            barangay_id: 0,
        });
        setSelectedRecord(null);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Eligible Barangays" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="rounded-xl border bg-card shadow-sm">
                    <div className="p-6">
                        <h1 className="mb-2 text-3xl font-bold">Eligible Barangays</h1>
                        <p className="text-muted-foreground">Restrict allocations to certain locations</p>
                    </div>

                    <div className="border-t p-6">
                        <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div className="relative flex-1 max-w-sm">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9"
                                />
                            </div>

                            <Button onClick={() => setIsCreateModalOpen(true)}>
                                Add Eligible Barangay
                            </Button>
                        </div>

                        <div className="mb-4 text-sm text-muted-foreground">
                            Showing {paginatedRecords.length} of {filteredRecords.length} records
                        </div>

                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ID</TableHead>
                                        <TableHead>Allocation Type</TableHead>
                                        <TableHead>Barangay</TableHead>
                                        <TableHead>Created</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paginatedRecords.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-24 text-center">
                                                No eligible barangays found. Click "Add Eligible Barangay" to create one.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        paginatedRecords.map((record) => (
                                            <TableRow key={record.id}>
                                                <TableCell className="font-medium">{record.id}</TableCell>
                                                <TableCell>{record.allocation_type?.name || '-'}</TableCell>
                                                <TableCell>{record.barangay?.name || '-'}</TableCell>
                                                <TableCell>{new Date(record.created_at).toLocaleDateString()}</TableCell>
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
                                                            <DropdownMenuItem 
                                                                onClick={() => openDeleteModal(record)}
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
                        <DialogTitle>Add Eligible Barangay</DialogTitle>
                        <DialogDescription>
                            Link a barangay to an allocation type.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="create-allocation-type">Allocation Type <span className="text-red-500">*</span></Label>
                            <Select
                                value={formData.allocation_type_id.toString()}
                                onValueChange={(value) => setFormData({ ...formData, allocation_type_id: parseInt(value) })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select an allocation type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {(allocationTypes || []).map((type) => (
                                        <SelectItem key={type.id} value={type.id.toString()}>
                                            {type.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="create-barangay">Barangay <span className="text-red-500">*</span></Label>
                            <Select
                                value={formData.barangay_id.toString()}
                                onValueChange={(value) => setFormData({ ...formData, barangay_id: parseInt(value) })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a barangay" />
                                </SelectTrigger>
                                <SelectContent>
                                    {(barangays || []).map((brgy) => (
                                        <SelectItem key={brgy.id} value={brgy.id.toString()}>
                                            {brgy.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreate}>
                            Add
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Modal */}
            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Record</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to remove this eligible barangay? This action cannot be undone.
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
