import { useState, useMemo } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
    Calendar as CalendarIcon, 
    ChevronLeft, 
    ChevronRight, 
    ClipboardList, 
    FileText,
    Clock,
    MapPin,
    User,
    AlertCircle,
    CheckCircle2,
    XCircle,
    Sprout,
    UserCheck,
    Package,
    UserPlus,
    AlertTriangle
} from 'lucide-react';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Activity Calendar',
        href: '/admin/calendar',
    },
];

interface CalendarEvent {
    id: number;
    title: string;
    type: 'task' | 'report';
    task_type?: string;
    report_type?: string;
    status: string;
    priority?: string;
    date: string;
    start_time?: string | null;
    end_time?: string | null;
    assigned_to: string;
    url: string;
}

interface Stats {
    total_tasks: number;
    completed_tasks: number;
    pending_tasks: number;
    overdue_tasks: number;
    total_reports: number;
    verified_reports: number;
}

interface Props {
    events: CalendarEvent[];
    stats: Stats;
    currentMonth: string;
    filters: any;
}

export default function Calendar({ events, stats, currentMonth }: Props) {
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [showEventDialog, setShowEventDialog] = useState(false);
    const [selectedEvents, setSelectedEvents] = useState<CalendarEvent[]>([]);
    
    const currentDate = new Date(currentMonth + '-01');
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Get calendar days
    const calendarDays = useMemo(() => {
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        const days = [];
        
        // Previous month days
        const prevMonthLastDay = new Date(year, month, 0).getDate();
        for (let i = startingDayOfWeek - 1; i >= 0; i--) {
            days.push({
                date: prevMonthLastDay - i,
                currentMonth: false,
                fullDate: new Date(year, month - 1, prevMonthLastDay - i)
            });
        }

        // Current month days
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dateStr = date.toISOString().split('T')[0];
            const dayEvents = events.filter(e => e.date === dateStr);
            
            days.push({
                date: day,
                currentMonth: true,
                fullDate: date,
                events: dayEvents,
                isToday: date.toDateString() === new Date().toDateString()
            });
        }

        // Next month days
        const remainingDays = 42 - days.length; // 6 rows * 7 days
        for (let day = 1; day <= remainingDays; day++) {
            days.push({
                date: day,
                currentMonth: false,
                fullDate: new Date(year, month + 1, day)
            });
        }

        return days;
    }, [year, month, events]);

    const navigateMonth = (direction: number) => {
        const newDate = new Date(year, month + direction, 1);
        const newMonth = newDate.toISOString().slice(0, 7);
        router.get('/admin/calendar', { month: newMonth }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleDateClick = (day: any) => {
        if (!day.currentMonth) return;
        
        const dateStr = day.fullDate.toISOString().split('T')[0];
        const dayEvents = events.filter(e => e.date === dateStr);
        
        if (dayEvents.length > 0) {
            setSelectedDate(dateStr);
            setSelectedEvents(dayEvents);
            setShowEventDialog(true);
        }
    };

    const getStatusColor = (event: CalendarEvent) => {
        if (event.type === 'task') {
            switch (event.status) {
                case 'verified': return 'bg-green-500';
                case 'submitted': return 'bg-blue-500';
                case 'in_progress': return 'bg-yellow-500';
                case 'rejected': return 'bg-red-500';
                default: return 'bg-gray-400';
            }
        } else {
            switch (event.status) {
                case 'verified': return 'bg-green-500';
                case 'submitted': return 'bg-blue-500';
                case 'rejected': return 'bg-red-500';
                default: return 'bg-gray-400';
            }
        }
    };

    const getTaskTypeIcon = (taskType?: string) => {
        const icons: Record<string, React.ReactNode> = {
            'monitor_crops': <Sprout className="h-3 w-3" />,
            'verify_farmers': <UserCheck className="h-3 w-3" />,
            'distribute_allocation': <Package className="h-3 w-3" />,
            'register_farmers': <UserPlus className="h-3 w-3" />,
            'crop_damage_assessment': <AlertTriangle className="h-3 w-3" />,
        };
        return taskType ? icons[taskType] || <ClipboardList className="h-3 w-3" /> : <ClipboardList className="h-3 w-3" />;
    };

    const getTypeIcon = (type: string) => {
        return type === 'task' ? <ClipboardList className="h-4 w-4" /> : <FileText className="h-4 w-4" />;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Activity Calendar" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                            <CalendarIcon className="h-7 w-7 text-primary" />
                            Activity Calendar
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            View all scheduled tasks and technician activities
                        </p>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-primary">{stats.total_tasks}</div>
                                <div className="text-sm text-muted-foreground mt-1">Total Tasks</div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-green-600">{stats.completed_tasks}</div>
                                <div className="text-sm text-muted-foreground mt-1">Completed</div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-amber-600">{stats.pending_tasks}</div>
                                <div className="text-sm text-muted-foreground mt-1">In Progress</div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-blue-600">{stats.total_reports}</div>
                                <div className="text-sm text-muted-foreground mt-1">Reports Filed</div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Calendar */}
                <Card>
                    <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-2xl font-bold">
                                {monthNames[month]} {year}
                            </CardTitle>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="icon" onClick={() => navigateMonth(-1)}>
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => {
                                    const today = new Date().toISOString().slice(0, 7);
                                    router.get('/admin/calendar', { month: today });
                                }}>
                                    Today
                                </Button>
                                <Button variant="outline" size="icon" onClick={() => navigateMonth(1)}>
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {/* Day Names Header */}
                        <div className="grid grid-cols-7 gap-px mb-2">
                            {dayNames.map((day) => (
                                <div key={day} className="text-center text-sm font-semibold text-muted-foreground py-2">
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Calendar Grid */}
                        <div className="grid grid-cols-7 gap-px">
                            {calendarDays.map((day, index) => (
                                <div
                                    key={index}
                                    onClick={() => handleDateClick(day)}
                                    className={`min-h-[100px] p-2 border rounded-lg cursor-pointer transition-all ${
                                        day.currentMonth 
                                            ? 'bg-white hover:bg-accent/50' 
                                            : 'bg-gray-50 opacity-50'
                                    } ${
                                        day.isToday ? 'ring-2 ring-primary' : ''
                                    }`}
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <span className={`text-sm font-medium ${
                                            day.isToday 
                                                ? 'bg-primary text-primary-foreground w-7 h-7 rounded-full flex items-center justify-center' 
                                                : ''
                                        }`}>
                                            {day.date}
                                        </span>
                                        {day.currentMonth && day.events && day.events.length > 0 && (
                                            <Badge variant="secondary" className="text-xs">
                                                {day.events.length}
                                            </Badge>
                                        )}
                                    </div>
                                    
                                    {day.currentMonth && day.events && (
                                        <div className="space-y-1">
                                            {day.events.slice(0, 3).map((event, idx) => (
                                                <div
                                                    key={idx}
                                                    className={`text-xs p-1 rounded truncate ${getStatusColor(event)} text-white`}
                                                    title={event.title}
                                                >
                                                    <span className="mr-1">{getTaskTypeIcon(event.task_type)}</span>
                                                    {event.title}
                                                </div>
                                            ))}
                                            {day.events.length > 3 && (
                                                <div className="text-xs text-muted-foreground pl-1">
                                                    +{day.events.length - 3} more
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Event Dialog */}
            <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <CalendarIcon className="h-5 w-5" />
                            Events for {selectedDate && new Date(selectedDate).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </DialogTitle>
                    </DialogHeader>
                    
                    <div className="space-y-4 mt-4">
                        {selectedEvents.map((event) => (
                            <Link key={event.id} href={event.url}>
                                <Card className="hover:bg-accent/50 cursor-pointer transition-all">
                                    <CardContent className="pt-4">
                                        <div className="flex items-start gap-3">
                                            <div className={`p-2 rounded-lg ${getStatusColor(event)} text-white`}>
                                                {getTypeIcon(event.type)}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-semibold">{event.title}</h3>
                                                    <Badge variant="outline" className="text-xs capitalize">
                                                        {event.type}
                                                    </Badge>
                                                    {event.priority && (
                                                        <Badge className={`text-xs ${
                                                            event.priority === 'high' ? 'bg-red-500' :
                                                            event.priority === 'medium' ? 'bg-yellow-500' :
                                                            'bg-blue-500'
                                                        }`}>
                                                            {event.priority}
                                                        </Badge>
                                                    )}
                                                </div>
                                                
                                                <div className="space-y-1 text-sm text-muted-foreground">
                                                    <div className="flex items-center gap-2">
                                                        <User className="h-3 w-3" />
                                                        <span>{event.assigned_to}</span>
                                                    </div>
                                                    {event.start_time && (
                                                        <div className="flex items-center gap-2">
                                                            <Clock className="h-3 w-3" />
                                                            <span>
                                                                {new Date(event.start_time).toLocaleTimeString()} - 
                                                                {event.end_time && new Date(event.end_time).toLocaleTimeString()}
                                                            </span>
                                                        </div>
                                                    )}
                                                    <div className="flex items-center gap-2">
                                                        {event.status === 'verified' ? (
                                                            <CheckCircle2 className="h-3 w-3 text-green-600" />
                                                        ) : event.status === 'rejected' ? (
                                                            <XCircle className="h-3 w-3 text-red-600" />
                                                        ) : (
                                                            <AlertCircle className="h-3 w-3 text-amber-600" />
                                                        )}
                                                        <span className="capitalize">{event.status.replace('_', ' ')}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
