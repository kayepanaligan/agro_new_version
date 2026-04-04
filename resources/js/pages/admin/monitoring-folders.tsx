import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type CropMonitoringFolder, type CropMonitoringCategory, type Commodity, type Variety } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarGroup, AvatarGroupCount, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, FolderOpen, LayoutGrid, List, Search, Calendar, Users, Pencil, Eye, MoreHorizontal, PictureInPicture } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Monitoring Folders',
        href: '/admin/monitoring-folders',
    },
];

interface Props {
    folders: {
        data: CropMonitoringFolder[];
        links: any[];
        current_page: number;
        last_page: number;
    };
    categories: CropMonitoringCategory[];
    commodities: Commodity[];
    filters: {
        category_id?: string;
        commodity_id?: string;
        search?: string;
    };
}

export default function MonitoringFolders({ folders, categories, commodities, filters }: Props) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedFolder, setSelectedFolder] = useState<CropMonitoringFolder | null>(null);
    const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedCategory, setSelectedCategory] = useState(filters.category_id || '');
    const [selectedCommodity, setSelectedCommodity] = useState(filters.commodity_id || '');

    const createForm = useForm({
        folder_name: '',
        description: '',
        category_id: '',
        commodity_id: '',
        variety_id: '',
    });

    const editForm = useForm({
        folder_name: '',
        description: '',
        category_id: '',
        commodity_id: '',
        variety_id: '',
    });

    // Get varieties for selected commodity
    const getVarietiesForCommodity = (commodityId: string) => {
        // This would need to be passed from backend or fetched via API
        return [] as Variety[];
    };

    const handleFilter = () => {
        router.get(route('admin.monitoring-folders.index'), {
            search: searchTerm,
            category_id: selectedCategory,
            commodity_id: selectedCommodity,
        }, {
            preserveState: false,
            replace: true,
        });
    };

    const handleCreate = () => {
        createForm.post(route('admin.monitoring-folders.store'), {
            onSuccess: () => {
                createForm.reset();
                setIsCreateOpen(false);
            },
        });
    };

    const handleEdit = (folder: CropMonitoringFolder) => {
        setSelectedFolder(folder);
        editForm.setData({
            folder_name: folder.folder_name,
            description: folder.description || '',
            category_id: String(folder.category_id),
            commodity_id: String(folder.commodity_id),
            variety_id: String(folder.variety_id),
        });
        setIsEditOpen(true);
    };

    const handleUpdate = () => {
        if (!selectedFolder) return;
        editForm.put(route('admin.monitoring-folders.update', selectedFolder.crop_monitoring_folder_id), {
            onSuccess: () => {
                editForm.reset();
                setIsEditOpen(false);
                setSelectedFolder(null);
            },
        });
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this folder? All timeline items will be deleted.')) {
            router.delete(route('admin.monitoring-folders.destroy', id));
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Monitoring Folders" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between px-4 pt-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Monitoring Folders</h1>
                        <p className="text-muted-foreground">Organize and track crop monitoring activities</p>
                    </div>
                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                New Folder
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>Create Monitoring Folder</DialogTitle>
                                <DialogDescription>Start a new crop monitoring project</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="folder-name">Folder Name</Label>
                                    <Input
                                        id="folder-name"
                                        value={createForm.data.folder_name}
                                        onChange={(e) => createForm.setData('folder_name', e.target.value)}
                                        placeholder="e.g., Rice Blast Monitoring - Field A"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        value={createForm.data.description}
                                        onChange={(e) => createForm.setData('description', e.target.value)}
                                        placeholder="Describe the monitoring purpose..."
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label>Category</Label>
                                        <Select
                                            value={createForm.data.category_id}
                                            onValueChange={(value) => createForm.setData('category_id', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {categories.map((cat) => (
                                                    <SelectItem key={cat.crop_monitoring_category_id} value={String(cat.crop_monitoring_category_id)}>
                                                        {cat.category_name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Commodity</Label>
                                        <Select
                                            value={createForm.data.commodity_id}
                                            onValueChange={(value) => createForm.setData('commodity_id', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select commodity" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {commodities.map((comm) => (
                                                    <SelectItem key={comm.id} value={String(comm.id)}>
                                                        {comm.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Variety</Label>
                                    <Select
                                        value={createForm.data.variety_id}
                                        onValueChange={(value) => createForm.setData('variety_id', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select variety" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {/* Varieties would be loaded based on commodity selection */}
                                            <SelectItem value="1">Sample Variety 1</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                                <Button onClick={handleCreate} disabled={createForm.processing}>Create Folder</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>  

                {/* Filters */}
                <Card className="mb-2">
                    <CardContent className="pt-6">
                        
                        <div className="grid gap-4 md:grid-cols-4">
                            <div className="relative">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search folders..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
                                    className="pl-8"
                                />
                            </div>
                            <Select value={selectedCategory || 'all'} onValueChange={(value) => setSelectedCategory(value === 'all' ? '' : value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Categories" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Categories</SelectItem>
                                    {categories.map((cat) => (
                                        <SelectItem key={cat.crop_monitoring_category_id} value={String(cat.crop_monitoring_category_id)}>
                                            {cat.category_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={selectedCommodity || 'all'} onValueChange={(value) => setSelectedCommodity(value === 'all' ? '' : value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Commodities" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Commodities</SelectItem>
                                    {commodities.map((comm) => (
                                        <SelectItem key={comm.id} value={String(comm.id)}>
                                            {comm.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button onClick={handleFilter}>Apply Filters</Button>
                        </div>
                        {/* View Toggle */}

                    </CardContent>
                </Card>

                <div className="flex items-center justify-between px-4">
                    <p className="text-sm text-muted-foreground">
                        {folders.data.length} folder{folders.data.length !== 1 ? 's' : ''} found
                    </p>
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
            
                {/* Grid View */}
                {viewMode === 'card' && (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {folders.data.map((folder) => (
                            <Card 
                                key={folder.crop_monitoring_folder_id}
                                className="group relative overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                                onClick={() => router.visit(route('admin.monitoring-folders.show', folder.crop_monitoring_folder_id))}
                            >
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <FolderOpen className="h-8 w-8 text-primary" />
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={(e) => {
                                                    e.stopPropagation();
                                                    router.visit(route('admin.monitoring-folders.show', folder.crop_monitoring_folder_id));
                                                }}>
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    View Folder
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleEdit(folder);
                                                }}>
                                                    <Pencil className="mr-2 h-4 w-4" />
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDelete(folder.crop_monitoring_folder_id);
                                                    }}
                                                    className="text-destructive focus:text-destructive"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                                                        <path d="M3 6h18" />
                                                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                                    </svg>
                                                    Delete Folder
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                    <CardTitle className="mt-4 line-clamp-2">{folder.folder_name}</CardTitle>
                                    <CardDescription className="line-clamp-2">
                                        {folder.description || 'No description'}
                                    </CardDescription>
                                </CardHeader>
                                <CardFooter className="flex flex-col items-start gap-3">
                                    <div className="flex flex-wrap gap-2">
                                        {folder.category && (
                                            <Badge variant="outline">{folder.category.category_name}</Badge>
                                        )}
                                        {folder.commodity && (
                                            <Badge variant="secondary">{folder.commodity.name}</Badge>
                                        )}
                                    </div>
                                    
                                    {/* Avatar Group for Updaters */}
                                    {folder.updaters && folder.updaters.length > 0 && (
                                        <div className="flex items-center gap-2">
                                            <AvatarGroup>
                                                {folder.updaters.slice(0, 3).map((updater, idx) => (
                                                    <Avatar key={idx} className="h-9 w-9 border-2 border-background">
                                                        <AvatarImage 
                                                            src={updater.user.avatar || undefined} 
                                                            alt={`${updater.user.first_name} ${updater.user.last_name}`} 
                                                        />
                                                        <AvatarFallback>
                                                            {updater.user.first_name[0]}{updater.user.last_name[0]}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                ))}
                                                {folder.updaters.length > 3 && (
                                                    <AvatarGroupCount users={folder.updaters}>
                                                        +{folder.updaters.length - 3}
                                                    </AvatarGroupCount>
                                                )}
                                            </AvatarGroup>
                                        </div>
                                    )}
                                    
                                    <div className="flex items-center justify-between w-full text-sm text-muted-foreground mt-1">
                                        <div className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            {new Date(folder.updated_at).toLocaleDateString()}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <PictureInPicture className="h-3 w-3" />
                                            {folder.items_count || 0} updates
                                        </div>
                                    </div>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}

                {/* List View */}
                {viewMode === 'list' && (
                    <div className="rounded-md border ">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Folder Name</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Commodity/Variety</TableHead>
                                    <TableHead>Updates</TableHead>
                                    <TableHead>Last Updated</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {folders.data.map((folder) => (
                                    <TableRow 
                                        key={folder.crop_monitoring_folder_id}
                                        className="cursor-pointer hover:bg-muted/50"
                                        onClick={() => router.visit(route('admin.monitoring-folders.show', folder.crop_monitoring_folder_id))}
                                    >
                                        <TableCell className="font-medium">{folder.folder_name}</TableCell>
                                        <TableCell>
                                            {folder.category && (
                                                <Badge variant="outline">{folder.category.category_name}</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {folder.commodity?.name}
                                            {folder.variety && ` / ${folder.variety.name}`}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">{folder.items_count || 0}</Badge>
                                        </TableCell>
                                        <TableCell>{new Date(folder.updated_at).toLocaleDateString()}</TableCell>
                                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={() => {
                                                        router.visit(route('admin.monitoring-folders.show', folder.crop_monitoring_folder_id));
                                                    }}>
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        View Folder
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleEdit(folder)}>
                                                        <Pencil className="mr-2 h-4 w-4" />
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        onClick={() => handleDelete(folder.crop_monitoring_folder_id)}
                                                        className="text-destructive focus:text-destructive"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                                                            <path d="M3 6h18" />
                                                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                                        </svg>
                                                        Delete Folder
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

                {/* Pagination */}
                {folders.last_page && folders.last_page > 1 && (
                    <div className="mt-6 flex items-center justify-center gap-2">
                        {folders.links && folders.links.map((link: any, index: number) => (
                            link.url ? (
                                <Button
                                    key={index}
                                    variant={link.active ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => router.visit(link.url)}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ) : (
                                <span
                                    key={index}
                                    className="px-3 py-1 text-sm text-muted-foreground"
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            )
                        ))}
                    </div>
                )}
            </div>

            {/* Edit Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Edit Monitoring Folder</DialogTitle>
                        <DialogDescription>Update folder information</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-folder-name">Folder Name</Label>
                            <Input
                                id="edit-folder-name"
                                value={editForm.data.folder_name}
                                onChange={(e) => editForm.setData('folder_name', e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-description">Description</Label>
                            <Textarea
                                id="edit-description"
                                value={editForm.data.description}
                                onChange={(e) => editForm.setData('description', e.target.value)}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Category</Label>
                                <Select
                                    value={editForm.data.category_id}
                                    onValueChange={(value) => editForm.setData('category_id', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((cat) => (
                                            <SelectItem key={cat.crop_monitoring_category_id} value={String(cat.crop_monitoring_category_id)}>
                                                {cat.category_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label>Commodity</Label>
                                <Select
                                    value={editForm.data.commodity_id}
                                    onValueChange={(value) => editForm.setData('commodity_id', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select commodity" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {commodities.map((comm) => (
                                            <SelectItem key={comm.id} value={String(comm.id)}>
                                                {comm.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label>Variety</Label>
                            <Select
                                value={editForm.data.variety_id}
                                onValueChange={(value) => editForm.setData('variety_id', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select variety" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1">Sample Variety 1</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
                        <Button onClick={handleUpdate} disabled={editForm.processing}>Update</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

           
        </AppLayout>
    );
}
