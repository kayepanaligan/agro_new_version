# Offline-First PWA Documentation

## Overview

AgroProfiler is now an offline-first Progressive Web App (PWA) that allows agricultural technicians to collect and manage farmer data even without internet connectivity. The app automatically synchronizes changes when connectivity is restored.

## Key Features

### 1. **Offline Data Storage**
- All farmer and farm data is cached locally using IndexedDB (via Dexie.js)
- Reference data (commodities, varieties, damage types, programs) is pre-cached on app load
- Service workers cache static assets and API responses

### 2. **Automatic Synchronization**
- Changes made while offline are queued for later sync
- Auto-sync triggers when internet connection is restored
- Manual sync button available for users to trigger sync on demand

### 3. **Conflict Resolution**
- Server data takes precedence in case of conflicts
- Duplicate LFID detection prevents data corruption
- Registration status transitions are validated to maintain workflow integrity
- Idempotency via operation IDs prevents duplicate processing

### 4. **Visual Status Indicators**
- Online/Offline status badge in sidebar
- Unsynced changes counter shows pending operations
- Sync progress indicator during synchronization

## Architecture

### Client-Side (React + TypeScript)

#### Database Layer (`resources/js/db/`)
- `index.ts`: Dexie database instance with table definitions
- `operations/farmers.ts`: Farmer CRUD operations with caching
- `operations/queue.ts`: Offline queue management
- `operations/reference-data.ts`: Reference data caching

#### Services
- `services/api.ts`: Enhanced API client with offline support
- `services/sync.ts`: Sync manager for processing queue
- `services/reference-data.ts`: Reference data service with caching

#### Components
- `components/offline-status-indicator.tsx`: Shows online/offline status and sync controls
- `contexts/NetworkContext.tsx`: Network status React context

### Server-Side (Laravel)

#### Controllers
- `app/Http/Controllers/Api/SyncController.php`: Processes queued operations
- Validates data, handles conflicts, enforces uniqueness

#### Database
- `sync_logs` table: Tracks synced operations for idempotency

## How It Works

### Data Flow

```
User Action → Update IndexedDB → Update UI (Optimistic)
     ↓
If Online → Send to Server Immediately
If Offline → Queue Operation
     ↓
On Reconnect → Process Queue → Resolve Conflicts
```

### Caching Strategy

| Resource Type | Strategy | Details |
|--------------|----------|---------|
| Static Assets (JS/CSS) | Cache First | Cached with version invalidation |
| Images | Cache First | 7-day expiration |
| API GET Requests | Network First | Falls back to cache if offline |
| Reference Data | Stale While Revalidate | 1-hour TTL with background refresh |
| User Data | Optimistic UI + Queue | Local-first with sync queue |

### Sync Process

1. **Queue Creation**: When user creates/updates/deletes data offline:
   - Operation is added to `offline_queue` table in IndexedDB
   - UI updates immediately (optimistic update)
   - Operation gets unique UUID for idempotency

2. **Auto-Sync Trigger**: When browser detects online status:
   - `app-online` event fires
   - Sync manager processes queue sequentially
   - Each operation sent to `/api/sync` endpoint

3. **Server Processing**: Laravel receives batch of operations:
   - Validates each operation
   - Checks for duplicates (LFID, etc.)
   - Validates workflow transitions
   - Creates/updates/deletes records
   - Logs operation ID for idempotency

4. **Conflict Handling**:
   - If server has newer data → Server wins
   - If duplicate LFID → Reject with error
   - If invalid transition → Reject with error
   - Failed operations remain in queue for retry

5. **Cleanup**: Successfully synced operations are removed from queue

## Usage

### For Technicians

1. **Working Offline**:
   - App works normally even without internet
   - All forms and data collection features available
   - Changes saved locally and marked as "unsynced"

2. **Synchronizing**:
   - When internet returns, app shows "Online" status
   - Click the WiFi icon next to unsynced count to sync manually
   - Or wait for automatic sync (happens within seconds)
   - Watch sync progress in real-time

3. **Status Indicators**:
   - 🟢 **Online** (green): Connected to internet
   - 🔴 **Offline** (red): No internet connection
   - 🟡 **Unsynced** (amber): X changes waiting to sync
   - 🔵 **Syncing** (blue): Currently synchronizing

### For Developers

#### Adding New Entity Types

1. **Add TypeScript Types** (`resources/js/types/index.ts`):
```typescript
export interface MyEntity {
    id: number;
    // ... fields
}

export interface CachedMyEntity extends MyEntity {
    _cached_at: string;
    _is_dirty: boolean;
}
```

2. **Create Database Operations** (`resources/js/db/operations/my-entity.ts`):
```typescript
import { db } from '../index';

export async function getMyEntities(): Promise<CachedMyEntity[]> {
    return await db.my_entities.toArray();
}

// ... other CRUD operations
```

3. **Update API Client** (`resources/js/services/api.ts`):
```typescript
export const myEntityApi = {
    async index() {
        return await apiFetch<MyEntity[]>('/api/my-entities');
    },
    // ... other methods
};
```

4. **Update SyncController** (`app/Http/Controllers/Api/SyncController.php`):
```php
private function processOperation(array $operation): array
{
    switch ($entityType) {
        case 'my_entity':
            return $this->processMyEntityOperation($actionType, $payload);
        // ...
    }
}
```

#### Customizing Sync Behavior

Edit `resources/js/services/sync.ts`:
- `MAX_RETRIES`: Maximum retry attempts before giving up
- `SYNC_DELAY_MS`: Delay between syncing operations
- `processQueueItem()`: Custom error handling logic

#### Adding Reference Data

Edit `resources/js/services/reference-data.ts`:
```typescript
async myReferenceData(): Promise<MyData[]> {
    const cached = await getCachedReferenceData('my_data');
    if (cached) return cached;
    
    const data = await fetchFromApi('/api/my-data');
    await cacheReferenceData('my_data', data, CACHE_TTL);
    return data;
}
```

## Testing

### Manual Testing Scenarios

1. **Offline Create**:
   - Turn off WiFi
   - Create new farmer record
   - Verify it appears in list with "unsynced" badge
   - Turn on WiFi
   - Verify auto-sync completes
   - Verify badge disappears

2. **Offline Update**:
   - Turn off WiFi
   - Edit existing farmer
   - Verify changes appear immediately
   - Turn on WiFi
   - Verify sync preserves changes

3. **Conflict Simulation**:
   - Edit same farmer on two different devices
   - Sync both
   - Verify server data wins

### Browser DevTools

1. **Application Tab** → **IndexedDB**: View local database
2. **Application Tab** → **Service Workers**: Inspect SW status
3. **Network Tab**: Toggle "Offline" mode
4. **Console**: Monitor sync logs

## Troubleshooting

### Common Issues

**"No cached data available"**
- Clear browser cache and reload
- Check if reference data loaded on initial app load

**"Max retries exceeded"**
- Check server logs for validation errors
- Verify data format matches API expectations
- May need manual intervention to resolve conflict

**Sync stuck on "Syncing..."**
- Check browser console for errors
- Verify server endpoint `/api/sync` is responding
- Try manual page refresh

### Clearing Cache

In browser console:
```javascript
// Clear all IndexedDB
indexedDB.deleteDatabase('AgroProfilerDB');

// Reload page
location.reload();
```

## Performance Considerations

- **Initial Load**: ~2-3 seconds (pre-caching reference data)
- **Offline Reads**: Instant (from IndexedDB)
- **Online Writes**: ~200-500ms (server round-trip)
- **Offline Writes**: Instant (local only)
- **Sync Speed**: ~1 second per queued operation

## Security Notes

- All API requests still require authentication
- CSRF tokens included in queued requests
- Sensitive data encrypted at rest (browser-dependent)
- Service worker only caches authenticated responses

## Future Enhancements

- [ ] Background sync (when browser supports it)
- [ ] Selective sync (choose what to cache)
- [ ] Conflict resolution UI for user decisions
- [ ] Sync over WiFi only option
- [ ] Download specific regions/data for offline use
- [ ] Compression for large datasets
- [ ] Real-time collaboration indicators

## Dependencies

- `dexie`: IndexedDB wrapper
- `workbox-window`: Service worker management
- `vite-plugin-pwa`: PWA build configuration

## Related Files

- Frontend: `resources/js/db/`, `resources/js/services/`, `resources/js/components/`
- Backend: `app/Http/Controllers/Api/SyncController.php`
- Config: `vite.config.js`
- Migration: `database/migrations/*_create_sync_logs_table.php`
