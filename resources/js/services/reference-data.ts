import { cacheReferenceData, getCachedReferenceData } from '@/db/operations/reference-data';
import type { Commodity, Variety, DamageType, Program } from '@/types';

const CACHE_TTL = 3600; // 1 hour in seconds

export interface ReferenceDataService {
    commodities: () => Promise<Commodity[]>;
    varieties: () => Promise<Variety[]>;
    damageTypes: () => Promise<DamageType[]>;
    programs: () => Promise<Program[]>;
    refreshAll: () => Promise<void>;
}

async function fetchFromApi<T>(endpoint: string): Promise<T> {
    const response = await fetch(endpoint, {
        headers: {
            'Accept': 'application/json',
            'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
        }
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch ${endpoint}: ${response.status}`);
    }

    const data = await response.json();
    return data.data || data;
}

export const referenceDataService: ReferenceDataService = {
    /**
     * Get cached commodities or fetch from API
     */
    async commodities(): Promise<Commodity[]> {
        // Try cache first
        const cached = await getCachedReferenceData('commodities');
        if (cached) {
            return cached as Commodity[];
        }

        // Fetch from API
        try {
            const data = await fetchFromApi<Commodity[]>('/api/commodities');
            
            // Cache it
            await cacheReferenceData('commodities', data, CACHE_TTL);
            
            return data;
        } catch (error) {
            console.error('Failed to fetch commodities:', error);
            throw error;
        }
    },

    /**
     * Get cached varieties or fetch from API
     */
    async varieties(): Promise<Variety[]> {
        const cached = await getCachedReferenceData('varieties');
        if (cached) {
            return cached as Variety[];
        }

        try {
            const data = await fetchFromApi<Variety[]>('/api/varieties');
            await cacheReferenceData('varieties', data, CACHE_TTL);
            return data;
        } catch (error) {
            console.error('Failed to fetch varieties:', error);
            throw error;
        }
    },

    /**
     * Get cached damage types or fetch from API
     */
    async damageTypes(): Promise<DamageType[]> {
        const cached = await getCachedReferenceData('damage_types');
        if (cached) {
            return cached as DamageType[];
        }

        try {
            const data = await fetchFromApi<DamageType[]>('/api/damage-types');
            await cacheReferenceData('damage_types', data, CACHE_TTL);
            return data;
        } catch (error) {
            console.error('Failed to fetch damage types:', error);
            throw error;
        }
    },

    /**
     * Get cached programs or fetch from API
     */
    async programs(): Promise<Program[]> {
        const cached = await getCachedReferenceData('programs');
        if (cached) {
            return cached as Program[];
        }

        try {
            const data = await fetchFromApi<Program[]>('/api/programs');
            await cacheReferenceData('programs', data, CACHE_TTL);
            return data;
        } catch (error) {
            console.error('Failed to fetch programs:', error);
            throw error;
        }
    },

    /**
     * Refresh all reference data
     */
    async refreshAll(): Promise<void> {
        try {
            await Promise.all([
                this.commodities(),
                this.varieties(),
                this.damageTypes(),
                this.programs()
            ]);
            console.log('Reference data refreshed');
        } catch (error) {
            console.error('Failed to refresh reference data:', error);
        }
    }
};

/**
 * Pre-cache all reference data on app load
 */
export async function preCacheReferenceData(): Promise<void> {
    try {
        console.log('Pre-caching reference data...');
        
        // Start fetching all reference data in parallel
        await Promise.all([
            referenceDataService.commodities().catch(err => console.warn('Failed to cache commodities:', err)),
            referenceDataService.varieties().catch(err => console.warn('Failed to cache varieties:', err)),
            referenceDataService.damageTypes().catch(err => console.warn('Failed to cache damage types:', err)),
            referenceDataService.programs().catch(err => console.warn('Failed to cache programs:', err))
        ]);
        
        console.log('Reference data pre-caching completed');
    } catch (error) {
        console.error('Error during pre-caching:', error);
    }
}
