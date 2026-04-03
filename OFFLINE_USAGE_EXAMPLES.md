# Offline-First Usage Examples

## Using the Enhanced API Client

### Basic Usage with Farmers

```typescript
import { farmersApi } from '@/services/api';

// Get all farmers (automatically uses cache if offline)
const farmers = await farmersApi.index();

// Get single farmer by ID
const farmer = await farmersApi.show(1);

// Create new farmer (queues if offline)
const result = await farmersApi.store({
    first_name: 'Juan',
    last_name: 'Dela Cruz',
    sex: 'Male',
    // ... other fields
});

// Update farmer (queues if offline)
await farmersApi.update(1, {
    contact_number: '09171234567'
});

// Delete farmer (queues if offline)
await farmersApi.delete(1);
```

### Using Reference Data Hook

```typescript
import { useReferenceData } from '@/hooks/use-reference-data';

function FarmerForm() {
    const { commodities, varieties, programs, isLoading, error } = useReferenceData();

    if (isLoading) return <div>Loading reference data...</div>;
    if (error) return <div>Error loading data</div>;

    return (
        <form>
            {/* Use cached commodities for dropdown */}
            <select name="commodity_id">
                {commodities.map(commodity => (
                    <option key={commodity.id} value={commodity.id}>
                        {commodity.name}
                    </option>
                ))}
            </select>

            {/* Use cached varieties for dropdown */}
            <select name="variety_id">
                {varieties.map(variety => (
                    <option key={variety.id} value={variety.id}>
                        {variety.name}
                    </option>
                ))}
            </select>
        </form>
    );
}
```

### Direct Service Usage

```typescript
import { referenceDataService } from '@/services/reference-data';

// Get commodities (cached or fetch)
const commodities = await referenceDataService.commodities();

// Get varieties (cached or fetch)
const varieties = await referenceDataService.varieties();

// Refresh all reference data
await referenceDataService.refreshAll();
```

### Manual Sync Control

```typescript
import { triggerManualSync } from '@/services/sync';
import { useNetworkStatus } from '@/contexts/NetworkContext';

function SyncButton() {
    const { is_online, unsynced_count } = useNetworkStatus();

    const handleSync = async () => {
        try {
            const result = await triggerManualSync();
            console.log(`Synced ${result.synced_count} items`);
            
            if (result.failed_count > 0) {
                console.warn(`${result.failed_count} items failed to sync`);
            }
        } catch (error) {
            console.error('Sync failed:', error);
        }
    };

    return (
        <button 
            onClick={handleSync}
            disabled={!is_online || unsynced_count === 0}
        >
            Sync Now ({unsynced_count} pending)
        </button>
    );
}
```

## Working with Queued Operations

### Adding to Queue Manually

```typescript
import { addToQueue } from '@/db/operations/queue';

// Queue a create operation
await addToQueue(
    'create',
    'farmer',
    { first_name: 'Juan', last_name: 'Dela Cruz' },
    crypto.randomUUID() // Optional operation ID
);

// Queue an update operation
await addToQueue(
    'update',
    'farmer',
    { id: 1, contact_number: '09171234567' }
);

// Queue a delete operation
await addToQueue(
    'delete',
    'farmer',
    { id: 1 }
);
```

### Checking Queue Status

```typescript
import { getQueuedItems, getQueuedItemCount } from '@/db/operations/queue';

// Get count of pending operations
const count = await getQueuedItemCount();
console.log(`${count} operations pending sync`);

// Get all pending operations
const items = await getQueuedItems();
items.forEach(item => {
    console.log(`${item.action_type} ${item.entity_type} at ${item.timestamp}`);
});
```

## Network Status Detection

### Using Network Context

```typescript
import { useNetworkStatus } from '@/contexts/NetworkContext';

function StatusBar() {
    const { is_online, is_syncing, last_sync_time, unsynced_count } = useNetworkStatus();

    return (
        <div>
            <span>{is_online ? '🟢 Online' : '🔴 Offline'}</span>
            {unsynced_count > 0 && (
                <span>{unsynced_count} unsynced changes</span>
            )}
            {is_syncing && <span>Syncing...</span>}
            {last_sync_time && (
                <span>Last sync: {new Date(last_sync_time).toLocaleString()}</span>
            )}
        </div>
    );
}
```

## Caching Data Locally

### Caching Farmers

```typescript
import { cacheAllFarmers, saveFarmer } from '@/db/operations/farmers';

// Cache entire list of farmers
await cacheAllFarmers(farmersArray);

// Save/update single farmer
await saveFarmer(farmerData);

// Mark as dirty (needs sync)
await markFarmerAsDirty(farmerId);
```

### Caching Reference Data

```typescript
import { cacheReferenceData, getCachedReferenceData } from '@/db/operations/reference-data';

// Cache commodities with 1 hour TTL
await cacheReferenceData(
    'commodities',
    commoditiesArray,
    3600 // seconds
);

// Get cached data (returns null if expired)
const cached = await getCachedReferenceData('commodities');

if (!cached) {
    // Cache miss - fetch from API
    const fresh = await fetchFromAPI();
    await cacheReferenceData('commodities', fresh);
}
```

## Event Listening

### Listen for Network Changes

```typescript
// In your component or service
window.addEventListener('app-online', () => {
    console.log('Connection restored!');
    // Auto-sync will trigger automatically
});

window.addEventListener('app-offline', () => {
    console.log('Went offline');
    // Switch to local-only mode
});

window.addEventListener('queue-updated', () => {
    console.log('Queue changed - update UI');
    // Refresh unsynced count display
});
```

## Best Practices

### 1. Always Use the Enhanced API

```typescript
// ✅ Good - Uses offline-aware client
const farmers = await farmersApi.index();

// ❌ Bad - Bypasses caching and queue
const farmers = await fetch('/api/farmers');
```

### 2. Handle Loading States

```typescript
function MyComponent() {
    const { data, isLoading, error } = useReferenceData();

    if (isLoading) return <LoadingSpinner />;
    if (error) return <ErrorMessage error={error} />;
    
    return <DataDisplay data={data} />;
}
```

### 3. Provide Offline Feedback

```typescript
function SubmitButton() {
    const { is_online } = useNetworkStatus();

    return (
        <button type="submit">
            {is_online ? 'Save' : 'Save (Offline)'}
            {!is_online && (
                <span className="text-xs">Will sync when online</span>
            )}
        </button>
    );
}
```

### 4. Optimistic UI Updates

```typescript
// Update UI immediately, sync later
await farmersApi.update(farmer.id, updates);

// UI already updated by optimistic response
showSuccessToast('Farmer updated!');

// No need to wait for server confirmation
```

### 5. Error Handling

```typescript
try {
    const result = await farmersApi.store(data);
    
    if (!result.success) {
        // Check if it was queued
        if (result.operation_id) {
            showInfo('Saved locally. Will sync when online.');
        } else {
            showError('Failed to save');
        }
    }
} catch (error) {
    console.error('Operation failed:', error);
    showError('Unable to process request');
}
```

## Migration from Standard API Calls

### Before (Standard Fetch)

```typescript
// Old way - doesn't work offline
useEffect(() => {
    fetch('/api/farmers')
        .then(res => res.json())
        .then(data => setFarmers(data.data));
}, []);
```

### After (Offline-Aware)

```typescript
// New way - works offline with caching
useEffect(() => {
    farmersApi.index()
        .then(result => {
            if (result.success) {
                setFarmers(result.data);
            }
        })
        .catch(error => console.error('Failed to load farmers:', error));
}, []);
```

## Testing Your Implementation

### Simulate Offline Mode

```typescript
// In browser DevTools:
// 1. Open DevTools → Network tab
// 2. Select "Offline" from throttling dropdown
// 3. Test your app

// Or programmatically:
Object.defineProperty(navigator, 'onLine', {
    get: () => false
});
```

### Check IndexedDB

```typescript
// View in DevTools:
// Application → IndexedDB → AgroProfilerDB

// Or query programmatically:
import { db } from '@/db';

const farmers = await db.farmers.toArray();
console.log('Cached farmers:', farmers);

const queue = await db.offline_queue.toArray();
console.log('Pending operations:', queue);
```

## Common Patterns

### Form Submission with Offline Support

```typescript
async function handleSubmit(values) {
    try {
        const result = await farmersApi.store(values);
        
        if (result.operation_id) {
            // Was queued - show offline indicator
            toast.info('Saved locally. Will sync when online.');
        } else {
            // Synced immediately
            toast.success('Farmer created successfully!');
        }
        
        navigate('/farmers');
    } catch (error) {
        toast.error('Failed to save farmer');
        console.error(error);
    }
}
```

### List View with Cached Data

```typescript
function FarmersList() {
    const [farmers, setFarmers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        farmersApi.index()
            .then(result => {
                setFarmers(result.data || []);
                setLoading(false);
            })
            .catch(error => {
                console.error('Failed to load farmers:', error);
                setLoading(false);
            });
    }, []);

    if (loading) return <Spinner />;
    
    return (
        <ul>
            {farmers.map(farmer => (
                <li key={farmer.id}>{farmer.first_name} {farmer.last_name}</li>
            ))}
        </ul>
    );
}
```
