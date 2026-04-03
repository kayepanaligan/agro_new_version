import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type FarmerEligibility } from '@/types';
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
import { Badge } from '@/components/ui/badge';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Farmer Eligibilities',
        href: '/admin/farmer-eligibilities',
    },
];

type SortField = 'name' | 'attribute_field' | 'created_at';
type SortOrder = 'asc' | 'desc';

export default function FarmerEligibilities() {
    const { farmerEligibilities } = usePage<{ farmerEligibilities: FarmerEligibility[] }>().props;
    const [searchTerm, setSearchTerm] = useState('');
    const [sortField, setSortField] = useState<SortField>('name');
    const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedEligibility, setSelectedEligibility] = useState<FarmerEligibility | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        attribute_field: '',
        required_value: '',
        is_active: true,
    });

    // Filter and sort eligibilities
    const filteredEligibilities = useMemo(() => {
        let result = [...farmerEligibilities];

        // Search filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(
                (eligibility) =>
                    eligibility.name.toLowerCase().includes(term) ||
                    eligibility.attribute_field.toLowerCase().includes(term) ||
                    eligibility.required_value.toLowerCase().includes(term) ||
                    eligibility.description?.toLowerCase().includes(term),
            );
        }

        // Sorting
        result.sort((a, b) => {
            let aValue: any = a[sortField];
            let bValue: any = b[sortField];

            if (sortField === 'name' || sortField === 'attribute_field') {
                aValue = aValue.toLowerCase();
                bValue = bValue.toLowerCase();
            }

            if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });

        return result;
    }, [farmerEligibilities, searchTerm, sortField, sortOrder]);

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
    };

    const handleCreate = () => {
        router.post('/admin/farmer-eligibilities', formData, {
            preserveScroll: true,
            onSuccess: () => {
                setIsCreateModalOpen(false);
                setFormData({ name: '', description: '', attribute_field: '', required_value: '', is_active: true });
            },
        });
    };

    const handleUpdate = () => {
        if (!selectedEligibility) return;

        router.put(`/admin/farmer-eligibilities/${selectedEligibility.id}`, formData, {
            preserveScroll: true,
            onSuccess: () => {
                setIsEditModalOpen(false);
                setFormData({ name: '', description: '', attribute_field: '', required_value: '', is_active: true });
                setSelectedEligibility(null);
            },
        });
    };

    const handleDelete = () => {
        if (!selectedEligibility) return;

        router.delete(`/admin/farmer-eligibilities/${selectedEligibility.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setIsDeleteModalOpen(false);
                setSelectedEligibility(null);
            },
        });
    };

    const openEditModal = (eligibility: FarmerEligibility) => {
        setSelectedEligibility(eligibility);
        setFormData({
            name: eligibility.name,
            description: eligibility.description || '',
            attribute_field: eligibility.attribute_field,
            required_value: eligibility.required_value,
            is_active: eligibility.is_active,
        });
        setIsEditModalOpen(true);
    };

    const openDeleteModal = (eligibility: FarmerEligibility) => {
        setSelectedEligibility(eligibility);
        setIsDeleteModalOpen(true);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Farmer Eligibilities" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="rounded-xl border bg-card shadow-sm">
                    <div className="p-6">
                        <h1 className="mb-2 text-3xl font-bold">Farmer Eligibilities</h1>
                        <p className="text-muted-foreground">Manage eligibility criteria for farmers</p>
                    </div>

                    <div className="border-t p-6">
                        {/* Header with Add button */}
                        <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div className="relative flex-1 max-w-sm">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search eligibilities..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9"
                                />
                            </div>

                            <Button onClick={() => setIsCreateModalOpen(true)}>
                                Add Eligibility
                            </Button>
                        </div>

                        {/* Results count */}
                        <div className="mb-4 text-sm text-muted-foreground">
                            Showing {filteredEligibilities.length} of {farmerEligibilities.length} eligibilities
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
                                        <TableHead>Attribute Field</TableHead>
                                        <TableHead>Required Value</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredEligibilities.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="h-24 text-center">
                                                No farmer eligibilities found. Click "Add Eligibility" to create one.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredEligibilities.map((eligibility) => (
                                            <TableRow key={eligibility.id}>
                                                <TableCell className="font-medium">{eligibility.id}</TableCell>
                                                <TableCell className="font-medium">{eligibility.name}</TableCell>
                                                <TableCell className="font-mono text-sm">{eligibility.attribute_field}</TableCell>
                                                <TableCell className="font-mono text-sm">{eligibility.required_value}</TableCell>
                                                <TableCell>
                                                    {eligibility.is_active ? (
                                                        <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                                                            Active
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center rounded-full bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                                                            Inactive
                                                        </span>
                                                    )}
                                                </TableCell>
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
                                                            <DropdownMenuItem onClick={() => openEditModal(eligibility)}>
                                                                <Pencil className="mr-2 h-4 w-4" />
                                                                <span>Edit</span>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem 
                                                                onClick={() => openDeleteModal(eligibility)}
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
                        <DialogTitle>Create Farmer Eligibility</DialogTitle>
                        <DialogDescription>
                            Add a new farmer eligibility criterion. Fill in the details below.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="create-name">Name</Label>
                            <Input
                                id="create-name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g., PWD Beneficiary"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="create-description">Description</Label>
                            <Input
                                id="create-description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="e.g., Farmer is a person with disability"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="create-attribute">Attribute Field</Label>
                            <Input
                                id="create-attribute"
                                value={formData.attribute_field}
                                onChange={(e) => setFormData({ ...formData, attribute_field: e.target.value })}
                                placeholder="e.g., is_pwd"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="create-value">Required Value</Label>
                            <Input
                                id="create-value"
                                value={formData.required_value}
                                onChange={(e) => setFormData({ ...formData, required_value: e.target.value })}
                                placeholder="e.g., 1 or true"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="create-active">Active</Label>
                            <select
                                id="create-active"
                                value={formData.is_active ? 'true' : 'false'}
                                onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'true' })}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            >
                                <option value="true">Active</option>
                                <option value="false">Inactive</option>
                            </select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreate}>
                            Create Eligibility
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Modal */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Farmer Eligibility</DialogTitle>
                        <DialogDescription>
                            Update farmer eligibility information. Make your changes below.
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
                            <Label htmlFor="edit-description">Description</Label>
                            <Input
                                id="edit-description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-attribute">Attribute Field</Label>
                            <Input
                                id="edit-attribute"
                                value={formData.attribute_field}
                                onChange={(e) => setFormData({ ...formData, attribute_field: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-value">Required Value</Label>
                            <Input
                                id="edit-value"
                                value={formData.required_value}
                                onChange={(e) => setFormData({ ...formData, required_value: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-active">Active</Label>
                            <select
                                id="edit-active"
                                value={formData.is_active ? 'true' : 'false'}
                                onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'true' })}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            >
                                <option value="true">Active</option>
                                <option value="false">Inactive</option>
                            </select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleUpdate}>
                            Update Eligibility
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Modal */}
            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Farmer Eligibility</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "{selectedEligibility?.name}"? This action cannot be undone.
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
