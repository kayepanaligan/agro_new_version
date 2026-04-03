import { getQueuedItems, markItemAsSynced, removeQueuedItem, incrementRetryCount } from '@/db/operations/queue';
import type { OfflineQueueItem } from '@/types';

const MAX_RETRIES = 3;
const SYNC_DELAY_MS = 1000; // 1 second between syncs

export interface SyncResult {
    success: boolean;
    synced_count: number;
    failed_count: number;
    errors: Array<{
        operation_id: string;
        error: string;
    }>;
}

async function processQueueItem(item: OfflineQueueItem): Promise<boolean> {
    try {
        const response = await fetch('/api/sync', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
            },
            body: JSON.stringify({
                operations: [item]
            })
        });

        if (!response.ok) {
            throw new Error(`Server responded with ${response.status}`);
        }

        const result = await response.json();
        
        if (result.success) {
            return true;
        } else {
            throw new Error(result.message || 'Sync failed');
        }
    } catch (error) {
        console.error('Failed to sync item:', error);
        
        // Increment retry count
        if (item.id) {
            await incrementRetryCount(item.id);
        }
        
        return false;
    }
}

export async function syncOfflineQueue(): Promise<SyncResult> {
    const items = await getQueuedItems();
    
    const result: SyncResult = {
        success: true,
        synced_count: 0,
        failed_count: 0,
        errors: []
    };

    for (const item of items) {
        // Check if max retries exceeded
        if ((item.retry_count || 0) >= MAX_RETRIES) {
            result.failed_count++;
            result.errors.push({
                operation_id: item.operation_id,
                error: `Max retries (${MAX_RETRIES}) exceeded`
            });
            continue;
        }

        const success = await processQueueItem(item);
        
        if (success && item.id) {
            await markItemAsSynced(item.id);
            result.synced_count++;
            
            // Small delay between syncs to avoid overwhelming server
            await new Promise(resolve => setTimeout(resolve, SYNC_DELAY_MS));
        } else {
            result.failed_count++;
            result.errors.push({
                operation_id: item.operation_id,
                error: 'Sync failed'
            });
        }
    }

    // Clean up synced items
    import('@/db/operations/queue').then(({ clearSyncedItems }) => {
        clearSyncedItems();
    });

    // Dispatch event for UI updates
    window.dispatchEvent(new CustomEvent('queue-updated'));

    return result;
}

export async function startAutoSync(): Promise<void> {
    window.addEventListener('app-online', async () => {
        const { useNetworkStatus } = await import('@/contexts/NetworkContext');
        // Note: This is a simplified approach. In practice, you'd need access to the context
        
        const result = await syncOfflineQueue();
        
        if (result.success && result.synced_count > 0) {
            console.log(`Auto-sync completed: ${result.synced_count} items synced`);
        }
    });
}

export async function triggerManualSync(): Promise<SyncResult> {
    return await syncOfflineQueue();
}
