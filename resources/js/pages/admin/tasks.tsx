import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Plus, Eye, Edit, CheckCircle, XCircle, Filter, LayoutGrid, List, ClipboardList, Clock, AlertTriangle, Users } from 'lucide-react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MoreHorizontal } from 'lucide-react';
import type { BreadcrumbItem } from '@/types';
import { KpiCard } from '@/components/agro-profiler/kpi-card';
import { NarrativeCard } from '@/components/agro-profiler/narrative-card';
import BarChart from '@/components/charts/BarChart';
import PieChart from '@/components/charts/PieChart';

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

interface Productivity {
    total: number;
    status_dist: { name: string; count: number }[];
    type_dist: { name: string; count: number }[];
    priority_dist: { name: string; count: number }[];
    tech_productivity: { technician_id: number; technician_name: string; total: number; completed: number }[];
    overdue_count: number;
    completion_rate: number;
    narrative: string;
}

interface TasksProps {
    tasks: PaginatedTasks;
    technicians: Technician[];
    filters: {
        status?: string;
        technician_id?: string;
        priority?: string;
    };
    productivity: Productivity;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Task Management',
        href: '/admin/tasks',
    },
];

const STATUS_COLORS: Record<string, string> = {
    pending: 'bg-gray-500',
    assigned: 'bg-blue-500',
    in_progress: 'bg-yellow-500',
    submitted: 'bg-purple-500',
    verified: 'bg-green-500',
    rejected: 'bg-red-500',
};

const PRIORITY_COLORS: Record<string, string> = {
    low: 'bg-blue-400',
    medium: 'bg-yellow-500',
    high: 'bg-red-500',
};

const TASK_TYPE_LABELS: Record<string, string> = {
    monitor_crops: 'Monitor Crops',
    verify_farmers: 'Verify Farmers',
    distribute_allocation: 'Distribute Allocation',
    register_farmers: 'Register Farmers',
    crop_damage_assessment: 'Crop Damage Assessment',
};

const STATUS_LABELS: Record<string, string> = {
    pending: 'Pending',
    assigned: 'Assigned',
    in_progress: 'In Progress',
    submitted: 'Submitted',
    verified: 'Verified',
    rejected: 'Rejected',
};

const PIE_COLORS = ['hsl(var(--primary))', '#3b82f6', '#eab308', '#ef4444', '#8b5cf6', '#22c55e'];

export default function Tasks({ tasks, technicians, filters, productivity }: TasksProps) {
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

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

    const verifiedCount = productivity.status_dist.find(s => s.name === 'Verified')?.count ?? 0;
    const pendingCount = (productivity.status_dist.find(s => s.name === 'Pending')?.count ?? 0) + (productivity.status_dist.find(s => s.name === 'Assigned')?.count ?? 0);
    const inProgressCount = productivity.status_dist.find(s => s.name === 'In Progress')?.count ?? 0;

    const statusChartData = productivity.status_dist.map(s => ({ name: s.name, count: s.count }));
    const typeChartData = productivity.type_dist.map(t => ({ name: TASK_TYPE_LABELS[t.name] || t.name, count: t.count }));
    const priorityChartData = productivity.priority_dist.map(p => ({ name: p.name, count: p.count }));

    const techChartData = productivity.tech_productivity.map(t => ({
        name: t.technician_name.split(' ')[0],
        count: t.total,
    }));

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Task Management" />
            <div className="flex h-full flex-1 flex-col gap-5 rounded-xl p-4 md:p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Task Management</h1>
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

                {/* KPI Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <KpiCard label="Total Tasks" value={productivity.total} icon={ClipboardList} />
                    <KpiCard label="Verified" value={verifiedCount} icon={CheckCircle} />
                    <KpiCard label="In Progress" value={inProgressCount} icon={Clock} />
                    <KpiCard label="Overdue" value={productivity.overdue_count} icon={AlertTriangle} />
                </div>

                {/* Tabs */}
                <Tabs defaultValue="tasks" className="flex flex-col gap-4">
                    <TabsList className="glass-surface w-fit">
                        <TabsTrigger value="tasks">Tasks</TabsTrigger>
                        <TabsTrigger value="productivity">Productivity</TabsTrigger>
                    </TabsList>

                    {/* Tasks Tab */}
                    <TabsContent value="tasks" className="space-y-4">
                        {/* Filters */}
                        <div className="glass-card rounded-2xl p-4">
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
                        </div>

                        {/* Task List/Grid */}
                        <div className="glass-card rounded-2xl overflow-hidden">
                            <div className="p-4 pb-3 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
                                        <ClipboardList className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <h2 className="text-sm font-semibold">Tasks</h2>
                                        <p className="text-xs text-muted-foreground">
                                            {tasks.data.length} task{tasks.data.length !== 1 ? 's' : ''} found
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 rounded-lg border p-1">
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={`flex h-7 w-7 items-center justify-center rounded-md transition-colors ${
                                            viewMode === 'list'
                                                ? 'bg-primary text-primary-foreground'
                                                : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                        title="List view"
                                    >
                                        <List className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => setViewMode('grid')}
                                        className={`flex h-7 w-7 items-center justify-center rounded-md transition-colors ${
                                            viewMode === 'grid'
                                                ? 'bg-primary text-primary-foreground'
                                                : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                        title="Grid view"
                                    >
                                        <LayoutGrid className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>

                            {tasks.data.length === 0 ? (
                                <div className="flex h-48 items-center justify-center">
                                    <div className="glass-card rounded-2xl p-8 text-center">
                                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary ring-1 ring-primary/20">
                                            <ClipboardList className="h-6 w-6" />
                                        </div>
                                        <h3 className="mt-4 text-lg font-semibold">No tasks found</h3>
                                        <p className="text-muted-foreground">Create your first task to get started</p>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {viewMode === 'list' ? (
                                    /* List View */
                                    <div className="overflow-x-auto">
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
                                                {tasks.data.map((task) => (
                                                    <TableRow key={task.id} className={task.is_overdue ? 'bg-red-50 dark:bg-red-950/20' : ''}>
                                                        <TableCell className="font-medium">
                                                            <div>
                                                                {task.title}
                                                                {task.is_overdue && (
                                                                    <div className="text-xs text-red-500 mt-1">Overdue</div>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant="outline">{TASK_TYPE_LABELS[task.task_type] || task.task_type}</Badge>
                                                        </TableCell>
                                                        <TableCell>{task.assigned_to.full_name}</TableCell>
                                                        <TableCell>{new Date(task.due_date).toLocaleDateString()}</TableCell>
                                                        <TableCell>
                                                            <Badge className={PRIORITY_COLORS[task.priority] || 'bg-gray-500'}>
                                                                {task.priority.toUpperCase()}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge className={STATUS_COLORS[task.status] || 'bg-gray-500'}>
                                                                {STATUS_LABELS[task.status] || task.status.replace('_', ' ').toUpperCase()}
                                                            </Badge>
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
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                    ) : (
                                    /* Grid View */
                                    <div className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3">
                                        {tasks.data.map((task) => (
                                            <Link key={`grid-${task.id}`} href={route('admin.tasks.show', task.id)}>
                                                <div className={`glass-card rounded-2xl p-4 cursor-pointer hover:shadow-lg transition-shadow ${task.is_overdue ? 'ring-1 ring-red-300 dark:ring-red-700' : ''}`}>
                                                    <div className="flex items-start justify-between mb-3">
                                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
                                                            <ClipboardList className="h-5 w-5" />
                                                        </div>
                                                        <div className="flex gap-1">
                                                            <Badge className={PRIORITY_COLORS[task.priority] || 'bg-gray-500'}>
                                                                {task.priority.toUpperCase()}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                    <h3 className="font-semibold line-clamp-2 mb-1">{task.title}</h3>
                                                    <p className="text-xs text-muted-foreground mb-3">
                                                        {TASK_TYPE_LABELS[task.task_type] || task.task_type}
                                                    </p>
                                                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                                                        <span className="flex items-center gap-1">
                                                            <Users className="h-3 w-3" />
                                                            {task.assigned_to.full_name}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="h-3 w-3" />
                                                            {new Date(task.due_date).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    {task.is_overdue && (
                                                        <Badge className="bg-red-500 w-fit text-xs">OVERDUE</Badge>
                                                    )}
                                                    <div className="mt-2">
                                                        <Badge className={STATUS_COLORS[task.status] || 'bg-gray-500'}>
                                                            {STATUS_LABELS[task.status] || task.status.replace('_', ' ').toUpperCase()}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                    )}
                                </>
                            )}
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
                    </TabsContent>

                    {/* Productivity Tab */}
                    <TabsContent value="productivity" className="space-y-4">
                        <NarrativeCard
                            title="Task Productivity Insights"
                            narrative={productivity.narrative}
                            highlights={[
                                { text: 'Completion Rate', value: `${productivity.completion_rate}%` },
                                { text: 'Total Tasks', value: productivity.total },
                                { text: 'Overdue', value: productivity.overdue_count },
                            ]}
                        />

                        {/* Status & Type Distribution */}
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="glass-card rounded-2xl p-4">
                                <h3 className="text-sm font-semibold mb-4">Status Distribution</h3>
                                {statusChartData.length > 0 ? (
                                    <PieChart data={statusChartData} />
                                ) : (
                                    <p className="text-sm text-muted-foreground text-center py-8">No data available</p>
                                )}
                            </div>
                            <div className="glass-card rounded-2xl p-4">
                                <h3 className="text-sm font-semibold mb-4">Task Type Distribution</h3>
                                {typeChartData.length > 0 ? (
                                    <PieChart data={typeChartData} />
                                ) : (
                                    <p className="text-sm text-muted-foreground text-center py-8">No data available</p>
                                )}
                            </div>
                        </div>

                        {/* Priority Distribution & Technician Productivity */}
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="glass-card rounded-2xl p-4">
                                <h3 className="text-sm font-semibold mb-4">Priority Distribution</h3>
                                {priorityChartData.length > 0 ? (
                                    <PieChart data={priorityChartData} />
                                ) : (
                                    <p className="text-sm text-muted-foreground text-center py-8">No data available</p>
                                )}
                            </div>
                            <div className="glass-card rounded-2xl p-4">
                                <h3 className="text-sm font-semibold mb-4">Technician Workload</h3>
                                {techChartData.length > 0 ? (
                                    <BarChart data={techChartData} />
                                ) : (
                                    <p className="text-sm text-muted-foreground text-center py-8">No data available</p>
                                )}
                            </div>
                        </div>

                        {/* Completion & Overdue Summary */}
                        <div className="grid gap-4 sm:grid-cols-3">
                            <div className="glass-surface rounded-xl p-4 text-center">
                                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Completion Rate</p>
                                <p className="text-3xl font-bold text-primary">{productivity.completion_rate}%</p>
                            </div>
                            <div className="glass-surface rounded-xl p-4 text-center">
                                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Verified Tasks</p>
                                <p className="text-3xl font-bold text-primary">{verifiedCount}</p>
                            </div>
                            <div className="glass-surface rounded-xl p-4 text-center">
                                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Overdue Tasks</p>
                                <p className="text-3xl font-bold text-primary">{productivity.overdue_count}</p>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}
