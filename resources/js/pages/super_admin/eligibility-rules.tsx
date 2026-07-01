import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type EligibilityRule, type AllocationType } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { ArrowUpDown, MoreHorizontal, Pencil, Search, Trash2, ListChecks, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Eligibility Rules', href: '/super-admin/eligibility-rules' }];

type SortField = 'created_at';
type SortOrder = 'asc' | 'desc';

export default function EligibilityRules() {
    const { eligibilityRules, allocationTypes, farmerAttributes } = usePage<{ eligibilityRules: EligibilityRule[]; allocationTypes: AllocationType[]; farmerAttributes: any[] }>().props;
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedRule, setSelectedRule] = useState<EligibilityRule | null>(null);
    const [formData, setFormData] = useState({ allocation_type_id: 0, field_name: '', operator: '=', value: '', score: 1 });
    const [availableValues, setAvailableValues] = useState<any[]>([]);

    const filteredRules = useMemo(() => {
        let result = [...eligibilityRules];
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter((rule) => rule.field_name.toLowerCase().includes(term) || rule.allocation_type?.name.toLowerCase().includes(term));
        }
        result.sort((a, b) => {
            const aValue = new Date(a.created_at).getTime();
            const bValue = new Date(b.created_at).getTime();
            return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
        });
        return result;
    }, [eligibilityRules, searchTerm, sortOrder]);

    const totalPages = Math.ceil(filteredRules.length / itemsPerPage);
    const paginatedRules = useMemo(() => filteredRules.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage), [filteredRules, currentPage, itemsPerPage]);
    useMemo(() => setCurrentPage(1), [searchTerm]);

    const handleCreate = () => { router.post('/super-admin/eligibility-rules', formData, { preserveScroll: false, onSuccess: () => { setIsCreateModalOpen(false); resetForm(); } }); };
    const handleUpdate = () => { if (!selectedRule) return; router.put(`/super-admin/eligibility-rules/${selectedRule.id}`, formData, { preserveScroll: false, onSuccess: () => { setIsEditModalOpen(false); resetForm(); } }); };
    const handleDelete = () => { if (!selectedRule) return; router.delete(`/super-admin/eligibility-rules/${selectedRule.id}`, { preserveScroll: false, onSuccess: () => { setIsDeleteModalOpen(false); setSelectedRule(null); } }); };

    const openEditModal = (rule: EligibilityRule) => { setSelectedRule(rule); setFormData({ allocation_type_id: rule.allocation_type_id, field_name: rule.field_name, operator: rule.operator, value: rule.value, score: rule.score || 1 }); setIsEditModalOpen(true); };
    const resetForm = () => { setFormData({ allocation_type_id: 0, field_name: '', operator: '=', value: '', score: 1 }); setSelectedRule(null); setAvailableValues([]); };

    const getShortFieldName = (fieldName: string) => {
        const parts = fieldName.split('.');
        return parts.length > 1 ? parts[parts.length - 1] : fieldName;
    };

    // Update available values when field_name changes
    useEffect(() => {
        if (formData.field_name && farmerAttributes) {
            const selectedAttr = farmerAttributes.find(attr => attr.value === formData.field_name);
            if (selectedAttr && selectedAttr.values) {
                setAvailableValues(selectedAttr.values);
            } else {
                setAvailableValues([]);
            }
        } else {
            setAvailableValues([]);
        }
    }, [formData.field_name, farmerAttributes]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Eligibility Rules" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">

                {/* Page Header */}
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                            <ListChecks className="h-5 w-5" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Eligibility Rules</h1>
                            <p className="text-sm text-muted-foreground">Define who qualifies for allocations</p>
                        </div>
                    </div>
                    <Button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="mt-3 sm:mt-0 bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        New Rule
                    </Button>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    {[
                        { label: 'Total Rules', value: eligibilityRules.length, accent: 'border-l-primary' },
                        { label: 'Unique Fields', value: new Set(eligibilityRules.map((r) => r.field_name)).size, accent: 'border-l-blue-400' },
                        { label: 'Allocation Types', value: new Set(eligibilityRules.map((r) => r.allocation_type_id)).size, accent: 'border-l-amber-400' },
                        { label: 'High Score (≥5)', value: eligibilityRules.filter((r) => (r.score || 1) >= 5).length, accent: 'border-l-purple-400' },
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
                                placeholder="Search rules..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 h-9 text-sm"
                            />
                        </div>
                        <span className="text-xs text-muted-foreground">
                            {filteredRules.length === eligibilityRules.length
                                ? `${eligibilityRules.length} rules`
                                : `${filteredRules.length} of ${eligibilityRules.length} rules`}
                        </span>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/40 hover:bg-muted/40">
                                    <TableHead className="w-16 text-xs font-semibold uppercase tracking-wide text-muted-foreground">ID</TableHead>
                                    <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                        <Button variant="ghost" size="sm" className="h-auto p-0 text-xs font-semibold uppercase tracking-wide" onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}>
                                            Date <ArrowUpDown className="ml-1 h-3 w-3" />
                                        </Button>
                                    </TableHead>
                                    <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Allocation Type</TableHead>
                                    <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Field</TableHead>
                                    <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Operator</TableHead>
                                    <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Value</TableHead>
                                    <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Score</TableHead>
                                    <TableHead className="w-16 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedRules.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="h-40 text-center">
                                            <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                                <ListChecks className="h-8 w-8 opacity-30" />
                                                <p className="text-sm font-medium">No rules found</p>
                                                <p className="text-xs">
                                                    {searchTerm ? 'Try a different search term.' : 'Click "New Rule" to get started.'}
                                                </p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    paginatedRules.map((rule) => (
                                        <TableRow key={rule.id} className="hover:bg-muted/30 transition-colors">
                                            <TableCell className="text-xs text-muted-foreground font-mono">{rule.id}</TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {new Date(rule.created_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </TableCell>
                                            <TableCell className="font-medium text-sm">{rule.allocation_type?.name || <span className="text-muted-foreground">—</span>}</TableCell>
                                            <TableCell className="text-sm">{getShortFieldName(rule.field_name)}</TableCell>
                                            <TableCell>
                                                <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">{rule.operator}</code>
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate" title={rule.value}>
                                                {rule.value}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" className="font-bold text-xs">
                                                    {rule.score || 1}
                                                </Badge>
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
                                                            onClick={() => openEditModal(rule)}
                                                            className="cursor-pointer"
                                                        >
                                                            <Pencil className="mr-2 h-3.5 w-3.5" />
                                                            Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            onClick={() => { setSelectedRule(rule); setIsDeleteModalOpen(true); }}
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
            <Dialog open={isCreateModalOpen} onOpenChange={(open) => { setIsCreateModalOpen(open); if (!open) resetForm(); }}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
                                <ListChecks className="h-4 w-4" />
                            </span>
                            New Eligibility Rule
                        </DialogTitle>
                        <DialogDescription>
                            Define a rule for allocation eligibility. Fields marked with <span className="text-red-500">*</span> are required.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="create-type">
                                Allocation Type <span className="text-red-500">*</span>
                            </Label>
                            <Select value={formData.allocation_type_id.toString()} onValueChange={(value) => setFormData({ ...formData, allocation_type_id: parseInt(value) })}>
                                <SelectTrigger id="create-type"><SelectValue placeholder="Select" /></SelectTrigger>
                                <SelectContent>{(allocationTypes || []).map((t) => (<SelectItem key={t.id} value={t.id.toString()}>{t.name}</SelectItem>))}</SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="create-field">
                                Attribute Field <span className="text-red-500">*</span>
                            </Label>
                            <Select value={formData.field_name} onValueChange={(value) => setFormData({ ...formData, field_name: value, value: '' })}>
                                <SelectTrigger id="create-field"><SelectValue placeholder="Select farmer attribute" /></SelectTrigger>
                                <SelectContent>
                                    {(farmerAttributes || []).map((attr) => (<SelectItem key={attr.value} value={attr.value}>{attr.label}</SelectItem>))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="create-operator">
                                Operator <span className="text-red-500">*</span>
                            </Label>
                            <Select value={formData.operator} onValueChange={(value) => setFormData({ ...formData, operator: value })}>
                                <SelectTrigger id="create-operator"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="=">=</SelectItem><SelectItem value=">">&gt;</SelectItem><SelectItem value="<">&lt;</SelectItem>
                                    <SelectItem value=">=">&gt;=</SelectItem><SelectItem value="<=">&lt;=</SelectItem><SelectItem value="!=">≠</SelectItem>
                                    <SelectItem value="in">In (comma-separated)</SelectItem><SelectItem value="not in">Not In (comma-separated)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="create-value">
                                Required Value <span className="text-red-500">*</span>
                            </Label>
                            {availableValues && availableValues.length > 0 ? (
                                <Select value={formData.value} onValueChange={(value) => setFormData({ ...formData, value })}>
                                    <SelectTrigger id="create-value"><SelectValue placeholder="Select value" /></SelectTrigger>
                                    <SelectContent>
                                        {availableValues.map((val: any) => (<SelectItem key={val.value} value={val.value}>{val.label}</SelectItem>))}
                                    </SelectContent>
                                </Select>
                            ) : (
                                <Input id="create-value" value={formData.value} onChange={(e) => setFormData({ ...formData, value: e.target.value })} placeholder="Enter required value" />
                            )}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="create-score">Score / Weight</Label>
                            <Input id="create-score" type="number" min="1" max="100" value={formData.score} onChange={(e) => setFormData({ ...formData, score: parseInt(e.target.value) || 1 })} placeholder="Default: 1" />
                            <p className="text-xs text-muted-foreground">Higher scores = higher priority in DSS ranking</p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreate} disabled={!formData.allocation_type_id || !formData.field_name || !formData.value}>Create Rule</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Modal */}
            <Dialog open={isEditModalOpen} onOpenChange={(open) => { setIsEditModalOpen(open); if (!open) resetForm(); }}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-100 text-slate-700">
                                <Pencil className="h-4 w-4" />
                            </span>
                            Edit Eligibility Rule
                        </DialogTitle>
                        <DialogDescription>
                            Update the eligibility rule. Fields marked with <span className="text-red-500">*</span> are required.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-type">
                                Allocation Type <span className="text-red-500">*</span>
                            </Label>
                            <Select value={formData.allocation_type_id.toString()} onValueChange={(value) => setFormData({ ...formData, allocation_type_id: parseInt(value) })}>
                                <SelectTrigger id="edit-type"><SelectValue /></SelectTrigger>
                                <SelectContent>{(allocationTypes || []).map((t) => (<SelectItem key={t.id} value={t.id.toString()}>{t.name}</SelectItem>))}</SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-field">
                                Attribute Field <span className="text-red-500">*</span>
                            </Label>
                            <Select value={formData.field_name} onValueChange={(value) => setFormData({ ...formData, field_name: value, value: '' })}>
                                <SelectTrigger id="edit-field"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {(farmerAttributes || []).map((attr) => (<SelectItem key={attr.value} value={attr.value}>{attr.label}</SelectItem>))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-operator">
                                Operator <span className="text-red-500">*</span>
                            </Label>
                            <Select value={formData.operator} onValueChange={(value) => setFormData({ ...formData, operator: value })}>
                                <SelectTrigger id="edit-operator"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="=">=</SelectItem><SelectItem value=">">&gt;</SelectItem><SelectItem value="<">&lt;</SelectItem>
                                    <SelectItem value=">=">&gt;=</SelectItem><SelectItem value="<=">&lt;=</SelectItem><SelectItem value="!=">≠</SelectItem>
                                    <SelectItem value="in">In (comma-separated)</SelectItem><SelectItem value="not in">Not In (comma-separated)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-value">
                                Required Value <span className="text-red-500">*</span>
                            </Label>
                            {availableValues && availableValues.length > 0 ? (
                                <Select value={formData.value} onValueChange={(value) => setFormData({ ...formData, value })}>
                                    <SelectTrigger id="edit-value"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {availableValues.map((val: any) => (<SelectItem key={val.value} value={val.value}>{val.label}</SelectItem>))}
                                    </SelectContent>
                                </Select>
                            ) : (
                                <Input id="edit-value" value={formData.value} onChange={(e) => setFormData({ ...formData, value: e.target.value })} />
                            )}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-score">Score / Weight</Label>
                            <Input id="edit-score" type="number" min="1" max="100" value={formData.score} onChange={(e) => setFormData({ ...formData, score: parseInt(e.target.value) || 1 })} />
                            <p className="text-xs text-muted-foreground">Higher scores = higher priority in DSS ranking</p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleUpdate} disabled={!formData.allocation_type_id || !formData.field_name || !formData.value}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Modal */}
            <Dialog open={isDeleteModalOpen} onOpenChange={(open) => { setIsDeleteModalOpen(open); if (!open) setSelectedRule(null); }}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-red-100 text-red-600">
                                <Trash2 className="h-4 w-4" />
                            </span>
                            Delete Eligibility Rule
                        </DialogTitle>
                        <DialogDescription className="pt-1">
                            This will permanently delete this rule. This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDelete}>Delete Rule</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
