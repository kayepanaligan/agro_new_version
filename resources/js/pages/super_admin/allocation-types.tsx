import AppLayout from '@/layouts/app-layout';
import { type AllocationType, type BreadcrumbItem, type Program, type UnitOfMeasure, type Category, type Commodity, type Variety, type Barangay, type FarmerEligibility } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { ArrowUpDown, MoreHorizontal, Pencil, Search, Trash2, ListChecks, Plus, DollarSign, Calendar } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { KpiCard } from '@/components/agro-profiler/kpi-card';
import { ExportButtons } from '@/components/agro-profiler/export-buttons';
import { exportToCsv, exportToPdf } from '@/lib/export';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Allocation Types',
        href: '/super-admin/allocation-types',
    },
];

type SortField = 'name' | 'amount' | 'created_at';
type SortOrder = 'asc' | 'desc';

export default function AllocationTypes() {
    const { allocationTypes, programs, unitsOfMeasure, categories, commodities, varieties, barangays, farmerEligibilities } = usePage<{
        allocationTypes: AllocationType[];
        programs: Program[];
        unitsOfMeasure: UnitOfMeasure[];
        categories: Category[];
        commodities: Commodity[];
        varieties: Variety[];
        barangays: Barangay[];
        farmerEligibilities: FarmerEligibility[];
    }>().props;
    const [searchTerm, setSearchTerm] = useState('');
    const [sortField, setSortField] = useState<SortField>('name');
    const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedAllocation, setSelectedAllocation] = useState<AllocationType | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        amount: 0,
        unit_of_measurement_id: 0,
        program_id: 0,
        category_ids: [] as number[],
        commodity_ids: [] as number[],
        variety_ids: [] as number[],
        barangay_ids: [] as number[],
    });

    // Filter and sort allocations
    const filteredAllocations = useMemo(() => {
        let result = [...allocationTypes];

        // Search filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(
                (allocation) =>
                    allocation.name.toLowerCase().includes(term) ||
                    allocation.description?.toLowerCase().includes(term) ||
                    allocation.program?.program_name.toLowerCase().includes(term),
            );
        }

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
    }, [allocationTypes, searchTerm, sortField, sortOrder]);

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
    };

    const handleCreate = () => {
        router.post('/super-admin/allocation-types', formData, {
            preserveScroll: false,
            onSuccess: () => {
                setIsCreateModalOpen(false);
                setFormData({ 
                    name: '', 
                    description: '', 
                    amount: 0, 
                    unit_of_measurement_id: 0, 
                    program_id: 0,
                    category_ids: [],
                    commodity_ids: [],
                    variety_ids: [],
                    barangay_ids: [],
                });
            },
            onError: (errors) => {
                console.error('Create error:', errors);
            },
        });
    };

    const handleUpdate = () => {
        if (!selectedAllocation) return;

        router.put(`/super-admin/allocation-types/${selectedAllocation.id}`, formData, {
            preserveScroll: false,
            onSuccess: () => {
                setIsEditModalOpen(false);
                setFormData({ 
                    name: '', 
                    description: '', 
                    amount: 0, 
                    unit_of_measurement_id: 0, 
                    program_id: 0,
                    category_ids: [],
                    commodity_ids: [],
                    variety_ids: [],
                    barangay_ids: [],
                });
                setSelectedAllocation(null);
            },
            onError: (errors) => {
                console.error('Update error:', errors);
            },
        });
    };

    const handleDelete = () => {
        if (!selectedAllocation) return;

        router.delete(`/super-admin/allocation-types/${selectedAllocation.id}`, {
            preserveScroll: false,
            onSuccess: () => {
                setIsDeleteModalOpen(false);
                setSelectedAllocation(null);
            },
            onError: (errors) => {
                console.error('Delete error:', errors);
            },
        });
    };

    const openEditModal = (allocation: AllocationType) => {
        setSelectedAllocation(allocation);
        setFormData({
            name: allocation.name,
            description: allocation.description || '',
            amount: allocation.amount,
            unit_of_measurement_id: allocation.unit_of_measurement_id,
            program_id: allocation.program_id,
            category_ids: allocation.category_ids || [],
            commodity_ids: allocation.commodity_ids || [],
            variety_ids: allocation.variety_ids || [],
            barangay_ids: allocation.barangay_ids || [],
        });
        setIsEditModalOpen(true);
    };

    const openDeleteModal = (allocation: AllocationType) => {
        setSelectedAllocation(allocation);
        setIsDeleteModalOpen(true);
    };

    const handleExportCsv = () => {
        const headers = ['ID', 'Name', 'Description', 'Amount', 'Program', 'Unit'];
        const rows = filteredAllocations.map((a) => [
            a.id,
            a.name,
            a.description || '',
            a.amount.toLocaleString(),
            a.program?.program_name || '',
            a.unit_of_measurement?.code || '',
        ]);
        exportToCsv('allocation-types', headers, rows);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Allocation Types" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Page Header */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Allocation Types</h1>
                        <p className="text-sm text-muted-foreground">Manage allocation types for distribution</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <ExportButtons onExportCsv={handleExportCsv} onExportPdf={exportToPdf} />
                        <Button onClick={() => setIsCreateModalOpen(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Allocation Type
                        </Button>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    <KpiCard label="Total Types" value={allocationTypes.length} icon={ListChecks} />
                    <KpiCard label="With Programs" value={allocationTypes.filter((a) => a.program_id).length} icon={DollarSign} />
                    <KpiCard label="Average Amount" value={allocationTypes.length ? Math.round(allocationTypes.reduce((sum, a) => sum + a.amount, 0) / allocationTypes.length).toLocaleString() : 0} icon={Calendar} />
                    <KpiCard label="Unique Units" value={new Set(allocationTypes.map((a) => a.unit_of_measurement_id)).size} icon={ListChecks} />
                </div>

                {/* Table Card */}
                <div className="glass-card rounded-2xl overflow-hidden">
                    {/* Toolbar */}
                    <div className="flex flex-col gap-3 border-b px-6 py-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="relative w-full max-w-xs">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search allocations..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                        </div>

                        <span className="text-xs text-muted-foreground">
                            {filteredAllocations.length} of {allocationTypes.length} allocation type{allocationTypes.length !== 1 ? 's' : ''}
                        </span>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/40 hover:bg-muted/40">
                                    <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">ID</TableHead>
                                    <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Name</TableHead>
                                    <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Description</TableHead>
                                    <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Amount</TableHead>
                                    <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Program</TableHead>
                                    <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Unit</TableHead>
                                    <TableHead className="w-20 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredAllocations.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-40 text-center">
                                            <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                                <ListChecks className="h-8 w-8 opacity-30" />
                                                <p className="text-sm font-medium">No allocation types found</p>
                                                <p className="text-xs">Click "Add Allocation Type" to create one.</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredAllocations.map((allocation) => (
                                        <TableRow key={allocation.id} className="hover:bg-muted/30 transition-colors">
                                            <TableCell className="font-mono text-sm">{allocation.id}</TableCell>
                                            <TableCell className="font-medium">{allocation.name}</TableCell>
                                            <TableCell className="max-w-xs truncate text-sm text-muted-foreground line-clamp-2">{allocation.description || '-'}</TableCell>
                                            <TableCell className="text-sm font-semibold">{allocation.amount.toLocaleString()}</TableCell>
                                            <TableCell className="text-sm">{allocation.program?.program_name || '-'}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="text-xs">{allocation.unit_of_measurement?.code || '-'}</Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem onClick={() => openEditModal(allocation)}>
                                                            <Pencil className="mr-2 h-4 w-4" />
                                                            <span>Edit</span>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem 
                                                            onClick={() => openDeleteModal(allocation)}
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
                </div>

            {/* Create Modal */}
            <Dialog open={isCreateModalOpen} onOpenChange={(open) => { setIsCreateModalOpen(open); if (!open) setFormData({ name: '', description: '', amount: 0, unit_of_measurement_id: 0, program_id: 0, category_ids: [], commodity_ids: [], variety_ids: [], barangay_ids: [] }); }}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
                                <ListChecks className="h-4 w-4" />
                            </span>
                            New Allocation Type
                        </DialogTitle>
                        <DialogDescription>
                            Add a new allocation type. Fields marked with <span className="text-red-500">*</span> are required.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4 pr-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="create-name">
                                    Name <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="create-name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g., Rice Distribution"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="create-amount">
                                    Amount <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="create-amount"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                                    placeholder="0.00"
                                />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="create-description">Description</Label>
                            <Input
                                id="create-description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="e.g., Monthly rice distribution program"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="create-program">Program</Label>
                                <Select
                                    value={formData.program_id.toString()}
                                    onValueChange={(value) => setFormData({ ...formData, program_id: parseInt(value) })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select program" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="0">No Program</SelectItem>
                                        {programs.map((program) => (
                                            <SelectItem key={program.id} value={program.id.toString()}>
                                                {program.program_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="create-unit">Unit of Measurement</Label>
                                <Select
                                    value={formData.unit_of_measurement_id.toString()}
                                    onValueChange={(value) => setFormData({ ...formData, unit_of_measurement_id: parseInt(value) })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select unit" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="0">No Unit</SelectItem>
                                        {unitsOfMeasure.map((unit) => (
                                            <SelectItem key={unit.id} value={unit.id.toString()}>
                                                {unit.name} ({unit.code})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Advanced Configuration - Multi-select Dropdowns */}
                        <div className="mt-4 space-y-4">
                            <h4 className="text-sm font-medium">Advanced Configuration</h4>
                            
                            {/* Categories Multi-select */}
                            <div className="grid gap-2">
                                <Label>Commodity Categories</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className="justify-start text-left font-normal">
                                            <span>{formData.category_ids.length > 0 ? `${formData.category_ids.length} selected` : 'Select categories...'}</span>
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[300px] p-0" align="start" style={{ zIndex: 50 }}>
                                        <Command>
                                            <CommandInput placeholder="Search categories..." />
                                            <CommandList>
                                                <CommandEmpty>No categories found.</CommandEmpty>
                                                <CommandGroup>
                                                    {categories.map((category) => (
                                                        <CommandItem key={category.id} value={category.id.toString()}>
                                                            <Checkbox
                                                                id={`create-category-${category.id}`}
                                                                checked={formData.category_ids.includes(category.id)}
                                                                onCheckedChange={(checked) => {
                                                                    if (checked) {
                                                                        setFormData({
                                                                            ...formData,
                                                                            category_ids: [...formData.category_ids, category.id],
                                                                        });
                                                                    } else {
                                                                        setFormData({
                                                                            ...formData,
                                                                            category_ids: formData.category_ids.filter((id) => id !== category.id),
                                                                        });
                                                                    }
                                                                }}
                                                            />
                                                            <label
                                                                htmlFor={`create-category-${category.id}`}
                                                                className="ml-2 cursor-pointer text-sm"
                                                            >
                                                                {category.name}
                                                            </label>
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                                {formData.category_ids.length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                        {formData.category_ids.map((id) => {
                                            const cat = categories.find((c) => c.id === id);
                                            return cat ? (
                                                <Badge key={id} variant="secondary" className="text-xs">
                                                    {cat.name}
                                                    <button
                                                        onClick={() => setFormData({
                                                            ...formData,
                                                            category_ids: formData.category_ids.filter((cid) => cid !== id),
                                                        })}
                                                        className="ml-1 hover:text-destructive"
                                                    >
                                                        ×
                                                    </button>
                                                </Badge>
                                            ) : null;
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Commodities Multi-select */}
                            <div className="grid gap-2">
                                <Label>Commodities</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className="justify-start text-left font-normal">
                                            <span>{formData.commodity_ids.length > 0 ? `${formData.commodity_ids.length} selected` : 'Select commodities...'}</span>
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[300px] p-0" align="start" style={{ zIndex: 50 }}>
                                        <Command>
                                            <CommandInput placeholder="Search commodities..." />
                                            <CommandList>
                                                <CommandEmpty>No commodities found.</CommandEmpty>
                                                <CommandGroup>
                                                    {commodities
                                                        .filter((c) => formData.category_ids.length === 0 || formData.category_ids.includes(c.category_id))
                                                        .map((commodity) => (
                                                            <CommandItem key={commodity.id} value={commodity.id.toString()}>
                                                                <Checkbox
                                                                    id={`create-commodity-${commodity.id}`}
                                                                    checked={formData.commodity_ids.includes(commodity.id)}
                                                                    onCheckedChange={(checked) => {
                                                                        if (checked) {
                                                                            setFormData({
                                                                                ...formData,
                                                                                commodity_ids: [...formData.commodity_ids, commodity.id],
                                                                            });
                                                                        } else {
                                                                            setFormData({
                                                                                ...formData,
                                                                                commodity_ids: formData.commodity_ids.filter((id) => id !== commodity.id),
                                                                            });
                                                                        }
                                                                    }}
                                                                />
                                                                <label
                                                                    htmlFor={`create-commodity-${commodity.id}`}
                                                                    className="ml-2 cursor-pointer text-sm"
                                                                >
                                                                    {commodity.name} - <span className="text-muted-foreground">{commodity.category?.name || 'No Category'}</span>
                                                                </label>
                                                            </CommandItem>
                                                        ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                                {formData.commodity_ids.length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                        {formData.commodity_ids.map((id) => {
                                            const comm = commodities.find((c) => c.id === id);
                                            return comm ? (
                                                <Badge key={id} variant="secondary" className="text-xs">
                                                    {comm.name}
                                                    <button
                                                        onClick={() => setFormData({
                                                            ...formData,
                                                            commodity_ids: formData.commodity_ids.filter((cid) => cid !== id),
                                                        })}
                                                        className="ml-1 hover:text-destructive"
                                                    >
                                                        ×
                                                    </button>
                                                </Badge>
                                            ) : null;
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Varieties Multi-select */}
                            <div className="grid gap-2">
                                <Label>Varieties</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className="justify-start text-left font-normal">
                                            <span>{formData.variety_ids.length > 0 ? `${formData.variety_ids.length} selected` : 'Select varieties...'}</span>
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[300px] p-0" align="start" style={{ zIndex: 50 }}>
                                        <Command>
                                            <CommandInput placeholder="Search varieties..." />
                                            <CommandList>
                                                <CommandEmpty>No varieties found.</CommandEmpty>
                                                <CommandGroup>
                                                    {varieties
                                                        .filter((v) => formData.commodity_ids.length === 0 || formData.commodity_ids.includes(v.commodity_id))
                                                        .map((variety) => (
                                                            <CommandItem key={variety.id} value={variety.id.toString()}>
                                                                <Checkbox
                                                                    id={`create-variety-${variety.id}`}
                                                                    checked={formData.variety_ids.includes(variety.id)}
                                                                    onCheckedChange={(checked) => {
                                                                        if (checked) {
                                                                            setFormData({
                                                                                ...formData,
                                                                                variety_ids: [...formData.variety_ids, variety.id],
                                                                            });
                                                                        } else {
                                                                            setFormData({
                                                                                ...formData,
                                                                                variety_ids: formData.variety_ids.filter((id) => id !== variety.id),
                                                                            });
                                                                        }
                                                                    }}
                                                                />
                                                                <label
                                                                    htmlFor={`create-variety-${variety.id}`}
                                                                    className="ml-2 cursor-pointer text-sm"
                                                                >
                                                                    {variety.name} - <span className="text-muted-foreground">{variety.commodity?.name || 'No Commodity'}</span>
                                                                </label>
                                                            </CommandItem>
                                                        ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                                {formData.variety_ids.length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                        {formData.variety_ids.map((id) => {
                                            const variet = varieties.find((v) => v.id === id);
                                            return variet ? (
                                                <Badge key={id} variant="secondary" className="text-xs">
                                                    {variet.name}
                                                    <button
                                                        onClick={() => setFormData({
                                                            ...formData,
                                                            variety_ids: formData.variety_ids.filter((vid) => vid !== id),
                                                        })}
                                                        className="ml-1 hover:text-destructive"
                                                    >
                                                        ×
                                                    </button>
                                                </Badge>
                                            ) : null;
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Barangays Multi-select */}
                            <div className="grid gap-2">
                                <Label>Eligible Barangays</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className="justify-start text-left font-normal">
                                            <span>{formData.barangay_ids.length > 0 ? `${formData.barangay_ids.length} selected` : 'Select barangays...'}</span>
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[300px] p-0" align="start" style={{ zIndex: 50 }}>
                                        <Command>
                                            <CommandInput placeholder="Search barangays..." />
                                            <CommandList>
                                                <CommandEmpty>No barangays found.</CommandEmpty>
                                                <CommandGroup>
                                                    {barangays.map((barangay) => (
                                                        <CommandItem key={barangay.id} value={barangay.id.toString()}>
                                                            <Checkbox
                                                                id={`create-barangay-${barangay.id}`}
                                                                checked={formData.barangay_ids.includes(barangay.id)}
                                                                onCheckedChange={(checked) => {
                                                                    if (checked) {
                                                                        setFormData({
                                                                            ...formData,
                                                                            barangay_ids: [...formData.barangay_ids, barangay.id],
                                                                        });
                                                                    } else {
                                                                        setFormData({
                                                                            ...formData,
                                                                            barangay_ids: formData.barangay_ids.filter((id) => id !== barangay.id),
                                                                        });
                                                                    }
                                                                }}
                                                            />
                                                            <label
                                                                htmlFor={`create-barangay-${barangay.id}`}
                                                                className="ml-2 cursor-pointer text-sm"
                                                            >
                                                                {barangay.name}
                                                            </label>
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                                {formData.barangay_ids.length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                        {formData.barangay_ids.map((id) => {
                                            const brgy = barangays.find((b) => b.id === id);
                                            return brgy ? (
                                                <Badge key={id} variant="secondary" className="text-xs">
                                                    {brgy.name}
                                                    <button
                                                        onClick={() => setFormData({
                                                            ...formData,
                                                            barangay_ids: formData.barangay_ids.filter((bid) => bid !== id),
                                                        })}
                                                        className="ml-1 hover:text-destructive"
                                                    >
                                                        ×
                                                    </button>
                                                </Badge>
                                            ) : null;
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
                        <Button
                            onClick={handleCreate}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground"
                            disabled={!formData.name.trim() || formData.amount <= 0}
                        >
                            Create Allocation
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Modal */}
            <Dialog open={isEditModalOpen} onOpenChange={(open) => { setIsEditModalOpen(open); if (!open && selectedAllocation) { setFormData({ name: selectedAllocation.name, description: selectedAllocation.description || '', amount: selectedAllocation.amount, unit_of_measurement_id: selectedAllocation.unit_of_measurement_id || 0, program_id: selectedAllocation.program_id || 0, category_ids: [], commodity_ids: [], variety_ids: [], barangay_ids: [] }); } }}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-100 text-slate-700">
                                <ListChecks className="h-4 w-4" />
                            </span>
                            Edit Allocation Type
                        </DialogTitle>
                        <DialogDescription>
                            Update allocation type information. Fields marked with <span className="text-red-500">*</span> are required.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4 pr-4">
                        <div className="grid grid-cols-2 gap-4">
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
                                <Label htmlFor="edit-amount">
                                    Amount <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="edit-amount"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                                />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-description">Description</Label>
                            <Input
                                id="edit-description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit-program">Program</Label>
                                <Select
                                    value={formData.program_id.toString()}
                                    onValueChange={(value) => setFormData({ ...formData, program_id: parseInt(value) })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select program" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="0">No Program</SelectItem>
                                        {programs.map((program) => (
                                            <SelectItem key={program.id} value={program.id.toString()}>
                                                {program.program_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-unit">Unit of Measurement</Label>
                                <Select
                                    value={formData.unit_of_measurement_id.toString()}
                                    onValueChange={(value) => setFormData({ ...formData, unit_of_measurement_id: parseInt(value) })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select unit" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="0">No Unit</SelectItem>
                                        {unitsOfMeasure.map((unit) => (
                                            <SelectItem key={unit.id} value={unit.id.toString()}>
                                                {unit.name} ({unit.code})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Advanced Configuration - Multi-select Dropdowns */}
                        <div className="mt-4 space-y-4">
                            <h4 className="text-sm font-medium">Advanced Configuration</h4>
                            
                            {/* Categories Multi-select */}
                            <div className="grid gap-2">
                                <Label>Commodity Categories</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className="justify-start text-left font-normal">
                                            <span>{formData.category_ids.length > 0 ? `${formData.category_ids.length} selected` : 'Select categories...'}</span>
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[300px] p-0" align="start" style={{ zIndex: 50 }}>
                                        <Command>
                                            <CommandInput placeholder="Search categories..." />
                                            <CommandList>
                                                <CommandEmpty>No categories found.</CommandEmpty>
                                                <CommandGroup>
                                                    {categories.map((category) => (
                                                        <CommandItem key={category.id} value={category.id.toString()}>
                                                            <Checkbox
                                                                id={`edit-category-${category.id}`}
                                                                checked={formData.category_ids.includes(category.id)}
                                                                onCheckedChange={(checked) => {
                                                                    if (checked) {
                                                                        setFormData({
                                                                            ...formData,
                                                                            category_ids: [...formData.category_ids, category.id],
                                                                        });
                                                                    } else {
                                                                        setFormData({
                                                                            ...formData,
                                                                            category_ids: formData.category_ids.filter((id) => id !== category.id),
                                                                        });
                                                                    }
                                                                }}
                                                            />
                                                            <label
                                                                htmlFor={`edit-category-${category.id}`}
                                                                className="ml-2 cursor-pointer text-sm"
                                                            >
                                                                {category.name}
                                                            </label>
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                                {formData.category_ids.length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                        {formData.category_ids.map((id) => {
                                            const cat = categories.find((c) => c.id === id);
                                            return cat ? (
                                                <Badge key={id} variant="secondary" className="text-xs">
                                                    {cat.name}
                                                    <button
                                                        onClick={() => setFormData({
                                                            ...formData,
                                                            category_ids: formData.category_ids.filter((cid) => cid !== id),
                                                        })}
                                                        className="ml-1 hover:text-destructive"
                                                    >
                                                        ×
                                                    </button>
                                                </Badge>
                                            ) : null;
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Commodities Multi-select */}
                            <div className="grid gap-2">
                                <Label>Commodities</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className="justify-start text-left font-normal">
                                            <span>{formData.commodity_ids.length > 0 ? `${formData.commodity_ids.length} selected` : 'Select commodities...'}</span>
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[300px] p-0" align="start" style={{ zIndex: 50 }}>
                                        <Command>
                                            <CommandInput placeholder="Search commodities..." />
                                            <CommandList>
                                                <CommandEmpty>No commodities found.</CommandEmpty>
                                                <CommandGroup>
                                                    {commodities
                                                        .filter((c) => formData.category_ids.length === 0 || formData.category_ids.includes(c.category_id))
                                                        .map((commodity) => (
                                                            <CommandItem key={commodity.id} value={commodity.id.toString()}>
                                                                <Checkbox
                                                                    id={`edit-commodity-${commodity.id}`}
                                                                    checked={formData.commodity_ids.includes(commodity.id)}
                                                                    onCheckedChange={(checked) => {
                                                                        if (checked) {
                                                                            setFormData({
                                                                                ...formData,
                                                                                commodity_ids: [...formData.commodity_ids, commodity.id],
                                                                            });
                                                                        } else {
                                                                            setFormData({
                                                                                ...formData,
                                                                                commodity_ids: formData.commodity_ids.filter((id) => id !== commodity.id),
                                                                            });
                                                                        }
                                                                    }}
                                                                />
                                                                <label
                                                                    htmlFor={`edit-commodity-${commodity.id}`}
                                                                    className="ml-2 cursor-pointer text-sm"
                                                                >
                                                                    {commodity.name} - <span className="text-muted-foreground">{commodity.category?.name || 'No Category'}</span>
                                                                </label>
                                                            </CommandItem>
                                                        ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                                {formData.commodity_ids.length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                        {formData.commodity_ids.map((id) => {
                                            const comm = commodities.find((c) => c.id === id);
                                            return comm ? (
                                                <Badge key={id} variant="secondary" className="text-xs">
                                                    {comm.name}
                                                    <button
                                                        onClick={() => setFormData({
                                                            ...formData,
                                                            commodity_ids: formData.commodity_ids.filter((cid) => cid !== id),
                                                        })}
                                                        className="ml-1 hover:text-destructive"
                                                    >
                                                        ×
                                                    </button>
                                                </Badge>
                                            ) : null;
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Varieties Multi-select */}
                            <div className="grid gap-2">
                                <Label>Varieties</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className="justify-start text-left font-normal">
                                            <span>{formData.variety_ids.length > 0 ? `${formData.variety_ids.length} selected` : 'Select varieties...'}</span>
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[300px] p-0" align="start" style={{ zIndex: 50 }}>
                                        <Command>
                                            <CommandInput placeholder="Search varieties..." />
                                            <CommandList>
                                                <CommandEmpty>No varieties found.</CommandEmpty>
                                                <CommandGroup>
                                                    {varieties
                                                        .filter((v) => formData.commodity_ids.length === 0 || formData.commodity_ids.includes(v.commodity_id))
                                                        .map((variety) => (
                                                            <CommandItem key={variety.id} value={variety.id.toString()}>
                                                                <Checkbox
                                                                    id={`edit-variety-${variety.id}`}
                                                                    checked={formData.variety_ids.includes(variety.id)}
                                                                    onCheckedChange={(checked) => {
                                                                        if (checked) {
                                                                            setFormData({
                                                                                ...formData,
                                                                                variety_ids: [...formData.variety_ids, variety.id],
                                                                            });
                                                                        } else {
                                                                            setFormData({
                                                                                ...formData,
                                                                                variety_ids: formData.variety_ids.filter((id) => id !== variety.id),
                                                                            });
                                                                        }
                                                                    }}
                                                                />
                                                                <label
                                                                    htmlFor={`edit-variety-${variety.id}`}
                                                                    className="ml-2 cursor-pointer text-sm"
                                                                >
                                                                    {variety.name} - <span className="text-muted-foreground">{variety.commodity?.name || 'No Commodity'}</span>
                                                                </label>
                                                            </CommandItem>
                                                        ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                                {formData.variety_ids.length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                        {formData.variety_ids.map((id) => {
                                            const variet = varieties.find((v) => v.id === id);
                                            return variet ? (
                                                <Badge key={id} variant="secondary" className="text-xs">
                                                    {variet.name}
                                                    <button
                                                        onClick={() => setFormData({
                                                            ...formData,
                                                            variety_ids: formData.variety_ids.filter((vid) => vid !== id),
                                                        })}
                                                        className="ml-1 hover:text-destructive"
                                                    >
                                                        ×
                                                    </button>
                                                </Badge>
                                            ) : null;
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Barangays Multi-select */}
                            <div className="grid gap-2">
                                <Label>Eligible Barangays</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className="justify-start text-left font-normal">
                                            <span>{formData.barangay_ids.length > 0 ? `${formData.barangay_ids.length} selected` : 'Select barangays...'}</span>
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[300px] p-0" align="start" style={{ zIndex: 50 }}>
                                        <Command>
                                            <CommandInput placeholder="Search barangays..." />
                                            <CommandList>
                                                <CommandEmpty>No barangays found.</CommandEmpty>
                                                <CommandGroup>
                                                    {barangays.map((barangay) => (
                                                        <CommandItem key={barangay.id} value={barangay.id.toString()}>
                                                            <Checkbox
                                                                id={`edit-barangay-${barangay.id}`}
                                                                checked={formData.barangay_ids.includes(barangay.id)}
                                                                onCheckedChange={(checked) => {
                                                                    if (checked) {
                                                                        setFormData({
                                                                            ...formData,
                                                                            barangay_ids: [...formData.barangay_ids, barangay.id],
                                                                        });
                                                                    } else {
                                                                        setFormData({
                                                                            ...formData,
                                                                            barangay_ids: formData.barangay_ids.filter((id) => id !== barangay.id),
                                                                        });
                                                                    }
                                                                }}
                                                            />
                                                            <label
                                                                htmlFor={`edit-barangay-${barangay.id}`}
                                                                className="ml-2 cursor-pointer text-sm"
                                                            >
                                                                {barangay.name}
                                                            </label>
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                                {formData.barangay_ids.length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                        {formData.barangay_ids.map((id) => {
                                            const brgy = barangays.find((b) => b.id === id);
                                            return brgy ? (
                                                <Badge key={id} variant="secondary" className="text-xs">
                                                    {brgy.name}
                                                    <button
                                                        onClick={() => setFormData({
                                                            ...formData,
                                                            barangay_ids: formData.barangay_ids.filter((bid) => bid !== id),
                                                        })}
                                                        className="ml-1 hover:text-destructive"
                                                    >
                                                        ×
                                                    </button>
                                                </Badge>
                                            ) : null;
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
                        <Button
                            onClick={handleUpdate}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground"
                            disabled={!formData.name.trim() || formData.amount <= 0}
                        >
                            Update Allocation
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Modal */}
            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-red-100 text-red-700">
                                <ListChecks className="h-4 w-4" />
                            </span>
                            Delete Allocation Type
                        </DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete <span className="font-semibold text-foreground">"{selectedAllocation?.name}"</span>? This action cannot be undone.
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
            </div>
        </AppLayout>
    );
}
