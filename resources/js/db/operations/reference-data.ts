import { db } from '../index';
import type { ReferenceDataCache } from '@/types';

export async function cacheReferenceData(
    dataType: ReferenceDataCache['data_type'],
    data: any[],
    ttlSeconds: number = 3600 // 1 hour default
): Promise<void> {
    const now = new Date();
    const existing = await db.reference_data
        .where('data_type')
        .equals(dataType)
        .first();

    const cacheItem: ReferenceDataCache = {
        data_type: dataType,
        data: data,
        cached_at: now.toISOString(),
        expires_at: new Date(now.getTime() + ttlSeconds * 1000).toISOString()
    };

    if (existing) {
        await db.reference_data.put({ ...cacheItem, id: existing.id });
    } else {
        await db.reference_data.add(cacheItem);
    }
}

export async function getCachedReferenceData(
    dataType: ReferenceDataCache['data_type']
): Promise<any[] | null> {
    const cacheItem = await db.reference_data
        .where('data_type')
        .equals(dataType)
        .first();

    if (!cacheItem) {
        return null;
    }

    // Check if expired
    const now = new Date();
    const expiresAt = new Date(cacheItem.expires_at || cacheItem.cached_at);
    
    if (now > expiresAt) {
        // Cache expired
        return null;
    }

    return cacheItem.data;
}

export async function isReferenceDataCached(
    dataType: ReferenceDataCache['data_type']
): Promise<boolean> {
    const cacheItem = await getCachedReferenceData(dataType);
    return cacheItem !== null;
}

export async function clearExpiredReferenceData(): Promise<void> {
    const now = new Date();
    const allItems = await db.reference_data.toArray();
    
    for (const item of allItems) {
        const expiresAt = new Date(item.expires_at || item.cached_at);
        if (now > expiresAt) {
            await db.reference_data.delete(item.id!);
        }
    }
}

export async function clearAllReferenceData(): Promise<void> {
    await db.reference_data.clear();
}

export async function refreshReferenceData(
    dataType: ReferenceDataCache['data_type'],
    data: any[]
): Promise<void> {
    await cacheReferenceData(dataType, data, 3600);
}
