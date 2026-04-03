import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type DistributionRecord, type DistributionRecordItem, type AllocationPolicy } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { ArrowLeft, FileDown, MoreHorizontal, Pencil, Search, Trash2, CheckCircle2, Eye, ArrowUpDown } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface Props {
    distributionRecord: DistributionRecord;
    items: DistributionRecordItem[];
    allocationPolicies: AllocationPolicy[];
    [key: string]: any;
}

const DistributionRecordsItems = () => {
    const { distributionRecord, items, allocationPolicies } = usePage<Props>().props;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Distribution Records', href: '/admin/distribution-records' },
        { title: distributionRecord.distribution_name, href: `/admin/distribution-records/${distributionRecord.id}/items` },
    ];

    const [searchTerm, setSearchTerm] = useState('');
    const [sortField, setSortField] = useState<'farmer_lfid' | 'quantity_allocated' | 'status'>('farmer_lfid');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'received'>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isAcknowledgeModalOpen, setIsAcknowledgeModalOpen] = useState(false);
    const [isViewAckModalOpen, setIsViewAckModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<DistributionRecordItem | null>(null);
    const [formData, setFormData] = useState({
        distribution_record_id: distributionRecord.id,
        farmer_lfid: '',
        quantity_allocated: 0,
        allocation_policy_id: 0,
        status: 'pending' as 'pending' | 'received',
    });

    const filteredItems = useMemo(() => {
        let result = [...items];
        
        // Filter by search term
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter((item) => item.farmer_lfid.toLowerCase().includes(term));
        }
        
        // Filter by status
        if (filterStatus !== 'all') {
            result = result.filter((item) => item.status === filterStatus);
        }
        
        // Sort
        result.sort((a, b) => {
            let comparison = 0;
            if (sortField === 'farmer_lfid') {
                comparison = a.farmer_lfid.localeCompare(b.farmer_lfid);
            } else if (sortField === 'quantity_allocated') {
                comparison = Number(a.quantity_allocated) - Number(b.quantity_allocated);
            } else if (sortField === 'status') {
                comparison = a.status.localeCompare(b.status);
            }
            return sortDirection === 'asc' ? comparison : -comparison;
        });
        
        return result;
    }, [items, searchTerm, sortField, sortDirection, filterStatus]);
    
    // Pagination
    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
    const paginatedItems = filteredItems.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );
    
    const handleSort = (field: 'farmer_lfid' | 'quantity_allocated' | 'status') => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const handleAddItem = () => {
        router.post('/admin/distribution-record-items', formData, {
            preserveScroll: false,
            onSuccess: () => {
                setIsAddItemModalOpen(false);
                resetForm();
                setCurrentPage(1);
            },
        });
    };

    const handleUpdate = () => {
        if (!selectedItem) return;
        router.put(`/admin/distribution-record-items/${selectedItem.id}`, formData, {
            preserveScroll: false,
            onSuccess: () => {
                setIsEditModalOpen(false);
                resetForm();
                setCurrentPage(1);
            },
        });
    };

    const handleDelete = () => {
        if (!selectedItem) return;
        router.delete(`/admin/distribution-record-items/${selectedItem.id}`, {
            preserveScroll: false,
            onSuccess: () => {
                setIsDeleteModalOpen(false);
                setSelectedItem(null);
                if (filteredItems.length <= itemsPerPage && currentPage > 1) {
                    setCurrentPage(currentPage - 1);
                }
            },
        });
    };

    const handleAcknowledge = () => {
        if (!selectedItem) return;
        router.post('/admin/acknowledgements', {
            ...formData,
            distribution_record_item_id: selectedItem.id,
            received_at: new Date().toISOString().split('T')[0],
        }, {
            preserveScroll: false,
            onSuccess: () => {
                setIsAcknowledgeModalOpen(false);
                resetForm();
            },
        });
    };

    const openEditModal = (item: DistributionRecordItem) => {
        setSelectedItem(item);
        setFormData({
            distribution_record_id: item.distribution_record_id,
            farmer_lfid: item.farmer_lfid,
            quantity_allocated: Number(item.quantity_allocated),
            allocation_policy_id: item.allocation_policy_id || 0,
            status: item.status,
        });
        setIsEditModalOpen(true);
    };

    const openAcknowledgeModal = (item: DistributionRecordItem) => {
        setSelectedItem(item);
        setFormData({
            distribution_record_id: item.distribution_record_id,
            farmer_lfid: item.farmer_lfid,
            quantity_allocated: Number(item.quantity_allocated),
            allocation_policy_id: item.allocation_policy_id || 0,
            status: 'received',
        });
        setIsAcknowledgeModalOpen(true);
    };

    const resetForm = () => {
        setFormData({
            distribution_record_id: distributionRecord.id,
            farmer_lfid: '',
            quantity_allocated: 0,
            allocation_policy_id: 0,
            status: 'pending',
        });
        setSelectedItem(null);
    };

    const getStatusBadge = (status: string) => {
        const variants: any = { pending: 'secondary', received: 'default' };
        return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>;
    };

    const exportToCsv = () => {
        window.open(`/admin/distribution-records/${distributionRecord.id}/export-csv`, '_blank');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${distributionRecord.distribution_name} - Items`} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="rounded-xl border bg-card shadow-sm">
                    <div className="p-6">
                        <div className="mb-4 flex items-center gap-2">
                            <Button variant="ghost" size="sm" onClick={() => router.get('/admin/distribution-records')}>
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back
                            </Button>
                        </div>
                        
                        <Card className="mb-6">
                            <CardContent className="p-4">
                                <h2 className="text-2xl font-bold mb-2">{distributionRecord.distribution_name}</h2>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    <div>
                                        <span className="text-muted-foreground">Source:</span>
                                        <span className="ml-2 font-medium">{distributionRecord.source_type === 'dss_generated' ? 'DSS Generated' : 'Manual'}</span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Release Date:</span>
                                        <span className="ml-2 font-medium">{new Date(distributionRecord.release_date).toLocaleDateString()}</span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Total Quantity:</span>
                                        <span className="ml-2 font-medium">{Number(distributionRecord.total_quantity).toFixed(2)}</span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Items:</span>
                                        <span className="ml-2 font-medium">{items.length} farmers</span>
                                    </div>
                                </div>
                                {distributionRecord.note && (
                                    <p className="text-sm text-muted-foreground mt-3">{distributionRecord.note}</p>
                                )}
                            </CardContent>
                        </Card>

                        <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div className="flex flex-col gap-4 md:flex-row md:items-center flex-1">
                                <div className="relative flex-1 max-w-sm">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        placeholder="Search farmers..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-9"
                                    />
                                </div>
                                <Select 
                                    value={filterStatus} 
                                    onValueChange={(value: any) => { setFilterStatus(value); setCurrentPage(1); }}
                                >
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Filter by status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="received">Received</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" onClick={exportToCsv}>
                                    <FileDown className="mr-2 h-4 w-4" />
                                    Export CSV
                                </Button>
                                <Button onClick={() => setIsAddItemModalOpen(true)}>
                                    Add Item
                                </Button>
                            </div>
                        </div>

                        <div className="mb-4 flex items-center justify-between text-sm text-muted-foreground">
                            <span>Showing {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredItems.length)} of {filteredItems.length} items</span>
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

                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="cursor-pointer hover:bg-accent" onClick={() => handleSort('farmer_lfid')}>
                                            <div className="flex items-center gap-2">
                                                Farmer LFID
                                                <ArrowUpDown className="h-4 w-4" />
                                            </div>
                                        </TableHead>
                                        <TableHead className="cursor-pointer hover:bg-accent" onClick={() => handleSort('quantity_allocated')}>
                                            <div className="flex items-center gap-2">
                                                Quantity
                                                <ArrowUpDown className="h-4 w-4" />
                                            </div>
                                        </TableHead>
                                        <TableHead className="cursor-pointer hover:bg-accent" onClick={() => handleSort('status')}>
                                            <div className="flex items-center gap-2">
                                                Status
                                                <ArrowUpDown className="h-4 w-4" />
                                            </div>
                                        </TableHead>
                                        <TableHead>Policy Applied</TableHead>
                                        <TableHead>Acknowledgement</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredItems.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="h-24 text-center">
                                                No items found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        paginatedItems.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell className="font-medium">{item.farmer_lfid}</TableCell>
                                                <TableCell>{Number(item.quantity_allocated).toFixed(2)}</TableCell>
                                                <TableCell>{getStatusBadge(item.status)}</TableCell>
                                                <TableCell>{item.allocation_policy ? `Policy #${item.allocation_policy.id}` : '-'}</TableCell>
                                                <TableCell>
                                                    {item.acknowledgement ? (
                                                        <Badge variant="default" className="cursor-pointer" onClick={() => { setSelectedItem(item); setIsViewAckModalOpen(true); }}>
                                                            <CheckCircle2 className="h-3 w-3 mr-1" />
                                                            View
                                                        </Badge>
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground">Not acknowledged</span>
                                                    )}
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
                                                            {item.status === 'pending' && (
                                                                <DropdownMenuItem onClick={() => openAcknowledgeModal(item)}>
                                                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                                                    Acknowledge Receipt
                                                                </DropdownMenuItem>
                                                            )}
                                                            {item.acknowledgement && (
                                                                <DropdownMenuItem onClick={() => { setSelectedItem(item); setIsViewAckModalOpen(true); }}>
                                                                    <Eye className="mr-2 h-4 w-4" />
                                                                    View Acknowledgement
                                                                </DropdownMenuItem>
                                                            )}
                                                            <DropdownMenuItem onClick={() => openEditModal(item)}>
                                                                <Pencil className="mr-2 h-4 w-4" />
                                                                Edit
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem 
                                                                onClick={() => { setSelectedItem(item); setIsDeleteModalOpen(true); }}
                                                                className="text-red-600"
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
                    </div>
                </div>
            </div>

            {/* Add Item Modal */}
            <Dialog open={isAddItemModalOpen} onOpenChange={setIsAddItemModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Distribution Item</DialogTitle>
                        <DialogDescription>Add a farmer to this distribution list.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="add-lfid">Farmer LFID</Label>
                            <Input
                                id="add-lfid"
                                value={formData.farmer_lfid}
                                onChange={(e) => setFormData({ ...formData, farmer_lfid: e.target.value })}
                                placeholder="e.g., DCAG-26-APL-0001"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="add-qty">Quantity Allocated</Label>
                            <Input
                                id="add-qty"
                                type="number"
                                min="0"
                                step="0.01"
                                value={formData.quantity_allocated}
                                onChange={(e) => setFormData({ ...formData, quantity_allocated: parseFloat(e.target.value) || 0 })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddItemModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleAddItem}>Add Item</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Modal */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Distribution Item</DialogTitle>
                        <DialogDescription>Update item details.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-lfid">Farmer LFID</Label>
                            <Input
                                id="edit-lfid"
                                value={formData.farmer_lfid}
                                onChange={(e) => setFormData({ ...formData, farmer_lfid: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-qty">Quantity Allocated</Label>
                            <Input
                                id="edit-qty"
                                type="number"
                                min="0"
                                step="0.01"
                                value={formData.quantity_allocated}
                                onChange={(e) => setFormData({ ...formData, quantity_allocated: parseFloat(e.target.value) || 0 })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-status">Status</Label>
                            <Select 
                                value={formData.status} 
                                onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                            >
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="received">Received</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleUpdate}>Update</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Acknowledge Modal */}
            <Dialog open={isAcknowledgeModalOpen} onOpenChange={setIsAcknowledgeModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Acknowledge Receipt</DialogTitle>
                        <DialogDescription>Confirm that the farmer has received the items.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label>Farmer LFID</Label>
                            <Input value={formData.farmer_lfid} disabled />
                        </div>
                        <div className="grid gap-2">
                            <Label>Quantity</Label>
                            <Input value={formData.quantity_allocated} disabled />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="ack-notes">Notes/Remarks (Optional)</Label>
                            <textarea
                                id="ack-notes"
                                value={formData.status === 'received' ? '' : formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'pending' | 'received' })}
                                placeholder="Optional notes about the receipt"
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAcknowledgeModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleAcknowledge}>Confirm Receipt</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* View Acknowledgement Modal */}
            <Dialog open={isViewAckModalOpen} onOpenChange={setIsViewAckModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Acknowledgement Details</DialogTitle>
                        <DialogDescription>Receipt confirmation details</DialogDescription>
                    </DialogHeader>
                    {selectedItem?.acknowledgement && (
                        <div className="space-y-4 py-4">
                            <div className="grid gap-2">
                                <Label className="text-muted-foreground">Farmer LFID</Label>
                                <p className="font-medium">{selectedItem.acknowledgement.farmer_lfid}</p>
                            </div>
                            <div className="grid gap-2">
                                <Label className="text-muted-foreground">Received At</Label>
                                <p className="font-medium">
                                    {new Date(selectedItem.acknowledgement.received_at).toLocaleString()}
                                </p>
                            </div>
                            {selectedItem.acknowledgement.photo_proof && (
                                <div className="grid gap-2">
                                    <Label className="text-muted-foreground">Photo Proof</Label>
                                    <div className="rounded-md border overflow-hidden">
                                        <img 
                                            src={`/storage/${selectedItem.acknowledgement.photo_proof}`} 
                                            alt="Proof of receipt" 
                                            className="w-full h-auto"
                                        />
                                    </div>
                                </div>
                            )}
                            {selectedItem.acknowledgement.notes && (
                                <div className="grid gap-2">
                                    <Label className="text-muted-foreground">Notes/Remarks</Label>
                                    <p className="font-medium">{selectedItem.acknowledgement.notes}</p>
                                </div>
                            )}
                        </div>
                    )}
                    <DialogFooter>
                        <Button onClick={() => setIsViewAckModalOpen(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Modal */}
            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Distribution Item</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to remove "{selectedItem?.farmer_lfid}" from this distribution? This action cannot be undone.
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
};

export default DistributionRecordsItems;
