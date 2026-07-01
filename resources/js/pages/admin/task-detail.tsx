import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Calendar, User, MapPin, AlertCircle, CheckCircle, XCircle, Paperclip, Clock, ClipboardList } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import type { BreadcrumbItem } from '@/types';
import { useState } from 'react';

interface Attachment {
    id: number;
    file_path: string;
    file_type: string;
    uploaded_by: string;
    created_at: string;
}

interface TaskDetailProps {
    task: {
        id: number;
        title: string;
        description: string | null;
        task_type: string;
        status: string;
        priority: string;
        due_date: string;
        completed_at: string | null;
        remarks: string | null;
        is_overdue: boolean;
        target_barangay: string[] | null;
        assigned_to: {
            id: number;
            full_name: string;
            email: string;
        };
        assigned_by: {
            id: number;
            full_name: string;
        };
        attachments: Attachment[];
        created_at: string;
        updated_at: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Task Management',
        href: '/admin/tasks',
    },
    {
        title: 'Task Details',
        href: '/admin/tasks/1',
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

export default function TaskDetail({ task }: TaskDetailProps) {
    const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false);

    const verifyForm = useForm({ remarks: '' });
    const rejectForm = useForm({ remarks: '' });

    const handleVerify = (e: React.FormEvent) => {
        e.preventDefault();
        router.post(route('admin.tasks.verify', task.id), verifyForm.data, {
            onSuccess: () => setVerifyDialogOpen(false),
        });
    };

    const handleReject = (e: React.FormEvent) => {
        e.preventDefault();
        router.post(route('admin.tasks.reject', task.id), rejectForm.data, {
            onSuccess: () => setRejectDialogOpen(false),
        });
    };

    const getStatusTimeline = () => {
        return [
            { status: 'created', label: 'Task Created', date: task.created_at, completed: true },
            { status: 'assigned', label: 'Assigned to Technician', date: task.created_at, completed: true },
            { status: 'in_progress', label: 'In Progress', date: null, completed: ['in_progress', 'submitted', 'verified', 'rejected'].includes(task.status) },
            { status: 'submitted', label: 'Submitted by Technician', date: task.completed_at, completed: ['submitted', 'verified', 'rejected'].includes(task.status) },
            { status: task.status === 'verified' ? 'verified' : task.status === 'rejected' ? 'rejected' : 'pending_review', 
              label: task.status === 'verified' ? 'Verified' : task.status === 'rejected' ? 'Rejected' : 'Pending Review', 
              date: task.status === 'verified' || task.status === 'rejected' ? task.updated_at : null, 
              completed: ['verified', 'rejected'].includes(task.status) },
        ];
    };

    breadcrumbs[1] = {
        title: task.title,
        href: `/admin/tasks/${task.id}`,
    };

    const canVerify = ['submitted', 'in_progress'].includes(task.status);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Task: ${task.title}`} />
            <div className="flex h-full flex-1 flex-col gap-5 rounded-xl p-4 md:p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="sm" asChild>
                            <Link href={route('admin.tasks')}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back
                            </Link>
                        </Button>
                    </div>
                    {canVerify && (
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                className="text-red-600 border-red-600 hover:bg-red-50"
                                onClick={() => setRejectDialogOpen(true)}
                            >
                                <XCircle className="mr-2 h-4 w-4" />
                                Reject
                            </Button>
                            <Button
                                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                                onClick={() => setVerifyDialogOpen(true)}
                            >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Verify Task
                            </Button>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-5">
                        {/* Task Info */}
                        <div className="glass-card rounded-2xl overflow-hidden">
                            <div className="p-4 pb-3">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
                                            <ClipboardList className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-semibold">{task.title}</h2>
                                            <div className="flex flex-wrap gap-2 mt-1">
                                                <Badge className={STATUS_COLORS[task.status] || 'bg-gray-500'}>
                                                    {task.status.replace('_', ' ').toUpperCase()}
                                                </Badge>
                                                <Badge className={PRIORITY_COLORS[task.priority] || 'bg-gray-500'}>
                                                    {task.priority.toUpperCase()}
                                                </Badge>
                                                <Badge variant="outline">{TASK_TYPE_LABELS[task.task_type] || task.task_type}</Badge>
                                                {task.is_overdue && <Badge className="bg-red-600">OVERDUE</Badge>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="p-4 pt-0 space-y-4">
                                {task.description && (
                                    <div>
                                        <h4 className="text-sm font-medium text-muted-foreground mb-1">Description</h4>
                                        <p className="text-sm">{task.description}</p>
                                    </div>
                                )}

                                {task.target_barangay && task.target_barangay.length > 0 && (
                                    <div>
                                        <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                                            <MapPin className="h-4 w-4" />
                                            Target Barangays
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {task.target_barangay.map((brgy, idx) => (
                                                <Badge key={idx} variant="secondary">{brgy}</Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {task.remarks && (
                                    <div className="glass-surface rounded-xl p-4">
                                        <h4 className="text-sm font-medium text-primary mb-1">Remarks</h4>
                                        <p className="text-sm">{task.remarks}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Timeline */}
                        <div className="glass-card rounded-2xl overflow-hidden">
                            <div className="p-4 pb-3">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
                                        <Clock className="h-4 w-4" />
                                    </div>
                                    <h2 className="text-sm font-semibold">Progress Timeline</h2>
                                </div>
                            </div>
                            <div className="p-4 pt-0">
                                <div className="space-y-0">
                                    {getStatusTimeline().map((step, idx) => (
                                        <div key={idx} className="flex items-start gap-4">
                                            <div className="flex flex-col items-center">
                                                <div className={`h-4 w-4 rounded-full ${step.completed ? 'bg-primary' : 'bg-muted'}`} />
                                                {idx < getStatusTimeline().length - 1 && (
                                                    <div className={`w-0.5 h-12 ${step.completed ? 'bg-primary' : 'bg-muted'}`} />
                                                )}
                                            </div>
                                            <div className="flex-1 pb-4">
                                                <div className="font-medium">{step.label}</div>
                                                {step.date && (
                                                    <div className="text-sm text-muted-foreground">
                                                        {new Date(step.date).toLocaleString()}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Attachments */}
                        {task.attachments && task.attachments.length > 0 && (
                            <div className="glass-card rounded-2xl overflow-hidden">
                                <div className="p-4 pb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
                                            <Paperclip className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <h2 className="text-sm font-semibold">Attachments & Evidence</h2>
                                            <p className="text-xs text-muted-foreground">
                                                {task.attachments.length} file{task.attachments.length !== 1 ? 's' : ''} uploaded
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-4 pt-0 grid gap-3">
                                    {task.attachments.map((attachment) => (
                                        <div key={attachment.id} className="glass-surface rounded-xl p-3 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <Paperclip className="h-5 w-5 text-muted-foreground" />
                                                <div>
                                                    <div className="font-medium text-sm">
                                                        {attachment.file_path.split('/').pop()}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        Uploaded by {attachment.uploaded_by} • {new Date(attachment.created_at).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </div>
                                            <Button variant="outline" size="sm">Download</Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-5">
                        <div className="glass-card rounded-2xl overflow-hidden">
                            <div className="p-4 pb-3">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
                                        <User className="h-4 w-4" />
                                    </div>
                                    <h2 className="text-sm font-semibold">Assignment Details</h2>
                                </div>
                            </div>
                            <div className="p-4 pt-0 space-y-4">
                                <div>
                                    <div className="text-sm text-muted-foreground">Assigned To</div>
                                    <div className="flex items-center gap-2 mt-1">
                                        <User className="h-4 w-4 text-primary" />
                                        <div className="font-medium">{task.assigned_to.full_name}</div>
                                    </div>
                                    <div className="text-sm text-muted-foreground mt-1">
                                        {task.assigned_to.email}
                                    </div>
                                </div>

                                <div>
                                    <div className="text-sm text-muted-foreground">Assigned By</div>
                                    <div className="font-medium mt-1">{task.assigned_by.full_name}</div>
                                </div>

                                <div className="pt-4 border-t space-y-3">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-primary" />
                                        <div>
                                            <div className="text-sm text-muted-foreground">Due Date</div>
                                            <div className="font-medium">
                                                {new Date(task.due_date).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>

                                    {task.completed_at && (
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4 text-primary" />
                                            <div>
                                                <div className="text-sm text-muted-foreground">Completed At</div>
                                                <div className="font-medium">
                                                    {new Date(task.completed_at).toLocaleString()}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="glass-card rounded-2xl overflow-hidden">
                            <div className="p-4 pb-3">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
                                        <ClipboardList className="h-4 w-4" />
                                    </div>
                                    <h2 className="text-sm font-semibold">Task Metadata</h2>
                                </div>
                            </div>
                            <div className="p-4 pt-0 space-y-3 text-sm">
                                <div>
                                    <div className="text-muted-foreground">Task ID</div>
                                    <div className="font-mono">#{task.id}</div>
                                </div>
                                <div>
                                    <div className="text-muted-foreground">Created</div>
                                    <div>{new Date(task.created_at).toLocaleString()}</div>
                                </div>
                                <div>
                                    <div className="text-muted-foreground">Last Updated</div>
                                    <div>{new Date(task.updated_at).toLocaleString()}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Verify Dialog */}
                <Dialog open={verifyDialogOpen} onOpenChange={setVerifyDialogOpen}>
                    <DialogContent>
                        <form onSubmit={handleVerify}>
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                    <CheckCircle className="h-5 w-5 text-primary" />
                                    Verify Task
                                </DialogTitle>
                                <DialogDescription>
                                    Mark this task as verified. This action confirms the task has been completed satisfactorily.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="verify-remarks">Remarks (Optional)</Label>
                                    <Textarea
                                        id="verify-remarks"
                                        value={verifyForm.data.remarks}
                                        onChange={(e) => verifyForm.setData('remarks', e.target.value)}
                                        placeholder="Add any additional comments..."
                                        rows={3}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setVerifyDialogOpen(false)}>Cancel</Button>
                                <Button type="submit">Verify Task</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Reject Dialog */}
                <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
                    <DialogContent>
                        <form onSubmit={handleReject}>
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2 text-red-600">
                                    <XCircle className="h-5 w-5" />
                                    Reject Task
                                </DialogTitle>
                                <DialogDescription>
                                    This task will be sent back to the technician for revision. Please provide reasons for rejection.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="reject-remarks">Rejection Remarks *</Label>
                                    <Textarea
                                        id="reject-remarks"
                                        value={rejectForm.data.remarks}
                                        onChange={(e) => rejectForm.setData('remarks', e.target.value)}
                                        placeholder="Explain why this task is being rejected..."
                                        rows={4}
                                        required
                                    />
                                    {rejectForm.errors.remarks && (
                                        <p className="text-sm text-red-500">{rejectForm.errors.remarks}</p>
                                    )}
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
                                <Button type="submit" variant="destructive">Reject Task</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
