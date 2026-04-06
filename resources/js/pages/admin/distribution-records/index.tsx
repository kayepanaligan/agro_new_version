import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type DistributionRecord, type AllocationType, type AllocationPolicy } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { FileText, Plus, Search, MoreHorizontal, Pencil, Trash2, Calendar, Package, Truck, List, LayoutGrid, ArrowUpDown } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage, AvatarGroup } from '@/components/ui/avatar';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Distribution Records', href: '/admin/distribution-records' }];

export default function DistributionRecordsIndex() {
    const { distributionRecords, allocationTypes, allocationPolicies } = usePage<{ 
        distributionRecords: DistributionRecord[]; 
        allocationTypes: AllocationType[];
        allocationPolicies: AllocationPolicy[];
    }>().props;

    const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortField, setSortField] = useState<'distribution_name' | 'release_date' | 'source_type'>('release_date');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
    const [filterSourceType, setFilterSourceType] = useState<'all' | 'dss_generated' | 'manual'>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<DistributionRecord | null>(null);
    const [formData, setFormData] = useState({
        distribution_name: '',
        allocation_type_id: 0,
        source_type: 'manual' as 'dss_generated' | 'manual',
        total_quantity: 0,
        release_date: new Date().toISOString().split('T')[0],
        note: '',
        allocation_policy_id: 0,
    });

    const filteredRecords = useMemo(() => {
        let result = [...distributionRecords];
        
        // Filter by search term
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter((r) => 
                r.distribution_name.toLowerCase().includes(term) || 
                r.allocation_type?.name.toLowerCase().includes(term)
            );
        }
        
        // Filter by source type
        if (filterSourceType !== 'all') {
            result = result.filter((r) => r.source_type === filterSourceType);
        }
        
        // Sort
        result.sort((a, b) => {
            let comparison = 0;
            if (sortField === 'distribution_name') {
                comparison = a.distribution_name.localeCompare(b.distribution_name);
            } else if (sortField === 'release_date') {
                comparison = new Date(a.release_date).getTime() - new Date(b.release_date).getTime();
            } else if (sortField === 'source_type') {
                comparison = a.source_type.localeCompare(b.source_type);
            }
            return sortDirection === 'asc' ? comparison : -comparison;
        });
        
        return result;
    }, [distributionRecords, searchTerm, sortField, sortDirection, filterSourceType]);
    
    // Pagination
    const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
    const paginatedRecords = filteredRecords.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );
    
    const handleSort = (field: 'distribution_name' | 'release_date' | 'source_type') => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const handleCreate = () => {
        router.post('/admin/distribution-records', formData, {
            preserveScroll: false,
            onSuccess: () => {
                setIsCreateModalOpen(false);
                resetForm();
                setCurrentPage(1);
            },
        });
    };

    const handleUpdate = () => {
        if (!selectedRecord) return;
        router.put(`/admin/distribution-records/${selectedRecord.id}`, formData, {
            preserveScroll: false,
            onSuccess: () => {
                setIsEditModalOpen(false);
                resetForm();
                setCurrentPage(1);
            },
        });
    };

    const handleDelete = () => {
        if (!selectedRecord) return;
        router.delete(`/admin/distribution-records/${selectedRecord.id}`, {
            preserveScroll: false,
            onSuccess: () => {
                setIsDeleteModalOpen(false);
                setSelectedRecord(null);
                if (filteredRecords.length <= itemsPerPage && currentPage > 1) {
                    setCurrentPage(currentPage - 1);
                }
            },
        });
    };

    const openEditModal = (record: DistributionRecord) => {
        setSelectedRecord(record);
        setFormData({
            distribution_name: record.distribution_name,
            allocation_type_id: record.allocation_type_id,
            source_type: record.source_type,
            total_quantity: Number(record.total_quantity),
            release_date: record.release_date,
            note: record.note || '',
            allocation_policy_id: record.allocation_policy_id || 0,
        });
        setIsEditModalOpen(true);
    };

    const resetForm = () => {
        setFormData({
            distribution_name: '',
            allocation_type_id: 0,
            source_type: 'manual',
            total_quantity: 0,
            release_date: new Date().toISOString().split('T')[0],
            note: '',
            allocation_policy_id: 0,
        });
        setSelectedRecord(null);
    };

    const getSourceTypeBadge = (type: string) => {
        const variants: any = { dss_generated: 'default', manual: 'secondary' };
        return (
            <Badge variant={variants[type] || 'secondary'} className="flex items-center gap-1">
                {type === 'dss_generated' ? <Truck className="h-3 w-3" /> : <Package className="h-3 w-3" />}
                {type === 'dss_generated' ? 'DSS Generated' : 'Manual'}
            </Badge>
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Distribution Records" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="rounded-xl border bg-card shadow-sm">
                    <div className="p-6">
                        <h1 className="mb-2 text-3xl font-bold">Distribution Records</h1>
                        <p className="text-muted-foreground">Manage distribution lists and allocations</p>
                    </div>

                    <div className="border-t p-6">
                        <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div className="flex flex-col gap-4 md:flex-row md:items-center flex-1">
                                <div className="relative flex-1 max-w-sm">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        placeholder="Search distributions..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-9"
                                    />
                                </div>
                                <Select 
                                    value={filterSourceType} 
                                    onValueChange={(value: any) => { setFilterSourceType(value); setCurrentPage(1); }}
                                >
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Filter by source" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Sources</SelectItem>
                                        <SelectItem value="dss_generated">DSS Generated</SelectItem>
                                        <SelectItem value="manual">Manual</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button 
                                    variant={viewMode === 'card' ? 'default' : 'outline'} 
                                    size="sm" 
                                    onClick={() => { setViewMode('card'); setCurrentPage(1); }}
                                    className="h-9 w-9 p-0"
                                >
                                    <LayoutGrid className="h-4 w-4" />
                                </Button>
                                <Button 
                                    variant={viewMode === 'list' ? 'default' : 'outline'} 
                                    size="sm" 
                                    onClick={() => { setViewMode('list'); setCurrentPage(1); }}
                                    className="h-9 w-9 p-0"
                                >
                                    <List className="h-4 w-4" />
                                </Button>
                                <Button onClick={() => setIsCreateModalOpen(true)}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    New Distribution
                                </Button>
                            </div>
                        </div>

                        <div className="mb-4 flex items-center justify-between text-sm text-muted-foreground">
                            <span>Showing {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredRecords.length)} of {filteredRecords.length} distributions</span>
                            {totalPages > 1 && (
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                    >
                                        Previous
                                    </Button>
                                    <span>Page {currentPage} of {totalPages}</span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                    >
                                        Next
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* Card View */}
                        {viewMode === 'card' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {paginatedRecords.length === 0 ? (
                                    <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                                        <FileText className="h-12 w-12 text-muted-foreground" />
                                        <p className="mt-4 text-lg font-medium">No distribution records found</p>
                                        <p className="text-sm text-muted-foreground">Create your first distribution to get started</p>
                                    </div>
                                ) : (
                                    paginatedRecords.map((record) => (
                                        <Card 
                                            key={record.id} 
                                            className="cursor-pointer transition-colors hover:bg-accent"
                                            onClick={() => router.get(`/admin/distribution-records/${record.id}/items`)}
                                        >
                                            <CardContent className="p-4">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex items-center gap-2">
                                                    <FileText className="h-5 w-5 text-primary" />
                                                    <h3 className="font-semibold text-sm line-clamp-1">{record.distribution_name}</h3>
                                                </div>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem onClick={() => router.get(`/admin/distribution-records/${record.id}/items`)}>
                                                            <Package className="mr-2 h-4 w-4" />
                                                            View Items
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => openEditModal(record)}>
                                                            <Pencil className="mr-2 h-4 w-4" />
                                                            Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem 
                                                            onClick={() => { setSelectedRecord(record); setIsDeleteModalOpen(true); }}
                                                            className="text-red-600"
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>

                                            <div className="space-y-2 text-sm">
                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                    <Calendar className="h-4 w-4" />
                                                    <span>{new Date(record.release_date).toLocaleDateString()}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                    <Package className="h-4 w-4" />
                                                    <span>{record.allocation_type?.name || 'Unknown'}</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    {getSourceTypeBadge(record.source_type)}
                                                    <span className="text-xs font-medium">{Number(record.total_quantity).toFixed(2)} units</span>
                                                </div>
                                                
                                                {/* Avatar Group of Users Who Distributed Items */}
                                                {record.items && record.items.length > 0 && (
                                                    <div className="flex items-center gap-2 pt-2 border-t border-border mt-2">
                                                        <span className="text-xs text-muted-foreground">Distributed by:</span>
                                                        <AvatarGroup>
                                                            {(() => {
                                                                // Only include items where user_id is NOT null (actually distributed)
                                                                const uniqueUsers = Array.from(
                                                                    new Map(
                                                                        record.items
                                                                            .filter(item => item.user_id && item.user)
                                                                            .map(item => [item.user!.id, item.user])
                                                                    ).values()
                                                                );
                                                                
                                                                // Don't show avatar group if no users distributed items
                                                                if (uniqueUsers.length === 0) {
                                                                    return null;
                                                                }
                                                                
                                                                const displayUsers = uniqueUsers.slice(0, 3);
                                                                const remainingCount = uniqueUsers.length - 3;
                                                                
                                                                return (
                                                                    <>
                                                                        {displayUsers.map((user: any) => (
                                                                            <Avatar key={user.id} className="h-6 w-6">
                                                                                <AvatarImage src={user.avatar ? `/storage/${user.avatar}` : undefined} />
                                                                                <AvatarFallback className="text-xs">
                                                                                    {user.first_name && user.last_name 
                                                                                        ? `${user.first_name[0]}${user.last_name[0]}`.toUpperCase() 
                                                                                        : 'U'}
                                                                                </AvatarFallback>
                                                                            </Avatar>
                                                                        ))}
                                                                        {remainingCount > 0 && (
                                                                            <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-background bg-muted text-xs font-medium">
                                                                                +{remainingCount}
                                                                            </div>
                                                                        )}
                                                                    </>
                                                                );
                                                            })()}
                                                        </AvatarGroup>
                                                    </div>
                                                )}
                                                
                                                {record.note && (
                                                    <p className="text-xs text-muted-foreground line-clamp-2 mt-2">{record.note}</p>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )))}
                            </div>
                        )}

                        {/* List View */}
                        {viewMode === 'list' && (
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="cursor-pointer hover:bg-accent" onClick={() => handleSort('distribution_name')}>
                                                <div className="flex items-center gap-2">
                                                    Name
                                                    <ArrowUpDown className="h-4 w-4" />
                                                </div>
                                            </TableHead>
                                            <TableHead className="cursor-pointer hover:bg-accent" onClick={() => handleSort('release_date')}>
                                                <div className="flex items-center gap-2">
                                                    Release Date
                                                    <ArrowUpDown className="h-4 w-4" />
                                                </div>
                                            </TableHead>
                                            <TableHead>Allocation Type</TableHead>
                                            <TableHead className="cursor-pointer hover:bg-accent" onClick={() => handleSort('source_type')}>
                                                <div className="flex items-center gap-2">
                                                    Source Type
                                                    <ArrowUpDown className="h-4 w-4" />
                                                </div>
                                            </TableHead>
                                            <TableHead className="text-right">Total Quantity</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {paginatedRecords.map((record) => (
                                            <TableRow key={record.id} className="cursor-pointer hover:bg-accent/50" onClick={() => router.get(`/admin/distribution-records/${record.id}/items`)}>
                                                <TableCell className="font-medium">
                                                    <div className="flex items-center gap-2">
                                                        <FileText className="h-4 w-4 text-primary" />
                                                        {record.distribution_name}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                                        {new Date(record.release_date).toLocaleDateString()}
                                                    </div>
                                                </TableCell>
                                                <TableCell>{record.allocation_type?.name || 'Unknown'}</TableCell>
                                                <TableCell>{getSourceTypeBadge(record.source_type)}</TableCell>
                                                <TableCell className="text-right font-medium">{Number(record.total_quantity).toFixed(2)}</TableCell>
                                                <TableCell className="text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem onClick={() => router.get(`/admin/distribution-records/${record.id}/items`)}>
                                                                <Package className="mr-2 h-4 w-4" />
                                                                View Items
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => openEditModal(record)}>
                                                                <Pencil className="mr-2 h-4 w-4" />
                                                                Edit
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem 
                                                                onClick={() => { setSelectedRecord(record); setIsDeleteModalOpen(true); }}
                                                                className="text-red-600"
                                                            >
                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                Delete
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Create Modal */}
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Create Distribution Record</DialogTitle>
                        <DialogDescription>Add a new distribution list. Fill in the details below.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="create-name">Distribution Name</Label>
                            <Input
                                id="create-name"
                                value={formData.distribution_name}
                                onChange={(e) => setFormData({ ...formData, distribution_name: e.target.value })}
                                placeholder="e.g., Fertilizer Distribution Q1 2026"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Allocation Type</Label>
                                <Select 
                                    value={formData.allocation_type_id.toString()} 
                                    onValueChange={(value) => setFormData({ ...formData, allocation_type_id: parseInt(value) })}
                                >
                                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                    <SelectContent>
                                        {(allocationTypes || []).map((t) => (
                                            <SelectItem key={t.id} value={t.id.toString()}>{t.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label>Source Type</Label>
                                <Select 
                                    value={formData.source_type} 
                                    onValueChange={(value: any) => setFormData({ ...formData, source_type: value })}
                                >
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="manual">Manual</SelectItem>
                                        <SelectItem value="dss_generated">DSS Generated</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Total Quantity</Label>
                                <Input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={formData.total_quantity}
                                    onChange={(e) => setFormData({ ...formData, total_quantity: parseFloat(e.target.value) || 0 })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Release Date</Label>
                                <Input
                                    type="date"
                                    value={formData.release_date}
                                    onChange={(e) => setFormData({ ...formData, release_date: e.target.value })}
                                />
                            </div>
                        </div>
                        {formData.source_type === 'dss_generated' && (
                            <div className="grid gap-2">
                                <Label>Allocation Policy (Optional)</Label>
                                <Select 
                                    value={formData.allocation_policy_id.toString()} 
                                    onValueChange={(value) => setFormData({ ...formData, allocation_policy_id: parseInt(value) })}
                                >
                                    <SelectTrigger><SelectValue placeholder="Select policy" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="0">None</SelectItem>
                                        {(allocationPolicies || []).map((p) => (
                                            <SelectItem key={p.id} value={p.id.toString()}>{p.allocation_type?.name || 'Policy'}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                        <div className="grid gap-2">
                            <Label htmlFor="create-note">Notes</Label>
                            <Input
                                id="create-note"
                                value={formData.note}
                                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                                placeholder="Optional notes about this distribution"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreate}>Create Distribution</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Modal */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Edit Distribution Record</DialogTitle>
                        <DialogDescription>Update distribution information.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-name">Distribution Name</Label>
                            <Input
                                id="edit-name"
                                value={formData.distribution_name}
                                onChange={(e) => setFormData({ ...formData, distribution_name: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Allocation Type</Label>
                                <Select 
                                    value={formData.allocation_type_id.toString()} 
                                    onValueChange={(value) => setFormData({ ...formData, allocation_type_id: parseInt(value) })}
                                >
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {(allocationTypes || []).map((t) => (
                                            <SelectItem key={t.id} value={t.id.toString()}>{t.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label>Source Type</Label>
                                <Select 
                                    value={formData.source_type} 
                                    onValueChange={(value: any) => setFormData({ ...formData, source_type: value })}
                                >
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="manual">Manual</SelectItem>
                                        <SelectItem value="dss_generated">DSS Generated</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Total Quantity</Label>
                                <Input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={formData.total_quantity}
                                    onChange={(e) => setFormData({ ...formData, total_quantity: parseFloat(e.target.value) || 0 })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Release Date</Label>
                                <Input
                                    type="date"
                                    value={formData.release_date}
                                    onChange={(e) => setFormData({ ...formData, release_date: e.target.value })}
                                />
                            </div>
                        </div>
                        {formData.source_type === 'dss_generated' && (
                            <div className="grid gap-2">
                                <Label>Allocation Policy (Optional)</Label>
                                <Select 
                                    value={formData.allocation_policy_id.toString()} 
                                    onValueChange={(value) => setFormData({ ...formData, allocation_policy_id: parseInt(value) })}
                                >
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="0">None</SelectItem>
                                        {(allocationPolicies || []).map((p) => (
                                            <SelectItem key={p.id} value={p.id.toString()}>{p.allocation_type?.name || 'Policy'}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                        <div className="grid gap-2">
                            <Label htmlFor="edit-note">Notes</Label>
                            <Input
                                id="edit-note"
                                value={formData.note}
                                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleUpdate}>Update</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Modal */}
            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Distribution Record</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "{selectedRecord?.distribution_name}"? This will also delete all items in this distribution. This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDelete}>Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
