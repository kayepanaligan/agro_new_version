# Real-Time Integration Examples

This document provides practical examples of how to integrate real-time updates into your existing pages.

## Example 1: Auto-Refresh Farmers List

When a new farmer is created from mobile/API, automatically refresh the farmers list on admin dashboard.

```tsx
// resources/js/pages/admin/farmers.tsx

import { useFarmerEvents } from '@/hooks/use-websocket';
import { router } from '@inertiajs/react';

export default function Farmers() {
    const { farmers } = usePage().props;

    // Real-time: Auto-refresh when farmer is created/updated
    useFarmerEvents({
        onFarmerCreated: (data) => {
            console.log('🔔 New farmer created:', data.name);
            // Refresh the farmers list
            router.reload({ only: ['farmers'] });
            
            // Optional: Show toast notification
            toast.success(`New farmer registered: ${data.name}`);
        },
        onFarmerUpdated: (data) => {
            console.log('🔔 Farmer updated:', data.name);
            router.reload({ only: ['farmers'] });
        },
    });

    // ... rest of your component
}
```

## Example 2: Live Dashboard Statistics

Update dashboard counters in real-time when new data arrives.

```tsx
// resources/js/pages/admin/dashboard.tsx

import { useFarmerEvents, useCropDamageEvents, useTechnicianReportEvents } from '@/hooks/use-websocket';
import { useState } from 'react';

export default function AdminDashboard() {
    const { totalFarmers, totalCropDamage, totalReports } = usePage().props;
    const [stats, setStats] = useState({
        farmers: totalFarmers,
        cropDamage: totalCropDamage,
        reports: totalReports,
    });

    // Update farmer count
    useFarmerEvents({
        onFarmerCreated: () => {
            setStats(prev => ({
                ...prev,
                farmers: prev.farmers + 1
            }));
        },
    });

    // Update crop damage count
    useCropDamageEvents({
        onCropDamageCreated: () => {
            setStats(prev => ({
                ...prev,
                cropDamage: prev.cropDamage + 1
            }));
        },
    });

    // Update reports count
    useTechnicianReportEvents({
        onReportCreated: () => {
            setStats(prev => ({
                ...prev,
                reports: prev.reports + 1
            }));
        },
    });

    return (
        <div className="grid grid-cols-3 gap-4">
            <StatCard title="Total Farmers" value={stats.farmers} icon="👨‍🌾" />
            <StatCard title="Crop Damage Reports" value={stats.cropDamage} icon="⚠️" />
            <StatCard title="Technician Reports" value={stats.reports} icon="📋" />
        </div>
    );
}
```

## Example 3: Real-Time Task Updates

When admin assigns a task, technician sees it immediately.

```tsx
// resources/js/pages/technician/tasks.tsx

import { useTaskEvents } from '@/hooks/use-websocket';
import { router } from '@inertiajs/react';

export default function TechnicianTasks() {
    const { tasks } = usePage().props;

    useTaskEvents({
        onTaskCreated: (data) => {
            console.log('📌 New task assigned:', data.title);
            router.reload({ only: ['tasks'] });
            
            // Show browser notification
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification('New Task Assigned', {
                    body: data.title,
                    icon: '/logo.svg',
                });
            }
        },
        onTaskUpdated: (data) => {
            console.log('📝 Task updated:', data.title);
            router.reload({ only: ['tasks'] });
        },
    });

    return <div>...</div>;
}
```

## Example 4: Crop Damage Alerts for Admin

Show immediate alert when crop damage is reported.

```tsx
// resources/js/pages/admin/crop-damage-records.tsx

import { useCropDamageEvents } from '@/hooks/use-websocket';
import { router } from '@inertiajs/react';
import { toast } from 'sonner'; // or your toast library

export default function CropDamageRecords() {
    useCropDamageEvents({
        onCropDamageCreated: (data) => {
            console.log('⚠️ Crop damage reported:', data);
            
            // Show urgent notification
            toast.warning('New Crop Damage Report', {
                description: `${data.farmer_name} - ${data.damage_category}`,
                action: {
                    label: 'View',
                    onClick: () => router.visit(`/admin/crop-damage/${data.id}`),
                },
            });

            // Refresh the list
            router.reload({ only: ['cropDamageRecords'] });
        },
    });

    return <div>...</div>;
}
```

## Example 5: Announcement Broadcast

All users see new announcements instantly.

```tsx
// resources/js/pages/farmer/dashboard.tsx

import { useAnnouncementEvents } from '@/hooks/use-websocket';
import { toast } from 'sonner';

export default function FarmerDashboard() {
    useAnnouncementEvents({
        onAnnouncementCreated: (data) => {
            console.log('📢 New announcement:', data.title);
            
            toast.info('📢 New Announcement', {
                title: data.title,
                description: data.content,
                duration: 10000, // Show for 10 seconds
            });
        },
    });

    return <div>...</div>;
}
```

## Example 6: Multi-Channel Listening

Listen to multiple event types in one component.

```tsx
// resources/js/pages/super-admin/dashboard.tsx

import { useWebSocket } from '@/hooks/use-websocket';
import { useEffect } from 'react';
import { router } from '@inertiajs/react';

export default function SuperAdminDashboard() {
    const { subscribe, unsubscribeAll } = useWebSocket({ enabled: true });

    useEffect(() => {
        // Listen to farmer events
        subscribe('farmers', 'farmer.created', (data) => {
            console.log('👨‍🌾 New farmer:', data);
            router.reload({ only: ['stats'] });
        });

        // Listen to technician reports
        subscribe('reports', 'technician-report.created', (data) => {
            console.log('📋 New report:', data);
            router.reload({ only: ['stats'] });
        });

        // Listen to crop damage
        subscribe('crop-damage', 'crop-damage.created', (data) => {
            console.log('⚠️ Crop damage:', data);
            router.reload({ only: ['stats'] });
        });

        // Listen to tasks
        subscribe('admin', 'task.created', (data) => {
            console.log('📌 New task:', data);
            router.reload({ only: ['stats'] });
        });

        // Cleanup
        return () => {
            unsubscribeAll();
        };
    }, [subscribe, unsubscribeAll]);

    return <div>...</div>;
}
```

## Example 7: Connection Status Indicator

Show WebSocket connection status to users.

```tsx
// resources/js/components/websocket-status.tsx

import { useEffect, useState } from 'react';
import { getEcho } from '@/services/echo';
import { Badge } from '@/components/ui/badge';

export function WebSocketStatus() {
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        const echo = getEcho();
        
        if (echo) {
            setConnected(true);

            // Listen for disconnect
            echo.connector.pusher.connection.bind('disconnected', () => {
                setConnected(false);
            });

            // Listen for reconnection
            echo.connector.pusher.connection.bind('connected', () => {
                setConnected(true);
            });
        }

        return () => {
            if (echo) {
                echo.connector.pusher.connection.unbind('disconnected');
                echo.connector.pusher.connection.unbind('connected');
            }
        };
    }, []);

    return (
        <Badge variant={connected ? 'default' : 'destructive'} className="text-xs">
            {connected ? '🟢 Live' : '🔴 Offline'}
        </Badge>
    );
}
```

## Example 8: Custom Toast Notifications

Create a dedicated notification handler.

```tsx
// resources/js/hooks/use-real-time-notifications.ts

import { useWebSocket } from '@/hooks/use-websocket';
import { useEffect } from 'react';
import { toast } from 'sonner';

export function useRealTimeNotifications() {
    const { subscribe, unsubscribeAll } = useWebSocket({ enabled: true });

    useEffect(() => {
        // Farmer notifications
        subscribe('farmers', 'farmer.created', (data) => {
            toast.success('👨‍🌾 New Farmer Registered', {
                description: data.message,
            });
        });

        // Crop damage alerts
        subscribe('crop-damage', 'crop-damage.created', (data) => {
            toast.warning('⚠️ Crop Damage Reported', {
                description: `${data.farmer_name} - ${data.severity} severity`,
            });
        });

        // Task notifications
        subscribe('admin', 'task.created', (data) => {
            toast.info('📌 New Task Assigned', {
                description: data.title,
            });
        });

        return () => {
            unsubscribeAll();
        };
    }, [subscribe, unsubscribeAll]);
}

// Usage in any component:
// useRealTimeNotifications();
```

## Example 9: Conditional Event Handling

Only handle events for specific users or data.

```tsx
// resources/js/pages/technician/my-tasks.tsx

import { useWebSocket } from '@/hooks/use-websocket';
import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';

export default function MyTasks() {
    const { auth } = usePage().props;
    const { subscribe, unsubscribe } = useWebSocket({ enabled: true });

    useEffect(() => {
        subscribe('admin', 'task.created', (data) => {
            // Only refresh if task is assigned to current user
            if (data.assigned_to === auth.user.name) {
                console.log('📌 You have a new task!');
                router.reload({ only: ['tasks'] });
            }
        });

        return () => {
            unsubscribe('admin', 'task.created');
        };
    }, [subscribe, unsubscribe, auth.user.name]);

    return <div>...</div>;
}
```

## Example 10: Debounced Refresh

Prevent excessive page reloads with debouncing.

```tsx
// resources/js/pages/admin/farmers.tsx

import { useFarmerEvents } from '@/hooks/use-websocket';
import { router } from '@inertiajs/react';
import { useCallback } from 'react';
import { debounce } from 'lodash';

export default function Farmers() {
    // Debounced refresh (max 1 refresh per 2 seconds)
    const debouncedRefresh = useCallback(
        debounce(() => {
            router.reload({ only: ['farmers'] });
        }, 2000),
        []
    );

    useFarmerEvents({
        onFarmerCreated: debouncedRefresh,
        onFarmerUpdated: debouncedRefresh,
    });

    return <div>...</div>;
}
```

## Tips & Best Practices

### 1. Choose the Right Hook
- Use **specialized hooks** (`useFarmerEvents`, etc.) for simple cases
- Use **generic `useWebSocket`** for custom channel/event combinations

### 2. Performance Optimization
- Only subscribe to channels you need
- Use debouncing for frequent events
- Avoid full page reloads; update state instead when possible

### 3. Error Handling
```tsx
useWebSocket({
    enabled: true,
    onError: (error) => {
        console.error('WebSocket error:', error);
        toast.error('Connection lost. Trying to reconnect...');
    },
});
```

### 4. Conditional Subscription
```tsx
const { subscribe } = useWebSocket({ 
    enabled: userRole === 'admin' // Only admins get WebSocket
});
```

### 5. Manual Data Update (Instead of Reload)
```tsx
useFarmerEvents({
    onFarmerCreated: (data) => {
        // Instead of router.reload(), update state directly
        setFarmers(prev => [data, ...prev]);
    },
});
```

---

**Next Steps:**
1. Pick the example that matches your use case
2. Adapt it to your page/component
3. Test with multiple browser windows
4. Monitor browser console for events
