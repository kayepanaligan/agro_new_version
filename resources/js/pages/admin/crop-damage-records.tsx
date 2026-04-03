import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type CropDamageRecord } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { 
    Calendar, 
    FileText, 
    MoreHorizontal, 
    Pencil, 
    Plus, 
    Search, 
    Trash2,
    FolderOpen,
    Filter,
    X,
    List,
    LayoutGrid,
    ArrowUpDown
} from 'lucide-react';
import { useState, useMemo } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Textarea } from '@/components/ui/textarea';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Crop Damage Records',
        href: '/admin/crop-damage-records',
    },
];

interface CropDamageRecordsProps {
    cropDamageRecords: CropDamageRecord[];
}

export default function CropDamageRecords({ cropDamageRecords }: CropDamageRecordsProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
    const [sortField, setSortField] = useState<'name' | 'recorded_date'>('recorded_date');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12;
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<CropDamageRecord | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        recorded_date: new Date().toISOString().split('T')[0],
        notes: '',
    });

    const filteredRecords = useMemo(() => {
        let result = [...cropDamageRecords];

        // Search filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(
                (record) =>
                    record.name.toLowerCase().includes(term) ||
                    record.notes?.toLowerCase().includes(term),
            );
        }

        // Sorting
        result.sort((a, b) => {
            let comparison = 0;
            
            switch (sortField) {
                case 'name':
                    comparison = a.name.localeCompare(b.name);
                    break;
                case 'recorded_date':
                    comparison = new Date(a.recorded_date).getTime() - new Date(b.recorded_date).getTime();
                    break;
            }
            
            return sortOrder === 'asc' ? comparison : -comparison;
        });

        return result;
    }, [cropDamageRecords, searchTerm, sortField, sortOrder]);

    const paginatedRecords = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        return filteredRecords.slice(start, end);
    }, [filteredRecords, currentPage]);

    const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);

    const handleSort = (field: typeof sortField) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
    };

    const handleCreate = () => {
        router.post(route('admin.crop-damage-records.store'), formData, {
            onSuccess: () => {
                setIsCreateModalOpen(false);
                setFormData({
                    name: '',
                    recorded_date: new Date().toISOString().split('T')[0],
                    notes: '',
                });
            },
        });
    };

    const handleEdit = () => {
        if (!selectedRecord) return;
        
        router.put(route('admin.crop-damage-records.update', selectedRecord.crop_damage_record_id), formData, {
            onSuccess: () => {
                setIsEditModalOpen(false);
                setSelectedRecord(null);
                setFormData({
                    name: '',
                    recorded_date: new Date().toISOString().split('T')[0],
                    notes: '',
                });
            },
        });
    };

    const handleDelete = () => {
        if (!selectedRecord) return;
        
        router.delete(route('admin.crop-damage-records.destroy', selectedRecord.crop_damage_record_id), {
            onSuccess: () => {
                setIsDeleteModalOpen(false);
                setSelectedRecord(null);
            },
        });
    };

    const openEditModal = (record: CropDamageRecord) => {
        setSelectedRecord(record);
        setFormData({
            name: record.name,
            recorded_date: record.recorded_date,
            notes: record.notes || '',
        });
        setIsEditModalOpen(true);
    };

    const openDeleteModal = (record: CropDamageRecord) => {
        setSelectedRecord(record);
        setIsDeleteModalOpen(true);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Crop Damage Records" />
            
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Crop Damage Records</h1>
                        <p className="text-muted-foreground mt-1">Manage crop damage record folders</p>
                    </div>
                    <Button onClick={() => setIsCreateModalOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        New Record Folder
                    </Button>
                </div>

                {/* Filters and View Toggle */}
                <Card className="mb-6">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between gap-4">
                            <div className="relative flex-1 max-w-sm">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search records..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                            
                            <div className="flex items-center gap-2">
                                <Button
                                    variant={viewMode === 'card' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setViewMode('card')}
                                >
                                    <LayoutGrid className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant={viewMode === 'list' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setViewMode('list')}
                                >
                                    <List className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Card View */}
                {viewMode === 'card' && (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {paginatedRecords.length === 0 ? (
                            <div className="col-span-full flex h-64 items-center justify-center">
                                <div className="text-center">
                                    <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                                    <h3 className="mt-4 text-lg font-semibold">No records found</h3>
                                    <p className="text-muted-foreground">Create your first crop damage record folder</p>
                                </div>
                            </div>
                        ) : (
                            paginatedRecords.map((record) => (
                                <Card 
                                    key={record.crop_damage_record_id} 
                                    className="group relative overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                                    onClick={() => router.visit(route('admin.crop-damage-records.show', record.crop_damage_record_id))}
                                >
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <FolderOpen className="h-8 w-8 text-primary" />
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={() => router.visit(route('admin.crop-damage-records.show', record.crop_damage_record_id))}>
                                                        <FolderOpen className="mr-2 h-4 w-4" />
                                                        Open Folder
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => openEditModal(record)}>
                                                        <Pencil className="mr-2 h-4 w-4" />
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem 
                                                        onClick={() => openDeleteModal(record)}
                                                        className="text-destructive focus:text-destructive"
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                        <CardTitle className="mt-4 line-clamp-2">{record.name}</CardTitle>
                                        <CardDescription className="line-clamp-2">
                                            {record.notes || 'No notes'}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardFooter className="flex items-center justify-between text-sm text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            {new Date(record.recorded_date).toLocaleDateString()}
                                        </div>
                                        <Badge variant="secondary">
                                            {record.items_count || 0} items
                                        </Badge>
                                    </CardFooter>
                                </Card>
                            ))
                        )}
                    </div>
                )}

                {/* List View */}
                {viewMode === 'list' && (
                    <Card>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>
                                            <Button variant="ghost" onClick={() => handleSort('recorded_date')} className="-ml-4">
                                                Date Recorded
                                                <ArrowUpDown className="ml-2 h-4 w-4" />
                                            </Button>
                                        </TableHead>
                                        <TableHead>Notes</TableHead>
                                        <TableHead>Items</TableHead>
                                        <TableHead className="w-[80px]">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paginatedRecords.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-24 text-center">
                                                No records found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        paginatedRecords.map((record) => (
                                            <TableRow key={record.crop_damage_record_id}>
                                                <TableCell className="font-medium">
                                                    <div className="flex items-center gap-2">
                                                        <FolderOpen className="h-4 w-4 text-primary" />
                                                        {record.name}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {new Date(record.recorded_date).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell className="max-w-xs truncate">
                                                    {record.notes || '-'}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary">
                                                        {record.items_count || 0} items
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="sm">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem onClick={() => router.visit(route('admin.crop-damage-records.show', record.crop_damage_record_id))}>
                                                                <FolderOpen className="mr-2 h-4 w-4" />
                                                                Open Folder
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => openEditModal(record)}>
                                                                <Pencil className="mr-2 h-4 w-4" />
                                                                Edit
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem 
                                                                onClick={() => openDeleteModal(record)}
                                                                className="text-destructive focus:text-destructive"
                                                            >
                                                                <Trash2 className="mr-2 h-4 w-4" />
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
                        </CardContent>
                    </Card>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="mt-6 flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredRecords.length)} of {filteredRecords.length} records
                        </p>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                            >
                                Previous
                            </Button>
                            <span className="text-sm text-muted-foreground">
                                Page {currentPage} of {totalPages}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Create Modal */}
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create Crop Damage Record Folder</DialogTitle>
                        <DialogDescription>
                            Create a new folder to organize crop damage record items.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g., Rice Blast Outbreak 2024"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="recorded_date">Date Recorded</Label>
                            <Input
                                id="recorded_date"
                                type="date"
                                value={formData.recorded_date}
                                onChange={(e) => setFormData({ ...formData, recorded_date: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="notes">Notes</Label>
                            <Textarea
                                id="notes"
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                placeholder="General notes about this crop damage record..."
                                rows={4}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreate}>
                            Create Folder
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Modal */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Crop Damage Record Folder</DialogTitle>
                        <DialogDescription>
                            Update the crop damage record folder details.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-name">Name</Label>
                            <Input
                                id="edit-name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-recorded_date">Date Recorded</Label>
                            <Input
                                id="edit-recorded_date"
                                type="date"
                                value={formData.recorded_date}
                                onChange={(e) => setFormData({ ...formData, recorded_date: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-notes">Notes</Label>
                            <Textarea
                                id="edit-notes"
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                rows={4}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleEdit}>
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Modal */}
            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Crop Damage Record Folder</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "{selectedRecord?.name}"? This will also delete all {selectedRecord?.items_count || 0} items inside this folder. This action cannot be undone.
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
