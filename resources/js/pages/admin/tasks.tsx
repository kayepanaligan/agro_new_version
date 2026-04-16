import { Head, Link, router } from '@inertiajs/react';
import { Plus, Eye, Edit, CheckCircle, XCircle, Filter } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { MoreHorizontal } from 'lucide-react';
import type { BreadcrumbItem } from '@/types';

interface Technician {
    id: number;
    full_name: string;
    email: string;
}

interface Task {
    id: number;
    title: string;
    task_type: string;
    status: string;
    priority: string;
    due_date: string;
    is_overdue: boolean;
    assigned_to: {
        id: number;
        full_name: string;
    };
    assigned_by: {
        id: number;
        full_name: string;
    };
    target_barangay: string[] | null;
}

interface PaginatedTasks {
    data: Task[];
    links: { url: string | null; label: string; active: boolean }[];
    current_page: number;
    last_page: number;
}

interface TasksProps {
    tasks: PaginatedTasks;
    technicians: Technician[];
    filters: {
        status?: string;
        technician_id?: string;
        priority?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Task Management',
        href: '/admin/tasks',
    },
];

export default function Tasks({ tasks, technicians, filters }: TasksProps) {
    const getStatusBadge = (status: string) => {
        const colors: Record<string, string> = {
            pending: 'bg-gray-500',
            assigned: 'bg-blue-500',
            'in_progress': 'bg-yellow-500',
            submitted: 'bg-purple-500',
            verified: 'bg-green-500',
            rejected: 'bg-red-500',
        };
        return (
            <Badge className={colors[status] || 'bg-gray-500'}>
                {status.replace('_', ' ').toUpperCase()}
            </Badge>
        );
    };

    const getPriorityBadge = (priority: string) => {
        const colors: Record<string, string> = {
            low: 'bg-blue-400',
            medium: 'bg-yellow-500',
            high: 'bg-red-500',
        };
        return (
            <Badge className={colors[priority] || 'bg-gray-500'}>
                {priority.toUpperCase()}
            </Badge>
        );
    };

    const getTaskTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            monitor_crops: 'Monitor Crops',
            verify_farmers: 'Verify Farmers',
            distribute_allocation: 'Distribute Allocation',
            register_farmers: 'Register Farmers',
            crop_damage_assessment: 'Crop Damage Assessment',
        };
        return labels[type] || type;
    };

    const handleFilter = (key: string, value: string) => {
        const params = new URLSearchParams();
        if (value && value !== 'all') {
            params.set(key, value);
        }
        if (filters.status && key !== 'status') params.set('status', filters.status);
        if (filters.technician_id && key !== 'technician_id') params.set('technician_id', filters.technician_id);
        if (filters.priority && key !== 'priority') params.set('priority', filters.priority);
        
        router.get(route('admin.tasks'), Object.fromEntries(params), {
            preserveState: true,
            replace: true,
        });
    };

    const handlePageChange = (url: string | null) => {
        if (url) {
            router.get(url, {}, { preserveState: true });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Task Management" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Task Management</h1>
                        <p className="text-muted-foreground">
                            Assign and manage field tasks for technicians
                        </p>
                    </div>
                    <Button asChild>
                        <Link href={route('admin.tasks.create')}>
                            <Plus className="mr-2 h-4 w-4" />
                            Create Task
                        </Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Tasks</CardTitle>
                                <CardDescription>
                                    {tasks.data.length} task{tasks.data.length !== 1 ? 's' : ''} found
                                </CardDescription>
                            </div>
                            <Filter className="h-5 w-5 text-muted-foreground" />
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Status</label>
                                <Select 
                                    value={filters.status || 'all'} 
                                    onValueChange={(value) => handleFilter('status', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Statuses" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Statuses</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="assigned">Assigned</SelectItem>
                                        <SelectItem value="in_progress">In Progress</SelectItem>
                                        <SelectItem value="submitted">Submitted</SelectItem>
                                        <SelectItem value="verified">Verified</SelectItem>
                                        <SelectItem value="rejected">Rejected</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Technician</label>
                                <Select 
                                    value={filters.technician_id || 'all'} 
                                    onValueChange={(value) => handleFilter('technician_id', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Technicians" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Technicians</SelectItem>
                                        {technicians.map((tech) => (
                                            <SelectItem key={tech.id} value={tech.id.toString()}>
                                                {tech.full_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Priority</label>
                                <Select 
                                    value={filters.priority || 'all'} 
                                    onValueChange={(value) => handleFilter('priority', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Priorities" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Priorities</SelectItem>
                                        <SelectItem value="low">Low</SelectItem>
                                        <SelectItem value="medium">Medium</SelectItem>
                                        <SelectItem value="high">High</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Title</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Assigned To</TableHead>
                                        <TableHead>Due Date</TableHead>
                                        <TableHead>Priority</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {tasks.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="h-24 text-center">
                                                No tasks found. Create your first task to get started.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        tasks.data.map((task) => (
                                            <TableRow key={task.id} className={task.is_overdue ? 'bg-red-50 dark:bg-red-950/20' : ''}>
                                                <TableCell className="font-medium">
                                                    <div>
                                                        {task.title}
                                                        {task.is_overdue && (
                                                            <div className="text-xs text-red-500 mt-1">
                                                                Overdue
                                                            </div>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">
                                                        {getTaskTypeLabel(task.task_type)}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{task.assigned_to.full_name}</TableCell>
                                                <TableCell>
                                                    {new Date(task.due_date).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell>
                                                    {getPriorityBadge(task.priority)}
                                                </TableCell>
                                                <TableCell>
                                                    {getStatusBadge(task.status)}
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
                                                            <DropdownMenuItem asChild>
                                                                <Link href={route('admin.tasks.show', task.id)}>
                                                                    <Eye className="mr-2 h-4 w-4" />
                                                                    View Details
                                                                </Link>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem asChild>
                                                                <Link href={route('admin.tasks.edit', task.id)}>
                                                                    <Edit className="mr-2 h-4 w-4" />
                                                                    Edit Task
                                                                </Link>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem>
                                                                <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                                                                <span className="text-green-600">Verify</span>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem>
                                                                <XCircle className="mr-2 h-4 w-4 text-red-600" />
                                                                <span className="text-red-600">Reject</span>
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
                        {tasks.links.length > 3 && (
                            <div className="flex items-center justify-center gap-2">
                                {tasks.links.map((link, index) => (
                                    <Button
                                        key={index}
                                        variant={link.active ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => handlePageChange(link.url)}
                                        disabled={!link.url}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
