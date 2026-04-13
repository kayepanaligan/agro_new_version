import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type EligibilityRule, type AllocationType } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { ArrowUpDown, MoreHorizontal, Pencil, Search, Trash2 } from 'lucide-react';
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
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="rounded-xl border bg-card shadow-sm">
                    <div className="p-6">
                        <h1 className="mb-2 text-3xl font-bold">Eligibility Rules</h1>
                        <p className="text-muted-foreground">Define who qualifies for allocations</p>
                    </div>
                    <div className="border-t p-6">
                        <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div className="relative flex-1 max-w-sm"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" /></div>
                            <Button onClick={() => setIsCreateModalOpen(true)}>Add Rule</Button>
                        </div>
                        <div className="mb-4 text-sm text-muted-foreground">Showing {paginatedRules.length} of {filteredRules.length} rules</div>
                        <div className="rounded-md border"><Table><TableHeader><TableRow><TableHead>ID</TableHead><TableHead><Button variant="ghost" onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}><ArrowUpDown className="ml-2 h-4 w-4" /></Button></TableHead><TableHead>Allocation Type</TableHead><TableHead>Field</TableHead><TableHead>Operator</TableHead><TableHead>Value</TableHead><TableHead>Score</TableHead><TableHead>Created</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader><TableBody>{paginatedRules.length === 0 ? (<TableRow><TableCell colSpan={8} className="h-24 text-center">No rules found.</TableCell></TableRow>) : (paginatedRules.map((rule) => (<TableRow key={rule.id}><TableCell>{rule.id}</TableCell><TableCell>{rule.field_name}</TableCell><TableCell>{rule.allocation_type?.name || '-'}</TableCell><TableCell className="font-medium">{getShortFieldName(rule.field_name)}</TableCell><TableCell><span className="font-mono text-xs">{rule.operator}</span></TableCell><TableCell>{rule.value}</TableCell><TableCell><Badge variant="secondary" className="font-bold">{rule.score || 1}</Badge></TableCell><TableCell>{new Date(rule.created_at).toLocaleDateString()}</TableCell><TableCell className="text-right"><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="sm" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuLabel>Actions</DropdownMenuLabel><DropdownMenuSeparator /><DropdownMenuItem onClick={() => openEditModal(rule)}><Pencil className="mr-2 h-4 w-4" /><span>Edit</span></DropdownMenuItem><DropdownMenuItem onClick={() => { setSelectedRule(rule); setIsDeleteModalOpen(true); }} className="text-red-600"><Trash2 className="mr-2 h-4 w-4" /><span>Delete</span></DropdownMenuItem></DropdownMenuContent></DropdownMenu></TableCell></TableRow>)))}</TableBody></Table></div>
                    </div>
                    {totalPages > 1 && (<div className="border-t p-6"><div className="flex items-center justify-between"><div className="text-sm text-muted-foreground">Page {currentPage} of {totalPages}</div><div className="flex items-center gap-2"><Button variant="outline" size="sm" onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>Previous</Button><div className="flex items-center gap-1">{Array.from({ length: Math.min(5, totalPages) }, (_, i) => { let pageNum = totalPages <= 5 ? i + 1 : currentPage <= 3 ? i + 1 : currentPage >= totalPages - 2 ? totalPages - 4 + i : currentPage - 2 + i; return (<Button key={pageNum} variant={currentPage === pageNum ? 'default' : 'outline'} size="sm" onClick={() => setCurrentPage(pageNum)} className="w-10">{pageNum}</Button>); })}</div><Button variant="outline" size="sm" onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>Next</Button></div></div></div>)}
                </div>
            </div>
            <Dialog open={isCreateModalOpen} onOpenChange={(open) => { setIsCreateModalOpen(open); if (!open) resetForm(); }}><DialogContent><DialogHeader><DialogTitle>Create Eligibility Rule</DialogTitle><DialogDescription>Define a rule for allocation eligibility.</DialogDescription></DialogHeader><div className="grid gap-4 py-4">
                <div className="grid gap-2">
                    <Label>Allocation Type</Label>
                    <Select value={formData.allocation_type_id.toString()} onValueChange={(value) => setFormData({ ...formData, allocation_type_id: parseInt(value) })}>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>{(allocationTypes || []).map((t) => (<SelectItem key={t.id} value={t.id.toString()}>{t.name}</SelectItem>))}</SelectContent>
                    </Select>
                </div>
                <div className="grid gap-2">
                    <Label>Attribute Field</Label>
                    <Select value={formData.field_name} onValueChange={(value) => setFormData({ ...formData, field_name: value, value: '' })}>
                        <SelectTrigger><SelectValue placeholder="Select farmer attribute" /></SelectTrigger>
                        <SelectContent>
                            {(farmerAttributes || []).map((attr) => (
                                <SelectItem key={attr.value} value={attr.value}>{attr.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid gap-2">
                    <Label>Operator</Label>
                    <Select value={formData.operator} onValueChange={(value) => setFormData({ ...formData, operator: value })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="=">=</SelectItem>
                            <SelectItem value=">">&gt;</SelectItem>
                            <SelectItem value="<">&lt;</SelectItem>
                            <SelectItem value=">=">&gt;=</SelectItem>
                            <SelectItem value="<=">&lt;=</SelectItem>
                            <SelectItem value="!=">≠</SelectItem>
                            <SelectItem value="in">In (comma-separated)</SelectItem>
                            <SelectItem value="not in">Not In (comma-separated)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid gap-2">
                    <Label>Required Value</Label>
                    {availableValues && availableValues.length > 0 ? (
                        <Select value={formData.value} onValueChange={(value) => setFormData({ ...formData, value })}>
                            <SelectTrigger><SelectValue placeholder="Select value" /></SelectTrigger>
                            <SelectContent>
                                {availableValues.map((val: any) => (
                                    <SelectItem key={val.value} value={val.value}>{val.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    ) : (
                        <Input value={formData.value} onChange={(e) => setFormData({ ...formData, value: e.target.value })} placeholder="Enter required value" />
                    )}
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="score">Score / Weight</Label>
                    <Input
                        id="score"
                        type="number"
                        min="1"
                        max="100"
                        value={formData.score}
                        onChange={(e) => setFormData({ ...formData, score: parseInt(e.target.value) || 1 })}
                        placeholder="Default: 1"
                    />
                    <p className="text-xs text-muted-foreground">Higher scores = higher priority in DSS ranking</p>
                </div>
            </div><DialogFooter><Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button><Button onClick={handleCreate}>Create</Button></DialogFooter></DialogContent></Dialog>
            <Dialog open={isEditModalOpen} onOpenChange={(open) => { setIsEditModalOpen(open); if (!open) resetForm(); }}><DialogContent><DialogHeader><DialogTitle>Edit Rule</DialogTitle><DialogDescription>Update the eligibility rule.</DialogDescription></DialogHeader><div className="grid gap-4 py-4">
                <div className="grid gap-2">
                    <Label>Allocation Type</Label>
                    <Select value={formData.allocation_type_id.toString()} onValueChange={(value) => setFormData({ ...formData, allocation_type_id: parseInt(value) })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{(allocationTypes || []).map((t) => (<SelectItem key={t.id} value={t.id.toString()}>{t.name}</SelectItem>))}</SelectContent>
                    </Select>
                </div>
                <div className="grid gap-2">
                    <Label>Attribute Field</Label>
                    <Select value={formData.field_name} onValueChange={(value) => setFormData({ ...formData, field_name: value, value: '' })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            {(farmerAttributes || []).map((attr) => (
                                <SelectItem key={attr.value} value={attr.value}>{attr.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid gap-2">
                    <Label>Operator</Label>
                    <Select value={formData.operator} onValueChange={(value) => setFormData({ ...formData, operator: value })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="=">=</SelectItem>
                            <SelectItem value=">">&gt;</SelectItem>
                            <SelectItem value="<">&lt;</SelectItem>
                            <SelectItem value=">=">&gt;=</SelectItem>
                            <SelectItem value="<=">&lt;=</SelectItem>
                            <SelectItem value="!=">≠</SelectItem>
                            <SelectItem value="in">In (comma-separated)</SelectItem>
                            <SelectItem value="not in">Not In (comma-separated)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid gap-2">
                    <Label>Required Value</Label>
                    {availableValues && availableValues.length > 0 ? (
                        <Select value={formData.value} onValueChange={(value) => setFormData({ ...formData, value })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {availableValues.map((val: any) => (
                                    <SelectItem key={val.value} value={val.value}>{val.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    ) : (
                        <Input value={formData.value} onChange={(e) => setFormData({ ...formData, value: e.target.value })} />
                    )}
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="score">Score / Weight</Label>
                    <Input
                        id="score"
                        type="number"
                        min="1"
                        max="100"
                        value={formData.score}
                        onChange={(e) => setFormData({ ...formData, score: parseInt(e.target.value) || 1 })}
                    />
                    <p className="text-xs text-muted-foreground">Higher scores = higher priority in DSS ranking</p>
                </div>
            </div><DialogFooter><Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button><Button onClick={handleUpdate}>Update</Button></DialogFooter></DialogContent></Dialog>
            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}><DialogContent><DialogHeader><DialogTitle>Delete Rule</DialogTitle><DialogDescription>Are you sure? This cannot be undone.</DialogDescription></DialogHeader><DialogFooter><Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button><Button variant="destructive" onClick={handleDelete}>Delete</Button></DialogFooter></DialogContent></Dialog>
        </AppLayout>
    );
}
