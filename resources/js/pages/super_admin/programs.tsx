import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Program, type FundingSource } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { ArrowUpDown, MoreHorizontal, Pencil, Search, Trash2, Sprout, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
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
import { Badge } from '@/components/ui/badge';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Programs',
        href: '/super-admin/programs',
    },
];

type SortField = 'program_name' | 'created_at';
type SortOrder = 'asc' | 'desc';

export default function Programs() {
    const { programs, fundingSources } = usePage<{ programs: Program[]; fundingSources: FundingSource[] }>().props;

    const [searchTerm, setSearchTerm] = useState('');
    const [sortField, setSortField] = useState<SortField>('program_name');
    const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
    const [formData, setFormData] = useState({
        program_name: '',
        program_description: '',
        start_date: '',
        end_date: '',
        funding_source_id: 0,
    });

    const filteredPrograms = useMemo(() => {
        let result = [...programs];
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(
                (program) =>
                    program.program_name.toLowerCase().includes(term) ||
                    program.program_description?.toLowerCase().includes(term),
            );
        }
        result.sort((a, b) => {
            let aValue: any = a[sortField];
            let bValue: any = b[sortField];
            if (sortField === 'program_name') {
                aValue = aValue.toLowerCase();
                bValue = bValue.toLowerCase();
            }
            if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });
        return result;
    }, [programs, searchTerm, sortField, sortOrder]);

    const totalPages = Math.ceil(filteredPrograms.length / itemsPerPage);
    const paginatedPrograms = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredPrograms.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredPrograms, currentPage, itemsPerPage]);

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
        router.post('/super-admin/programs', formData, {
            preserveScroll: false,
            onSuccess: () => { setIsCreateModalOpen(false); resetForm(); },
            onError: (errors) => { console.error('Create error:', errors); },
        });
    };

    const handleUpdate = () => {
        if (!selectedProgram) return;
        router.put(`/super-admin/programs/${selectedProgram.id}`, formData, {
            preserveScroll: false,
            onSuccess: () => { setIsEditModalOpen(false); resetForm(); setSelectedProgram(null); },
            onError: (errors) => { console.error('Update error:', errors); },
        });
    };

    const handleDelete = () => {
        if (!selectedProgram) return;
        router.delete(`/super-admin/programs/${selectedProgram.id}`, {
            preserveScroll: false,
            onSuccess: () => { setIsDeleteModalOpen(false); setSelectedProgram(null); },
            onError: (errors) => { console.error('Delete error:', errors); },
        });
    };

    const openEditModal = (program: Program) => {
        setSelectedProgram(program);
        setFormData({
            program_name: program.program_name,
            program_description: program.program_description || '',
            start_date: program.start_date || '',
            end_date: program.end_date || '',
            funding_source_id: program.funding_source_id || 0,
        });
        setIsEditModalOpen(true);
    };

    const openDeleteModal = (program: Program) => {
        setSelectedProgram(program);
        setIsDeleteModalOpen(true);
    };

    const resetForm = () => {
        setFormData({ program_name: '', program_description: '', start_date: '', end_date: '', funding_source_id: 0 });
        setSelectedProgram(null);
    };

    const isProgramActive = (program: Program) => {
        if (!program.start_date || !program.end_date) return null;
        const now = new Date();
        const start = new Date(program.start_date);
        const end = new Date(program.end_date);
        if (now < start) return 'upcoming';
        if (now > end) return 'ended';
        return 'active';
    };

    const statusConfig = {
        active: { label: 'Active', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
        upcoming: { label: 'Upcoming', className: 'bg-sky-50 text-sky-700 border-sky-200' },
        ended: { label: 'Ended', className: 'bg-slate-100 text-slate-500 border-slate-200' },
    };

    const sharedTextareaClass =
        'flex min-h-[88px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none';

    const FormFields = ({ prefix }: { prefix: string }) => (
        <div className="grid gap-4 py-4">
            <div className="grid gap-2">
                <Label htmlFor={`${prefix}-program-name`}>
                    Program Name <span className="text-red-500">*</span>
                </Label>
                <Input
                    id={`${prefix}-program-name`}
                    value={formData.program_name}
                    onChange={(e) => setFormData({ ...formData, program_name: e.target.value })}
                    placeholder="e.g., RSBSA Registration Program"
                />
            </div>
            <div className="grid gap-2">
                <Label htmlFor={`${prefix}-description`}>Description</Label>
                <textarea
                    id={`${prefix}-description`}
                    value={formData.program_description}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                        setFormData({ ...formData, program_description: e.target.value })
                    }
                    placeholder="Brief description of the program"
                    rows={3}
                    className={sharedTextareaClass}
                />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor={`${prefix}-start-date`}>Start Date</Label>
                    <Input
                        id={`${prefix}-start-date`}
                        type="date"
                        value={formData.start_date}
                        onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor={`${prefix}-end-date`}>End Date</Label>
                    <Input
                        id={`${prefix}-end-date`}
                        type="date"
                        value={formData.end_date}
                        onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    />
                </div>
            </div>
            <div className="grid gap-2">
                <Label htmlFor={`${prefix}-funding-source`}>Funding Source</Label>
                <Select
                    value={formData.funding_source_id ? formData.funding_source_id.toString() : ''}
                    onValueChange={(value) => setFormData({ ...formData, funding_source_id: parseInt(value) })}
                >
                    <SelectTrigger id={`${prefix}-funding-source`}>
                        <SelectValue placeholder="Select a funding source" />
                    </SelectTrigger>
                    <SelectContent>
                        {fundingSources.length === 0 ? (
                            <div className="p-2 text-sm text-muted-foreground">
                                No funding sources available.{' '}
                                <a
                                    href="/admin/funding-sources"
                                    className="text-emerald-600 hover:underline font-medium"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Add one here
                                </a>
                            </div>
                        ) : (
                            fundingSources.map((source) => (
                                <SelectItem key={source.id} value={source.id.toString()}>
                                    {source.name}
                                </SelectItem>
                            ))
                        )}
                    </SelectContent>
                </Select>
            </div>
        </div>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Programs" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">

                {/* Page Header */}
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                            <Sprout className="h-5 w-5" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Programs</h1>
                            <p className="text-sm text-muted-foreground">Manage agricultural programs and beneficiary eligibility</p>
                        </div>
                    </div>
                    <Button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="mt-3 sm:mt-0 bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        New Program
                    </Button>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    {[
                        { label: 'Total Programs', value: programs.length, accent: 'border-l-primary' },
                        {
                            label: 'Active',
                            value: programs.filter((p) => isProgramActive(p) === 'active').length,
                            accent: 'border-l-emerald-400',
                        },
                        {
                            label: 'Upcoming',
                            value: programs.filter((p) => isProgramActive(p) === 'upcoming').length,
                            accent: 'border-l-sky-400',
                        },
                        {
                            label: 'Ended',
                            value: programs.filter((p) => isProgramActive(p) === 'ended').length,
                            accent: 'border-l-slate-300',
                        },
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
                                placeholder="Search programs..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 h-9 text-sm"
                            />
                        </div>
                        <span className="text-xs text-muted-foreground">
                            {filteredPrograms.length === programs.length
                                ? `${programs.length} programs`
                                : `${filteredPrograms.length} of ${programs.length} programs`}
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
                                            onClick={() => handleSort('program_name')}
                                            className="flex items-center gap-1.5 hover:text-foreground transition-colors"
                                        >
                                            Program Name
                                            <ArrowUpDown className="h-3.5 w-3.5" />
                                        </button>
                                    </TableHead>
                                    <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground max-w-xs">Description</TableHead>
                                    <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Funding Source</TableHead>
                                    <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</TableHead>
                                    <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Duration</TableHead>
                                    <TableHead className="w-16 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedPrograms.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-40 text-center">
                                            <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                                <Sprout className="h-8 w-8 opacity-30" />
                                                <p className="text-sm font-medium">No programs found</p>
                                                <p className="text-xs">
                                                    {searchTerm ? 'Try a different search term.' : 'Click "New Program" to get started.'}
                                                </p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    paginatedPrograms.map((program) => {
                                        const status = isProgramActive(program);
                                        const config = status ? statusConfig[status] : null;
                                        return (
                                            <TableRow key={program.id} className="hover:bg-muted/30 transition-colors">
                                                <TableCell className="text-xs text-muted-foreground font-mono">{program.id}</TableCell>
                                                <TableCell className="font-medium text-sm">{program.program_name}</TableCell>
                                                <TableCell className="max-w-xs">
                                                    <span className="text-sm text-muted-foreground line-clamp-2">
                                                        {program.program_description || '—'}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    {program.funding_source?.name ? (
                                                        <span className="text-sm text-foreground">{program.funding_source.name}</span>
                                                    ) : (
                                                        <span className="text-sm text-muted-foreground">—</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {config ? (
                                                        <span
                                                            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${config.className}`}
                                                        >
                                                            {config.label}
                                                        </span>
                                                    ) : (
                                                        <span className="text-sm text-muted-foreground">—</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {program.start_date && program.end_date ? (
                                                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                                                            {new Date(program.start_date).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                            {' – '}
                                                            {new Date(program.end_date).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                        </span>
                                                    ) : (
                                                        <span className="text-sm text-muted-foreground">—</span>
                                                    )}
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
                                                                onClick={() => openEditModal(program)}
                                                                className="cursor-pointer"
                                                            >
                                                                <Pencil className="mr-2 h-3.5 w-3.5" />
                                                                Edit
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                onClick={() => openDeleteModal(program)}
                                                                className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                                                            >
                                                                <Trash2 className="mr-2 h-3.5 w-3.5" />
                                                                Delete
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
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
                                            className={`h-8 w-8 p-0 text-xs ${currentPage === pageNum ? 'bg-primary hover:bg-primary/90 border-primary' : ''}`}
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
            <Dialog
                open={isCreateModalOpen}
                onOpenChange={(open) => { setIsCreateModalOpen(open); if (!open) resetForm(); }}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
                                <Sprout className="h-4 w-4" />
                            </span>
                            New Program
                        </DialogTitle>
                        <DialogDescription>
                            Add a new agricultural program. Fields marked with <span className="text-red-500">*</span> are required.
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
                            disabled={!formData.program_name.trim()}
                        >
                            Create Program
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
                            Edit Program
                        </DialogTitle>
                        <DialogDescription>
                            Update the details for <span className="font-medium text-foreground">{selectedProgram?.program_name}</span>.
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
                            disabled={!formData.program_name.trim()}
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
                            Delete Program
                        </DialogTitle>
                        <DialogDescription className="pt-1">
                            This will permanently delete{' '}
                            <span className="font-medium text-foreground">"{selectedProgram?.program_name}"</span>.
                            This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            Delete Program
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
