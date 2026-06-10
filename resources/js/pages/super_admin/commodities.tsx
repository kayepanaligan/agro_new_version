import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Category, type Commodity } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { ArrowUpDown, MoreHorizontal, Pencil, Search, Trash2, Upload, X, Image as ImageIcon, Package, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
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

            <div className="flex h-full flex-1 flex-col gap-6 p-6">

                {/* Page Header */}
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-sm">
                            <Package className="h-5 w-5" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Commodities</h1>
                            <p className="text-sm text-muted-foreground">Manage agricultural products and commodities</p>
                        </div>
                    </div>
                    <Button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="mt-3 sm:mt-0 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        New Commodity
                    </Button>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    {[
                        { label: 'Total Commodities', value: commodities.length, accent: 'border-l-emerald-500' },
                        { label: 'With Images', value: commodities.filter((c) => c.image_path).length, accent: 'border-l-blue-400' },
                        { label: 'No Images', value: commodities.filter((c) => !c.image_path).length, accent: 'border-l-amber-400' },
                        { label: 'Categories', value: new Set(commodities.map((c) => c.category_id).filter(Boolean)).size, accent: 'border-l-purple-400' },
                    ].map((stat) => (
                        <div
                            key={stat.label}
                            className={`rounded-lg border bg-card p-4 shadow-sm border-l-4 ${stat.accent}`}
                        >
                            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{stat.label}</p>
                            <p className="mt-1 text-2xl font-bold text-foreground">{stat.value}</p>
                        </div>
                    ))}
                </div>

                {/* Table Card */}
                <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                    {/* Toolbar */}
                    <div className="flex flex-col gap-3 border-b px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3 flex-1">
                            <div className="relative w-full max-w-xs">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search commodities..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9 h-9 text-sm"
                                />
                            </div>
                            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                <SelectTrigger className="w-[180px] h-9 text-sm">
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
                        <span className="text-xs text-muted-foreground">
                            {filteredCommodities.length === commodities.length
                                ? `${commodities.length} commodities`
                                : `${filteredCommodities.length} of ${commodities.length} commodities`}
                        </span>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/40 hover:bg-muted/40">
                                    <TableHead className="w-16 text-xs font-semibold uppercase tracking-wide text-muted-foreground">ID</TableHead>
                                    <TableHead className="w-20 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Image</TableHead>
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
                                            onClick={() => handleSort('category')}
                                            className="flex items-center gap-1.5 hover:text-foreground transition-colors"
                                        >
                                            Category
                                            <ArrowUpDown className="h-3.5 w-3.5" />
                                        </button>
                                    </TableHead>
                                    <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground max-w-xs">Description</TableHead>
                                    <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Created</TableHead>
                                    <TableHead className="w-16 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedCommodities.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-40 text-center">
                                            <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                                <Package className="h-8 w-8 opacity-30" />
                                                <p className="text-sm font-medium">No commodities found</p>
                                                <p className="text-xs">
                                                    {searchTerm ? 'Try a different search term.' : 'Click "New Commodity" to get started.'}
                                                </p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    paginatedCommodities.map((commodity) => (
                                        <TableRow key={commodity.id} className="hover:bg-muted/30 transition-colors">
                                            <TableCell className="text-xs text-muted-foreground font-mono">{commodity.id}</TableCell>
                                            <TableCell>
                                                {commodity.image_path ? (
                                                    <img
                                                        src={`/storage/${commodity.image_path}?t=${new Date().getTime()}`}
                                                        alt={commodity.name}
                                                        className="h-10 w-10 rounded object-cover"
                                                    />
                                                ) : (
                                                    <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                                                        <ImageIcon className="h-5 w-5 text-muted-foreground" />
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell className="font-medium text-sm">{commodity.name}</TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" className="text-xs">{commodity.category?.name || 'No Category'}</Badge>
                                            </TableCell>
                                            <TableCell className="max-w-xs">
                                                <span className="text-sm text-muted-foreground line-clamp-2">
                                                    {commodity.description || '—'}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {new Date(commodity.created_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
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
                                                            onClick={() => openEditModal(commodity)}
                                                            className="cursor-pointer"
                                                        >
                                                            <Pencil className="mr-2 h-3.5 w-3.5" />
                                                            Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            onClick={() => openDeleteModal(commodity)}
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
                        <div className="flex items-center justify-between border-t px-6 py-4">
                            <p className="text-xs text-muted-foreground">
                                Page {currentPage} of {totalPages}
                            </p>
                            <div className="flex items-center gap-1">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    let pageNum: number;
                                    if (totalPages <= 5) pageNum = i + 1;
                                    else if (currentPage <= 3) pageNum = i + 1;
                                    else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                                    else pageNum = currentPage - 2 + i;
                                    return (
                                        <Button
                                            key={pageNum}
                                            variant={currentPage === pageNum ? 'default' : 'outline'}
                                            size="sm"
                                            className={`h-8 w-8 p-0 text-xs ${currentPage === pageNum ? 'bg-emerald-600 hover:bg-emerald-700 border-emerald-600' : ''}`}
                                            onClick={() => setCurrentPage(pageNum)}
                                        >
                                            {pageNum}
                                        </Button>
                                    );
                                })}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Create Modal */}
            <Dialog open={isCreateModalOpen} onOpenChange={(open) => { setIsCreateModalOpen(open); if (!open) resetForm(); }}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-100 text-emerald-700">
                                <Package className="h-4 w-4" />
                            </span>
                            New Commodity
                        </DialogTitle>
                        <DialogDescription>
                            Add a new agricultural commodity. Fields marked with <span className="text-red-500">*</span> are required.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="create-category">
                                    Category <span className="text-red-500">*</span>
                                </Label>
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
                                <Label htmlFor="create-name">
                                    Name <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="create-name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g., Rice"
                                />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="create-description">Description</Label>
                            <textarea
                                id="create-description"
                                value={formData.description}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                                    setFormData({ ...formData, description: e.target.value })
                                }
                                placeholder="Brief description of the commodity"
                                rows={3}
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
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
                        <Button
                            onClick={handleCreate}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                            disabled={!formData.name.trim() || !formData.category_id}
                        >
                            Create Commodity
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Modal */}
            <Dialog open={isEditModalOpen} onOpenChange={(open) => { setIsEditModalOpen(open); if (!open) resetForm(); }}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-100 text-slate-600">
                                <Pencil className="h-4 w-4" />
                            </span>
                            Edit Commodity
                        </DialogTitle>
                        <DialogDescription>
                            Update the details for <span className="font-medium text-foreground">{selectedCommodity?.name}</span>.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit-category">
                                    Category <span className="text-red-500">*</span>
                                </Label>
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
                                <Label htmlFor="edit-name">
                                    Name <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="edit-name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-description">Description</Label>
                            <textarea
                                id="edit-description"
                                value={formData.description}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                                    setFormData({ ...formData, description: e.target.value })
                                }
                                placeholder="Brief description of the commodity"
                                rows={3}
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
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
                        <Button
                            onClick={handleUpdate}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                            disabled={!formData.name.trim() || !formData.category_id}
                        >
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Modal */}
            <Dialog open={isDeleteModalOpen} onOpenChange={(open) => { setIsDeleteModalOpen(open); if (!open) setSelectedCommodity(null); }}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-red-100 text-red-600">
                                <Trash2 className="h-4 w-4" />
                            </span>
                            Delete Commodity
                        </DialogTitle>
                        <DialogDescription className="pt-1">
                            This will permanently delete{' '}
                            <span className="font-medium text-foreground">"{selectedCommodity?.name}"</span>.
                            This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            Delete Commodity
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
