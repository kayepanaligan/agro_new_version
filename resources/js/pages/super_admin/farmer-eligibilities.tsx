import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type FarmerEligibility } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { ArrowUpDown, MoreHorizontal, Pencil, Search, Trash2, UserCheck, Plus, Users, Calendar, TrendingUp } from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';

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
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { KpiCard } from '@/components/agro-profiler/kpi-card';
import { Pagination } from '@/components/agro-profiler/pagination';
import { ExportButtons } from '@/components/agro-profiler/export-buttons';
import { exportToCsv, exportToPdf } from '@/lib/export';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Farmer Eligibilities',
        href: '/super-admin/farmer-eligibilities',
    },
];

type SortField = 'name' | 'attribute_field' | 'created_at';
type SortOrder = 'asc' | 'desc';

export default function FarmerEligibilities() {
    const { farmerEligibilities, farmerAttributes } = usePage<{ farmerEligibilities: FarmerEligibility[]; farmerAttributes: any[] }>().props;
    const [searchTerm, setSearchTerm] = useState('');
    const [sortField, setSortField] = useState<SortField>('name');
    const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedEligibility, setSelectedEligibility] = useState<FarmerEligibility | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        attribute_field: '',
        required_value: '',
        is_active: true,
    });
    const [availableValues, setAvailableValues] = useState<any[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    // Filter and sort eligibilities
    const filteredEligibilities = useMemo(() => {
        let result = [...farmerEligibilities];

        // Search filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(
                (eligibility) =>
                    eligibility.name.toLowerCase().includes(term) ||
                    eligibility.attribute_field.toLowerCase().includes(term) ||
                    eligibility.required_value.toLowerCase().includes(term) ||
                    eligibility.description?.toLowerCase().includes(term),
            );
        }

        // Sorting
        result.sort((a, b) => {
            let aValue: any = a[sortField];
            let bValue: any = b[sortField];

            if (sortField === 'name' || sortField === 'attribute_field') {
                aValue = aValue.toLowerCase();
                bValue = bValue.toLowerCase();
            }

            if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });

        return result;
    }, [farmerEligibilities, searchTerm, sortField, sortOrder]);

    const totalPages = Math.ceil(filteredEligibilities.length / itemsPerPage);
    const paginatedEligibilities = useMemo(() => filteredEligibilities.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage), [filteredEligibilities, currentPage, itemsPerPage]);
    useMemo(() => setCurrentPage(1), [searchTerm]);

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
    };

    const handleCreate = () => {
        router.post('/super-admin/farmer-eligibilities', formData, {
            preserveScroll: false,
            onSuccess: () => {
                setIsCreateModalOpen(false);
                setFormData({ name: '', description: '', attribute_field: '', required_value: '', is_active: true });
            },
            onError: (errors) => {
                console.error('Create error:', errors);
            },
        });
    };

    const handleUpdate = () => {
        if (!selectedEligibility) return;

        router.put(`/super-admin/farmer-eligibilities/${selectedEligibility.id}`, formData, {
            preserveScroll: false,
            onSuccess: () => {
                setIsEditModalOpen(false);
                setFormData({ name: '', description: '', attribute_field: '', required_value: '', is_active: true });
                setSelectedEligibility(null);
            },
            onError: (errors) => {
                console.error('Update error:', errors);
            },
        });
    };

    const handleDelete = () => {
        if (!selectedEligibility) return;

        router.delete(`/super-admin/farmer-eligibilities/${selectedEligibility.id}`, {
            preserveScroll: false,
            onSuccess: () => {
                setIsDeleteModalOpen(false);
                setSelectedEligibility(null);
            },
            onError: (errors) => {
                console.error('Delete error:', errors);
            },
        });
    };

    const openEditModal = (eligibility: FarmerEligibility) => {
        setSelectedEligibility(eligibility);
        setFormData({
            name: eligibility.name,
            description: eligibility.description || '',
            attribute_field: eligibility.attribute_field,
            required_value: eligibility.required_value,
            is_active: eligibility.is_active,
        });
        setIsEditModalOpen(true);
    };

    const openDeleteModal = (eligibility: FarmerEligibility) => {
        setSelectedEligibility(eligibility);
        setIsDeleteModalOpen(true);
    };

    // Update available values when attribute_field changes
    const handleExportCsv = () => {
        const headers = ['ID', 'Name', 'Attribute Field', 'Required Value', 'Status'];
        const rows = filteredEligibilities.map((e) => [
            e.id,
            e.name,
            e.attribute_field,
            e.required_value,
            e.is_active ? 'Active' : 'Inactive',
        ]);
        exportToCsv('farmer-eligibilities', headers, rows);
    };

    useEffect(() => {
        if (formData.attribute_field && farmerAttributes) {
            const selectedAttr = farmerAttributes.find(attr => attr.value === formData.attribute_field);
            if (selectedAttr && selectedAttr.values) {
                setAvailableValues(selectedAttr.values);
            } else {
                setAvailableValues([]);
            }
        } else {
            setAvailableValues([]);
        }
    }, [formData.attribute_field, farmerAttributes]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Farmer Eligibilities" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">

                {/* Page Header */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Farmer Eligibilities</h1>
                        <p className="text-sm text-muted-foreground">Manage eligibility criteria for farmers</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <ExportButtons onExportCsv={handleExportCsv} onExportPdf={exportToPdf} />
                        <Button onClick={() => setIsCreateModalOpen(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                            <Plus className="mr-2 h-4 w-4" />
                            New Eligibility
                        </Button>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    <KpiCard label="Total Criteria" value={farmerEligibilities.length} icon={UserCheck} />
                    <KpiCard label="Active" value={farmerEligibilities.filter((e) => e.is_active).length} icon={Users} />
                    <KpiCard label="Inactive" value={farmerEligibilities.filter((e) => !e.is_active).length} icon={Calendar} />
                    <KpiCard label="Unique Fields" value={new Set(farmerEligibilities.map((e) => e.attribute_field)).size} icon={TrendingUp} />
                </div>

                {/* Table Card */}
                <div className="glass-card rounded-2xl overflow-hidden">
                    {/* Toolbar */}
                    <div className="flex flex-col gap-3 border-b px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="relative w-full max-w-xs">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search eligibilities..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 h-9 text-sm"
                            />
                        </div>
                        <span className="text-xs text-muted-foreground">
                            {filteredEligibilities.length === farmerEligibilities.length
                                ? `${farmerEligibilities.length} criteria`
                                : `${filteredEligibilities.length} of ${farmerEligibilities.length} criteria`}
                        </span>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/40 hover:bg-muted/40">
                                    <TableHead className="w-16 text-xs font-semibold uppercase tracking-wide text-muted-foreground">ID</TableHead>
                                    <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                        <Button variant="ghost" size="sm" className="h-auto p-0 text-xs font-semibold uppercase tracking-wide" onClick={() => handleSort('name')}>
                                            Name <ArrowUpDown className="ml-1 h-3 w-3" />
                                        </Button>
                                    </TableHead>
                                    <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Attribute Field</TableHead>
                                    <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Required Value</TableHead>
                                    <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</TableHead>
                                    <TableHead className="w-16 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedEligibilities.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-40 text-center">
                                            <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                                <UserCheck className="h-8 w-8 opacity-30" />
                                                <p className="text-sm font-medium">No eligibilities found</p>
                                                <p className="text-xs">
                                                    {searchTerm ? 'Try a different search term.' : 'Click "New Eligibility" to get started.'}
                                                </p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    paginatedEligibilities.map((eligibility) => (
                                        <TableRow key={eligibility.id} className="hover:bg-muted/30 transition-colors">
                                            <TableCell className="text-xs text-muted-foreground font-mono">{eligibility.id}</TableCell>
                                            <TableCell className="font-medium text-sm">{eligibility.name}</TableCell>
                                            <TableCell className="font-mono text-xs text-muted-foreground">{eligibility.attribute_field}</TableCell>
                                            <TableCell className="font-mono text-xs text-muted-foreground max-w-[200px] truncate" title={eligibility.required_value}>
                                                {eligibility.required_value}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={eligibility.is_active ? 'default' : 'secondary'} className="text-xs">
                                                    {eligibility.is_active ? 'Active' : 'Inactive'}
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
                                                            onClick={() => openEditModal(eligibility)}
                                                            className="cursor-pointer"
                                                        >
                                                            <Pencil className="mr-2 h-3.5 w-3.5" />
                                                            Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            onClick={() => openDeleteModal(eligibility)}
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
                            <Pagination currentPage={currentPage} lastPage={totalPages} total={filteredEligibilities.length} perPage={itemsPerPage} onPageChange={setCurrentPage} />
                        </div>
                    )}
                </div>
            </div>

            {/* Create Modal */}
            <Dialog open={isCreateModalOpen} onOpenChange={(open) => { setIsCreateModalOpen(open); if (!open) setFormData({ name: '', description: '', attribute_field: '', required_value: '', is_active: true }); }}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-100 text-emerald-700">
                                <UserCheck className="h-4 w-4" />
                            </span>
                            New Farmer Eligibility
                        </DialogTitle>
                        <DialogDescription>
                            Add a new eligibility criterion. Fields marked with <span className="text-red-500">*</span> are required.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="create-name">
                                Name <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="create-name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g., PWD Beneficiary"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="create-description">Description</Label>
                            <Input
                                id="create-description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="e.g., Farmer is a person with disability"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="create-attribute">
                                Attribute Field <span className="text-red-500">*</span>
                            </Label>
                            <Select value={formData.attribute_field} onValueChange={(value) => setFormData({ ...formData, attribute_field: value, required_value: '' })}>
                                <SelectTrigger id="create-attribute"><SelectValue placeholder="Select farmer attribute" /></SelectTrigger>
                                <SelectContent>
                                    {(farmerAttributes || []).map((attr) => (
                                        <SelectItem key={attr.value} value={attr.value}>{attr.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="create-value">
                                Required Value <span className="text-red-500">*</span>
                            </Label>
                            {availableValues && availableValues.length > 0 ? (
                                <Select value={formData.required_value} onValueChange={(value) => setFormData({ ...formData, required_value: value })}>
                                    <SelectTrigger id="create-value"><SelectValue placeholder="Select value" /></SelectTrigger>
                                    <SelectContent>
                                        {availableValues.map((val: any) => (
                                            <SelectItem key={val.value} value={val.value}>{val.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            ) : (
                                <Input
                                    id="create-value"
                                    value={formData.required_value}
                                    onChange={(e) => setFormData({ ...formData, required_value: e.target.value })}
                                    placeholder="Enter required value"
                                />
                            )}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="create-active">Status</Label>
                            <Select value={formData.is_active ? 'true' : 'false'} onValueChange={(value) => setFormData({ ...formData, is_active: value === 'true' })}>
                                <SelectTrigger id="create-active"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="true">Active</SelectItem>
                                    <SelectItem value="false">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
                        <Button
                            onClick={handleCreate}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground"
                            disabled={!formData.name.trim() || !formData.attribute_field || !formData.required_value}
                        >
                            Create Eligibility
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Modal */}
            <Dialog open={isEditModalOpen} onOpenChange={(open) => { setIsEditModalOpen(open); if (!open) { setFormData({ name: '', description: '', attribute_field: '', required_value: '', is_active: true }); setSelectedEligibility(null); } }}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-100 text-slate-700">
                                <Pencil className="h-4 w-4" />
                            </span>
                            Edit Farmer Eligibility
                        </DialogTitle>
                        <DialogDescription>
                            Update eligibility criterion. Fields marked with <span className="text-red-500">*</span> are required.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-name">
                                Name <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="edit-name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-description">Description</Label>
                            <Input
                                id="edit-description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-attribute">
                                Attribute Field <span className="text-red-500">*</span>
                            </Label>
                            <Select value={formData.attribute_field} onValueChange={(value) => setFormData({ ...formData, attribute_field: value, required_value: '' })}>
                                <SelectTrigger id="edit-attribute"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {(farmerAttributes || []).map((attr) => (
                                        <SelectItem key={attr.value} value={attr.value}>{attr.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-value">
                                Required Value <span className="text-red-500">*</span>
                            </Label>
                            {availableValues && availableValues.length > 0 ? (
                                <Select value={formData.required_value} onValueChange={(value) => setFormData({ ...formData, required_value: value })}>
                                    <SelectTrigger id="edit-value"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {availableValues.map((val: any) => (
                                            <SelectItem key={val.value} value={val.value}>{val.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            ) : (
                                <Input
                                    id="edit-value"
                                    value={formData.required_value}
                                    onChange={(e) => setFormData({ ...formData, required_value: e.target.value })}
                                />
                            )}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-active">Status</Label>
                            <Select value={formData.is_active ? 'true' : 'false'} onValueChange={(value) => setFormData({ ...formData, is_active: value === 'true' })}>
                                <SelectTrigger id="edit-active"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="true">Active</SelectItem>
                                    <SelectItem value="false">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
                        <Button
                            onClick={handleUpdate}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground"
                            disabled={!formData.name.trim() || !formData.attribute_field || !formData.required_value}
                        >
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Modal */}
            <Dialog open={isDeleteModalOpen} onOpenChange={(open) => { setIsDeleteModalOpen(open); if (!open) setSelectedEligibility(null); }}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-red-100 text-red-600">
                                <Trash2 className="h-4 w-4" />
                            </span>
                            Delete Farmer Eligibility
                        </DialogTitle>
                        <DialogDescription className="pt-1">
                            This will permanently delete{' '}
                            <span className="font-medium text-foreground">{selectedEligibility?.name}</span>.
                            This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDelete}>Delete Eligibility</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
