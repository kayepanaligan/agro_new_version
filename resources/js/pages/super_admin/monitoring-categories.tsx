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
import { Plus, Pencil, Trash2, Search, ArrowUpDown } from 'lucide-react';
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

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 px-6">
                <div className="flex items-center justify-between py-2">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Monitoring Categories</h1>
                        <p className="text-muted-foreground">Manage crop monitoring category types</p>
                    </div>
                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Category
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create New Category</DialogTitle>
                                <DialogDescription>Add a new crop monitoring category type</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Category Name</Label>
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
                                <Button onClick={handleCreate} disabled={createForm.processing}>Create</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Search */}
                <Card className="">
                    <CardContent className="pt-6">
                        <div className="relative max-w-sm">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search categories..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-8"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Table */}
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort('category_name')}>
                                    <div className="flex items-center gap-2">
                                        Category Name
                                        <ArrowUpDown className="h-3 w-3" />
                                    </div>
                                </TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead className="cursor-pointer hover:bg-muted/50 text-right" onClick={() => handleSort('folders_count')}>
                                    <div className="flex items-center justify-end gap-2">
                                        Folders
                                        <ArrowUpDown className="h-3 w-3" />
                                    </div>
                                </TableHead>
                                <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort('created_at')}>
                                    <div className="flex items-center gap-2">
                                        Created
                                        <ArrowUpDown className="h-3 w-3" />
                                    </div>
                                </TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredAndSortedCategories.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                        No categories found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredAndSortedCategories.map((category) => (
                                    <TableRow key={category.crop_monitoring_category_id}>
                                        <TableCell className="font-medium">
                                            {category.category_name}
                                        </TableCell>
                                        <TableCell className="max-w-md">
                                            <p className="truncate text-sm text-muted-foreground">
                                                {category.description || '—'}
                                            </p>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Badge variant="secondary">
                                                {category.folders_count || 0}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {new Date(category.created_at).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleEdit(category)}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(category.crop_monitoring_category_id)}
                                                    className="text-destructive hover:text-destructive"
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

                {/* Edit Dialog */}
                <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit Category</DialogTitle>
                            <DialogDescription>Update category information</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit-name">Category Name</Label>
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
                            <Button onClick={handleUpdate} disabled={editForm.processing}>Update</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

        </AppLayout>
    );
}
