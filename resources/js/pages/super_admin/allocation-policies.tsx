import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type AllocationPolicy, type AllocationType } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { ArrowUpDown, MoreHorizontal, Pencil, Search, Trash2, FileText, Plus, Shield, Link2, TrendingUp } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { KpiCard } from '@/components/agro-profiler/kpi-card';
import { Pagination } from '@/components/agro-profiler/pagination';
import { ExportButtons } from '@/components/agro-profiler/export-buttons';
import { exportToCsv, exportToPdf } from '@/lib/export';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Allocation Policies', href: '/super-admin/allocation-policies' }];

export default function AllocationPolicies() {
    const { allocationPolicies, allocationTypes } = usePage<{ allocationPolicies: AllocationPolicy[]; allocationTypes: AllocationType[] }>().props;
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedPolicy, setSelectedPolicy] = useState<AllocationPolicy | null>(null);
    const [formData, setFormData] = useState({ allocation_type_id: 0, policy_type: 'equal', is_active: true });

    const filteredPolicies = useMemo(() => {
        let result = [...allocationPolicies];
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter((p) => p.allocation_type?.name.toLowerCase().includes(term) || p.policy_type.toLowerCase().includes(term));
        }
        result.sort((a, b) => sortOrder === 'asc' ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime() : new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        return result;
    }, [allocationPolicies, searchTerm, sortOrder]);

    const totalPages = Math.ceil(filteredPolicies.length / itemsPerPage);
    const paginatedPolicies = useMemo(() => filteredPolicies.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage), [filteredPolicies, currentPage, itemsPerPage]);
    useMemo(() => setCurrentPage(1), [searchTerm]);

    const handleCreate = () => { router.post('/super-admin/allocation-policies', formData, { preserveScroll: false, onSuccess: () => { setIsEditModalOpen(false); resetForm(); } }); };
    const handleQuickAdd = () => {
        setFormData({ allocation_type_id: 0, policy_type: 'equal', is_active: true });
        setIsEditModalOpen(true);
    };
    const handleUpdate = () => { if (!selectedPolicy) return; router.put(`/super-admin/allocation-policies/${selectedPolicy.id}`, formData, { preserveScroll: false, onSuccess: () => { setIsEditModalOpen(false); resetForm(); } }); };
    const handleDelete = () => { if (!selectedPolicy) return; router.delete(`/super-admin/allocation-policies/${selectedPolicy.id}`, { preserveScroll: false, onSuccess: () => { setIsDeleteModalOpen(false); setSelectedPolicy(null); } }); };

    const openEditModal = (policy: AllocationPolicy) => { setSelectedPolicy(policy); setFormData({ allocation_type_id: policy.allocation_type_id, policy_type: policy.policy_type, is_active: policy.is_active }); setIsEditModalOpen(true); };
    const resetForm = () => { setFormData({ allocation_type_id: 0, policy_type: 'equal', is_active: true }); setSelectedPolicy(null); };

    const getPolicyBadge = (type: string) => {
        const variants: any = { equal: 'default', proportional: 'secondary', priority: 'outline', weighted: 'destructive', hybrid: 'destructive' };
        return <Badge variant={variants[type] || 'secondary'}>{type}</Badge>;
    };

    const handleExportCsv = () => {
        const headers = ['ID', 'Allocation Type', 'Policy Type', 'Status', 'Created'];
        const rows = filteredPolicies.map(p => [
            p.id, p.allocation_type?.name || '', p.policy_type, p.is_active ? 'Active' : 'Inactive', new Date(p.created_at).toLocaleDateString(),
        ]);
        exportToCsv('allocation-policies', headers, rows);
    };

    const FormFields = ({ prefix }: { prefix: string }) => (
        <div className="grid gap-4 py-4">
            <div className="grid gap-2">
                <Label htmlFor={`${prefix}-type`}>
                    Allocation Type <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.allocation_type_id.toString()} onValueChange={(value) => setFormData({ ...formData, allocation_type_id: parseInt(value) })}>
                    <SelectTrigger id={`${prefix}-type`}><SelectValue placeholder="Select allocation type" /></SelectTrigger>
                    <SelectContent>{(allocationTypes || []).map((t) => (<SelectItem key={t.id} value={t.id.toString()}>{t.name}</SelectItem>))}</SelectContent>
                </Select>
            </div>
            <div className="grid gap-2">
                <Label htmlFor={`${prefix}-policy`}>
                    Policy Type <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.policy_type} onValueChange={(v: any) => setFormData({ ...formData, policy_type: v })}>
                    <SelectTrigger id={`${prefix}-policy`}><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="equal">Equal</SelectItem>
                        <SelectItem value="proportional">Proportional</SelectItem>
                        <SelectItem value="priority">Priority</SelectItem>
                        <SelectItem value="weighted">Weighted</SelectItem>
                        <SelectItem value="hybrid">Hybrid</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="flex items-center gap-2">
                <input type="checkbox" id={`${prefix}-active`} checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} />
                <Label htmlFor={`${prefix}-active`}>Active</Label>
            </div>
        </div>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Allocation Policies" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">

                {/* Page Header */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Allocation Policies</h1>
                        <p className="text-sm text-muted-foreground">DSS logic for recommended allocations</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <ExportButtons onExportCsv={handleExportCsv} onExportPdf={exportToPdf} />
                        <Button onClick={handleQuickAdd} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                            <Plus className="mr-2 h-4 w-4" />
                            New Policy
                        </Button>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    <KpiCard label="Total Policies" value={allocationPolicies.length} icon={FileText} />
                    <KpiCard label="Active" value={allocationPolicies.filter((p) => p.is_active).length} icon={Shield} />
                    <KpiCard label="Inactive" value={allocationPolicies.filter((p) => !p.is_active).length} icon={Link2} />
                    <KpiCard label="Equal Policy" value={allocationPolicies.filter((p) => p.policy_type === 'equal').length} icon={TrendingUp} />
                </div>

                {/* Table Card */}
                <div className="glass-card rounded-2xl overflow-hidden">
                    {/* Toolbar */}
                    <div className="flex flex-col gap-3 border-b px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="relative w-full max-w-xs">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search policies..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 h-9 text-sm"
                            />
                        </div>
                        <span className="text-xs text-muted-foreground">
                            {filteredPolicies.length === allocationPolicies.length
                                ? `${allocationPolicies.length} policies`
                                : `${filteredPolicies.length} of ${allocationPolicies.length} policies`}
                        </span>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/40 hover:bg-muted/40">
                                    <TableHead className="w-16 text-xs font-semibold uppercase tracking-wide text-muted-foreground">ID</TableHead>
                                    <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Allocation Type</TableHead>
                                    <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Policy Type</TableHead>
                                    <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</TableHead>
                                    <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Created</TableHead>
                                    <TableHead className="w-16 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedPolicies.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-40 text-center">
                                            <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                                <FileText className="h-8 w-8 opacity-30" />
                                                <p className="text-sm font-medium">No policies found</p>
                                                <p className="text-xs">
                                                    {searchTerm ? 'Try a different search term.' : 'Click "New Policy" to get started.'}
                                                </p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    paginatedPolicies.map((p) => (
                                        <TableRow key={p.id} className="hover:bg-muted/30 transition-colors">
                                            <TableCell className="text-xs text-muted-foreground font-mono">{p.id}</TableCell>
                                            <TableCell className="font-medium text-sm">{p.allocation_type?.name || <span className="text-muted-foreground">—</span>}</TableCell>
                                            <TableCell>{getPolicyBadge(p.policy_type)}</TableCell>
                                            <TableCell>
                                                <Badge variant={p.is_active ? 'default' : 'secondary'}>
                                                    {p.is_active ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {new Date(p.created_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
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
                                                            onClick={() => openEditModal(p)}
                                                            className="cursor-pointer"
                                                        >
                                                            <Pencil className="mr-2 h-3.5 w-3.5" />
                                                            Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            onClick={() => { setSelectedPolicy(p); setIsDeleteModalOpen(true); }}
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
                                total={filteredPolicies.length}
                                perPage={itemsPerPage}
                                onPageChange={setCurrentPage}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Edit/Create Modal */}
            <Dialog open={isEditModalOpen} onOpenChange={(open) => { setIsEditModalOpen(open); if (!open) resetForm(); }}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
                                <FileText className="h-4 w-4" />
                            </span>
                            {selectedPolicy ? 'Edit Allocation Policy' : 'New Allocation Policy'}
                        </DialogTitle>
                        <DialogDescription>
                            {selectedPolicy
                                ? `Update the policy for ${selectedPolicy.allocation_type?.name}.`
                                : 'Add a new allocation policy. Fields marked with * are required.'}
                        </DialogDescription>
                    </DialogHeader>
                    <FormFields prefix={selectedPolicy ? 'edit' : 'create'} />
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
                        <Button
                            onClick={selectedPolicy ? handleUpdate : handleCreate}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground"
                            disabled={!formData.allocation_type_id}
                        >
                            {selectedPolicy ? 'Save Changes' : 'Create Policy'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Modal */}
            <Dialog open={isDeleteModalOpen} onOpenChange={(open) => { setIsDeleteModalOpen(open); if (!open) setSelectedPolicy(null); }}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-red-100 text-red-600">
                                <Trash2 className="h-4 w-4" />
                            </span>
                            Delete Allocation Policy
                        </DialogTitle>
                        <DialogDescription className="pt-1">
                            This will permanently delete the policy for{' '}
                            <span className="font-medium text-foreground">{selectedPolicy?.allocation_type?.name}</span>.
                            This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDelete}>Delete Policy</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
