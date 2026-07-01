import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Category } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { ArrowUpDown, MoreHorizontal, Pencil, Search, Trash2, Tags, Plus, FileText, HelpCircle, Calendar } from 'lucide-react';
import { useMemo, useState } from 'react';

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
import { KpiCard } from '@/components/agro-profiler/kpi-card';
import { Pagination } from '@/components/agro-profiler/pagination';
import { ExportButtons } from '@/components/agro-profiler/export-buttons';
import { exportToCsv, exportToPdf } from '@/lib/export';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Categories',
        href: '/super-admin/categories',
    },
];

type SortField = 'name' | 'created_at';
type SortOrder = 'asc' | 'desc';

export default function Categories() {
    const { categories } = usePage<{ categories: Category[] }>().props;
    const [searchTerm, setSearchTerm] = useState('');
    const [sortField, setSortField] = useState<SortField>('name');
    const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
    });

    const filteredCategories = useMemo(() => {
        let result = [...categories];
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(
                (category) =>
                    category.name.toLowerCase().includes(term) ||
                    category.description?.toLowerCase().includes(term),
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
    }, [categories, searchTerm, sortField, sortOrder]);

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
        router.post('/super-admin/categories', formData, {
            preserveScroll: false,
            onSuccess: () => { setIsCreateModalOpen(false); resetForm(); },
        });
    };

    const handleUpdate = () => {
        if (!selectedCategory) return;
        router.put(`/super-admin/categories/${selectedCategory.id}`, formData, {
            preserveScroll: false,
            onSuccess: () => { setIsEditModalOpen(false); resetForm(); setSelectedCategory(null); },
        });
    };

    const handleDelete = () => {
        if (!selectedCategory) return;
        router.delete(`/super-admin/categories/${selectedCategory.id}`, {
            preserveScroll: false,
            onSuccess: () => { setIsDeleteModalOpen(false); setSelectedCategory(null); },
        });
    };

    const openEditModal = (category: Category) => {
        setSelectedCategory(category);
        setFormData({
            name: category.name,
            description: category.description || '',
        });
        setIsEditModalOpen(true);
    };

    const openDeleteModal = (category: Category) => {
        setSelectedCategory(category);
        setIsDeleteModalOpen(true);
    };

    const resetForm = () => {
        setFormData({ name: '', description: '' });
        setSelectedCategory(null);
    };

    const sharedTextareaClass =
        'flex min-h-[88px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none';

    const handleExportCsv = () => {
        const headers = ['ID', 'Name', 'Description', 'Created'];
        const rows = filteredCategories.map(c => [
            c.id, c.name, c.description || '', new Date(c.created_at).toLocaleDateString(),
        ]);
        exportToCsv('categories', headers, rows);
    };

    const FormFields = ({ prefix }: { prefix: string }) => (
        <div className="grid gap-4 py-4">
            <div className="grid gap-2">
                <Label htmlFor={`${prefix}-name`}>
                    Name <span className="text-red-500">*</span>
                </Label>
                <Input
                    id={`${prefix}-name`}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Vegetables"
                />
            </div>
            <div className="grid gap-2">
                <Label htmlFor={`${prefix}-description`}>Description</Label>
                <textarea
                    id={`${prefix}-description`}
                    value={formData.description}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                        setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Brief description of the category"
                    rows={3}
                    className={sharedTextareaClass}
                />
            </div>
        </div>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Categories" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">

                {/* Page Header */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Categories</h1>
                        <p className="text-sm text-muted-foreground">Manage product categories and descriptions</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <ExportButtons onExportCsv={handleExportCsv} onExportPdf={exportToPdf} />
                        <Button onClick={() => setIsCreateModalOpen(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                            <Plus className="mr-2 h-4 w-4" />
                            New Category
                        </Button>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    <KpiCard label="Total Categories" value={categories.length} icon={Tags} />
                    <KpiCard label="With Description" value={categories.filter((c) => c.description).length} icon={FileText} />
                    <KpiCard label="No Description" value={categories.filter((c) => !c.description).length} icon={HelpCircle} />
                    <KpiCard label="Created This Month" value={categories.filter((c) => new Date(c.created_at).getMonth() === new Date().getMonth()).length} icon={Calendar} />
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
                            {filteredCategories.length === categories.length
                                ? `${categories.length} categories`
                                : `${filteredCategories.length} of ${categories.length} categories`}
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
                                    <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground max-w-xs">Description</TableHead>
                                    <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Created</TableHead>
                                    <TableHead className="w-16 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedCategories.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-40 text-center">
                                            <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                                <Tags className="h-8 w-8 opacity-30" />
                                                <p className="text-sm font-medium">No categories found</p>
                                                <p className="text-xs">
                                                    {searchTerm ? 'Try a different search term.' : 'Click "New Category" to get started.'}
                                                </p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    paginatedCategories.map((category) => (
                                        <TableRow key={category.id} className="hover:bg-muted/30 transition-colors">
                                            <TableCell className="text-xs text-muted-foreground font-mono">{category.id}</TableCell>
                                            <TableCell className="font-medium text-sm">{category.name}</TableCell>
                                            <TableCell className="max-w-xs">
                                                <span className="text-sm text-muted-foreground line-clamp-2">
                                                    {category.description || '—'}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {new Date(category.created_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
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
            <Dialog
                open={isCreateModalOpen}
                onOpenChange={(open) => { setIsCreateModalOpen(open); if (!open) resetForm(); }}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
                                <Tags className="h-4 w-4" />
                            </span>
                            New Category
                        </DialogTitle>
                        <DialogDescription>
                            Add a new product category. Fields marked with <span className="text-red-500">*</span> are required.
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
                            disabled={!formData.name.trim()}
                        >
                            Create Category
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Modal */}
            <Dialog
                open={isEditModalOpen}
                onOpenChange={(open) => { setIsEditModalOpen(open); if (!open) resetForm(); }}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-100 text-slate-600">
                                <Pencil className="h-4 w-4" />
                            </span>
                            Edit Category
                        </DialogTitle>
                        <DialogDescription>
                            Update the details for <span className="font-medium text-foreground">{selectedCategory?.name}</span>.
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
                            disabled={!formData.name.trim()}
                        >
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Modal */}
            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-red-100 text-red-600">
                                <Trash2 className="h-4 w-4" />
                            </span>
                            Delete Category
                        </DialogTitle>
                        <DialogDescription className="pt-1">
                            This will permanently delete{' '}
                            <span className="font-medium text-foreground">"{selectedCategory?.name}"</span>.
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
