import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type DamageCategory } from '@/types';
import { Head, router } from '@inertiajs/react';
import { ArrowUpDown, MoreHorizontal, Pencil, Plus, Search, Trash2 } from 'lucide-react';
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

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Damage Categories',
        href: '/admin/damage-categories',
    },
];

interface DamageCategoriesProps {
    damageCategories: DamageCategory[];
}

export default function DamageCategories({ damageCategories }: DamageCategoriesProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortField, setSortField] = useState<'damage_category_name' | 'damage_types_count' | 'created_at'>('damage_category_name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
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
        router.post('/admin/damage-categories', formData, {
            preserveScroll: true,
            onSuccess: () => {
                setIsCreateModalOpen(false);
                setFormData({ damage_category_name: '', damage_category_description: '' });
            },
        });
    };

    const handleUpdate = () => {
        if (!selectedCategory) return;
        
        router.put(`/admin/damage-categories/${selectedCategory.damage_category_id}`, formData, {
            preserveScroll: true,
            onSuccess: () => {
                setIsEditModalOpen(false);
                setSelectedCategory(null);
                setFormData({ damage_category_name: '', damage_category_description: '' });
            },
        });
    };

    const handleDelete = () => {
        if (!selectedCategory) return;

        router.delete(`/admin/damage-categories/${selectedCategory.damage_category_id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setIsDeleteModalOpen(false);
                setSelectedCategory(null);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Damage Categories" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                {/* Header */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold">Damage Categories</h1>
                                <p className="text-muted-foreground">Manage standard damage categories</p>
                            </div>
                            <Button onClick={openCreateModal}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Category
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Search */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-2">
                            <div className="relative flex-1 max-w-sm">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search categories..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                            <div className="text-sm text-muted-foreground">
                                {filteredCategories.length} categor{filteredCategories.length !== 1 ? 'ies' : 'y'} found
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
                                        <TableHead>
                                            <Button variant="ghost" onClick={() => handleSort('damage_category_name')} className="-ml-4">
                                                Category Name
                                                <ArrowUpDown className="ml-2 h-4 w-4" />
                                            </Button>
                                        </TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead>
                                            <Button variant="ghost" onClick={() => handleSort('damage_types_count')} className="-ml-4">
                                                Damage Types
                                                <ArrowUpDown className="ml-2 h-4 w-4" />
                                            </Button>
                                        </TableHead>
                                        <TableHead className="w-[70px]">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredCategories.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-24 text-center">
                                                No damage categories found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredCategories.map((category) => (
                                            <TableRow key={category.damage_category_id}>
                                                <TableCell className="font-medium">{category.damage_category_id}</TableCell>
                                                <TableCell className="font-medium">{category.damage_category_name}</TableCell>
                                                <TableCell>{category.damage_category_description || '-'}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">
                                                        {category.damage_types_count || 0} type{(category.damage_types_count || 0) !== 1 ? 's' : ''}
                                                    </Badge>
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
                    </CardContent>
                </Card>
            </div>

            {/* Create Modal */}
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create Damage Category</DialogTitle>
                        <DialogDescription>
                            Add a new damage category. Fill in the details below.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="damage_category_name">Category Name</Label>
                            <Input
                                id="damage_category_name"
                                value={formData.damage_category_name}
                                onChange={(e) => setFormData({ ...formData, damage_category_name: e.target.value })}
                                placeholder="Enter category name"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="damage_category_description">Description</Label>
                            <Textarea
                                id="damage_category_description"
                                value={formData.damage_category_description}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, damage_category_description: e.target.value })}
                                placeholder="Enter description (optional)"
                                rows={4}
                            />
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
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Damage Category</DialogTitle>
                        <DialogDescription>
                            Update damage category information.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit_damage_category_name">Category Name</Label>
                            <Input
                                id="edit_damage_category_name"
                                value={formData.damage_category_name}
                                onChange={(e) => setFormData({ ...formData, damage_category_name: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit_damage_category_description">Description</Label>
                            <Textarea
                                id="edit_damage_category_description"
                                value={formData.damage_category_description}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, damage_category_description: e.target.value })}
                                rows={4}
                            />
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

            {/* Delete Modal */}
            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Damage Category</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "{selectedCategory?.damage_category_name}"? This action cannot be undone.
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
