import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type FundingSource } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { ArrowUpDown, MoreHorizontal, Pencil, Search, Trash2, Wallet, Plus, FileText, Building2, Calendar } from 'lucide-react';
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
        title: 'Funding Sources',
        href: '/super-admin/funding-sources',
    },
];

type SortField = 'name' | 'created_at';
type SortOrder = 'asc' | 'desc';

export default function FundingSources() {
    const { fundingSources } = usePage<{ fundingSources: FundingSource[] }>().props;

    const [searchTerm, setSearchTerm] = useState('');
    const [sortField, setSortField] = useState<SortField>('name');
    const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedFundingSource, setSelectedFundingSource] = useState<FundingSource | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
    });

    // Filter and sort funding sources
    const filteredFundingSources = useMemo(() => {
        let result = [...fundingSources];

        // Search filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(
                (source) =>
                    source.name.toLowerCase().includes(term) ||
                    source.description?.toLowerCase().includes(term),
            );
        }

        // Sorting
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
    }, [fundingSources, searchTerm, sortField, sortOrder]);

    // Pagination
    const totalPages = Math.ceil(filteredFundingSources.length / itemsPerPage);
    const paginatedFundingSources = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredFundingSources.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredFundingSources, currentPage, itemsPerPage]);

    // Reset to page 1 when filters change
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
        router.post('/super-admin/funding-sources', formData, {
            preserveScroll: false,
            onSuccess: () => {
                setIsCreateModalOpen(false);
                resetForm();
            },
            onError: (errors) => {
                console.error('Create error:', errors);
            },
        });
    };

    const handleUpdate = () => {
        if (!selectedFundingSource) return;

        router.put(`/super-admin/funding-sources/${selectedFundingSource.id}`, formData, {
            preserveScroll: false,
            onSuccess: () => {
                setIsEditModalOpen(false);
                resetForm();
                setSelectedFundingSource(null);
            },
            onError: (errors) => {
                console.error('Update error:', errors);
            },
        });
    };

    const handleDelete = () => {
        if (!selectedFundingSource) return;

        router.delete(`/super-admin/funding-sources/${selectedFundingSource.id}`, {
            preserveScroll: false,
            onSuccess: () => {
                setIsDeleteModalOpen(false);
                setSelectedFundingSource(null);
            },
            onError: (errors) => {
                console.error('Delete error:', errors);
            },
        });
    };

    const openEditModal = (source: FundingSource) => {
        setSelectedFundingSource(source);
        setFormData({
            name: source.name,
            description: source.description || '',
        });
        setIsEditModalOpen(true);
    };

    const openDeleteModal = (source: FundingSource) => {
        setSelectedFundingSource(source);
        setIsDeleteModalOpen(true);
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
        });
        setSelectedFundingSource(null);
    };

    const sharedTextareaClass =
        'flex min-h-[88px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none';

    const handleExportCsv = () => {
        const headers = ['ID', 'Name', 'Description', 'Created'];
        const rows = filteredFundingSources.map(f => [
            f.id, f.name, f.description || '', new Date(f.created_at).toLocaleDateString(),
        ]);
        exportToCsv('funding-sources', headers, rows);
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
                    placeholder="e.g., National Agricultural Fund"
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
                    placeholder="Brief description of the funding source"
                    rows={3}
                    className={sharedTextareaClass}
                />
            </div>
        </div>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Funding Sources" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">

                {/* Page Header */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Funding Sources</h1>
                        <p className="text-sm text-muted-foreground">Manage funding sources for agricultural programs</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <ExportButtons onExportCsv={handleExportCsv} onExportPdf={exportToPdf} />
                        <Button onClick={() => setIsCreateModalOpen(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                            <Plus className="mr-2 h-4 w-4" />
                            New Funding Source
                        </Button>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    <KpiCard label="Total Sources" value={fundingSources.length} icon={Wallet} />
                    <KpiCard label="With Description" value={fundingSources.filter((f) => f.description).length} icon={FileText} />
                    <KpiCard label="No Description" value={fundingSources.filter((f) => !f.description).length} icon={Building2} />
                    <KpiCard label="Created This Month" value={fundingSources.filter((f) => new Date(f.created_at).getMonth() === new Date().getMonth()).length} icon={Calendar} />
                </div>

                {/* Table Card */}
                <div className="glass-card rounded-2xl overflow-hidden">
                    {/* Toolbar */}
                    <div className="flex flex-col gap-3 border-b px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="relative w-full max-w-xs">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search funding sources..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 h-9 text-sm"
                            />
                        </div>
                        <span className="text-xs text-muted-foreground">
                            {filteredFundingSources.length === fundingSources.length
                                ? `${fundingSources.length} funding sources`
                                : `${filteredFundingSources.length} of ${fundingSources.length} funding sources`}
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
                                {paginatedFundingSources.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-40 text-center">
                                            <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                                <Wallet className="h-8 w-8 opacity-30" />
                                                <p className="text-sm font-medium">No funding sources found</p>
                                                <p className="text-xs">
                                                    {searchTerm ? 'Try a different search term.' : 'Click "New Funding Source" to get started.'}
                                                </p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    paginatedFundingSources.map((source) => (
                                        <TableRow key={source.id} className="hover:bg-muted/30 transition-colors">
                                            <TableCell className="text-xs text-muted-foreground font-mono">{source.id}</TableCell>
                                            <TableCell className="font-medium text-sm">{source.name}</TableCell>
                                            <TableCell className="max-w-xs">
                                                <span className="text-sm text-muted-foreground line-clamp-2">
                                                    {source.description || '—'}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {new Date(source.created_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
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
                                                            onClick={() => openEditModal(source)}
                                                            className="cursor-pointer"
                                                        >
                                                            <Pencil className="mr-2 h-3.5 w-3.5" />
                                                            Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            onClick={() => openDeleteModal(source)}
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
                                total={filteredFundingSources.length}
                                perPage={itemsPerPage}
                                onPageChange={setCurrentPage}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Create Modal */}
            <Dialog open={isCreateModalOpen} onOpenChange={(open) => { setIsCreateModalOpen(open); if (!open) resetForm(); }}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
                                <Wallet className="h-4 w-4" />
                            </span>
                            New Funding Source
                        </DialogTitle>
                        <DialogDescription>
                            Add a new funding source. Fields marked with <span className="text-red-500">*</span> are required.
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
                            Create Funding Source
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Modal */}
            <Dialog open={isEditModalOpen} onOpenChange={(open) => { setIsEditModalOpen(open); if (!open) resetForm(); }}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-100 text-slate-600">
                                <Pencil className="h-4 w-4" />
                            </span>
                            Edit Funding Source
                        </DialogTitle>
                        <DialogDescription>
                            Update the details for <span className="font-medium text-foreground">{selectedFundingSource?.name}</span>.
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
            <Dialog open={isDeleteModalOpen} onOpenChange={(open) => { setIsDeleteModalOpen(open); if (!open) setSelectedFundingSource(null); }}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-red-100 text-red-600">
                                <Trash2 className="h-4 w-4" />
                            </span>
                            Delete Funding Source
                        </DialogTitle>
                        <DialogDescription className="pt-1">
                            This will permanently delete{' '}
                            <span className="font-medium text-foreground">"{selectedFundingSource?.name}"</span>.
                            This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            Delete Funding Source
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
