import Dexie, { Table } from 'dexie';
import type { 
    OfflineQueueItem, 
    CachedFarmer, 
    CachedFarm, 
    CachedFarmParcel,
    ReferenceDataCache 
} from '@/types';

export class AgroProfilerDB extends Dexie {
    // Table declarations
    farmers!: Table<CachedFarmer, number>;
    farms!: Table<CachedFarm, number>;
    farm_parcels!: Table<CachedFarmParcel, number>;
    offline_queue!: Table<OfflineQueueItem, number>;
    reference_data!: Table<ReferenceDataCache, number>;

    constructor() {
        super('AgroProfilerDB');
        
        this.version(1).stores({
            // IndexedDB schema with indexes
            farmers: '++id, lfid, first_name, last_name, _cached_at, _is_dirty',
            farms: '++id, farmer_id, farm_name, _cached_at, _is_dirty',
            farm_parcels: '++id, farm_profile_id, _cached_at, _is_dirty',
            offline_queue: '++id, operation_id, action_type, entity_type, timestamp, synced_at',
            reference_data: '++id, data_type, cached_at'
        });
    }
}

// Export singleton instance
export const db = new AgroProfilerDB();
