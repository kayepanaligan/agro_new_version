# Laravel Reverb Real-Time Integration Guide

## Overview

This guide covers the complete Laravel Reverb integration for real-time data synchronization across devices in the AgroProfiler application.

## Architecture

### Data Flow
```
Farmers/Technicians (Mobile/API) 
    ↓ Create/Update Data
    ↓ Broadcast Events via Reverb
Admin Dashboard ← Real-time Updates
    ↓ Review/Verify
Super Admin Dashboard ← Real-time Updates
```

## What's Been Implemented

### 1. Backend (Laravel)

#### Installed Packages
- `laravel/reverb` - WebSocket server
- `pusher/pusher-php-server` - PHP SDK for broadcasting

#### Event Classes Created
Located in `app/Events/`:

1. **FarmerCreated.php** - Broadcasts when new farmer is registered
2. **FarmerUpdated.php** - Broadcasts when farmer data is updated
3. **CropDamageRecordCreated.php** - Broadcasts when crop damage is reported
4. **TechnicianReportCreated.php** - Broadcasts when technician submits report
5. **TaskCreated.php** - Broadcasts when new task is assigned
6. **TaskUpdated.php** - Broadcasts when task status changes
7. **AnnouncementCreated.php** - Broadcasts when announcement is published

#### Channels Configuration
Located in `routes/channels.php`:

- `farmers` - Farmer-related updates
- `technicians` - Technician-related updates
- `admin` - Admin-level updates
- `super-admin` - Super admin exclusive updates
- `farmer.{id}` - Individual farmer updates
- `crop-damage.{id}` - Individual crop damage record updates
- `task.{id}` - Individual task updates
- `reports` - All technician reports

#### Controllers Updated
- `Admin\FarmerController` - Dispatches FarmerCreated/FarmerUpdated events
- `Api\FarmerController` - Dispatches events for API requests
- `Admin\CropDamageRecordController` - Dispatches CropDamageRecordCreated event

### 2. Frontend (React)

#### Installed Packages
- `laravel-echo` - Laravel's JavaScript WebSocket client
- `pusher-js` - Pusher JavaScript SDK

#### Services & Hooks Created

1. **echo.ts** - WebSocket service initialization
   - Location: `resources/js/services/echo.ts`
   - Configures connection to Reverb server

2. **use-websocket.ts** - React hooks for WebSocket
   - Location: `resources/js/hooks/use-websocket.ts`
   - Provides:
     - `useWebSocket()` - Generic WebSocket hook
     - `useFarmerEvents()` - Farmer-specific events
     - `useCropDamageEvents()` - Crop damage events
     - `useTechnicianReportEvents()` - Technician report events
     - `useTaskEvents()` - Task management events
     - `useAnnouncementEvents()` - Announcement events

3. **WebSocketContext.tsx** - Global WebSocket provider
   - Location: `resources/js/contexts/WebSocketContext.tsx`
   - Provides WebSocket context to all components

4. **real-time-notifications.tsx** - Notification UI component
   - Location: `resources/js/components/real-time-notifications.tsx`
   - Features:
     - Bell icon with unread count badge
     - Dropdown notification list
     - Categorized notifications with icons
     - Mark as read / Clear all functionality
     - Browser notifications support
     - Persistent storage in localStorage

## Configuration

### 1. Environment Variables (.env)

```env
BROADCAST_CONNECTION=reverb

# Reverb Configuration
REVERB_APP_ID=your-app-id
REVERB_APP_KEY=your-app-key
REVERB_APP_SECRET=your-app-secret
REVERB_HOST=127.0.0.1
REVERB_PORT=8080
REVERB_SCHEME=http

# Vite Environment Variables
VITE_REVERB_APP_KEY=${REVERB_APP_KEY}
VITE_REVERB_APP_CLUSTER=${REVERB_APP_CLUSTER}
```

### 2. Generate Reverb Keys

Run this command to generate keys:
```bash
php artisan reverb:install
```

Or manually generate and add to `.env`:
```bash
php artisan key:generate --show
```

Add the output to `.env`:
```env
REVERB_APP_ID=your-app-id
REVERB_APP_KEY=your-app-key  
REVERB_APP_SECRET=your-app-secret
```

## Running the Application

### Development Mode

You need to run **THREE** processes simultaneously:

#### Terminal 1: Laravel Server
```bash
php artisan serve
```

#### Terminal 2: Reverb WebSocket Server
```bash
php artisan reverb:start
```

For auto-reload during development:
```bash
php artisan reverb:start --debug
```

#### Terminal 3: Vite Dev Server
```bash
npm run dev
```

Or use the combined dev script (runs all three):
```bash
composer run dev
```

### Production Deployment

For production, you'll need:
1. Process manager (Supervisor) for Reverb
2. Reverse proxy (Nginx) for WebSocket connections
3. TLS/SSL for secure WebSocket (wss://)

#### Supervisor Configuration
```ini
[program:reverb]
process_name=%(program_name)s_%(process_num)02d
command=php /path/to/your/app/artisan reverb:start
autostart=true
autorestart=true
user=www-data
numprocs=1
redirect_stderr=true
stdout_logfile=/path/to/your/app/storage/logs/reverb.log
```

#### Nginx Configuration
```nginx
location /app/ {
    proxy_pass http://127.0.0.1:8080;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "Upgrade";
    proxy_set_header Host $host;
}
```

## Usage Examples

### 1. Using Hooks in Components

#### Basic WebSocket Usage
```tsx
import { useWebSocket } from '@/hooks/use-websocket';

function MyComponent() {
    const { subscribe, unsubscribe } = useWebSocket({ enabled: true });

    useEffect(() => {
        subscribe('farmers', 'farmer.created', (data) => {
            console.log('New farmer:', data.name);
            // Refresh data, show notification, etc.
        });

        return () => {
            unsubscribe('farmers', 'farmer.created');
        };
    }, [subscribe, unsubscribe]);

    return <div>...</div>;
}
```

#### Specialized Hooks
```tsx
import { useFarmerEvents, useCropDamageEvents } from '@/hooks/use-websocket';

function FarmersPage() {
    useFarmerEvents({
        onFarmerCreated: (data) => {
            console.log('New farmer created:', data);
            // Refresh farmer list
        },
        onFarmerUpdated: (data) => {
            console.log('Farmer updated:', data);
            // Update specific farmer in list
        },
    });

    return <div>...</div>;
}

function AdminDashboard() {
    useCropDamageEvents({
        onCropDamageCreated: (data) => {
            console.log('Crop damage reported:', data);
            // Show alert, update dashboard
        },
    });

    return <div>...</div>;
}
```

### 2. Using WebSocket Context

```tsx
import { useWebSocketContext } from '@/contexts/WebSocketContext';

function MyComponent() {
    const { subscribe, unsubscribe } = useWebSocketContext();

    useEffect(() => {
        subscribe('admin', 'task.created', (data) => {
            // Handle new task
        });

        return () => {
            unsubscribe('admin', 'task.created');
        };
    }, [subscribe, unsubscribe]);

    return <div>...</div>;
}
```

### 3. Real-Time Notifications

The notification component is already integrated in the header. It automatically:
- Listens to all broadcast events
- Displays unread count badge
- Shows categorized notifications with icons
- Persists notifications in localStorage

## Testing Real-Time Updates

### Test Scenario 1: Farmer Creation

1. **Device 1 (Admin Dashboard)**: Open `/admin/farmers`
2. **Device 2 (Mobile/API)**: Create new farmer via API
   ```bash
   curl -X POST http://localhost:8000/api/farmers \
     -H "Content-Type: application/json" \
     -d '{
       "first_name": "Juan",
       "last_name": "Dela Cruz",
       "sex": "Male",
       "birthdate": "1980-01-01"
     }'
   ```
3. **Expected Result**: Admin dashboard shows notification bell badge +1

### Test Scenario 2: Crop Damage Report

1. **Device 1 (Admin/Super Admin)**: Open dashboard
2. **Device 2 (Farmer Mobile App)**: Submit crop damage report
3. **Expected Result**: 
   - Real-time notification appears
   - Dashboard updates with new report count

### Test Scenario 3: Multi-Device Sync

1. **Device 1**: Open farmers list
2. **Device 2**: Open farmers list
3. **Device 3**: Create new farmer
4. **Expected**: Both Device 1 and 2 receive updates simultaneously

## Event Broadcasting Structure

### Event Payload Format
```json
{
    "id": 123,
    "name": "Juan Dela Cruz",
    "lfid": "LFID-2026-001",
    "message": "New farmer registered: Juan Dela Cruz",
    "timestamp": "2026-06-10T12:00:00.000Z"
}
```

### Channel Access Control

| Channel | Access |
|---------|--------|
| `farmers` | farmer, admin, super_admin |
| `technicians` | technician, admin, super_admin |
| `admin` | admin, super_admin |
| `super-admin` | super_admin only |
| `reports` | admin, super_admin |
| `farmer.{id}` | Public |
| `crop-damage.{id}` | Public |
| `task.{id}` | Public |

## Troubleshooting

### WebSocket Connection Issues

**Problem**: Not receiving real-time updates

**Solutions**:
1. Check if Reverb server is running:
   ```bash
   php artisan reverb:start --debug
   ```

2. Verify environment variables:
   ```bash
   php artisan config:clear
   php artisan cache:clear
   ```

3. Check browser console for connection errors

4. Verify VITE variables are set in `.env`:
   ```env
   VITE_REVERB_APP_KEY=your-key
   VITE_REVERB_APP_CLUSTER=your-cluster
   ```

### Events Not Broadcasting

**Problem**: Events are created but not broadcast

**Solutions**:
1. Check `BROADCAST_CONNECTION=reverb` in `.env`
2. Verify event class implements `ShouldBroadcast`
3. Check `broadcastOn()` method returns correct channels
4. Run queue worker (if using queue):
   ```bash
   php artisan queue:work
   ```

### CORS Issues

If WebSocket connections are blocked, update `config/cors.php`:
```php
'paths' => ['api/*', 'sanctum/csrf-cookie', 'broadcasting/auth'],
```

## Adding New Events

### Step 1: Create Event Class
```bash
php artisan make:event NewEventName
```

### Step 2: Implement ShouldBroadcast
```php
class NewEventName implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $data;

    public function __construct($data)
    {
        $this->data = $data;
    }

    public function broadcastOn(): array
    {
        return [
            new Channel('channel-name'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'event.name';
    }

    public function broadcastWith(): array
    {
        return [
            'key' => 'value',
        ];
    }
}
```

### Step 3: Dispatch Event
```php
event(new NewEventName($data));
```

### Step 4: Listen in Frontend
```tsx
subscribe('channel-name', 'event.name', (data) => {
    console.log('Received:', data);
});
```

## Performance Considerations

1. **Payload Size**: Keep broadcast data minimal
2. **Channel Subscription**: Only subscribe to needed channels
3. **Event Debouncing**: Debounce rapid updates if necessary
4. **Queue Broadcasting**: For heavy operations, use queued broadcasting:
   ```php
   class MyEvent implements ShouldBroadcastNow
   ```

## Security Notes

1. **Channel Authorization**: Define authorization in `routes/channels.php`
2. **Sensitive Data**: Never broadcast passwords, tokens, etc.
3. **Rate Limiting**: Implement rate limiting for event broadcasting
4. **HTTPS/WSS**: Use secure connections in production

## Next Steps

1. ✅ Install and configure Laravel Reverb
2. ✅ Create event classes for key operations
3. ✅ Update controllers to dispatch events
4. ✅ Set up frontend WebSocket connection
5. ✅ Create React hooks for event listening
6. ✅ Build notification UI component
7. ⏳ Add real-time data refresh to specific pages
8. ⏳ Implement live dashboard counters
9. ⏳ Add WebSocket connection status indicator
10. ⏳ Set up production deployment with Supervisor

## Resources

- [Laravel Reverb Documentation](https://laravel.com/docs/reverb)
- [Laravel Broadcasting Documentation](https://laravel.com/docs/broadcasting)
- [Laravel Echo Documentation](https://laravel.com/docs/broadcasting#client-installation)
- [Pusher JS Documentation](https://pusher.com/docs/channels/getting_started/javascript)
