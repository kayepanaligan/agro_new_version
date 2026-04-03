import { db } from '../index';
import type { CachedFarmer } from '@/types';

export async function getFarmers(): Promise<CachedFarmer[]> {
    return await db.farmers.orderBy('_cached_at').reverse().toArray();
}

export async function getFarmerById(id: number): Promise<CachedFarmer | undefined> {
    return await db.farmers.get(id);
}

export async function getFarmerByLfid(lfid: string): Promise<CachedFarmer | undefined> {
    return await db.farmers.where('lfid').equals(lfid).first();
}

export async function saveFarmer(farmer: CachedFarmer): Promise<number> {
    const existing = await db.farmers.where('lfid').equals(farmer.lfid!).first();
    
    if (existing) {
        await db.farmers.update(existing.id!, {
            ...farmer,
            _cached_at: new Date().toISOString(),
            _is_dirty: false
        });
        return existing.id!;
    } else {
        return await db.farmers.add({
            ...farmer,
            _cached_at: new Date().toISOString(),
            _is_dirty: false
        });
    }
}

export async function updateFarmerLocally(id: number, updates: Partial<CachedFarmer>): Promise<void> {
    await db.farmers.update(id, {
        ...updates,
        _cached_at: new Date().toISOString(),
        _is_dirty: true
    });
}

export async function deleteFarmer(id: number): Promise<void> {
    await db.farmers.delete(id);
}

export async function markFarmerAsDirty(id: number): Promise<void> {
    await db.farmers.update(id, {
        _is_dirty: true,
        _cached_at: new Date().toISOString()
    });
}

export async function getDirtyFarmers(): Promise<CachedFarmer[]> {
    const all = await db.farmers.toArray();
    return all.filter(f => f._is_dirty === true);
}

export async function cacheAllFarmers(farmers: CachedFarmer[]): Promise<void> {
    await db.transaction('rw', db.farmers, async () => {
        // Clear existing cache
        await db.farmers.clear();
        
        // Add all farmers with cache metadata
        const farmersWithMeta = farmers.map(farmer => ({
            ...farmer,
            _cached_at: new Date().toISOString(),
            _is_dirty: false
        }));
        
        await db.farmers.bulkAdd(farmersWithMeta);
    });
}
