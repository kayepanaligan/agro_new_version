import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type DistributionRecord, type AllocationType } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { ArrowUpDown, MoreHorizontal, Pencil, Search, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Distribution Records', href: '/admin/distribution-records' }];

export default function DistributionRecords() {
    const { distributionRecords, allocationTypes } = usePage<{ distributionRecords: DistributionRecord[]; allocationTypes: AllocationType[] }>().props;
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<DistributionRecord | null>(null);
    const [formData, setFormData] = useState({ allocation_type_id: 0, farmer_lfid: '', items_assigned: '', quantity: 0, status: 'pending', distribution_date: '', remarks: '' });

    const filteredRecords = useMemo(() => {
        let result = [...distributionRecords];
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter((r) => r.farmer_lfid.toLowerCase().includes(term) || r.allocation_type?.name.toLowerCase().includes(term));
        }
        result.sort((a, b) => sortOrder === 'asc' ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime() : new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        return result;
    }, [distributionRecords, searchTerm, sortOrder]);

    const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
    const paginatedRecords = useMemo(() => filteredRecords.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage), [filteredRecords, currentPage, itemsPerPage]);
    useMemo(() => setCurrentPage(1), [searchTerm]);

    const handleCreate = () => { router.post('/admin/distribution-records', formData, { preserveScroll: false, onSuccess: () => { setIsEditModalOpen(true); } }); };
    const handleQuickAdd = () => {
        setFormData({ allocation_type_id: 0, farmer_lfid: '', items_assigned: '', quantity: 0, status: 'pending', distribution_date: '', remarks: '' });
        setIsEditModalOpen(true);
    };
    const handleUpdate = () => { if (!selectedRecord) return; router.put(`/admin/distribution-records/${selectedRecord.id}`, formData, { preserveScroll: false, onSuccess: () => { setIsEditModalOpen(false); resetForm(); } }); };
    const handleDelete = () => { if (!selectedRecord) return; router.delete(`/admin/distribution-records/${selectedRecord.id}`, { preserveScroll: false, onSuccess: () => { setIsDeleteModalOpen(false); setSelectedRecord(null); } }); };

    const openEditModal = (record: DistributionRecord) => { setSelectedRecord(record); setFormData({ allocation_type_id: record.allocation_type_id, farmer_lfid: record.farmer_lfid, items_assigned: record.items_assigned || '', quantity: Number(record.quantity), status: record.status, distribution_date: record.distribution_date || '', remarks: record.remarks || '' }); setIsEditModalOpen(true); };
    const resetForm = () => { setFormData({ allocation_type_id: 0, farmer_lfid: '', items_assigned: '', quantity: 0, status: 'pending', distribution_date: '', remarks: '' }); setSelectedRecord(null); };

    const getStatusBadge = (status: string) => {
        const variants: any = { pending: 'secondary', distributed: 'default', cancelled: 'destructive' };
        return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Distribution Records" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="rounded-xl border bg-card shadow-sm">
                    <div className="p-6">
                        <h1 className="mb-2 text-3xl font-bold">Distribution Records</h1>
                        <p className="text-muted-foreground">Track allocations delivered to farmers</p>
                    </div>
                    <div className="border-t p-6">
                        <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div className="relative flex-1 max-w-sm"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" /></div>
                            <Button onClick={handleQuickAdd}>Quick Add</Button>
                        </div>
                        <div className="mb-4 text-sm text-muted-foreground">Showing {paginatedRecords.length} of {filteredRecords.length} records</div>
                        <div className="rounded-md border"><Table><TableHeader><TableRow><TableHead>ID</TableHead><TableHead>Farmer LFID</TableHead><TableHead>Allocation Type</TableHead><TableHead>Items</TableHead><TableHead>Quantity</TableHead><TableHead>Status</TableHead><TableHead>Date</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader><TableBody>{paginatedRecords.length === 0 ? (<TableRow><TableCell colSpan={8} className="h-24 text-center">No records found.</TableCell></TableRow>) : (paginatedRecords.map((r) => (<TableRow key={r.id}><TableCell>{r.id}</TableCell><TableCell className="font-medium">{r.farmer_lfid}</TableCell><TableCell>{r.allocation_type?.name || '-'}</TableCell><TableCell>{r.items_assigned || '-'}</TableCell><TableCell>{r.quantity}</TableCell><TableCell>{getStatusBadge(r.status)}</TableCell><TableCell>{r.distribution_date ? new Date(r.distribution_date).toLocaleDateString() : '-'}</TableCell><TableCell className="text-right"><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="sm" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuLabel>Actions</DropdownMenuLabel><DropdownMenuSeparator /><DropdownMenuItem onClick={() => openEditModal(r)}><Pencil className="mr-2 h-4 w-4" /><span>Edit</span></DropdownMenuItem><DropdownMenuItem onClick={() => { setSelectedRecord(r); setIsDeleteModalOpen(true); }} className="text-red-600"><Trash2 className="mr-2 h-4 w-4" /><span>Delete</span></DropdownMenuItem></DropdownMenuContent></DropdownMenu></TableCell></TableRow>)))}</TableBody></Table></div>
                    </div>
                    {totalPages > 1 && (<div className="border-t p-6"><div className="flex items-center justify-between"><div className="text-sm text-muted-foreground">Page {currentPage} of {totalPages}</div><div className="flex items-center gap-2"><Button variant="outline" size="sm" onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>Previous</Button><div className="flex items-center gap-1">{Array.from({ length: Math.min(5, totalPages) }, (_, i) => { let pageNum = totalPages <= 5 ? i + 1 : currentPage <= 3 ? i + 1 : currentPage >= totalPages - 2 ? totalPages - 4 + i : currentPage - 2 + i; return (<Button key={pageNum} variant={currentPage === pageNum ? 'default' : 'outline'} size="sm" onClick={() => setCurrentPage(pageNum)} className="w-10">{pageNum}</Button>); })}</div><Button variant="outline" size="sm" onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>Next</Button></div></div></div>)}
                </div>
            </div>
            <Dialog open={isEditModalOpen} onOpenChange={(open) => { setIsEditModalOpen(open); if (!open) resetForm(); }}><DialogContent className="max-w-2xl"><DialogHeader><DialogTitle>{selectedRecord ? 'Edit Distribution Record' : 'Create Distribution Record'}</DialogTitle><DialogDescription>{selectedRecord ? 'Update distribution details.' : 'Add a new distribution record. Fill in the details below.'}</DialogDescription></DialogHeader><div className="grid gap-4 py-4"><div className="grid grid-cols-2 gap-4"><div className="grid gap-2"><Label>Allocation Type</Label><Select value={formData.allocation_type_id.toString()} onValueChange={(value) => setFormData({ ...formData, allocation_type_id: parseInt(value) })}><SelectTrigger><SelectValue placeholder="Select allocation type" /></SelectTrigger><SelectContent>{(allocationTypes || []).map((t) => (<SelectItem key={t.id} value={t.id.toString()}>{t.name}</SelectItem>))}</SelectContent></Select></div><div className="grid gap-2"><Label>Farmer LFID</Label><Input value={formData.farmer_lfid} onChange={(e) => setFormData({ ...formData, farmer_lfid: e.target.value })} placeholder="e.g., DCAG-26-APL-0001" /></div></div><div className="grid gap-2"><Label>Items Assigned</Label><Input value={formData.items_assigned} onChange={(e) => setFormData({ ...formData, items_assigned: e.target.value })} placeholder="e.g., Fertilizer, Seeds" /></div><div className="grid grid-cols-2 gap-4"><div className="grid gap-2"><Label>Quantity</Label><Input type="number" min="0" step="0.01" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) || 0 })} /></div><div className="grid gap-2"><Label>Status</Label><Select value={formData.status} onValueChange={(v: any) => setFormData({ ...formData, status: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="pending">Pending</SelectItem><SelectItem value="distributed">Distributed</SelectItem><SelectItem value="cancelled">Cancelled</SelectItem></SelectContent></Select></div></div><div className="grid grid-cols-2 gap-4"><div className="grid gap-2"><Label>Distribution Date</Label><Input type="date" value={formData.distribution_date} onChange={(e) => setFormData({ ...formData, distribution_date: e.target.value })} /></div><div className="grid gap-2"><Label>Remarks</Label><Input value={formData.remarks} onChange={(e) => setFormData({ ...formData, remarks: e.target.value })} placeholder="Optional notes" /></div></div></div><DialogFooter><Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button><Button onClick={selectedRecord ? handleUpdate : handleCreate}>{selectedRecord ? 'Update' : 'Create'}</Button></DialogFooter></DialogContent></Dialog>
            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}><DialogContent><DialogHeader><DialogTitle>Delete Record</DialogTitle><DialogDescription>Are you sure? This cannot be undone.</DialogDescription></DialogHeader><DialogFooter><Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button><Button variant="destructive" onClick={handleDelete}>Delete</Button></DialogFooter></DialogContent></Dialog>
        </AppLayout>
    );
}
