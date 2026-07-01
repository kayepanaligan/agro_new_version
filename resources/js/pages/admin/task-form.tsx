import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, Calendar, User, MapPin, AlertCircle, ClipboardList, Clock, Target, FileText, CheckCircle2, Sprout, UserCheck, Package, UserPlus, AlertTriangle } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { BreadcrumbItem } from '@/types';

interface Technician {
    id: number;
    full_name: string;
    email: string;
    assigned_barangays: string[] | null;
}

interface TaskFormProps {
    technicians: Technician[];
    task?: {
        id: number;
        title: string;
        description: string | null;
        task_type: string;
        target_barangay: string[] | null;
        due_date: string;
        assigned_to: number;
        priority: string;
        status: string;
    } | null;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Task Management',
        href: '/admin/tasks',
    },
    {
        title: 'Create Task',
        href: '/admin/tasks/create',
    },
];

export default function TaskForm({ technicians, task = null }: TaskFormProps) {
    const isEdit = task !== null;
    const today = new Date().toISOString().split('T')[0];

    const { data, setData, post, put, processing, errors } = useForm({
        title: task?.title || '',
        description: task?.description || '',
        task_type: task?.task_type || '',
        target_barangay: task?.target_barangay || [],
        due_date: task?.due_date || '',
        assigned_to: task?.assigned_to?.toString() || '',
        priority: task?.priority || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (isEdit && task) {
            put(route('admin.tasks.update', task.id));
        } else {
            post(route('admin.tasks.store'));
        }
    };

    const taskTypes = [
        { value: 'monitor_crops', label: 'Monitor Crops', icon: <Sprout className="h-6 w-6" />, description: 'Field monitoring and crop assessment' },
        { value: 'verify_farmers', label: 'Verify Farmers', icon: <UserCheck className="h-6 w-6" />, description: 'Farmer verification and validation' },
        { value: 'distribute_allocation', label: 'Distribute Allocation', icon: <Package className="h-6 w-6" />, description: 'Allocation distribution to farmers' },
        { value: 'register_farmers', label: 'Register Farmers', icon: <UserPlus className="h-6 w-6" />, description: 'New farmer registration' },
        { value: 'crop_damage_assessment', label: 'Crop Damage Assessment', icon: <AlertTriangle className="h-6 w-6" />, description: 'Assess and report crop damage' },
    ];

    const priorities = [
        { value: 'low', label: 'Low', icon: <span className="h-3 w-3 rounded-full bg-blue-500" /> },
        { value: 'medium', label: 'Medium', icon: <span className="h-3 w-3 rounded-full bg-yellow-500" /> },
        { value: 'high', label: 'High', icon: <span className="h-3 w-3 rounded-full bg-red-500" /> },
    ];

    const selectedTechnician = technicians.find(t => t.id.toString() === data.assigned_to);
    const selectedTaskType = taskTypes.find(t => t.value === data.task_type);
    const selectedPriority = priorities.find(p => p.value === data.priority);

    if (isEdit && task) {
        breadcrumbs[1] = {
            title: 'Edit Task',
            href: `/admin/tasks/${task.id}/edit`,
        };
    }

    const isFormComplete = data.title && data.task_type && data.priority && data.due_date && data.assigned_to;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={isEdit ? 'Edit Task' : 'Create Task'} />
            <div className="flex h-full flex-1 flex-col gap-5 rounded-xl p-4 md:p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" asChild>
                            <Link href={route('admin.tasks')}>
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight md:text-3xl flex items-center gap-2">
                                <ClipboardList className="h-7 w-7 text-primary" />
                                {isEdit ? 'Edit Task' : 'Create New Task'}
                            </h1>
                            <p className="text-muted-foreground mt-1">
                                {isEdit 
                                    ? 'Update task details and assignment'
                                    : 'Define task details and assign to a technician'
                                }
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {isFormComplete && (
                            <Badge className="bg-primary/10 text-primary border-primary/20">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Ready to Submit
                            </Badge>
                        )}
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                        {/* Main Form */}
                        <div className="lg:col-span-2 space-y-5">
                            {/* Task Type Selection */}
                            <div className="glass-card rounded-2xl overflow-hidden">
                                <div className="p-4 pb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
                                            <Target className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <h2 className="text-sm font-semibold">Task Type</h2>
                                            <p className="text-xs text-muted-foreground">Select the type of task to be performed</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-4 pt-0">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {taskTypes.map((type) => (
                                            <button
                                                key={type.value}
                                                type="button"
                                                onClick={() => setData('task_type', type.value)}
                                                className={`p-4 rounded-xl border-2 transition-all text-left ${
                                                    data.task_type === type.value 
                                                        ? 'glass-surface border-primary ring-2 ring-primary/20' 
                                                        : 'glass-surface hover:border-primary/30'
                                                }`}
                                            >
                                                <div className="text-primary mb-2">{type.icon}</div>
                                                <div className="font-semibold">{type.label}</div>
                                                <div className="text-xs text-muted-foreground mt-1">
                                                    {type.description}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                    {errors.task_type && (
                                        <p className="text-sm text-red-500 mt-2">{errors.task_type}</p>
                                    )}
                                </div>
                            </div>

                            {/* Task Details */}
                            <div className="glass-card rounded-2xl overflow-hidden">
                                <div className="p-4 pb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
                                            <FileText className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <h2 className="text-sm font-semibold">Task Details</h2>
                                            <p className="text-xs text-muted-foreground">Provide detailed information about the task</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-4 pt-0 space-y-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="title">Task Title *</Label>
                                        <Input
                                            id="title"
                                            value={data.title}
                                            onChange={(e) => setData('title', e.target.value)}
                                            placeholder="e.g., Monitor crops in Brgy. San Isidro"
                                            className="text-lg font-medium"
                                            required
                                        />
                                        {errors.title && (
                                            <p className="text-sm text-red-500">{errors.title}</p>
                                        )}
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="description">Description</Label>
                                        <Textarea
                                            id="description"
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            placeholder="Provide detailed instructions for the task..."
                                            rows={5}
                                            className="resize-none"
                                        />
                                        {errors.description && (
                                            <p className="text-sm text-red-500">{errors.description}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Priority & Schedule */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {/* Priority Selection */}
                                <div className="glass-card rounded-2xl overflow-hidden">
                                    <div className="p-4 pb-3">
                                        <div>
                                            <h2 className="text-sm font-semibold">Priority Level</h2>
                                            <p className="text-xs text-muted-foreground">Set task urgency</p>
                                        </div>
                                    </div>
                                    <div className="p-4 pt-0">
                                        <div className="space-y-2">
                                            {priorities.map((priority) => (
                                                <button
                                                    key={priority.value}
                                                    type="button"
                                                    onClick={() => setData('priority', priority.value)}
                                                    className={`w-full p-3 rounded-xl border-2 transition-all text-left flex items-center justify-between ${
                                                        data.priority === priority.value 
                                                            ? 'glass-surface border-primary ring-2 ring-primary/20' 
                                                            : 'glass-surface hover:border-primary/30'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xl">{priority.icon}</span>
                                                        <span className="font-semibold">{priority.label}</span>
                                                    </div>
                                                    {data.priority === priority.value && (
                                                        <CheckCircle2 className="h-5 w-5 text-primary" />
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                        {errors.priority && (
                                            <p className="text-sm text-red-500 mt-2">{errors.priority}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Due Date */}
                                <div className="glass-card rounded-2xl overflow-hidden">
                                    <div className="p-4 pb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
                                                <Calendar className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <h2 className="text-sm font-semibold">Due Date</h2>
                                                <p className="text-xs text-muted-foreground">When should this be completed?</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-4 pt-0">
                                        <div className="grid gap-2">
                                            <Input
                                                id="due_date"
                                                type="date"
                                                value={data.due_date}
                                                onChange={(e) => setData('due_date', e.target.value)}
                                                min={today}
                                                className="text-lg"
                                                required
                                            />
                                            {data.due_date && (
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <Clock className="h-4 w-4" />
                                                    {new Date(data.due_date).toLocaleDateString('en-US', { 
                                                        weekday: 'long',
                                                        year: 'numeric', 
                                                        month: 'long', 
                                                        day: 'numeric' 
                                                    })}
                                                </div>
                                            )}
                                            {errors.due_date && (
                                                <p className="text-sm text-red-500">{errors.due_date}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Target Location */}
                            <div className="glass-card rounded-2xl overflow-hidden">
                                <div className="p-4 pb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
                                            <MapPin className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <h2 className="text-sm font-semibold">Target Location</h2>
                                            <p className="text-xs text-muted-foreground">Specify the barangays where the task should be performed</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-4 pt-0">
                                    <div className="grid gap-2">
                                        <Label>Target Barangays (Optional)</Label>
                                        <Input
                                            placeholder="e.g., San Isidro, Santa Cruz, Poblacion"
                                            value={(data.target_barangay || []).join(', ')}
                                            onChange={(e) => {
                                                const barangays = e.target.value
                                                    .split(',')
                                                    .map(b => b.trim())
                                                    .filter(b => b.length > 0);
                                                setData('target_barangay', barangays);
                                            }}
                                        />
                                        {data.target_barangay && data.target_barangay.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mt-3">
                                                {data.target_barangay.map((brgy, idx) => (
                                                    <Badge key={idx} variant="secondary" className="px-3 py-1">
                                                        <MapPin className="h-3 w-3 mr-1" />
                                                        {brgy}
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}
                                        {errors.target_barangay && (
                                            <p className="text-sm text-red-500">{errors.target_barangay}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Assignment Sidebar */}
                        <div className="space-y-5">
                            {/* Technician Assignment */}
                            <div className="glass-card rounded-2xl overflow-hidden border-primary/20">
                                <div className="glass-surface p-4 pb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
                                            <User className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <h2 className="text-sm font-semibold">Assign Technician</h2>
                                            <p className="text-xs text-muted-foreground">Select who will execute this task</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-4 space-y-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="assigned_to">Technician *</Label>
                                        <Select 
                                            value={data.assigned_to} 
                                            onValueChange={(value) => setData('assigned_to', value)}
                                        >
                                            <SelectTrigger className="h-12">
                                                <SelectValue placeholder="Select technician" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {technicians.length === 0 ? (
                                                    <SelectItem value="" disabled>
                                                        No technicians available
                                                    </SelectItem>
                                                ) : (
                                                    technicians.map((tech) => (
                                                        <SelectItem key={tech.id} value={tech.id.toString()}>
                                                            <div className="py-1">
                                                                <div className="font-medium">{tech.full_name}</div>
                                                                <div className="text-xs text-muted-foreground">
                                                                    {tech.email}
                                                                </div>
                                                            </div>
                                                        </SelectItem>
                                                    ))
                                                )}
                                            </SelectContent>
                                        </Select>
                                        {errors.assigned_to && (
                                            <p className="text-sm text-red-500">{errors.assigned_to}</p>
                                        )}
                                    </div>

                                    {selectedTechnician && (
                                        <>
                                            <Separator />
                                            
                                            {/* Technician Info */}
                                            <div className="glass-surface rounded-xl p-4">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center ring-1 ring-primary/20">
                                                        <User className="h-5 w-5 text-primary" />
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold">{selectedTechnician.full_name}</div>
                                                        <div className="text-xs text-muted-foreground">{selectedTechnician.email}</div>
                                                    </div>
                                                </div>

                                                {selectedTechnician.assigned_barangays && selectedTechnician.assigned_barangays.length > 0 && (
                                                    <div>
                                                        <div className="text-xs font-medium text-muted-foreground mb-2">ASSIGNED TERRITORY</div>
                                                        <div className="flex flex-wrap gap-1">
                                                            {selectedTechnician.assigned_barangays.slice(0, 5).map((brgy, idx) => (
                                                                <Badge key={idx} variant="outline" className="text-xs">
                                                                    {brgy}
                                                                </Badge>
                                                            ))}
                                                            {selectedTechnician.assigned_barangays.length > 5 && (
                                                                <Badge variant="outline" className="text-xs">
                                                                    +{selectedTechnician.assigned_barangays.length - 5} more
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Territory Match Alert */}
                                            {data.target_barangay && data.target_barangay.length > 0 && (
                                                <Alert className="glass-surface border-primary/20">
                                                    <AlertCircle className="h-4 w-4 text-primary" />
                                                    <AlertTitle className="text-sm">Territory Match</AlertTitle>
                                                    <AlertDescription className="text-xs text-muted-foreground mt-1">
                                                        Verify that target barangays align with the technician's territory for optimal efficiency.
                                                    </AlertDescription>
                                                </Alert>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Task Summary */}
                            <div className="glass-card rounded-2xl overflow-hidden bg-primary/[0.02] dark:bg-primary/[0.04]">
                                <div className="glass-surface p-4 pb-3">
                                    <div>
                                        <h2 className="text-sm font-semibold">Task Summary</h2>
                                        <p className="text-xs text-muted-foreground">Review before submitting</p>
                                    </div>
                                </div>
                                <div className="p-4 space-y-3">
                                    {selectedTaskType && (
                                        <div className="glass-surface rounded-xl p-3 flex items-center gap-3">
                                            <span className="text-primary text-2xl">{selectedTaskType.icon}</span>
                                            <div>
                                                <div className="text-xs text-muted-foreground">Task Type</div>
                                                <div className="font-semibold">{selectedTaskType.label}</div>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {selectedPriority && (
                                        <div className="glass-surface rounded-xl p-3 flex items-center gap-3">
                                            <span className="text-2xl">{selectedPriority.icon}</span>
                                            <div>
                                                <div className="text-xs text-muted-foreground">Priority</div>
                                                <div className="font-semibold">{selectedPriority.label}</div>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {data.due_date && (
                                        <div className="glass-surface rounded-xl p-3 flex items-center gap-3">
                                            <Calendar className="h-5 w-5 text-primary" />
                                            <div>
                                                <div className="text-xs text-muted-foreground">Due Date</div>
                                                <div className="font-semibold">
                                                    {new Date(data.due_date).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {data.target_barangay && data.target_barangay.length > 0 && (
                                        <div className="glass-surface rounded-xl p-3">
                                            <div className="text-xs text-muted-foreground mb-2">Target Locations</div>
                                            <div className="font-semibold">{data.target_barangay.length} barangay(s)</div>
                                        </div>
                                    )}

                                    <Separator />
                                    
                                    <div className="text-center">
                                        <div className="text-xs text-muted-foreground mb-1">Form Completion</div>
                                        <div className={`text-2xl font-bold ${isFormComplete ? 'text-primary' : 'text-muted-foreground'}`}>
                                            {isFormComplete ? '✓ Complete' : 'Incomplete'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3 sticky bottom-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4 border-t shadow-lg rounded-b-xl">
                        <Button variant="outline" type="button" size="lg" asChild>
                            <Link href={route('admin.tasks')}>Cancel</Link>
                        </Button>
                        <Button 
                            type="submit" 
                            disabled={processing || !isFormComplete}
                            size="lg"
                            className="px-8"
                        >
                            <Save className="mr-2 h-5 w-5" />
                            {isEdit ? 'Update Task' : 'Create & Assign Task'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
