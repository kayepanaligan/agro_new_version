import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type AllocationPolicy, type AllocationType } from '@/types';
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

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Allocation Policies', href: '/admin/allocation-policies' }];

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

    const handleCreate = () => { router.post('/admin/allocation-policies', formData, { preserveScroll: false, onSuccess: () => { setIsEditModalOpen(true); } }); };
    const handleQuickAdd = () => {
        setFormData({ allocation_type_id: 0, policy_type: 'equal', is_active: true });
        setIsEditModalOpen(true);
    };
    const handleUpdate = () => { if (!selectedPolicy) return; router.put(`/admin/allocation-policies/${selectedPolicy.id}`, formData, { preserveScroll: false, onSuccess: () => { setIsEditModalOpen(false); resetForm(); } }); };
    const handleDelete = () => { if (!selectedPolicy) return; router.delete(`/admin/allocation-policies/${selectedPolicy.id}`, { preserveScroll: false, onSuccess: () => { setIsDeleteModalOpen(false); setSelectedPolicy(null); } }); };

    const openEditModal = (policy: AllocationPolicy) => { setSelectedPolicy(policy); setFormData({ allocation_type_id: policy.allocation_type_id, policy_type: policy.policy_type, is_active: policy.is_active }); setIsEditModalOpen(true); };
    const resetForm = () => { setFormData({ allocation_type_id: 0, policy_type: 'equal', is_active: true }); setSelectedPolicy(null); };

    const getPolicyBadge = (type: string) => {
        const variants: any = { equal: 'default', proportional: 'secondary', priority: 'outline', weighted: 'destructive', hybrid: 'destructive' };
        return <Badge variant={variants[type] || 'secondary'}>{type}</Badge>;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Allocation Policies" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="rounded-xl border bg-card shadow-sm">
                    <div className="p-6">
                        <h1 className="mb-2 text-3xl font-bold">Allocation Policies</h1>
                        <p className="text-muted-foreground">DSS logic for recommended allocations</p>
                    </div>
                    <div className="border-t p-6">
                        <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div className="relative flex-1 max-w-sm"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" /></div>
                            <Button onClick={handleQuickAdd}>Quick Add</Button>
                        </div>
                        <div className="mb-4 text-sm text-muted-foreground">Showing {paginatedPolicies.length} of {filteredPolicies.length} policies</div>
                        <div className="rounded-md border"><Table><TableHeader><TableRow><TableHead>ID</TableHead><TableHead>Allocation Type</TableHead><TableHead>Policy Type</TableHead><TableHead>Status</TableHead><TableHead>Created</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader><TableBody>{paginatedPolicies.length === 0 ? (<TableRow><TableCell colSpan={6} className="h-24 text-center">No policies found.</TableCell></TableRow>) : (paginatedPolicies.map((p) => (<TableRow key={p.id}><TableCell>{p.id}</TableCell><TableCell>{p.allocation_type?.name || '-'}</TableCell><TableCell>{getPolicyBadge(p.policy_type)}</TableCell><TableCell>{p.is_active ? <Badge variant="default">Active</Badge> : <Badge variant="secondary">Inactive</Badge>}</TableCell><TableCell>{new Date(p.created_at).toLocaleDateString()}</TableCell><TableCell className="text-right"><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="sm" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuLabel>Actions</DropdownMenuLabel><DropdownMenuSeparator /><DropdownMenuItem onClick={() => openEditModal(p)}><Pencil className="mr-2 h-4 w-4" /><span>Edit</span></DropdownMenuItem><DropdownMenuItem onClick={() => { setSelectedPolicy(p); setIsDeleteModalOpen(true); }} className="text-red-600"><Trash2 className="mr-2 h-4 w-4" /><span>Delete</span></DropdownMenuItem></DropdownMenuContent></DropdownMenu></TableCell></TableRow>)))}</TableBody></Table></div>
                    </div>
                    {totalPages > 1 && (<div className="border-t p-6"><div className="flex items-center justify-between"><div className="text-sm text-muted-foreground">Page {currentPage} of {totalPages}</div><div className="flex items-center gap-2"><Button variant="outline" size="sm" onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>Previous</Button><div className="flex items-center gap-1">{Array.from({ length: Math.min(5, totalPages) }, (_, i) => { let pageNum = totalPages <= 5 ? i + 1 : currentPage <= 3 ? i + 1 : currentPage >= totalPages - 2 ? totalPages - 4 + i : currentPage - 2 + i; return (<Button key={pageNum} variant={currentPage === pageNum ? 'default' : 'outline'} size="sm" onClick={() => setCurrentPage(pageNum)} className="w-10">{pageNum}</Button>); })}</div><Button variant="outline" size="sm" onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>Next</Button></div></div></div>)}
                </div>
            </div>
            <Dialog open={isEditModalOpen} onOpenChange={(open) => { setIsEditModalOpen(open); if (!open) resetForm(); }}><DialogContent><DialogHeader><DialogTitle>{selectedPolicy ? 'Edit Policy' : 'Create Allocation Policy'}</DialogTitle><DialogDescription>{selectedPolicy ? 'Configure allocation policy.' : 'Add a new allocation policy. Fill in the details below.'}</DialogDescription></DialogHeader><div className="grid gap-4 py-4"><div className="grid gap-2"><Label>Allocation Type</Label><Select value={formData.allocation_type_id.toString()} onValueChange={(value) => setFormData({ ...formData, allocation_type_id: parseInt(value) })}><SelectTrigger><SelectValue placeholder="Select allocation type" /></SelectTrigger><SelectContent>{(allocationTypes || []).map((t) => (<SelectItem key={t.id} value={t.id.toString()}>{t.name}</SelectItem>))}</SelectContent></Select></div><div className="grid gap-2"><Label>Policy Type</Label><Select value={formData.policy_type} onValueChange={(v: any) => setFormData({ ...formData, policy_type: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="equal">Equal</SelectItem><SelectItem value="proportional">Proportional</SelectItem><SelectItem value="priority">Priority</SelectItem><SelectItem value="weighted">Weighted</SelectItem><SelectItem value="hybrid">Hybrid</SelectItem></SelectContent></Select></div><div className="flex items-center gap-2"><input type="checkbox" id="is_active" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} /><Label htmlFor="is_active">Active</Label></div></div><DialogFooter><Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button><Button onClick={selectedPolicy ? handleUpdate : handleCreate}>{selectedPolicy ? 'Update' : 'Create'}</Button></DialogFooter></DialogContent></Dialog>
            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}><DialogContent><DialogHeader><DialogTitle>Delete Policy</DialogTitle><DialogDescription>Are you sure? This cannot be undone.</DialogDescription></DialogHeader><DialogFooter><Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button><Button variant="destructive" onClick={handleDelete}>Delete</Button></DialogFooter></DialogContent></Dialog>
        </AppLayout>
    );
}
