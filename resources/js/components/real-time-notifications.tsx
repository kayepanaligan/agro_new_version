import { useEffect, useState } from 'react';
import { Bell, X } from 'lucide-react';
import { useWebSocketContext } from '@/contexts/WebSocketContext';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface Notification {
    id: string;
    message: string;
    type: string;
    timestamp: string;
    data: any;
    read: boolean;
}

export function RealTimeNotifications({ compact = false }: { compact?: boolean }) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const { subscribe, unsubscribe } = useWebSocketContext();

    useEffect(() => {
        // Load notifications from localStorage
        const saved = localStorage.getItem('realtime_notifications');
        if (saved) {
            const parsed = JSON.parse(saved);
            setNotifications(parsed);
            setUnreadCount(parsed.filter((n: Notification) => !n.read).length);
        }

        // Subscribe to various events
        subscribe('farmers', 'farmer.created', (data) => {
            addNotification({
                message: data.message,
                type: 'farmer.created',
                timestamp: data.timestamp,
                data,
            });
        });

        subscribe('farmers', 'farmer.updated', (data) => {
            addNotification({
                message: data.message,
                type: 'farmer.updated',
                timestamp: data.timestamp,
                data,
            });
        });

        subscribe('crop-damage', 'crop-damage.created', (data) => {
            addNotification({
                message: data.message,
                type: 'crop-damage.created',
                timestamp: data.timestamp,
                data,
            });
        });

        subscribe('reports', 'technician-report.created', (data) => {
            addNotification({
                message: data.message,
                type: 'technician-report.created',
                timestamp: data.timestamp,
                data,
            });
        });

        subscribe('admin', 'task.created', (data) => {
            addNotification({
                message: data.message,
                type: 'task.created',
                timestamp: data.timestamp,
                data,
            });
        });

        subscribe('farmers', 'announcement.created', (data) => {
            addNotification({
                message: data.message,
                type: 'announcement.created',
                timestamp: data.timestamp,
                data,
            });
        });

        return () => {
            unsubscribe('farmers', 'farmer.created');
            unsubscribe('farmers', 'farmer.updated');
            unsubscribe('crop-damage', 'crop-damage.created');
            unsubscribe('reports', 'technician-report.created');
            unsubscribe('admin', 'task.created');
            unsubscribe('farmers', 'announcement.created');
        };
    }, [subscribe, unsubscribe]);

    const addNotification = (notification: Omit<Notification, 'id' | 'read'>) => {
        const newNotification: Notification = {
            ...notification,
            id: `${Date.now()}-${Math.random()}`,
            read: false,
        };

        setNotifications((prev) => {
            const updated = [newNotification, ...prev].slice(0, 50); // Keep last 50 notifications
            localStorage.setItem('realtime_notifications', JSON.stringify(updated));
            return updated;
        });

        setUnreadCount((prev) => prev + 1);

        // Show browser notification if permitted
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('AgroProfiler Update', {
                body: notification.message,
                icon: '/logo.svg',
            });
        }
    };

    const markAsRead = (id: string) => {
        setNotifications((prev) => {
            const updated = prev.map((n) => (n.id === id ? { ...n, read: true } : n));
            localStorage.setItem('realtime_notifications', JSON.stringify(updated));
            setUnreadCount(updated.filter((n) => !n.read).length);
            return updated;
        });
    };

    const markAllAsRead = () => {
        setNotifications((prev) => {
            const updated = prev.map((n) => ({ ...n, read: true }));
            localStorage.setItem('realtime_notifications', JSON.stringify(updated));
            setUnreadCount(0);
            return updated;
        });
    };

    const clearAll = () => {
        setNotifications([]);
        setUnreadCount(0);
        localStorage.removeItem('realtime_notifications');
    };

    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'farmer.created':
                return '👨‍🌾';
            case 'farmer.updated':
                return '✏️';
            case 'crop-damage.created':
                return '⚠️';
            case 'technician-report.created':
                return '📋';
            case 'task.created':
                return '📌';
            case 'announcement.created':
                return '📢';
            default:
                return '🔔';
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className={cn(
                    'relative flex items-center justify-center transition-colors hover:bg-primary/10 hover:text-primary rounded-lg',
                    compact ? 'h-8 w-8' : 'h-9 w-9'
                )}>
                    <Bell className={cn(compact ? 'h-4 w-4' : 'h-5 w-5')} />
                    {unreadCount > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -right-1 -top-1 h-4 w-4 rounded-full p-0 text-[9px] flex items-center justify-center"
                        >
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </Badge>
                    )}
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
                <div className="flex items-center justify-between border-b p-3">
                    <h3 className="font-semibold">Notifications</h3>
                    <div className="flex gap-2">
                        {unreadCount > 0 && (
                            <Button variant="ghost" size="sm" onClick={markAllAsRead} className="h-7 px-2 text-xs">
                                Mark all read
                            </Button>
                        )}
                        {notifications.length > 0 && (
                            <Button variant="ghost" size="sm" onClick={clearAll} className="h-7 px-2 text-xs">
                                Clear all
                            </Button>
                        )}
                    </div>
                </div>
                <ScrollArea className="h-96">
                    {notifications.length === 0 ? (
                        <div className="p-8 text-center text-sm text-muted-foreground">
                            No notifications yet
                        </div>
                    ) : (
                        <div className="divide-y">
                            {notifications.map((notification) => (
                                <DropdownMenuItem
                                    key={notification.id}
                                    onClick={() => markAsRead(notification.id)}
                                    className={`flex cursor-pointer flex-col gap-1 p-3 ${
                                        !notification.read ? 'bg-muted/50' : ''
                                    }`}
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex items-start gap-2">
                                            <span className="text-lg">
                                                {getNotificationIcon(notification.type)}
                                            </span>
                                            <div>
                                                <p className="text-sm">{notification.message}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {formatTime(notification.timestamp)}
                                                </p>
                                            </div>
                                        </div>
                                        {!notification.read && (
                                            <div className="h-2 w-2 shrink-0 rounded-full bg-primary" />
                                        )}
                                    </div>
                                </DropdownMenuItem>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export default RealTimeNotifications;
