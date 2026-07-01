import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type CropDamageRecord, type CropDamageRecordItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { 
    ArrowLeft, 
    Calendar, 
    Edit2, 
    FileText, 
    Image as ImageIcon, 
    Trash2,
    Plus,
    MoreHorizontal,
    Search,
    Filter,
    Eye,
    Pencil,
    X,
    Upload,
    FolderOpen,
    LayoutGrid,
    List,
    Sprout,
    AlertCircle
} from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { KpiCard } from '@/components/agro-profiler/kpi-card';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Crop Damage Records',
        href: '/admin/crop-damage-records',
    },
    {
        title: 'Record Details',
        href: '#',
    },
];

interface CropDamageRecordDetailProps {
    cropDamageRecord: CropDamageRecord;
    cropDamageRecordItems: CropDamageRecordItem[];
}

export default function CropDamageRecordDetail({ cropDamageRecord, cropDamageRecordItems }: CropDamageRecordDetailProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterSeverity, setFilterSeverity] = useState<string>('all');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [viewMode, setViewMode] = useState<'card' | 'list'>('list');
    const [isCreateItemModalOpen, setIsCreateItemModalOpen] = useState(false);
    const [isEditItemModalOpen, setIsEditItemModalOpen] = useState(false);
    const [isDeleteItemModalOpen, setIsDeleteItemModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<CropDamageRecordItem | null>(null);
    const [itemFormData, setItemFormData] = useState({
        photo: null as File | null,
        farm_id: '',
        commodity_name: '',
        variety_name: '',
        damage_type_id: '',
        damage_severity: 'low' as 'low' | 'medium' | 'high',
        status: 'pending' as 'pending' | 'verified' | 'closed',
        notes: '',
    });

    const filteredItems = cropDamageRecordItems.filter((item) => {
        const matchesSearch = searchTerm === '' || 
            item.commodity_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.variety_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.notes?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesSeverity = filterSeverity === 'all' || item.damage_severity === filterSeverity;
        const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
        
        return matchesSearch && matchesSeverity && matchesStatus;
    });

    const handleCreateItem = () => {
        const formDataObj = new FormData();
        Object.entries(itemFormData).forEach(([key, value]) => {
            if (value !== null && value !== '') {
                formDataObj.append(key, value as string);
            }
        });

        router.post(route('admin.crop-damage-record-items.store', cropDamageRecord.crop_damage_record_id), formDataObj, {
            onSuccess: () => {
                setIsCreateItemModalOpen(false);
                setItemFormData({
                    photo: null,
                    farm_id: '',
                    commodity_name: '',
                    variety_name: '',
                    damage_type_id: '',
                    damage_severity: 'low',
                    status: 'pending',
                    notes: '',
                });
            },
        });
    };

    const handleEditItem = () => {
        if (!selectedItem) return;
        
        const formDataObj = new FormData();
        Object.entries(itemFormData).forEach(([key, value]) => {
            if (value !== null && value !== '') {
                formDataObj.append(key, value as string);
            }
        });

        router.put(route('admin.crop-damage-record-items.update', selectedItem.crop_damage_record_item_id), formDataObj, {
            onSuccess: () => {
                setIsEditItemModalOpen(false);
                setSelectedItem(null);
                setItemFormData({
                    photo: null,
                    farm_id: '',
                    commodity_name: '',
                    variety_name: '',
                    damage_type_id: '',
                    damage_severity: 'low',
                    status: 'pending',
                    notes: '',
                });
            },
        });
    };

    const handleDeleteItem = () => {
        if (!selectedItem) return;
        
        router.delete(route('admin.crop-damage-record-items.destroy', selectedItem.crop_damage_record_item_id), {
            onSuccess: () => {
                setIsDeleteItemModalOpen(false);
                setSelectedItem(null);
            },
        });
    };

    const openEditItemModal = (item: CropDamageRecordItem) => {
        setSelectedItem(item);
        setItemFormData({
            photo: null,
            farm_id: item.farm_id.toString(),
            commodity_name: item.commodity_name,
            variety_name: item.variety_name,
            damage_type_id: item.damage_type_id.toString(),
            damage_severity: item.damage_severity,
            status: item.status,
            notes: item.notes || '',
        });
        setIsEditItemModalOpen(true);
    };

    const openViewItemModal = (item: CropDamageRecordItem) => {
        setSelectedItem(item);
        setIsViewModalOpen(true);
    };

    const openDeleteItemModal = (item: CropDamageRecordItem) => {
        setSelectedItem(item);
        setIsDeleteItemModalOpen(true);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${cropDamageRecord.name} - Items`} />
            
            <div className="flex h-full flex-1 flex-col gap-5 rounded-xl p-4 md:p-6">
                {/* Header */}
                <div className="space-y-1">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{cropDamageRecord.name}</h1>
                            <p className="mt-1 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    Recorded: {new Date(cropDamageRecord.recorded_date).toLocaleDateString()}
                                </span>
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => router.visit(route('admin.crop-damage-records'))}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back
                            </Button>
                            <Button size="sm" onClick={() => setIsCreateItemModalOpen(true)}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Item
                            </Button>
                        </div>
                    </div>
                    {cropDamageRecord.notes && (
                        <div className="glass-card rounded-2xl p-4 mt-3">
                            <p className="text-sm text-muted-foreground leading-relaxed">{cropDamageRecord.notes}</p>
                        </div>
                    )}
                </div>

                {/* KPI Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <KpiCard label="Total Items" value={cropDamageRecordItems.length} icon={FolderOpen} />
                    <KpiCard label="Verified" value={cropDamageRecordItems.filter(i => i.status === 'verified').length} icon={Eye} />
                    <KpiCard label="Pending" value={cropDamageRecordItems.filter(i => i.status === 'pending').length} icon={AlertCircle} />
                    <KpiCard label="Closed" value={cropDamageRecordItems.filter(i => i.status === 'closed').length} icon={FileText} />
                </div>

                {/* Filters */}
                <div className="glass-card rounded-2xl p-4">
                    <div className="flex items-center justify-between gap-4">
                        <div className="grid gap-4 md:grid-cols-3 flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search items..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                            <Select value={filterSeverity} onValueChange={setFilterSeverity}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Filter by severity" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Severities</SelectItem>
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={filterStatus} onValueChange={setFilterStatus}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Filter by status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="verified">Verified</SelectItem>
                                    <SelectItem value="closed">Closed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        
                        <div className="flex items-center gap-2">
                            <Button
                                variant={viewMode === 'card' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setViewMode('card')}
                            >
                                <LayoutGrid className="h-4 w-4" />
                            </Button>
                            <Button
                                variant={viewMode === 'list' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setViewMode('list')}
                            >
                                <List className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Items Section */}
                {viewMode === 'card' && (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {filteredItems.length === 0 ? (
                            <div className="col-span-full flex h-64 items-center justify-center">
                                <div className="glass-card rounded-2xl p-8 text-center">
                                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary ring-1 ring-primary/20">
                                        <FileText className="h-6 w-6" />
                                    </div>
                                    <h3 className="mt-4 text-lg font-semibold">No items found</h3>
                                    <p className="text-muted-foreground">Add your first item to this crop damage record</p>
                                </div>
                            </div>
                        ) : (
                            filteredItems.map((item) => (
                                <div 
                                    key={item.crop_damage_record_item_id}
                                    className="glass-card rounded-2xl p-4 cursor-pointer hover:shadow-lg transition-shadow"
                                    onClick={() => openViewItemModal(item)}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="relative h-20 w-20 overflow-hidden rounded-lg">
                                            {item.photo_path ? (
                                                <img
                                                    src={`/storage/${item.photo_path}`}
                                                    alt="Damage proof"
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center glass-surface rounded-lg">
                                                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                                                </div>
                                            )}
                                        </div>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                <Button variant="ghost" size="sm">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={() => openViewItemModal(item)}>
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    View
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => openEditItemModal(item)}>
                                                    <Pencil className="mr-2 h-4 w-4" />
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem 
                                                    onClick={() => openDeleteItemModal(item)}
                                                    className="text-destructive focus:text-destructive"
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                    <h3 className="mt-3 font-semibold line-clamp-2">
                                        {item.commodity_name} - {item.variety_name}
                                    </h3>
                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                        Farm ID: {item.farm_id} • Damage Type ID: {item.damage_type_id}
                                    </p>
                                    <div className="mt-3 flex items-center justify-between">
                                        <Badge 
                                            className={
                                                item.damage_severity === 'high' 
                                                    ? 'bg-red-100 text-red-800' 
                                                    : item.damage_severity === 'medium'
                                                    ? 'bg-yellow-100 text-yellow-800'
                                                    : 'bg-green-100 text-green-800'
                                            }
                                        >
                                            {item.damage_severity}
                                        </Badge>
                                        <Badge 
                                            className={
                                                item.status === 'closed' 
                                                    ? 'bg-blue-100 text-blue-800' 
                                                    : item.status === 'verified'
                                                    ? 'bg-purple-100 text-purple-800'
                                                    : 'bg-orange-100 text-orange-800'
                                            }
                                        >
                                            {item.status}
                                        </Badge>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* List View */}
                {viewMode === 'list' && (
                    <div className="glass-card rounded-2xl overflow-hidden">
                        <div className="p-4 pb-3">
                            <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
                                    <List className="h-4 w-4" />
                                </div>
                                <div>
                                    <h2 className="text-sm font-semibold">Crop Damage Record Items</h2>
                                    <p className="text-xs text-muted-foreground">Detailed list of all crop damage incidents in this folder</p>
                                </div>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Photo</TableHead>
                                        <TableHead>Farm</TableHead>
                                        <TableHead>Commodity</TableHead>
                                        <TableHead>Variety</TableHead>
                                        <TableHead>Damage Type</TableHead>
                                        <TableHead>Severity</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Notes</TableHead>
                                        <TableHead className="w-[100px]">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredItems.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={9} className="h-24 text-center">
                                                No items found. Add your first item to this crop damage record.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredItems.map((item) => (
                                            <TableRow 
                                                key={item.crop_damage_record_item_id}
                                                className="cursor-pointer hover:bg-muted/50"
                                                onClick={() => openViewItemModal(item)}
                                            >
                                                <TableCell>
                                                    {item.photo_path ? (
                                                        <div className="relative h-12 w-12 overflow-hidden rounded-md">
                                                            <img
                                                                src={`/storage/${item.photo_path}`}
                                                                alt="Damage proof"
                                                                className="h-full w-full object-cover"
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div className="flex h-12 w-12 items-center justify-center rounded-md bg-muted">
                                                            <ImageIcon className="h-6 w-6 text-muted-foreground" />
                                                        </div>
                                                    )}
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    Farm ID: {item.farm_id}
                                                </TableCell>
                                                <TableCell>{item.commodity_name}</TableCell>
                                                <TableCell>{item.variety_name}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">
                                                        Type ID: {item.damage_type_id}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge 
                                                        variant="outline"
                                                        className={
                                                            item.damage_severity === 'high' 
                                                                ? 'bg-red-100 text-red-800' 
                                                                : item.damage_severity === 'medium'
                                                                ? 'bg-yellow-100 text-yellow-800'
                                                                : 'bg-green-100 text-green-800'
                                                        }
                                                    >
                                                        {item.damage_severity}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge 
                                                        variant="outline"
                                                        className={
                                                            item.status === 'closed' 
                                                                ? 'bg-blue-100 text-blue-800' 
                                                                : item.status === 'verified'
                                                                ? 'bg-purple-100 text-purple-800'
                                                                : 'bg-orange-100 text-orange-800'
                                                        }
                                                    >
                                                        {item.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="max-w-xs truncate">
                                                    {item.notes || '-'}
                                                </TableCell>
                                                <TableCell onClick={(e) => e.stopPropagation()}>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="sm">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem onClick={() => openViewItemModal(item)}>
                                                                <Eye className="mr-2 h-4 w-4" />
                                                                View
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => openEditItemModal(item)}>
                                                                <Pencil className="mr-2 h-4 w-4" />
                                                                Edit
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem 
                                                                onClick={() => openDeleteItemModal(item)}
                                                                className="text-destructive focus:text-destructive"
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
                )}
            </div>

            {/* Create Item Modal */}
            <Dialog open={isCreateItemModalOpen} onOpenChange={setIsCreateItemModalOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Add Crop Damage Record Item</DialogTitle>
                        <DialogDescription>
                            Add a new crop damage incident to this folder.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="photo">Photo/Proof</Label>
                            <div className="flex items-center gap-4">
                                <Input
                                    id="photo"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setItemFormData({ ...itemFormData, photo: e.target.files?.[0] || null })}
                                    className="flex-1"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="farm_id">Farm ID</Label>
                            <Input
                                id="farm_id"
                                type="number"
                                value={itemFormData.farm_id}
                                onChange={(e) => setItemFormData({ ...itemFormData, farm_id: e.target.value })}
                                placeholder="Enter farm ID"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="commodity_name">Commodity</Label>
                                <Input
                                    id="commodity_name"
                                    value={itemFormData.commodity_name}
                                    onChange={(e) => setItemFormData({ ...itemFormData, commodity_name: e.target.value })}
                                    placeholder="e.g., Rice"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="variety_name">Variety</Label>
                                <Input
                                    id="variety_name"
                                    value={itemFormData.variety_name}
                                    onChange={(e) => setItemFormData({ ...itemFormData, variety_name: e.target.value })}
                                    placeholder="e.g., PSB Rc82"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="damage_type_id">Damage Type ID</Label>
                                <Input
                                    id="damage_type_id"
                                    type="number"
                                    value={itemFormData.damage_type_id}
                                    onChange={(e) => setItemFormData({ ...itemFormData, damage_type_id: e.target.value })}
                                    placeholder="Reference damage_types table"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="damage_severity">Damage Severity</Label>
                                <Select 
                                    value={itemFormData.damage_severity} 
                                    onValueChange={(val) => setItemFormData({ ...itemFormData, damage_severity: val as 'low' | 'medium' | 'high' })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="low">Low</SelectItem>
                                        <SelectItem value="medium">Medium</SelectItem>
                                        <SelectItem value="high">High</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select 
                                value={itemFormData.status} 
                                onValueChange={(val) => setItemFormData({ ...itemFormData, status: val as 'pending' | 'verified' | 'closed' })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="verified">Verified</SelectItem>
                                    <SelectItem value="closed">Closed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="notes">Notes/Remarks</Label>
                            <Textarea
                                id="notes"
                                value={itemFormData.notes}
                                onChange={(e) => setItemFormData({ ...itemFormData, notes: e.target.value })}
                                placeholder="Detailed observations and remarks..."
                                rows={4}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateItemModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreateItem}>
                            Add Item
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Item Modal */}
            <Dialog open={isEditItemModalOpen} onOpenChange={setIsEditItemModalOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Edit Crop Damage Record Item</DialogTitle>
                        <DialogDescription>
                            Update the crop damage incident details.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-photo">Photo/Proof</Label>
                            {selectedItem?.photo_path && (
                                <div className="mb-2">
                                    <img
                                        src={`/storage/${selectedItem.photo_path}`}
                                        alt="Current photo"
                                        className="h-32 rounded-md object-cover"
                                    />
                                </div>
                            )}
                            <Input
                                id="edit-photo"
                                type="file"
                                accept="image/*"
                                onChange={(e) => setItemFormData({ ...itemFormData, photo: e.target.files?.[0] || null })}
                                className="flex-1"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-farm_id">Farm ID</Label>
                            <Input
                                id="edit-farm_id"
                                value={itemFormData.farm_id}
                                onChange={(e) => setItemFormData({ ...itemFormData, farm_id: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-commodity_name">Commodity</Label>
                                <Input
                                    id="edit-commodity_name"
                                    value={itemFormData.commodity_name}
                                    onChange={(e) => setItemFormData({ ...itemFormData, commodity_name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-variety_name">Variety</Label>
                                <Input
                                    id="edit-variety_name"
                                    value={itemFormData.variety_name}
                                    onChange={(e) => setItemFormData({ ...itemFormData, variety_name: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-damage_type_id">Damage Type ID</Label>
                                <Input
                                    id="edit-damage_type_id"
                                    value={itemFormData.damage_type_id}
                                    onChange={(e) => setItemFormData({ ...itemFormData, damage_type_id: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-damage_severity">Damage Severity</Label>
                                <Select 
                                    value={itemFormData.damage_severity} 
                                    onValueChange={(val) => setItemFormData({ ...itemFormData, damage_severity: val as 'low' | 'medium' | 'high' })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="low">Low</SelectItem>
                                        <SelectItem value="medium">Medium</SelectItem>
                                        <SelectItem value="high">High</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-status">Status</Label>
                            <Select 
                                value={itemFormData.status} 
                                onValueChange={(val) => setItemFormData({ ...itemFormData, status: val as 'pending' | 'verified' | 'closed' })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="verified">Verified</SelectItem>
                                    <SelectItem value="closed">Closed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-notes">Notes/Remarks</Label>
                            <Textarea
                                id="edit-notes"
                                value={itemFormData.notes}
                                onChange={(e) => setItemFormData({ ...itemFormData, notes: e.target.value })}
                                rows={4}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditItemModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleEditItem}>
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* View Item Modal */}
            <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
                <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold">Crop Damage Record Item Details</DialogTitle>
                        <DialogDescription>
                            Comprehensive view of crop damage incident and supporting documentation
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="grid gap-6 py-4">
                        {/* Photo Section - Full Width at Top */}
                        <div className="glass-card rounded-2xl overflow-hidden">
                            <div className="p-4 pb-3">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
                                        <ImageIcon className="h-4 w-4" />
                                    </div>
                                    <h2 className="text-sm font-semibold">Photo Evidence</h2>
                                </div>
                            </div>
                            {selectedItem?.photo_path ? (
                                <div className="px-4 pb-4">
                                    <div className="relative w-full rounded-xl overflow-hidden glass-surface">
                                        <img
                                            src={`/storage/${selectedItem.photo_path}`}
                                            alt="Damage proof"
                                            className="w-full h-auto object-contain max-h-[500px] mx-auto"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="px-4 pb-4">
                                    <div className="flex items-center justify-center h-48 rounded-xl glass-surface border-2 border-dashed">
                                        <div className="text-center">
                                            <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                                            <p className="text-muted-foreground">No photo uploaded</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Two Column Layout for Details */}
                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Left Column - Farm & Crop Information */}
                            <div className="glass-card rounded-2xl overflow-hidden">
                                <div className="p-4 pb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
                                            <Sprout className="h-4 w-4" />
                                        </div>
                                        <h2 className="text-sm font-semibold">Farm & Crop Information</h2>
                                    </div>
                                </div>
                                <div className="p-4 pt-0 space-y-4">
                                    <div>
                                        <Label className="text-xs text-muted-foreground uppercase tracking-wide">Farm Owner</Label>
                                        <div className="mt-1 p-3 rounded-xl glass-surface">
                                            <p className="font-semibold text-sm">
                                                {selectedItem?.farm?.farmer?.lfid || 'N/A'}
                                            </p>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {selectedItem?.farm?.farm_name || `Farm ID: ${selectedItem?.farm_id}`}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <Label className="text-xs text-muted-foreground uppercase tracking-wide">Commodity</Label>
                                            <p className="font-medium mt-1 text-sm">{selectedItem?.commodity_name || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <Label className="text-xs text-muted-foreground uppercase tracking-wide">Variety</Label>
                                            <p className="font-medium mt-1 text-sm">{selectedItem?.variety_name || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column - Damage Classification */}
                            <div className="glass-card rounded-2xl overflow-hidden">
                                <div className="p-4 pb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
                                            <AlertCircle className="h-4 w-4" />
                                        </div>
                                        <h2 className="text-sm font-semibold">Damage Classification</h2>
                                    </div>
                                </div>
                                <div className="p-4 pt-0 space-y-4">
                                    <div>
                                        <Label className="text-xs text-muted-foreground uppercase tracking-wide">Damage Type</Label>
                                        <div className="mt-1 p-3 rounded-xl glass-surface">
                                            <p className="font-semibold text-sm">
                                                {selectedItem?.damage_type?.damage_type_name || `Type ID: ${selectedItem?.damage_type_id}`}
                                            </p>
                                            {selectedItem?.damage_type?.damage_category?.damage_category_name && (
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    Category: {selectedItem.damage_type.damage_category.damage_category_name}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <Label className="text-xs text-muted-foreground uppercase tracking-wide">Severity</Label>
                                            <div className="mt-1">
                                                <Badge 
                                                    className={`${
                                                        selectedItem?.damage_severity === 'high' 
                                                            ? 'bg-red-100 text-red-800 border-red-200' 
                                                            : selectedItem?.damage_severity === 'medium'
                                                            ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                                                            : 'bg-green-100 text-green-800 border-green-200'
                                                    } text-xs px-3 py-1`}
                                                >
                                                    {selectedItem?.damage_severity || 'N/A'}
                                                </Badge>
                                            </div>
                                        </div>
                                        <div>
                                            <Label className="text-xs text-muted-foreground uppercase tracking-wide">Status</Label>
                                            <div className="mt-1">
                                                <Badge 
                                                    className={`${
                                                        selectedItem?.status === 'closed' 
                                                            ? 'bg-blue-100 text-blue-800 border-blue-200' 
                                                            : selectedItem?.status === 'verified'
                                                            ? 'bg-purple-100 text-purple-800 border-purple-200'
                                                            : 'bg-orange-100 text-orange-800 border-orange-200'
                                                    } text-xs px-3 py-1`}
                                                >
                                                    {selectedItem?.status || 'N/A'}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Notes Section - Full Width */}
                        {selectedItem?.notes && (
                            <div className="glass-card rounded-2xl overflow-hidden">
                                <div className="p-4 pb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
                                            <FileText className="h-4 w-4" />
                                        </div>
                                        <h2 className="text-sm font-semibold">Notes & Remarks</h2>
                                    </div>
                                </div>
                                <div className="p-4 pt-0">
                                    <div className="p-4 rounded-xl glass-surface">
                                        <p className="text-sm whitespace-pre-wrap leading-relaxed">{selectedItem.notes}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Metadata Section - Compact */}
                        <div className="glass-card rounded-2xl overflow-hidden">
                            <div className="p-4 pb-3">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
                                        <Calendar className="h-4 w-4" />
                                    </div>
                                    <h2 className="text-sm font-semibold">Record Metadata</h2>
                                </div>
                            </div>
                            <div className="p-4 pt-0">
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <Label className="text-xs text-muted-foreground uppercase tracking-wide">Recorded</Label>
                                        <p className="font-medium mt-1 text-sm">
                                            {selectedItem ? new Date(selectedItem.created_at).toLocaleDateString() : 'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <Label className="text-xs text-muted-foreground uppercase tracking-wide">Last Updated</Label>
                                        <p className="font-medium mt-1 text-sm">
                                            {selectedItem ? new Date(selectedItem.updated_at).toLocaleDateString() : 'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <Label className="text-xs text-muted-foreground uppercase tracking-wide">Created At</Label>
                                        <p className="font-medium mt-1 text-sm">
                                            {selectedItem ? new Date(selectedItem.created_at).toLocaleString() : 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
                            Close
                        </Button>
                        <Button 
                            onClick={() => {
                                setIsViewModalOpen(false);
                                openEditItemModal(selectedItem!);
                            }}
                            className="gap-2"
                        >
                            <Pencil className="h-4 w-4" />
                            Edit Item
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Modal */}
            <Dialog open={isDeleteItemModalOpen} onOpenChange={setIsDeleteItemModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Crop Damage Record Item</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this crop damage record item? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteItemModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteItem}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
