import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type CropMonitoringCategory } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Pencil, Trash2, Search, ArrowUpDown, FolderKanban } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Monitoring Categories',
        href: '/super-admin/monitoring-categories',
    },
];

interface Props {
    categories: CropMonitoringCategory[];
}

export default function MonitoringCategories({ categories }: Props) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<CropMonitoringCategory | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortField, setSortField] = useState<'category_name' | 'folders_count' | 'created_at'>('category_name');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

    const createForm = useForm({
        category_name: '',
        description: '',
    });

    const editForm = useForm({
        category_name: '',
        description: '',
    });

    const handleCreate = () => {
        createForm.post(route('super-admin.monitoring-categories.store'), {
            onSuccess: () => {
                createForm.reset();
                setIsCreateOpen(false);
            },
        });
    };

    const handleEdit = (category: CropMonitoringCategory) => {
        setSelectedCategory(category);
        editForm.setData({
            category_name: category.category_name,
            description: category.description || '',
        });
        setIsEditOpen(true);
    };

    const handleUpdate = () => {
        if (!selectedCategory) return;
        editForm.put(route('super-admin.monitoring-categories.update', selectedCategory.crop_monitoring_category_id), {
            onSuccess: () => {
                editForm.reset();
                setIsEditOpen(false);
                setSelectedCategory(null);
            },
        });
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this category?')) {
            router.delete(route('super-admin.monitoring-categories.destroy', id));
        }
    };

    const handleSort = (field: typeof sortField) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const filteredAndSortedCategories = categories
        .filter((cat) =>
            cat.category_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (cat.description && cat.description.toLowerCase().includes(searchTerm.toLowerCase()))
        )
        .sort((a, b) => {
            let aValue: any = a[sortField];
            let bValue: any = b[sortField];

            if (sortField === 'folders_count') {
                aValue = a.folders_count || 0;
                bValue = b.folders_count || 0;
            }

            if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Monitoring Categories" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Page Header */}
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                        <FolderKanban className="h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Monitoring Categories</h1>
                        <p className="text-sm text-muted-foreground">Manage crop monitoring category types</p>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    {[
                        { label: 'Total Categories', value: categories.length, accent: 'border-l-primary' },
                        { label: 'With Folders', value: categories.filter((c) => (c.folders_count || 0) > 0).length, accent: 'border-l-blue-400' },
                        { label: 'No Folders', value: categories.filter((c) => (c.folders_count || 0) === 0).length, accent: 'border-l-amber-400' },
                        { label: 'Total Folders', value: categories.reduce((sum, c) => sum + (c.folders_count || 0), 0), accent: 'border-l-purple-400' },
                    ].map((stat) => (
                        <div
                            key={stat.label}
                            className={`glass-card rounded-lg p-4 border-l-4 ${stat.accent}`}
                        >
                            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{stat.label}</p>
                            <p className="mt-1 text-2xl font-bold text-foreground">{stat.value}</p>
                        </div>
                    ))}
                </div>

                {/* Table Card */}
                <div className="glass-card rounded-xl overflow-hidden">
                    {/* Toolbar */}
                    <div className="flex flex-col gap-3 border-b px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="relative w-full max-w-xs">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search categories..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                            <DialogTrigger asChild>
                                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                                    <Plus className="h-4 w-4 mr-2" />
                                    New Category
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                    <DialogTitle className="flex items-center gap-2">
                                        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
                                            <FolderKanban className="h-4 w-4" />
                                        </span>
                                        New Monitoring Category
                                    </DialogTitle>
                                    <DialogDescription>
                                        Add a new category. Fields marked with <span className="text-red-500">*</span> are required.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="name">
                                            Category Name <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="name"
                                            value={createForm.data.category_name}
                                            onChange={(e) => createForm.setData('category_name', e.target.value)}
                                            placeholder="e.g., Growth Experimentation"
                                        />
                                        {createForm.errors.category_name && (
                                            <p className="text-sm text-destructive">{createForm.errors.category_name}</p>
                                        )}
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="description">Description</Label>
                                        <Textarea
                                            id="description"
                                            value={createForm.data.description}
                                            onChange={(e) => createForm.setData('description', e.target.value)}
                                            placeholder="Describe this category..."
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                                    <Button
                                        onClick={handleCreate}
                                        className="bg-primary hover:bg-primary/90 text-primary-foreground"
                                        disabled={createForm.processing || !createForm.data.category_name.trim()}
                                    >
                                        Create
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <span className="px-6 text-xs text-muted-foreground">
                        {filteredAndSortedCategories.length} of {categories.length} categorie{categories.length !== 1 ? 's' : 'y'}
                    </span>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/40 hover:bg-muted/40">
                                    <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">ID</TableHead>
                                    <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Category Name</TableHead>
                                    <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Description</TableHead>
                                    <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Folders</TableHead>
                                    <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Created</TableHead>
                                    <TableHead className="w-24 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredAndSortedCategories.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-40 text-center">
                                            <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                                <FolderKanban className="h-8 w-8 opacity-30" />
                                                <p className="text-sm font-medium">No categories found</p>
                                                <p className="text-xs">{searchTerm ? 'Try a different search term.' : 'Click "New Category" to get started.'}</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredAndSortedCategories.map((category) => (
                                        <TableRow key={category.crop_monitoring_category_id} className="hover:bg-muted/30 transition-colors">
                                            <TableCell className="font-mono text-sm">{category.crop_monitoring_category_id}</TableCell>
                                            <TableCell className="font-medium">{category.category_name}</TableCell>
                                            <TableCell className="max-w-xs text-sm text-muted-foreground line-clamp-2">{category.description || '—'}</TableCell>
                                            <TableCell>
                                                <Badge variant="secondary">{category.folders_count || 0}</Badge>
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {new Date(category.created_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 w-8 p-0"
                                                        onClick={() => handleEdit(category)}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                        onClick={() => handleDelete(category.crop_monitoring_category_id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                {/* Edit Dialog */}
                <Dialog open={isEditOpen} onOpenChange={(open) => { setIsEditOpen(open); if (!open && selectedCategory) { editForm.setData({ category_name: selectedCategory.category_name, description: selectedCategory.description || '' }); } }}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-100 text-slate-700">
                                    <Pencil className="h-4 w-4" />
                                </span>
                                Edit Monitoring Category
                            </DialogTitle>
                            <DialogDescription>
                                Update the details for <span className="font-medium text-foreground">{selectedCategory?.category_name}</span>. Fields marked with <span className="text-red-500">*</span> are required.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit-name">
                                    Category Name <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="edit-name"
                                    value={editForm.data.category_name}
                                    onChange={(e) => editForm.setData('category_name', e.target.value)}
                                />
                                {editForm.errors.category_name && (
                                    <p className="text-sm text-destructive">{editForm.errors.category_name}</p>
                                )}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-description">Description</Label>
                                <Textarea
                                    id="edit-description"
                                    value={editForm.data.description}
                                    onChange={(e) => editForm.setData('description', e.target.value)}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
                            <Button
                                onClick={handleUpdate}
                                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                                disabled={editForm.processing || !editForm.data.category_name.trim()}
                            >
                                Save Changes
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

        </AppLayout>
    );
}
