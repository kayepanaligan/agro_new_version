import AppLayout from '@/layouts/app-layout';
import { type AssistanceCategory, type BreadcrumbItem, type Program, type Barangay } from '@/types';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Assistance Categories',
        href: '/super-admin/assistance-categories',
    },
];

type SortField = 'name' | 'created_at';
type SortOrder = 'asc' | 'desc';

export default function AssistanceCategories() {
    const { assistanceCategories, programs, barangays } = usePage<{
        assistanceCategories: AssistanceCategory[];
        programs: Program[];
        barangays: Barangay[];
    }>().props;

    const [searchTerm, setSearchTerm] = useState('');
    const [sortField, setSortField] = useState<SortField>('name');
    const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<AssistanceCategory | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        program_id: 0,
        barangay_ids: [] as number[],
    });
    const [openBarangaySelect, setOpenBarangaySelect] = useState(false);

    const filteredCategories = useMemo(() => {
        let result = [...assistanceCategories];

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(
                (category) =>
                    category.name.toLowerCase().includes(term) ||
                    category.description?.toLowerCase().includes(term) ||
                    category.program?.program_name.toLowerCase().includes(term),
            );
        }

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
    }, [assistanceCategories, searchTerm, sortField, sortOrder]);

    const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
    const paginatedCategories = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredCategories.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredCategories, currentPage, itemsPerPage]);

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
        router.post('/super-admin/assistance-categories', formData, {
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
        if (!selectedCategory) return;

        router.put(`/super-admin/assistance-categories/${selectedCategory.id}`, formData, {
            preserveScroll: false,
            onSuccess: () => {
                setIsEditModalOpen(false);
                resetForm();
                setSelectedCategory(null);
            },
            onError: (errors) => {
                console.error('Update error:', errors);
            },
        });
    };

    const handleDelete = () => {
        if (!selectedCategory) return;

        router.delete(`/super-admin/assistance-categories/${selectedCategory.id}`, {
            preserveScroll: false,
            onSuccess: () => {
                setIsDeleteModalOpen(false);
                setSelectedCategory(null);
            },
            onError: (errors) => {
                console.error('Delete error:', errors);
            },
        });
    };

    const openEditModal = (category: AssistanceCategory) => {
        setSelectedCategory(category);
        setFormData({
            name: category.name,
            description: category.description || '',
            program_id: category.program_id,
            barangay_ids: category.barangay_ids || [],
        });
        setIsEditModalOpen(true);
    };

    const openDeleteModal = (category: AssistanceCategory) => {
        setSelectedCategory(category);
        setIsDeleteModalOpen(true);
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            program_id: 0,
            barangay_ids: [],
        });
        setSelectedCategory(null);
    };

    const toggleBarangay = (barangayId: number) => {
        setFormData((prev) => ({
            ...prev,
            barangay_ids: prev.barangay_ids.includes(barangayId)
                ? prev.barangay_ids.filter((id) => id !== barangayId)
                : [...prev.barangay_ids, barangayId],
        }));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Assistance Categories" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="rounded-xl border bg-card shadow-sm">
                    <div className="p-6">
                        <h1 className="mb-2 text-3xl font-bold">Assistance Categories</h1>
                        <p className="text-muted-foreground">Define kinds of support distributed within programs</p>
                    </div>

                    <div className="border-t p-6">
                        <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div className="relative flex-1 max-w-sm">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search categories..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9"
                                />
                            </div>

                            <Button onClick={() => setIsCreateModalOpen(true)}>
                                Add Category
                            </Button>
                        </div>

                        <div className="mb-4 text-sm text-muted-foreground">
                            Showing {paginatedCategories.length} of {filteredCategories.length} categories
                        </div>

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
                                        <TableHead>Program</TableHead>
                                        <TableHead>Eligible Barangays</TableHead>
                                        <TableHead>Created</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paginatedCategories.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="h-24 text-center">
                                                No assistance categories found. Click "Add Category" to create one.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        paginatedCategories.map((category) => (
                                            <TableRow key={category.id}>
                                                <TableCell className="font-medium">{category.id}</TableCell>
                                                <TableCell className="font-medium">{category.name}</TableCell>
                                                <TableCell>{category.description || '-'}</TableCell>
                                                <TableCell>{category.program?.program_name || '-'}</TableCell>
                                                <TableCell>
                                                    {(category.barangay_ids || []).length === 0 ? (
                                                        <span className="text-muted-foreground">All Barangays</span>
                                                    ) : (
                                                        <div className="flex flex-wrap gap-1">
                                                            {(category.barangay_ids || []).slice(0, 3).map((id) => {
                                                                const brgy = barangays.find((b) => b.id === id);
                                                                return brgy ? (
                                                                    <Badge key={id} variant="secondary" className="text-xs">
                                                                        {brgy.name}
                                                                    </Badge>
                                                                ) : null;
                                                            })}
                                                            {(category.barangay_ids || []).length > 3 && (
                                                                <Badge variant="outline" className="text-xs">
                                                                    +{(category.barangay_ids || []).length - 3} more
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    )}
                                                </TableCell>
                                                <TableCell>{new Date(category.created_at).toLocaleDateString()}</TableCell>
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
                                                            <DropdownMenuItem onClick={() => openEditModal(category)}>
                                                                <Pencil className="mr-2 h-4 w-4" />
                                                                <span>Edit</span>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem 
                                                                onClick={() => openDeleteModal(category)}
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
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Create Assistance Category</DialogTitle>
                        <DialogDescription>
                            Add a new assistance category. Fill in the details below.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="create-name">Category Name <span className="text-red-500">*</span></Label>
                            <Input
                                id="create-name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g., Input Support"
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="create-description">Description</Label>
                            <textarea
                                id="create-description"
                                value={formData.description}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Purpose of this type of allocation"
                                rows={3}
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="create-program">Program <span className="text-red-500">*</span></Label>
                            <Select
                                value={formData.program_id.toString()}
                                onValueChange={(value) => setFormData({ ...formData, program_id: parseInt(value) })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a program" />
                                </SelectTrigger>
                                <SelectContent>
                                    {(programs || []).map((program) => (
                                        <SelectItem key={program.id} value={program.id.toString()}>
                                            {program.program_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label>Eligible Barangays</Label>
                            <Popover open={openBarangaySelect} onOpenChange={setOpenBarangaySelect}>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="justify-start text-left font-normal">
                                        {formData.barangay_ids.length === 0 ? (
                                            <span>Select barangays (leave empty for all)</span>
                                        ) : (
                                            <span>{formData.barangay_ids.length} selected</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[300px] p-0" align="start">
                                    <Command>
                                        <CommandInput placeholder="Search barangays..." />
                                        <CommandList>
                                            <CommandEmpty>No barangay found.</CommandEmpty>
                                            <CommandGroup>
                                                {(barangays || []).map((barangay) => (
                                                    <CommandItem
                                                        key={barangay.id}
                                                        onSelect={() => toggleBarangay(barangay.id)}
                                                    >
                                                        <Checkbox
                                                            checked={formData.barangay_ids.includes(barangay.id)}
                                                            className="mr-2"
                                                        />
                                                        {barangay.name}
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreate}>
                            Create Category
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Modal */}
            <Dialog open={isEditModalOpen} onOpenChange={(open) => { setIsEditModalOpen(open); if (!open) resetForm(); }}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Edit Assistance Category</DialogTitle>
                        <DialogDescription>
                            Update category information. Make your changes below.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-name">Category Name <span className="text-red-500">*</span></Label>
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
                                rows={3}
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-program">Program <span className="text-red-500">*</span></Label>
                            <Select
                                value={formData.program_id.toString()}
                                onValueChange={(value) => setFormData({ ...formData, program_id: parseInt(value) })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a program" />
                                </SelectTrigger>
                                <SelectContent>
                                    {(programs || []).map((program) => (
                                        <SelectItem key={program.id} value={program.id.toString()}>
                                            {program.program_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label>Eligible Barangays</Label>
                            <Popover open={openBarangaySelect} onOpenChange={setOpenBarangaySelect}>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="justify-start text-left font-normal">
                                        {formData.barangay_ids.length === 0 ? (
                                            <span>Select barangays (leave empty for all)</span>
                                        ) : (
                                            <span>{formData.barangay_ids.length} selected</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[300px] p-0" align="start">
                                    <Command>
                                        <CommandInput placeholder="Search barangays..." />
                                        <CommandList>
                                            <CommandEmpty>No barangay found.</CommandEmpty>
                                            <CommandGroup>
                                                {(barangays || []).map((barangay) => (
                                                    <CommandItem
                                                        key={barangay.id}
                                                        onSelect={() => toggleBarangay(barangay.id)}
                                                    >
                                                        <Checkbox
                                                            checked={formData.barangay_ids.includes(barangay.id)}
                                                            className="mr-2"
                                                        />
                                                        {barangay.name}
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleUpdate}>
                            Update Category
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Modal */}
            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Category</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "{selectedCategory?.name}"? This action cannot be undone.
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
