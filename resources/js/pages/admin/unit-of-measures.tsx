import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type UnitOfMeasure } from '@/types';
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
        title: 'Unit of Measures',
        href: '/admin/unit-of-measures',
    },
];

type SortField = 'name' | 'code' | 'created_at';
type SortOrder = 'asc' | 'desc';

export default function UnitOfMeasures() {
    const { unitOfMeasures } = usePage<{ unitOfMeasures: UnitOfMeasure[] }>().props;
    const [searchTerm, setSearchTerm] = useState('');
    const [sortField, setSortField] = useState<SortField>('name');
    const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedUoM, setSelectedUoM] = useState<UnitOfMeasure | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        description: '',
    });

    // Filter and sort unit of measures
    const filteredUoMs = useMemo(() => {
        let result = [...unitOfMeasures];

        // Search filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(
                (uom) =>
                    uom.name.toLowerCase().includes(term) ||
                    uom.code.toLowerCase().includes(term) ||
                    uom.description?.toLowerCase().includes(term),
            );
        }

        // Sorting
        result.sort((a, b) => {
            let aValue: any = a[sortField];
            let bValue: any = b[sortField];

            if (sortField === 'name' || sortField === 'code') {
                aValue = aValue.toLowerCase();
                bValue = bValue.toLowerCase();
            }

            if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });

        return result;
    }, [unitOfMeasures, searchTerm, sortField, sortOrder]);

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
    };

    const handleCreate = () => {
        router.post('/admin/unit-of-measures', formData, {
            preserveScroll: true,
            onSuccess: () => {
                setIsCreateModalOpen(false);
                setFormData({ name: '', code: '', description: '' });
            },
        });
    };

    const handleUpdate = () => {
        if (!selectedUoM) return;

        router.put(`/admin/unit-of-measures/${selectedUoM.id}`, formData, {
            preserveScroll: true,
            onSuccess: () => {
                setIsEditModalOpen(false);
                setFormData({ name: '', code: '', description: '' });
                setSelectedUoM(null);
            },
        });
    };

    const handleDelete = () => {
        if (!selectedUoM) return;

        router.delete(`/admin/unit-of-measures/${selectedUoM.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setIsDeleteModalOpen(false);
                setSelectedUoM(null);
            },
        });
    };

    const openEditModal = (uom: UnitOfMeasure) => {
        setSelectedUoM(uom);
        setFormData({
            name: uom.name,
            code: uom.code,
            description: uom.description || '',
        });
        setIsEditModalOpen(true);
    };

    const openDeleteModal = (uom: UnitOfMeasure) => {
        setSelectedUoM(uom);
        setIsDeleteModalOpen(true);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Unit of Measures" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="rounded-xl border bg-card shadow-sm">
                    <div className="p-6">
                        <h1 className="mb-2 text-3xl font-bold">Unit of Measures</h1>
                        <p className="text-muted-foreground">Manage measurement units for agricultural products</p>
                    </div>

                    <div className="border-t p-6">
                        {/* Header with Add button */}
                        <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div className="relative flex-1 max-w-sm">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search units..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9"
                                />
                            </div>

                            <Button onClick={() => setIsCreateModalOpen(true)}>
                                Add Unit of Measure
                            </Button>
                        </div>

                        {/* Results count */}
                        <div className="mb-4 text-sm text-muted-foreground">
                            Showing {filteredUoMs.length} of {unitOfMeasures.length} units
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
                                            <Button variant="ghost" onClick={() => handleSort('code')} className="-ml-4">
                                                Code
                                                <ArrowUpDown className="ml-2 h-4 w-4" />
                                            </Button>
                                        </TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Created</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredUoMs.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="h-24 text-center">
                                                No units of measure found. Click "Add Unit of Measure" to create one.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredUoMs.map((uom) => (
                                            <TableRow key={uom.id}>
                                                <TableCell className="font-medium">{uom.id}</TableCell>
                                                <TableCell className="font-medium">{uom.name}</TableCell>
                                                <TableCell>
                                                    <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                                                        {uom.code}
                                                    </span>
                                                </TableCell>
                                                <TableCell>{uom.description || '-'}</TableCell>
                                                <TableCell>{new Date(uom.created_at).toLocaleDateString()}</TableCell>
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
                                                            <DropdownMenuItem onClick={() => openEditModal(uom)}>
                                                                <Pencil className="mr-2 h-4 w-4" />
                                                                <span>Edit</span>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem 
                                                                onClick={() => openDeleteModal(uom)}
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
                </div>
            </div>

            {/* Create Modal */}
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create Unit of Measure</DialogTitle>
                        <DialogDescription>
                            Add a new unit of measure. Fill in the details below.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="create-name">Name</Label>
                            <Input
                                id="create-name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g., Kilogram"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="create-code">Code</Label>
                            <Input
                                id="create-code"
                                value={formData.code}
                                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                placeholder="e.g., KG"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="create-description">Description</Label>
                            <Input
                                id="create-description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="e.g., Standard unit for weight measurement"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreate}>
                            Create Unit
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Modal */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Unit of Measure</DialogTitle>
                        <DialogDescription>
                            Update unit of measure information. Make your changes below.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-name">Name</Label>
                            <Input
                                id="edit-name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-code">Code</Label>
                            <Input
                                id="edit-code"
                                value={formData.code}
                                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
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
                            Update Unit
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Modal */}
            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Unit of Measure</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "{selectedUoM?.name}"? This action cannot be undone.
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
