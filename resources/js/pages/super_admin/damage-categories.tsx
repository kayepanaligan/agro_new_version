import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type DamageCategory } from '@/types';
import { Head, router } from '@inertiajs/react';
import { ArrowUpDown, MoreHorizontal, Pencil, Plus, Search, Trash2, AlertTriangle, FileText, Bug, Calendar } from 'lucide-react';
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
import { KpiCard } from '@/components/agro-profiler/kpi-card';
import { Pagination } from '@/components/agro-profiler/pagination';
import { ExportButtons } from '@/components/agro-profiler/export-buttons';
import { exportToCsv, exportToPdf } from '@/lib/export';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Damage Categories',
        href: '/super-admin/damage-categories',
    },
];

interface DamageCategoriesProps {
    damageCategories: DamageCategory[];
}

export default function DamageCategories({ damageCategories }: DamageCategoriesProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortField, setSortField] = useState<'damage_category_name' | 'damage_types_count' | 'created_at'>('damage_category_name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<DamageCategory | null>(null);
    const [formData, setFormData] = useState({
        damage_category_name: '',
        damage_category_description: '',
    });

    const filteredCategories = useMemo(() => {
        let result = [...damageCategories];

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(
                (category) =>
                    category.damage_category_name.toLowerCase().includes(term) ||
                    category.damage_category_description?.toLowerCase().includes(term),
            );
        }

        result.sort((a, b) => {
            let comparison = 0;
            
            switch (sortField) {
                case 'damage_category_name':
                    comparison = a.damage_category_name.localeCompare(b.damage_category_name);
                    break;
                case 'damage_types_count':
                    comparison = (a.damage_types_count || 0) - (b.damage_types_count || 0);
                    break;
                case 'created_at':
                    comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
                    break;
            }
            
            return sortOrder === 'asc' ? comparison : -comparison;
        });

        return result;
    }, [damageCategories, searchTerm, sortField, sortOrder]);

    const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
    const paginatedCategories = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredCategories.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredCategories, currentPage, itemsPerPage]);

    useMemo(() => {
        setCurrentPage(1);
    }, [searchTerm, sortField, sortOrder]);

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
            damage_category_name: '',
            damage_category_description: '',
        });
        setIsCreateModalOpen(true);
    };

    const openEditModal = (category: DamageCategory) => {
        setSelectedCategory(category);
        setFormData({
            damage_category_name: category.damage_category_name,
            damage_category_description: category.damage_category_description || '',
        });
        setIsEditModalOpen(true);
    };

    const openDeleteModal = (category: DamageCategory) => {
        setSelectedCategory(category);
        setIsDeleteModalOpen(true);
    };

    const handleCreate = () => {
        router.post('/super-admin/damage-categories', formData, {
            preserveScroll: false,
            onSuccess: () => {
                setIsCreateModalOpen(false);
                setFormData({ damage_category_name: '', damage_category_description: '' });
            },
            onError: (errors) => {
                console.error('Create error:', errors);
            },
        });
    };

    const handleUpdate = () => {
        if (!selectedCategory) return;
        
        router.put(`/super-admin/damage-categories/${selectedCategory.damage_category_id}`, formData, {
            preserveScroll: false,
            onSuccess: () => {
                setIsEditModalOpen(false);
                setSelectedCategory(null);
                setFormData({ damage_category_name: '', damage_category_description: '' });
            },
            onError: (errors) => {
                console.error('Update error:', errors);
            },
        });
    };

    const handleDelete = () => {
        if (!selectedCategory) return;

        router.delete(`/super-admin/damage-categories/${selectedCategory.damage_category_id}`, {
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

    const sharedTextareaClass =
        'flex min-h-[88px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none';

    const handleExportCsv = () => {
        const headers = ['ID', 'Category Name', 'Description', 'Damage Types', 'Created'];
        const rows = filteredCategories.map(c => [
            c.damage_category_id, c.damage_category_name, c.damage_category_description || '', c.damage_types_count || 0, new Date(c.created_at).toLocaleDateString(),
        ]);
        exportToCsv('damage-categories', headers, rows);
    };

    const FormFields = ({ prefix }: { prefix: string }) => (
        <div className="grid gap-4 py-4">
            <div className="grid gap-2">
                <Label htmlFor={`${prefix}-name`}>
                    Category Name <span className="text-red-500">*</span>
                </Label>
                <Input
                    id={`${prefix}-name`}
                    value={formData.damage_category_name}
                    onChange={(e) => setFormData({ ...formData, damage_category_name: e.target.value })}
                    placeholder="e.g., Crop Damage"
                />
            </div>
            <div className="grid gap-2">
                <Label htmlFor={`${prefix}-description`}>Description</Label>
                <textarea
                    id={`${prefix}-description`}
                    value={formData.damage_category_description}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                        setFormData({ ...formData, damage_category_description: e.target.value })
                    }
                    placeholder="Brief description of the damage category"
                    rows={3}
                    className={sharedTextareaClass}
                />
            </div>
        </div>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Damage Categories" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">

                {/* Page Header */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Damage Categories</h1>
                        <p className="text-sm text-muted-foreground">Manage standard damage categories</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <ExportButtons onExportCsv={handleExportCsv} onExportPdf={exportToPdf} />
                        <Button onClick={openCreateModal} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                            <Plus className="mr-2 h-4 w-4" />
                            New Category
                        </Button>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    <KpiCard label="Total Categories" value={damageCategories.length} icon={AlertTriangle} />
                    <KpiCard label="With Types" value={damageCategories.filter((c) => (c.damage_types_count || 0) > 0).length} icon={FileText} />
                    <KpiCard label="No Types" value={damageCategories.filter((c) => (c.damage_types_count || 0) === 0).length} icon={Bug} />
                    <KpiCard label="Total Damage Types" value={damageCategories.reduce((sum, c) => sum + (c.damage_types_count || 0), 0)} icon={Calendar} />
                </div>

                {/* Table Card */}
                <div className="glass-card rounded-2xl overflow-hidden">
                    {/* Toolbar */}
                    <div className="flex flex-col gap-3 border-b px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="relative w-full max-w-xs">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search categories..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 h-9 text-sm"
                            />
                        </div>
                        <span className="text-xs text-muted-foreground">
                            {filteredCategories.length === damageCategories.length
                                ? `${damageCategories.length} categories`
                                : `${filteredCategories.length} of ${damageCategories.length} categories`}
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
                                            onClick={() => handleSort('damage_category_name')}
                                            className="flex items-center gap-1.5 hover:text-foreground transition-colors"
                                        >
                                            Category Name
                                            <ArrowUpDown className="h-3.5 w-3.5" />
                                        </button>
                                    </TableHead>
                                    <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground max-w-xs">Description</TableHead>
                                    <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                        <button
                                            onClick={() => handleSort('damage_types_count')}
                                            className="flex items-center gap-1.5 hover:text-foreground transition-colors"
                                        >
                                            Damage Types
                                            <ArrowUpDown className="h-3.5 w-3.5" />
                                        </button>
                                    </TableHead>
                                    <TableHead className="w-16 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedCategories.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-40 text-center">
                                            <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                                <AlertTriangle className="h-8 w-8 opacity-30" />
                                                <p className="text-sm font-medium">No damage categories found</p>
                                                <p className="text-xs">
                                                    {searchTerm ? 'Try a different search term.' : 'Click "New Category" to get started.'}
                                                </p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    paginatedCategories.map((category) => (
                                        <TableRow key={category.damage_category_id} className="hover:bg-muted/30 transition-colors">
                                            <TableCell className="text-xs text-muted-foreground font-mono">{category.damage_category_id}</TableCell>
                                            <TableCell className="font-medium text-sm">{category.damage_category_name}</TableCell>
                                            <TableCell className="max-w-xs">
                                                <span className="text-sm text-muted-foreground line-clamp-2">
                                                    {category.damage_category_description || '—'}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">
                                                    {category.damage_types_count || 0} type{(category.damage_types_count || 0) !== 1 ? 's' : ''}
                                                </Badge>
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
                                                            onClick={() => openEditModal(category)}
                                                            className="cursor-pointer"
                                                        >
                                                            <Pencil className="mr-2 h-3.5 w-3.5" />
                                                            Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            onClick={() => openDeleteModal(category)}
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
                            <Pagination
                                currentPage={currentPage}
                                lastPage={totalPages}
                                total={filteredCategories.length}
                                perPage={itemsPerPage}
                                onPageChange={setCurrentPage}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Create Modal */}
            <Dialog open={isCreateModalOpen} onOpenChange={(open) => { setIsCreateModalOpen(open); if (!open) setFormData({ damage_category_name: '', damage_category_description: '' }); }}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-100 text-emerald-700">
                                <AlertTriangle className="h-4 w-4" />
                            </span>
                            New Damage Category
                        </DialogTitle>
                        <DialogDescription>
                            Add a new category. Fields marked with <span className="text-red-500">*</span> are required.
                        </DialogDescription>
                    </DialogHeader>
                    <FormFields prefix="create" />
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleCreate}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground"
                            disabled={!formData.damage_category_name.trim()}
                        >
                            Create Category
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Modal */}
            <Dialog open={isEditModalOpen} onOpenChange={(open) => { setIsEditModalOpen(open); if (!open) { setFormData({ damage_category_name: '', damage_category_description: '' }); setSelectedCategory(null); } }}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-100 text-slate-600">
                                <Pencil className="h-4 w-4" />
                            </span>
                            Edit Damage Category
                        </DialogTitle>
                        <DialogDescription>
                            Update the details for <span className="font-medium text-foreground">{selectedCategory?.damage_category_name}</span>.
                        </DialogDescription>
                    </DialogHeader>
                    <FormFields prefix="edit" />
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleUpdate}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground"
                            disabled={!formData.damage_category_name.trim()}
                        >
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Modal */}
            <Dialog open={isDeleteModalOpen} onOpenChange={(open) => { setIsDeleteModalOpen(open); if (!open) setSelectedCategory(null); }}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-red-100 text-red-600">
                                <Trash2 className="h-4 w-4" />
                            </span>
                            Delete Damage Category
                        </DialogTitle>
                        <DialogDescription className="pt-1">
                            This will permanently delete{' '}
                            <span className="font-medium text-foreground">"{selectedCategory?.damage_category_name}"</span>.
                            This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            Delete Category
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
