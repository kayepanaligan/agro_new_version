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
    ArrowUpDown,
    ClipboardList,
    AlertTriangle,
    Layers
} from 'lucide-react';
import { useState, useMemo } from 'react';

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
import { Textarea } from '@/components/ui/textarea';
import { KpiCard } from '@/components/agro-profiler/kpi-card';
import { Pagination } from '@/components/agro-profiler/pagination';
import { ExportButtons } from '@/components/agro-profiler/export-buttons';
import { exportToCsv, exportToPdf } from '@/lib/export';

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

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(
                (record) =>
                    record.name.toLowerCase().includes(term) ||
                    record.notes?.toLowerCase().includes(term),
            );
        }

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

    // KPI computations
    const totalRecords = cropDamageRecords.length;
    const totalItems = cropDamageRecords.reduce((sum, r) => sum + (r.items_count || 0), 0);
    const thisMonth = cropDamageRecords.filter((r) => {
        const d = new Date(r.recorded_date);
        const now = new Date();
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
    const recentRecords = cropDamageRecords.filter((r) => {
        const daysDiff = (Date.now() - new Date(r.recorded_date).getTime()) / (1000 * 60 * 60 * 24);
        return daysDiff <= 30;
    }).length;

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

    const handleExportCsv = () => {
        const headers = ['ID', 'Name', 'Date Recorded', 'Notes', 'Items Count'];
        const rows = filteredRecords.map((r) => [
            r.crop_damage_record_id,
            r.name,
            r.recorded_date,
            r.notes || '',
            r.items_count || 0,
        ]);
        exportToCsv('crop-damage-records', headers, rows);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Crop Damage Records" />
            
            <div className="flex h-full flex-1 flex-col gap-5 rounded-xl p-4 md:p-6">
                {/* Page Header */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Crop Damage Records</h1>
                        <p className="text-sm text-muted-foreground">
                            Manage crop damage record folders and track damage reports
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <ExportButtons onExportCsv={handleExportCsv} onExportPdf={exportToPdf} />
                        <Button onClick={() => setIsCreateModalOpen(true)} size="sm" className="gap-2">
                            <Plus className="h-4 w-4" />
                            New Record Folder
                        </Button>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <KpiCard label="Total Records" value={totalRecords} icon={ClipboardList} />
                    <KpiCard label="Total Items" value={totalItems} icon={Layers} />
                    <KpiCard label="This Month" value={thisMonth} icon={Calendar} />
                    <KpiCard label="Last 30 Days" value={recentRecords} icon={AlertTriangle} />
                </div>

                {/* Main Table/Card Container */}
                <div className="glass-card rounded-2xl">
                    {/* Filters & View Toggle */}
                    <div className="space-y-3 border-b p-4">
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
                    </div>

                    {/* Card View */}
                    {viewMode === 'card' && (
                        <div className="grid gap-4 p-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
                                    <div 
                                        key={record.crop_damage_record_id} 
                                        className="glass-surface group relative overflow-hidden rounded-xl p-4 transition-all hover:shadow-md cursor-pointer"
                                        onClick={() => router.visit(route('admin.crop-damage-records.show', record.crop_damage_record_id))}
                                    >
                                        <div className="flex items-start justify-between">
                                            <FolderOpen className="h-8 w-8 text-primary" />
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm" 
                                                        className="text-muted-foreground/60 hover:text-foreground hover:bg-muted"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={(e) => {
                                                        e.stopPropagation();
                                                        router.visit(route('admin.crop-damage-records.show', record.crop_damage_record_id));
                                                    }}>
                                                        <FolderOpen className="mr-2 h-4 w-4" />
                                                        Open Folder
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={(e) => {
                                                        e.stopPropagation();
                                                        openEditModal(record);
                                                    }}>
                                                        <Pencil className="mr-2 h-4 w-4" />
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            openDeleteModal(record);
                                                        }}
                                                        className="text-destructive focus:text-destructive"
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                        <h3 className="mt-3 line-clamp-2 font-semibold">{record.name}</h3>
                                        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                                            {record.notes || 'No notes'}
                                        </p>
                                        <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                {new Date(record.recorded_date).toLocaleDateString()}
                                            </div>
                                            <Badge variant="secondary">
                                                {record.items_count || 0} items
                                            </Badge>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* List View */}
                    {viewMode === 'list' && (
                        <div className="overflow-x-auto">
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
                                            <TableRow 
                                                key={record.crop_damage_record_id}
                                                className="cursor-pointer hover:bg-muted/50"
                                                onClick={() => router.visit(route('admin.crop-damage-records.show', record.crop_damage_record_id))}
                                            >
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
                                                <TableCell onClick={(e) => e.stopPropagation()}>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button 
                                                                variant="ghost" 
                                                                size="sm"
                                                                className="text-muted-foreground/60 hover:text-foreground hover:bg-muted"
                                                            >
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
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="border-t p-4">
                            <Pagination
                                currentPage={currentPage}
                                lastPage={totalPages}
                                total={filteredRecords.length}
                                perPage={itemsPerPage}
                                onPageChange={setCurrentPage}
                            />
                        </div>
                    )}
                </div>
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
