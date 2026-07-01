import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type UnitOfMeasure } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { ArrowUpDown, MoreHorizontal, Pencil, Search, Trash2, Scale, Plus, Package, FileText, Calendar } from 'lucide-react';
import { useMemo, useState } from 'react';

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
        title: 'Unit of Measures',
        href: '/super-admin/unit-of-measures',
    },
];

type SortField = 'name' | 'code' | 'created_at';
type SortOrder = 'asc' | 'desc';

export default function UnitOfMeasures() {
    const { unitOfMeasures } = usePage<{ unitOfMeasures: UnitOfMeasure[] }>().props;
    const [searchTerm, setSearchTerm] = useState('');
    const [sortField, setSortField] = useState<SortField>('name');
    const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedUoM, setSelectedUoM] = useState<UnitOfMeasure | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        description: '',
    });

    // Filter and sort unit of measures
    const filteredUoMs = useMemo(() => {
        let result = [...unitOfMeasures];

        // Search filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(
                (uom) =>
                    uom.name.toLowerCase().includes(term) ||
                    uom.code.toLowerCase().includes(term) ||
                    uom.description?.toLowerCase().includes(term),
            );
        }

        // Sorting
        result.sort((a, b) => {
            let aValue: any = a[sortField];
            let bValue: any = b[sortField];

            if (sortField === 'name' || sortField === 'code') {
                aValue = aValue.toLowerCase();
                bValue = bValue.toLowerCase();
            }

            if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });

        return result;
    }, [unitOfMeasures, searchTerm, sortField, sortOrder]);

    const totalPages = Math.ceil(filteredUoMs.length / itemsPerPage);
    const paginatedUoMs = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredUoMs.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredUoMs, currentPage, itemsPerPage]);

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
        router.post('/super-admin/unit-of-measures', formData, {
            preserveScroll: false,
            onSuccess: () => {
                setIsCreateModalOpen(false);
                setFormData({ name: '', code: '', description: '' });
            },
            onError: (errors) => {
                console.error('Create error:', errors);
            },
        });
    };

    const handleUpdate = () => {
        if (!selectedUoM) return;

        router.put(`/super-admin/unit-of-measures/${selectedUoM.id}`, formData, {
            preserveScroll: false,
            onSuccess: () => {
                setIsEditModalOpen(false);
                setFormData({ name: '', code: '', description: '' });
                setSelectedUoM(null);
            },
            onError: (errors) => {
                console.error('Update error:', errors);
            },
        });
    };

    const handleDelete = () => {
        if (!selectedUoM) return;

        router.delete(`/super-admin/unit-of-measures/${selectedUoM.id}`, {
            preserveScroll: false,
            onSuccess: () => {
                setIsDeleteModalOpen(false);
                setSelectedUoM(null);
            },
            onError: (errors) => {
                console.error('Delete error:', errors);
            },
        });
    };

    const openEditModal = (uom: UnitOfMeasure) => {
        setSelectedUoM(uom);
        setFormData({
            name: uom.name,
            code: uom.code,
            description: uom.description || '',
        });
        setIsEditModalOpen(true);
    };

    const openDeleteModal = (uom: UnitOfMeasure) => {
        setSelectedUoM(uom);
        setIsDeleteModalOpen(true);
    };

    const sharedTextareaClass =
        'flex min-h-[88px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none';

    const handleExportCsv = () => {
        const headers = ['ID', 'Name', 'Code', 'Description', 'Created'];
        const rows = filteredUoMs.map(u => [
            u.id, u.name, u.code, u.description || '', new Date(u.created_at).toLocaleDateString(),
        ]);
        exportToCsv('unit-of-measures', headers, rows);
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
                    placeholder="e.g., Kilogram"
                />
            </div>
            <div className="grid gap-2">
                <Label htmlFor={`${prefix}-code`}>
                    Code <span className="text-red-500">*</span>
                </Label>
                <Input
                    id={`${prefix}-code`}
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="e.g., KG"
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
                    placeholder="Brief description of the unit"
                    rows={3}
                    className={sharedTextareaClass}
                />
            </div>
        </div>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Unit of Measures" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">

                {/* Page Header */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Unit of Measures</h1>
                        <p className="text-sm text-muted-foreground">Manage measurement units for agricultural products</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <ExportButtons onExportCsv={handleExportCsv} onExportPdf={exportToPdf} />
                        <Button onClick={() => setIsCreateModalOpen(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                            <Plus className="mr-2 h-4 w-4" />
                            New Unit
                        </Button>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    <KpiCard label="Total Units" value={unitOfMeasures.length} icon={Scale} />
                    <KpiCard label="With Codes" value={unitOfMeasures.filter((u) => u.code).length} icon={Package} />
                    <KpiCard label="With Description" value={unitOfMeasures.filter((u) => u.description).length} icon={FileText} />
                    <KpiCard label="No Description" value={unitOfMeasures.filter((u) => !u.description).length} icon={Calendar} />
                </div>

                {/* Table Card */}
                <div className="glass-card rounded-2xl overflow-hidden">
                    {/* Toolbar */}
                    <div className="flex flex-col gap-3 border-b px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="relative w-full max-w-xs">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search units..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 h-9 text-sm"
                            />
                        </div>
                        <span className="text-xs text-muted-foreground">
                            {filteredUoMs.length === unitOfMeasures.length
                                ? `${unitOfMeasures.length} units`
                                : `${filteredUoMs.length} of ${unitOfMeasures.length} units`}
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
                                    <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                        <button
                                            onClick={() => handleSort('code')}
                                            className="flex items-center gap-1.5 hover:text-foreground transition-colors"
                                        >
                                            Code
                                            <ArrowUpDown className="h-3.5 w-3.5" />
                                        </button>
                                    </TableHead>
                                    <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground max-w-xs">Description</TableHead>
                                    <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Created</TableHead>
                                    <TableHead className="w-16 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedUoMs.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-40 text-center">
                                            <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                                <Scale className="h-8 w-8 opacity-30" />
                                                <p className="text-sm font-medium">No units found</p>
                                                <p className="text-xs">
                                                    {searchTerm ? 'Try a different search term.' : 'Click "New Unit" to get started.'}
                                                </p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    paginatedUoMs.map((uom) => (
                                        <TableRow key={uom.id} className="hover:bg-muted/30 transition-colors">
                                            <TableCell className="text-xs text-muted-foreground font-mono">{uom.id}</TableCell>
                                            <TableCell className="font-medium text-sm">{uom.name}</TableCell>
                                            <TableCell>
                                                <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                                                    {uom.code}
                                                </span>
                                            </TableCell>
                                            <TableCell className="max-w-xs">
                                                <span className="text-sm text-muted-foreground line-clamp-2">
                                                    {uom.description || '—'}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {new Date(uom.created_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
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
                                                            onClick={() => openEditModal(uom)}
                                                            className="cursor-pointer"
                                                        >
                                                            <Pencil className="mr-2 h-3.5 w-3.5" />
                                                            Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            onClick={() => openDeleteModal(uom)}
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
                                total={filteredUoMs.length}
                                perPage={itemsPerPage}
                                onPageChange={setCurrentPage}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Create Modal */}
            <Dialog open={isCreateModalOpen} onOpenChange={(open) => { setIsCreateModalOpen(open); if (!open) setFormData({ name: '', code: '', description: '' }); }}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-100 text-emerald-700">
                                <Scale className="h-4 w-4" />
                            </span>
                            New Unit of Measure
                        </DialogTitle>
                        <DialogDescription>
                            Add a new unit. Fields marked with <span className="text-red-500">*</span> are required.
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
                            disabled={!formData.name.trim() || !formData.code.trim()}
                        >
                            Create Unit
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Modal */}
            <Dialog open={isEditModalOpen} onOpenChange={(open) => { setIsEditModalOpen(open); if (!open) { setFormData({ name: '', code: '', description: '' }); setSelectedUoM(null); } }}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-100 text-slate-600">
                                <Pencil className="h-4 w-4" />
                            </span>
                            Edit Unit of Measure
                        </DialogTitle>
                        <DialogDescription>
                            Update the details for <span className="font-medium text-foreground">{selectedUoM?.name}</span>.
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
                            disabled={!formData.name.trim() || !formData.code.trim()}
                        >
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Modal */}
            <Dialog open={isDeleteModalOpen} onOpenChange={(open) => { setIsDeleteModalOpen(open); if (!open) setSelectedUoM(null); }}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-red-100 text-red-600">
                                <Trash2 className="h-4 w-4" />
                            </span>
                            Delete Unit of Measure
                        </DialogTitle>
                        <DialogDescription className="pt-1">
                            This will permanently delete{' '}
                            <span className="font-medium text-foreground">"{selectedUoM?.name}"</span>.
                            This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            Delete Unit
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
