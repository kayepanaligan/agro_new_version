import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Category, type Commodity } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { ArrowUpDown, MoreHorizontal, Pencil, Search, Trash2, Upload, X, Image as ImageIcon } from 'lucide-react';
import { useMemo, useState, useRef, useCallback, useEffect } from 'react';

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
        title: 'Commodities',
        href: '/super-admin/commodities',
    },
];

type SortField = 'name' | 'category' | 'created_at';
type SortOrder = 'asc' | 'desc';

interface CommodityWithCategory extends Commodity {
    category?: { id: number; name: string } | null;
}

interface ImageUploadAreaProps {
    imageFile: File | null;
    imageUrl: string | null;
    onImageChange: (file: File | null) => void;
    label: string;
    disabled?: boolean;
}

const ImageUploadArea: React.FC<ImageUploadAreaProps> = ({
    imageFile,
    imageUrl,
    onImageChange,
    label,
    disabled = false,
}) => {
    const [isDragOver, setIsDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback(() => {
        setIsDragOver(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        const files = e.dataTransfer.files;
        if (files.length > 0 && files[0].type.startsWith('image/')) {
            onImageChange(files[0]);
        }
    }, [onImageChange]);

    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            onImageChange(files[0]);
        }
    }, [onImageChange]);

    const handleRemoveImage = useCallback(() => {
        onImageChange(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, [onImageChange]);

    const previewUrl = useMemo(() => {
        if (imageFile) {
            return URL.createObjectURL(imageFile);
        }
        return imageUrl;
    }, [imageFile, imageUrl]);

    return (
        <div className="grid gap-2">
            <Label>{label}</Label>
            <div
                className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    isDragOver
                        ? 'border-primary bg-primary/5'
                        : 'border-muted-foreground/25 hover:border-primary/50'
                } ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                {previewUrl ? (
                    <div className="relative">
                        <img
                            src={previewUrl}
                            alt="Preview"
                            className="mx-auto max-h-48 rounded-lg object-contain"
                        />
                        <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2 h-8 w-8 rounded-full p-0"
                            onClick={handleRemoveImage}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                ) : (
                    <div
                        className="cursor-pointer"
                        onClick={() => !disabled && fileInputRef.current?.click()}
                    >
                        <div className="flex flex-col items-center gap-2">
                            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                                <Upload className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <div className="text-sm text-muted-foreground">
                                <span className="font-medium">Click to upload</span> or drag and drop
                            </div>
                            <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 2MB</p>
                        </div>
                    </div>
                )}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    disabled={disabled}
                />
            </div>
        </div>
    );
};

export default function Commodities() {
    const { commodities, categories } = usePage<{ commodities: CommodityWithCategory[]; categories: Category[] }>().props;
    const [searchTerm, setSearchTerm] = useState('');
    const [sortField, setSortField] = useState<SortField>('name');
    const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedCommodity, setSelectedCommodity] = useState<CommodityWithCategory | null>(null);
    const [formData, setFormData] = useState({
        category_id: '',
        name: '',
        description: '',
        image: null as File | null,
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

    // Filter and sort commodities
    const filteredCommodities = useMemo(() => {
        let result = [...commodities];

        // Search filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(
                (commodity) =>
                    commodity.name.toLowerCase().includes(term) ||
                    commodity.description?.toLowerCase().includes(term) ||
                    commodity.category?.name.toLowerCase().includes(term),
            );
        }

        // Category filter
        if (categoryFilter !== 'all') {
            result = result.filter((commodity) => commodity.category_id === parseInt(categoryFilter));
        }

        // Sorting
        result.sort((a, b) => {
            let aValue: any = a[sortField];
            let bValue: any = b[sortField];

            if (sortField === 'name') {
                aValue = aValue.toLowerCase();
                bValue = bValue.toLowerCase();
            } else if (sortField === 'category') {
                aValue = a.category?.name.toLowerCase() || '';
                bValue = b.category?.name.toLowerCase() || '';
            }

            if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });

        return result;
    }, [commodities, searchTerm, sortField, sortOrder, categoryFilter]);

    // Pagination
    const totalPages = Math.ceil(filteredCommodities.length / itemsPerPage);
    const paginatedCommodities = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredCommodities.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredCommodities, currentPage, itemsPerPage]);

    // Reset to page 1 when filters change
    useMemo(() => {
        setCurrentPage(1);
    }, [searchTerm, categoryFilter, sortField, sortOrder]);

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
        const nameExists = commodities.some(
            (c) => c.name.toLowerCase() === formData.name.toLowerCase()
        );
        
        if (nameExists) {
            alert(`A commodity with the name "${formData.name}" already exists. Please use a unique name.`);
            return;
        }

        const data = new FormData();
        data.append('category_id', formData.category_id);
        data.append('name', formData.name);
        data.append('description', formData.description);
        if (formData.image) {
            data.append('image', formData.image);
        }

        router.post('/super-admin/commodities', data, {
            preserveScroll: false,
            preserveState: false,
            onSuccess: () => {
                console.log('🔧 CREATE SUCCESS - Starting cleanup...');
                
                // NUCLEAR OPTION: Force remove ALL dialog overlays from DOM
                const overlays = document.querySelectorAll('[data-state="open"]');
                console.log('Found', overlays.length, 'open dialogs to close');
                overlays.forEach((overlay, idx) => {
                    console.log(`Closing overlay #${idx}:`, overlay.tagName);
                    overlay.setAttribute('data-state', 'closed');
                    (overlay as HTMLElement).style.display = 'none';
                });
                
                // Then update React state
                setIsCreateModalOpen(false);
                console.log('Set modal state to false');
                
                // Clean up other state
                setTimeout(() => {
                    setFormData({ category_id: '', name: '', description: '', image: null });
                    console.log('Cleanup complete!');
                }, 100);
            },
            onError: (errors) => {
                console.error('Create error:', errors);
            },
        });
    };

    const handleUpdate = () => {
        if (!selectedCommodity) return;

        // Validate unique name on client-side (excluding current commodity)
        const nameExists = commodities.some(
            (c) => c.id !== selectedCommodity.id && c.name.toLowerCase() === formData.name.toLowerCase()
        );
        
        if (nameExists) {
            alert(`A commodity with the name "${formData.name}" already exists. Please use a unique name.`);
            return;
        }

        const data = new FormData();
        data.append('category_id', formData.category_id);
        data.append('name', formData.name);
        data.append('description', formData.description);
        if (formData.image) {
            data.append('image', formData.image);
        }

        router.post(`/super-admin/commodities/${selectedCommodity.id}?_method=PUT`, data, {
            preserveScroll: false,
            preserveState: false,
            onSuccess: () => {
                console.log('🔧 UPDATE SUCCESS - Starting cleanup...');
                console.log('Current modal state:', isEditModalOpen);
                
                // NUCLEAR OPTION: Force remove ALL dialog overlays from DOM
                const overlays = document.querySelectorAll('[data-state="open"]');
                console.log('Found', overlays.length, 'open dialogs to close');
                overlays.forEach((overlay, idx) => {
                    console.log(`Closing overlay #${idx}:`, overlay.tagName, overlay.getAttribute('data-radix-dialog-overlay'));
                    overlay.setAttribute('data-state', 'closed');
                    // Also hide it visually
                    (overlay as HTMLElement).style.display = 'none';
                });
                
                // Then update React state
                setIsEditModalOpen(false);
                console.log('Set modal state to false');
                
                // Clean up other state
                setTimeout(() => {
                    setFormData({ category_id: '', name: '', description: '', image: null });
                    setSelectedCommodity(null);
                    console.log('Cleanup complete!');
                }, 100);
            },
            onError: (errors) => {
                console.error('Update error:', errors);
            },
        });
    };

    const handleDelete = () => {
        if (!selectedCommodity) return;

        router.delete(`/super-admin/commodities/${selectedCommodity.id}`, {
            preserveScroll: false,
            preserveState: false,
            onSuccess: () => {
                console.log('🔧 DELETE SUCCESS - Starting cleanup...');
                
                // NUCLEAR OPTION: Force remove ALL dialog overlays from DOM
                const overlays = document.querySelectorAll('[data-state="open"]');
                console.log('Found', overlays.length, 'open dialogs to close');
                overlays.forEach((overlay, idx) => {
                    console.log(`Closing overlay #${idx}:`, overlay.tagName);
                    overlay.setAttribute('data-state', 'closed');
                    (overlay as HTMLElement).style.display = 'none';
                });
                
                // Then update React state
                setIsDeleteModalOpen(false);
                console.log('Set modal state to false');
                
                // Clean up other state
                setTimeout(() => {
                    setSelectedCommodity(null);
                    console.log('Cleanup complete!');
                }, 100);
            },
            onError: (errors) => {
                console.error('Delete error:', errors);
            },
        });
    };

    const openEditModal = (commodity: CommodityWithCategory) => {
        setSelectedCommodity(commodity);
        setFormData({
            category_id: commodity.category_id.toString(),
            name: commodity.name,
            description: commodity.description || '',
            image: null,
        });
        setIsEditModalOpen(true);
    };

    const openDeleteModal = (commodity: CommodityWithCategory) => {
        setSelectedCommodity(commodity);
        setIsDeleteModalOpen(true);
    };

    const resetForm = () => {
        setFormData({ category_id: '', name: '', description: '', image: null });
        setSelectedCommodity(null);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Commodities" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="rounded-xl border bg-card shadow-sm">
                    <div className="p-6">
                        <h1 className="mb-2 text-3xl font-bold">Commodities</h1>
                        <p className="text-muted-foreground">Manage agricultural products and commodities</p>
                    </div>

                    <div className="border-t p-6">
                        {/* Header with Add button */}
                        <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div className="relative flex-1 max-w-sm">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search commodities..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9"
                                />
                            </div>

                            <Button onClick={() => setIsCreateModalOpen(true)}>
                                Add Commodity
                            </Button>
                        </div>

                        {/* Filters */}
                        <div className="mb-4 flex items-center gap-2">
                            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                <SelectTrigger className="w-[200px]">
                                    <SelectValue placeholder="Filter by category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Categories</SelectItem>
                                    {categories.map((category) => (
                                        <SelectItem key={category.id} value={category.id.toString()}>
                                            {category.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Results count */}
                        <div className="mb-4 text-sm text-muted-foreground">
                            Showing {paginatedCommodities.length} of {filteredCommodities.length} commodities
                        </div>

                        {/* Table */}
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[100px]">ID</TableHead>
                                        <TableHead>Image</TableHead>
                                        <TableHead>
                                            <Button variant="ghost" onClick={() => handleSort('name')} className="-ml-4">
                                                Name
                                                <ArrowUpDown className="ml-2 h-4 w-4" />
                                            </Button>
                                        </TableHead>
                                        <TableHead>
                                            <Button variant="ghost" onClick={() => handleSort('category')} className="-ml-4">
                                                Category
                                                <ArrowUpDown className="ml-2 h-4 w-4" />
                                            </Button>
                                        </TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Created</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredCommodities.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="h-24 text-center">
                                                No commodities found. Click "Add Commodity" to create one.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        paginatedCommodities.map((commodity) => (
                                            <TableRow key={commodity.id}>
                                                <TableCell className="font-medium">{commodity.id}</TableCell>
                                                <TableCell>
                                                    {commodity.image_path ? (
                                                        <img
                                                            src={`/storage/${commodity.image_path}?t=${new Date().getTime()}`}
                                                            alt={commodity.name}
                                                            className="h-12 w-12 rounded object-cover"
                                                        />
                                                    ) : (
                                                        <div className="h-12 w-12 rounded bg-muted flex items-center justify-center">
                                                            <ImageIcon className="h-6 w-6 text-muted-foreground" />
                                                        </div>
                                                    )}
                                                </TableCell>
                                                <TableCell className="font-medium">{commodity.name}</TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary">{commodity.category?.name || 'No Category'}</Badge>
                                                </TableCell>
                                                <TableCell>{commodity.description || '-'}</TableCell>
                                                <TableCell>{new Date(commodity.created_at).toLocaleDateString()}</TableCell>
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
                                                            <DropdownMenuItem onClick={() => openEditModal(commodity)}>
                                                                <Pencil className="mr-2 h-4 w-4" />
                                                                <span>Edit</span>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem 
                                                                onClick={() => openDeleteModal(commodity)}
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
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Create Commodity</DialogTitle>
                        <DialogDescription>
                            Add a new commodity. Fill in the details below.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="create-category">Category</Label>
                                <Select value={formData.category_id} onValueChange={(value) => setFormData({ ...formData, category_id: value })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((category) => (
                                            <SelectItem key={category.id} value={category.id.toString()}>
                                                {category.name}
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
                                    placeholder="e.g., Carrot"
                                />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="create-description">Description</Label>
                            <Input
                                id="create-description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="e.g., Fresh orange carrots"
                            />
                        </div>
                        
                        <ImageUploadArea
                            label="Product Image"
                            imageFile={formData.image}
                            imageUrl={null}
                            onImageChange={(image) => setFormData({ ...formData, image })}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreate}>
                            Create Commodity
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
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Edit Commodity</DialogTitle>
                        <DialogDescription>
                            Update commodity information. Make your changes below.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit-category">Category</Label>
                                <Select value={formData.category_id} onValueChange={(value) => setFormData({ ...formData, category_id: value })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((category) => (
                                            <SelectItem key={category.id} value={category.id.toString()}>
                                                {category.name}
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
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-description">Description</Label>
                            <Input
                                id="edit-description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                        
                        <ImageUploadArea
                            label="Product Image"
                            imageFile={formData.image}
                            imageUrl={selectedCommodity?.image_path ? `/storage/${selectedCommodity.image_path}` : null}
                            onImageChange={(image) => setFormData({ ...formData, image })}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleUpdate}>
                            Update Commodity
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Modal */}
            <Dialog open={isDeleteModalOpen} onOpenChange={(open) => {
                setIsDeleteModalOpen(open);
                if (!open) {
                    setSelectedCommodity(null);
                    // Clear any focused elements to prevent button lock
                    document.activeElement instanceof HTMLElement && document.activeElement.blur();
                }
            }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Commodity</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "{selectedCommodity?.name}"? This action cannot be undone.
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
