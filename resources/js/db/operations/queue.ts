import { db } from '../index';
import type { OfflineQueueItem, QueueActionType } from '@/types';

export async function addToQueue(
    actionType: QueueActionType,
    entityType: OfflineQueueItem['entity_type'],
    payload: any,
    operationId?: string
): Promise<number> {
    const item: OfflineQueueItem = {
        operation_id: operationId || crypto.randomUUID(),
        action_type: actionType,
        entity_type: entityType,
        payload,
        timestamp: new Date().toISOString(),
        retry_count: 0
    };

    return await db.offline_queue.add(item);
}

export async function getQueuedItems(): Promise<OfflineQueueItem[]> {
    return await db.offline_queue
        .orderBy('timestamp')
        .filter(item => !item.synced_at)
        .toArray();
}

export async function getQueuedItemCount(): Promise<number> {
    const items = await getQueuedItems();
    return items.length;
}

export async function removeQueuedItem(id: number): Promise<void> {
    await db.offline_queue.delete(id);
}

export async function updateQueuedItem(
    id: number,
    updates: Partial<OfflineQueueItem>
): Promise<void> {
    await db.offline_queue.update(id, updates);
}

export async function markItemAsSynced(id: number): Promise<void> {
    await updateQueuedItem(id, {
        synced_at: new Date().toISOString()
    });
}

export async function incrementRetryCount(id: number): Promise<void> {
    const item = await db.offline_queue.get(id);
    if (item) {
        await updateQueuedItem(id, {
            retry_count: (item.retry_count || 0) + 1
        });
    }
}

export async function clearSyncedItems(): Promise<void> {
    const syncedItems = await db.offline_queue
        .filter(item => !!item.synced_at)
        .toArray();
    
    for (const item of syncedItems) {
        await db.offline_queue.delete(item.id!);
    }
}

export async function getFailedQueueItems(maxRetries: number = 3): Promise<OfflineQueueItem[]> {
    const items = await getQueuedItems();
    return items.filter(item => (item.retry_count || 0) >= maxRetries);
}
