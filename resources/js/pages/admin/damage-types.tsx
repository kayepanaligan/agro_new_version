import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type DamageCategory, type DamageType } from '@/types';
import { Head, router } from '@inertiajs/react';
import { ArrowUpDown, MoreHorizontal, Pencil, Plus, Search, Trash2, Image as ImageIcon } from 'lucide-react';
import { useState, useMemo } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
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
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Damage Types',
        href: '/admin/damage-types',
    },
];

interface DamageTypesProps {
    damageTypes: DamageType[];
    damageCategories: DamageCategory[];
}

export default function DamageTypes({ damageTypes, damageCategories }: DamageTypesProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortField, setSortField] = useState<'damage_type_name' | 'damage_category_name' | 'created_at'>('damage_type_name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [filterCategory, setFilterCategory] = useState<string>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedType, setSelectedType] = useState<DamageType | null>(null);
    const [formData, setFormData] = useState({
        damage_type_name: '',
        damage_category_id: '',
        damage_type_description: '',
        image: null as File | null,
    });

    const filteredTypes = useMemo(() => {
        let result = [...damageTypes];

        // Search filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(
                (type) =>
                    type.damage_type_name.toLowerCase().includes(term) ||
                    type.damage_type_description?.toLowerCase().includes(term) ||
                    type.damage_category?.damage_category_name.toLowerCase().includes(term),
            );
        }

        // Category filter
        if (filterCategory !== 'all') {
            result = result.filter((type) => type.damage_category_id.toString() === filterCategory);
        }

        // Sort
        result.sort((a, b) => {
            let comparison = 0;
            
            switch (sortField) {
                case 'damage_type_name':
                    comparison = a.damage_type_name.localeCompare(b.damage_type_name);
                    break;
                case 'damage_category_name':
                    comparison = (a.damage_category?.damage_category_name || '').localeCompare(b.damage_category?.damage_category_name || '');
                    break;
                case 'created_at':
                    comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
                    break;
            }
            
            return sortOrder === 'asc' ? comparison : -comparison;
        });

        return result;
    }, [damageTypes, searchTerm, filterCategory, sortField, sortOrder]);

    // Pagination
    const totalPages = Math.ceil(filteredTypes.length / itemsPerPage);
    const paginatedTypes = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredTypes.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredTypes, currentPage, itemsPerPage]);

    // Reset to page 1 when filters change
    useMemo(() => {
        setCurrentPage(1);
    }, [searchTerm, filterCategory]);

    const handleSort = (field: typeof sortField) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
    };

    const openCreateModal = () => {
        setFormData({
            damage_type_name: '',
            damage_category_id: '',
            damage_type_description: '',
            image: null,
        });
        setIsCreateModalOpen(true);
    };

    const openEditModal = (type: DamageType) => {
        setSelectedType(type);
        setFormData({
            damage_type_name: type.damage_type_name,
            damage_category_id: type.damage_category_id.toString(),
            damage_type_description: type.damage_type_description || '',
            image: null,
        });
        setIsEditModalOpen(true);
    };

    const openDeleteModal = (type: DamageType) => {
        setSelectedType(type);
        setIsDeleteModalOpen(true);
    };

    const handleCreate = () => {
        const data = new FormData();
        data.append('damage_type_name', formData.damage_type_name);
        data.append('damage_category_id', formData.damage_category_id);
        data.append('damage_type_description', formData.damage_type_description);
        if (formData.image) {
            data.append('image', formData.image);
        }

        router.post('/admin/damage-types', data, {
            preserveScroll: false,
            onSuccess: () => {
                setIsCreateModalOpen(false);
                setFormData({
                    damage_type_name: '',
                    damage_category_id: '',
                    damage_type_description: '',
                    image: null,
                });
            },
            onError: (errors) => {
                console.error('Create error:', errors);
            },
        });
    };

    const handleUpdate = () => {
        if (!selectedType) return;
        
        const data = new FormData();
        data.append('damage_type_name', formData.damage_type_name);
        data.append('damage_category_id', formData.damage_category_id);
        data.append('damage_type_description', formData.damage_type_description);
        if (formData.image) {
            data.append('image', formData.image);
        }

        router.post(`/admin/damage-types/${selectedType.damage_type_id}?_method=PUT`, data, {
            preserveScroll: false,
            onSuccess: () => {
                setIsEditModalOpen(false);
                setSelectedType(null);
                setFormData({
                    damage_type_name: '',
                    damage_category_id: '',
                    damage_type_description: '',
                    image: null,
                });
            },
            onError: (errors) => {
                console.error('Update error:', errors);
            },
        });
    };

    const handleDelete = () => {
        if (!selectedType) return;

        router.delete(`/admin/damage-types/${selectedType.damage_type_id}`, {
            preserveScroll: false,
            onSuccess: () => {
                setIsDeleteModalOpen(false);
                setSelectedType(null);
            },
            onError: (errors) => {
                console.error('Delete error:', errors);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Damage Types" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                {/* Header */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold">Damage Types</h1>
                                <p className="text-muted-foreground">Manage specific damage types with images</p>
                            </div>
                            <Button onClick={openCreateModal}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Damage Type
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
                                        placeholder="Search damage types..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-9"
                                    />
                                </div>
                                
                                <Select value={filterCategory} onValueChange={setFilterCategory}>
                                    <SelectTrigger className="w-[200px]">
                                        <SelectValue placeholder="Filter by category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Categories</SelectItem>
                                        {damageCategories.map((category) => (
                                            <SelectItem key={category.damage_category_id} value={category.damage_category_id.toString()}>
                                                {category.damage_category_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                {(searchTerm || filterCategory !== 'all') && (
                                    <Button variant="ghost" size="sm" onClick={() => { setSearchTerm(''); setFilterCategory('all'); }}>
                                        Clear Filters
                                    </Button>
                                )}
                            </div>

                            <div className="text-sm text-muted-foreground">
                                {paginatedTypes.length} of {filteredTypes.length} damage type{filteredTypes.length !== 1 ? 's' : ''}
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
                                        <TableHead>Image</TableHead>
                                        <TableHead>
                                            <Button variant="ghost" onClick={() => handleSort('damage_type_name')} className="-ml-4">
                                                Damage Type Name
                                                <ArrowUpDown className="ml-2 h-4 w-4" />
                                            </Button>
                                        </TableHead>
                                        <TableHead>
                                            <Button variant="ghost" onClick={() => handleSort('damage_category_name')} className="-ml-4">
                                                Category
                                                <ArrowUpDown className="ml-2 h-4 w-4" />
                                            </Button>
                                        </TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead className="w-[70px]">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paginatedTypes.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="h-24 text-center">
                                                No damage types found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        paginatedTypes.map((type) => (
                                            <TableRow key={type.damage_type_id}>
                                                <TableCell className="font-medium">{type.damage_type_id}</TableCell>
                                                <TableCell>
                                                    {type.image_path ? (
                                                        <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-md border">
                                                            <img 
                                                                src={`/storage/${type.image_path}`} 
                                                                alt={type.damage_type_name}
                                                                className="h-full w-full object-cover"
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
                                                            <ImageIcon className="h-5 w-5 text-muted-foreground" />
                                                        </div>
                                                    )}
                                                </TableCell>
                                                <TableCell className="font-medium">{type.damage_type_name}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">
                                                        {type.damage_category?.damage_category_name || '-'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="max-w-[200px] truncate">
                                                    {type.damage_type_description || '-'}
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
                                                            <DropdownMenuItem onClick={() => openEditModal(type)}>
                                                                <Pencil className="mr-2 h-4 w-4" />
                                                                <span>Edit</span>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem 
                                                                onClick={() => openDeleteModal(type)}
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

            {/* Create Modal */}
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Create Damage Type</DialogTitle>
                        <DialogDescription>
                            Add a new damage type. Fill in the details below.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="damage_type_name">Damage Type Name</Label>
                            <Input
                                id="damage_type_name"
                                value={formData.damage_type_name}
                                onChange={(e) => setFormData({ ...formData, damage_type_name: e.target.value })}
                                placeholder="Enter damage type name"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="damage_category_id">Damage Category</Label>
                            <Select 
                                value={formData.damage_category_id} 
                                onValueChange={(value) => setFormData({ ...formData, damage_category_id: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {damageCategories.map((category) => (
                                        <SelectItem key={category.damage_category_id} value={category.damage_category_id.toString()}>
                                            {category.damage_category_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="damage_type_description">Description</Label>
                            <Textarea
                                id="damage_type_description"
                                value={formData.damage_type_description}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, damage_type_description: e.target.value })}
                                placeholder="Enter description (optional)"
                                rows={4}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="image">Image (Optional)</Label>
                            <div 
                                className={`relative flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-colors ${
                                    formData.image 
                                        ? 'border-primary bg-muted/30' 
                                        : 'border-border hover:bg-muted/50'
                                }`}
                            >
                                <input
                                    id="image"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0] || null;
                                        setFormData({ ...formData, image: file });
                                    }}
                                    className="absolute inset-0 h-full w-full opacity-0 cursor-pointer"
                                    onClick={(e) => e.stopPropagation()}
                                />
                                
                                {formData.image ? (
                                    // Image Preview Inside Drop Zone
                                    <div className="flex h-full w-full flex-col items-center justify-center p-4">
                                        <img
                                            src={URL.createObjectURL(formData.image)}
                                            alt="Preview"
                                            className="max-h-[160px] w-full rounded-lg border object-contain bg-white shadow-sm"
                                        />
                                        <p className="mt-3 text-[15px] text-muted-foreground/80">Click to change image</p>
                                    </div>
                                ) : (
                                    // Default Upload Prompt
                                    <div className="flex flex-col items-center justify-center p-6 text-center">
                                        <ImageIcon className="mb-3 h-8 w-8 text-muted-foreground/70" />
                                        <p className="text-[15px] font-medium text-foreground">Drag & drop file here or click to browse</p>
                                        <p className="mt-1 text-[15px] text-muted-foreground/80">Supported formats: JPEG, PNG, GIF. Max size: 2MB</p>
                                    </div>
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground">Upload a clear image of the damage type</p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreate}>
                            Create Damage Type
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Modal */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Edit Damage Type</DialogTitle>
                        <DialogDescription>
                            Update damage type information.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit_damage_type_name">Damage Type Name</Label>
                            <Input
                                id="edit_damage_type_name"
                                value={formData.damage_type_name}
                                onChange={(e) => setFormData({ ...formData, damage_type_name: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit_damage_category_id">Damage Category</Label>
                            <Select 
                                value={formData.damage_category_id} 
                                onValueChange={(value) => setFormData({ ...formData, damage_category_id: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {damageCategories.map((category) => (
                                        <SelectItem key={category.damage_category_id} value={category.damage_category_id.toString()}>
                                            {category.damage_category_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit_damage_type_description">Description</Label>
                            <Textarea
                                id="edit_damage_type_description"
                                value={formData.damage_type_description}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, damage_type_description: e.target.value })}
                                rows={4}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit_image">Update Image (Optional)</Label>
                            <div 
                                className={`relative flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-colors ${
                                    formData.image || selectedType?.image_path
                                        ? 'border-primary bg-muted/30' 
                                        : 'border-border hover:bg-muted/50'
                                }`}
                            >
                                <input
                                    id="edit_image"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0] || null;
                                        setFormData({ ...formData, image: file });
                                    }}
                                    className="absolute inset-0 h-full w-full opacity-0 cursor-pointer"
                                    onClick={(e) => e.stopPropagation()}
                                />
                                
                                {(() => {
                                    // Show new image preview if file selected
                                    if (formData.image) {
                                        return (
                                            <div className="flex h-full w-full flex-col items-center justify-center p-4">
                                                <img
                                                    src={URL.createObjectURL(formData.image)}
                                                    alt="Preview"
                                                    className="max-h-[160px] w-full rounded-lg border object-contain bg-white shadow-sm"
                                                />
                                                <p className="mt-3 text-[15px] text-muted-foreground/80">Click to change image</p>
                                            </div>
                                        );
                                    }
                                    // Show existing image if no new file selected
                                    if (selectedType?.image_path) {
                                        return (
                                            <div className="flex h-full w-full flex-col items-center justify-center p-4">
                                                <img
                                                    src={`/storage/${selectedType.image_path}`}
                                                    alt={selectedType.damage_type_name}
                                                    className="max-h-[160px] w-full rounded-lg border object-contain bg-white shadow-sm"
                                                />
                                                <p className="mt-3 text-[15px] text-muted-foreground/80">Current image - Click to replace</p>
                                            </div>
                                        );
                                    }
                                    // Show default upload prompt
                                    return (
                                        <div className="flex flex-col items-center justify-center p-6 text-center">
                                            <ImageIcon className="mb-3 h-8 w-8 text-muted-foreground/70" />
                                            <p className="text-[15px] font-medium text-foreground">Drag & drop file here or click to browse</p>
                                            <p className="mt-1 text-[15px] text-muted-foreground/80">Leave empty to keep current image</p>
                                        </div>
                                    );
                                })()}
                            </div>
                            <p className="text-xs text-muted-foreground">Upload a clear image of the damage type</p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleUpdate}>
                            Update Damage Type
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Modal */}
            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Damage Type</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "{selectedType?.damage_type_name}"? This action cannot be undone.
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
