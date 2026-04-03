import type { OfflineQueueItem, QueueActionType } from '@/types';
import { addToQueue } from '@/db/operations/queue';
import { cacheAllFarmers, saveFarmer } from '@/db/operations/farmers';

export interface ApiRequestOptions extends RequestInit {
    skipCache?: boolean;
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
    errors?: any;
}

// Check if app is online
export function isOnline(): boolean {
    return navigator.onLine;
}

// Generic fetch wrapper with offline support
export async function apiFetch<T>(
    endpoint: string,
    options: ApiRequestOptions = {}
): Promise<ApiResponse<T>> {
    const { skipCache = false, ...fetchOptions } = options;

    // If online and not skipping cache, try network first
    if (isOnline() && !skipCache) {
        try {
            const response = await fetch(endpoint, fetchOptions);
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP ${response.status}`);
            }

            const data = await response.json();
            
            // Cache successful GET responses for farmers
            if (fetchOptions.method === 'GET' && endpoint.includes('/farmers')) {
                await cacheApiResponse(endpoint, data);
            }

            return data;
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    // If offline or cache-only mode, try IndexedDB
    if (!isOnline()) {
        console.log('Offline mode - using local cache');
        
        // For GET requests, return cached data
        if (fetchOptions.method === 'GET') {
            return await getCachedResponse<T>(endpoint);
        }

        // For mutations, queue for later sync
        if (['POST', 'PUT', 'DELETE'].includes(fetchOptions.method || 'GET')) {
            await queueOperation(endpoint, fetchOptions);
            
            // Return optimistic response
            return {
                success: true,
                message: 'Operation queued for sync when online'
            };
        }
    }

    throw new Error('Unable to process request - offline and no cache available');
}

// Cache API response in IndexedDB
async function cacheApiResponse(endpoint: string, data: any): Promise<void> {
    // Special handling for farmers list
    if (endpoint.includes('/api/farmers') && !endpoint.match(/\/farmers\/\d+$/)) {
        if (data.data && Array.isArray(data.data)) {
            await cacheAllFarmers(data.data);
        }
    }
}

// Get cached response from IndexedDB
async function getCachedResponse<T>(endpoint: string): Promise<ApiResponse<T>> {
    // For farmers list
    if (endpoint.includes('/api/farmers') && !endpoint.match(/\/farmers\/\d+$/)) {
        const { getFarmers } = await import('@/db/operations/farmers');
        const farmers = await getFarmers();
        
        return {
            success: true,
            data: farmers as unknown as T
        };
    }

    // For single farmer by ID
    const match = endpoint.match(/\/api\/farmers\/(\d+)/);
    if (match) {
        const id = parseInt(match[1]);
        const { getFarmerById } = await import('@/db/operations/farmers');
        const farmer = await getFarmerById(id);
        
        if (farmer) {
            return {
                success: true,
                data: farmer as unknown as T
            };
        }
    }

    throw new Error('No cached data available for this endpoint');
}

// Queue operation for later sync
async function queueOperation(
    endpoint: string,
    options: RequestInit
): Promise<void> {
    const actionType = mapMethodToActionType(options.method || 'GET');
    const entityType = inferEntityType(endpoint);
    
    let payload: any = {};
    
    if (options.body instanceof FormData) {
        payload = Object.fromEntries(options.body.entries());
    } else if (typeof options.body === 'string') {
        payload = JSON.parse(options.body);
    } else {
        payload = options.body;
    }

    // Extract entity ID from endpoint if present
    const idMatch = endpoint.match(/\/(\d+)$/);
    if (idMatch) {
        payload.id = parseInt(idMatch[1]);
    }

    await addToQueue(actionType, entityType, payload);
    
    // Dispatch event for UI updates
    window.dispatchEvent(new CustomEvent('queue-updated'));
}

function mapMethodToActionType(method: string): QueueActionType {
    switch (method) {
        case 'POST':
            return 'create';
        case 'PUT':
        case 'PATCH':
            return 'update';
        case 'DELETE':
            return 'delete';
        default:
            return 'update';
    }
}

function inferEntityType(endpoint: string): OfflineQueueItem['entity_type'] {
    if (endpoint.includes('/farmers')) return 'farmer';
    if (endpoint.includes('/farms')) return 'farm';
    if (endpoint.includes('/farm_parcels')) return 'farm_parcel';
    if (endpoint.includes('/crop_damage')) return 'crop_damage';
    if (endpoint.includes('/allocations')) return 'allocation';
    
    return 'farmer'; // Default
}

// Specific API methods
export const farmersApi = {
    async index() {
        return await apiFetch<any[]>('/api/farmers');
    },

    async show(id: number) {
        return await apiFetch<any>(`/api/farmers/${id}`);
    },

    async store(data: any) {
        const operationId = crypto.randomUUID();
        
        // Optimistic update - add to local DB immediately
        if (isOnline()) {
            // Try to send to server first
            try {
                const response = await fetch('/api/farmers', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                    },
                    body: JSON.stringify(data)
                });

                const result = await response.json();
                
                if (response.ok && result.success) {
                    // Cache the new farmer
                    await saveFarmer(result.data);
                    return result;
                }
            } catch (error) {
                console.error('Failed to create farmer on server:', error);
            }
        }

        // Queue for sync if offline or server request failed
        await addToQueue('create', 'farmer', data, operationId);
        window.dispatchEvent(new CustomEvent('queue-updated'));

        return {
            success: true,
            message: 'Farmer created locally. Will sync when online.',
            operation_id: operationId
        };
    },

    async update(id: number, data: any) {
        if (isOnline()) {
            try {
                const response = await fetch(`/api/farmers/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                    },
                    body: JSON.stringify(data)
                });

                const result = await response.json();
                
                if (response.ok && result.success) {
                    // Update cache
                    await saveFarmer(result.data);
                    return result;
                }
            } catch (error) {
                console.error('Failed to update farmer on server:', error);
            }
        }

        // Queue for sync
        await addToQueue('update', 'farmer', { id, ...data });
        window.dispatchEvent(new CustomEvent('queue-updated'));

        return {
            success: true,
            message: 'Farmer updated locally. Will sync when online.'
        };
    },

    async delete(id: number) {
        if (isOnline()) {
            try {
                const response = await fetch(`/api/farmers/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Accept': 'application/json',
                        'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                    }
                });

                if (response.ok) {
                    // Remove from cache
                    const { deleteFarmer } = await import('@/db/operations/farmers');
                    await deleteFarmer(id);
                    
                    return { success: true };
                }
            } catch (error) {
                console.error('Failed to delete farmer on server:', error);
            }
        }

        // Queue for sync
        await addToQueue('delete', 'farmer', { id });
        window.dispatchEvent(new CustomEvent('queue-updated'));

        return {
            success: true,
            message: 'Farmer marked for deletion. Will sync when online.'
        };
    }
};
