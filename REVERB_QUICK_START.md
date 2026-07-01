# Quick Start: Laravel Reverb Real-Time Updates

## 🚀 Getting Started in 3 Steps

### Step 1: Generate Reverb Keys

```bash
php artisan reverb:install
```

This will automatically add the necessary keys to your `.env` file:
- `REVERB_APP_ID`
- `REVERB_APP_KEY`
- `REVERB_APP_SECRET`

### Step 2: Start All Services

#### Option A: Single Command (Recommended)
```bash
composer run dev
```

This starts all 4 services simultaneously:
- ✅ Laravel Server (port 8000)
- ✅ Queue Worker
- ✅ Reverb WebSocket Server (port 8080)
- ✅ Vite Dev Server

#### Option B: Manual (Separate Terminals)

**Terminal 1:**
```bash
php artisan serve
```

**Terminal 2:**
```bash
php artisan queue:listen --tries=1
```

**Terminal 3:**
```bash
php artisan reverb:start
```

**Terminal 4:**
```bash
npm run dev
```

### Step 3: Test Real-Time Updates

1. Open `http://localhost:8000` in **Browser Window 1** (Admin Dashboard)
2. Open `http://localhost:8000` in **Browser Window 2** (or another device)
3. In Browser 2, create a new farmer
4. **Watch Browser 1**: You should see a notification bell badge appear! 🔔

## 📱 Testing Different Scenarios

### Test 1: Farmer Registration
```bash
# In terminal or API client
curl -X POST http://localhost:8000/api/farmers \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Juan",
    "last_name": "Dela Cruz",
    "sex": "Male",
    "birthdate": "1980-01-01"
  }'
```

**Expected**: All admin dashboards show notification instantly

### Test 2: Crop Damage Report
- Farmer submits crop damage via mobile app
- Admin/Technician dashboards receive real-time alert

### Test 3: Task Assignment
- Admin creates task
- Assigned technician receives notification
- Super admin sees update in dashboard

## 🔍 Verification Checklist

- [ ] Reverb server is running on port 8080
- [ ] Browser console shows "✅ WebSocket connected"
- [ ] Notification bell icon appears in header
- [ ] Creating data in one window shows notification in another
- [ ] Notification badge count increases
- [ ] Clicking bell shows notification dropdown

## 🐛 Troubleshooting

### No WebSocket Connection
```bash
# Check if Reverb is running
php artisan reverb:start --debug

# Clear config cache
php artisan config:clear
php artisan cache:clear
```

### Events Not Broadcasting
```bash
# Check .env has correct settings
BROADCAST_CONNECTION=reverb
REVERB_APP_ID=xxx
REVERB_APP_KEY=xxx
REVERB_APP_SECRET=xxx

# Restart Reverb server
php artisan reverb:stop
php artisan reverb:start
```

### Vite Can't Connect to Reverb
```bash
# Verify VITE variables in .env
VITE_REVERB_APP_KEY=your-key-here
VITE_REVERB_APP_CLUSTER=your-cluster-here

# Restart Vite
npm run dev
```

## 📊 Monitor Real-Time Activity

### View Reverb Logs
```bash
php artisan reverb:start --debug
```

### Check Connected Clients
```bash
php artisan reverb:status
```

### Browser Console
Open DevTools → Console to see:
- ✅ WebSocket connected
- 📡 Event received logs
- ⚠️ Any connection errors

## 🎯 Next Steps

1. **Add Real-Time Refresh to Pages**: Use the hooks to auto-refresh data
2. **Live Dashboard Counters**: Update stats in real-time
3. **Connection Status Indicator**: Show WebSocket status to users
4. **Custom Notifications**: Add more event types as needed

## 📚 Example: Auto-Refresh Farmers List

```tsx
import { useFarmerEvents } from '@/hooks/use-websocket';
import { router } from '@inertiajs/react';

function FarmersPage() {
    useFarmerEvents({
        onFarmerCreated: () => {
            // Refresh the farmers list
            router.reload({ only: ['farmers'] });
        },
        onFarmerUpdated: () => {
            router.reload({ only: ['farmers'] });
        },
    });

    return <div>...</div>;
}
```

## 🌐 Production Deployment

For production, you'll need:

1. **Supervisor** to keep Reverb running:
```ini
[program:reverb]
command=php /path/to/app/artisan reverb:start
autostart=true
autorestart=true
```

2. **Nginx** WebSocket proxy:
```nginx
location /app/ {
    proxy_pass http://127.0.0.1:8080;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "Upgrade";
}
```

3. **SSL/WSS** for secure connections

---

**Need Help?** Check [REVERB_INTEGRATION.md](./REVERB_INTEGRATION.md) for complete documentation.
