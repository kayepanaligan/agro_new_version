import { useEffect, useRef, useCallback } from 'react';
import { initializeEcho, getEcho } from '@/services/echo';

interface UseWebSocketOptions {
    enabled?: boolean;
    onConnect?: () => void;
    onDisconnect?: () => void;
    onError?: (error: any) => void;
}

interface EventCallback {
    event: string;
    channel: string;
    callback: (data: any) => void;
}

interface SubscriptionEntry {
    channel: any; // Echo channel object
    event: string; // event name without leading dot
}

/**
 * Custom hook for WebSocket connections using Laravel Reverb
 * 
 * @example
 * ```tsx
 * const { subscribe, unsubscribe } = useWebSocket({
 *   enabled: true,
 *   onConnect: () => console.log('Connected to WebSocket'),
 * });
 * 
 * // Subscribe to channels
 * useEffect(() => {
 *   subscribe('farmers', 'farmer.created', (data) => {
 *     console.log('New farmer created:', data);
 *   });
 * }, [subscribe]);
 * ```
 */
export function useWebSocket(options: UseWebSocketOptions = {}) {
    const { enabled = true, onConnect, onDisconnect, onError } = options;
    const echoRef = useRef<ReturnType<typeof initializeEcho> | null>(null);
    const subscriptionsRef = useRef<Map<string, SubscriptionEntry>>(new Map());
    const callbacksRef = useRef<EventCallback[]>([]);

    // Initialize Echo connection
    useEffect(() => {
        if (!enabled) return;

        try {
            echoRef.current = initializeEcho();

            if (onConnect) {
                onConnect();
            }

            // Re-subscribe to all channels on reconnect
            const echo = echoRef.current;
            if (echo) {
                callbacksRef.current.forEach(({ event, channel, callback }) => {
                    const key = `${channel}:${event}`;
                    if (!subscriptionsRef.current.has(key)) {
                        const ch = echo.channel(channel);
                        ch.listen(`.${event}`, callback);
                        subscriptionsRef.current.set(key, { channel: ch, event });
                    }
                });
            }
        } catch (error) {
            console.error('Failed to initialize WebSocket connection:', error);
            if (onError) onError(error);
        }

        return () => {
            if (echoRef.current) {
                subscriptionsRef.current.forEach((entry) => {
                    try {
                        entry.channel.stopListening(`.${entry.event}`);
                    } catch {
                        // Channel may already be cleaned up
                    }
                });
                subscriptionsRef.current.clear();
                
                if (onDisconnect) {
                    onDisconnect();
                }
            }
        };
    }, [enabled]);

    // Subscribe to a channel and event
    const subscribe = useCallback((channel: string, event: string, callback: (data: any) => void) => {
        if (!echoRef.current) {
            console.warn('WebSocket not initialized. Call initializeEcho() first.');
            return;
        }

        const key = `${channel}:${event}`;
        
        // Store callback for reconnection
        callbacksRef.current.push({ event, channel, callback });

        // Stop existing subscription if any
        if (subscriptionsRef.current.has(key)) {
            try {
                const existing = subscriptionsRef.current.get(key)!;
                existing.channel.stopListening(`.${existing.event}`);
            } catch {
                // Ignore errors from already-cleaned channels
            }
        }

        // Create new subscription
        const ch = echoRef.current.channel(channel);
        ch.listen(`.${event}`, callback);
        subscriptionsRef.current.set(key, { channel: ch, event });

        return () => unsubscribe(channel, event);
    }, []);

    // Unsubscribe from a channel and event
    const unsubscribe = useCallback((channel: string, event: string) => {
        const key = `${channel}:${event}`;
        
        if (subscriptionsRef.current.has(key)) {
            try {
                const entry = subscriptionsRef.current.get(key)!;
                entry.channel.stopListening(`.${entry.event}`);
            } catch {
                // Channel may already be cleaned up
            }
            subscriptionsRef.current.delete(key);
        }

        // Remove from callbacks
        callbacksRef.current = callbacksRef.current.filter(
            (cb) => !(cb.channel === channel && cb.event === event)
        );
    }, []);

    // Unsubscribe from all channels
    const unsubscribeAll = useCallback(() => {
        subscriptionsRef.current.forEach((entry) => {
            try {
                entry.channel.stopListening(`.${entry.event}`);
            } catch {
                // Channel may already be cleaned up
            }
        });
        subscriptionsRef.current.clear();
        callbacksRef.current = [];
    }, []);

    return {
        subscribe,
        unsubscribe,
        unsubscribeAll,
        echo: echoRef.current,
    };
}

/**
 * Hook specifically for farmer-related real-time events
 */
export function useFarmerEvents(options: {
    onFarmerCreated?: (data: any) => void;
    onFarmerUpdated?: (data: any) => void;
    enabled?: boolean;
} = {}) {
    const { onFarmerCreated, onFarmerUpdated, enabled = true } = options;
    const { subscribe, unsubscribeAll } = useWebSocket({ enabled });

    useEffect(() => {
        if (!enabled) return;

        if (onFarmerCreated) {
            subscribe('farmers', 'farmer.created', onFarmerCreated);
        }

        if (onFarmerUpdated) {
            subscribe('farmers', 'farmer.updated', onFarmerUpdated);
        }

        return () => {
            unsubscribeAll();
        };
    }, [enabled, onFarmerCreated, onFarmerUpdated, subscribe, unsubscribeAll]);
}

/**
 * Hook for crop damage record events
 */
export function useCropDamageEvents(options: {
    onCropDamageCreated?: (data: any) => void;
    enabled?: boolean;
} = {}) {
    const { onCropDamageCreated, enabled = true } = options;
    const { subscribe, unsubscribeAll } = useWebSocket({ enabled });

    useEffect(() => {
        if (!enabled) return;

        if (onCropDamageCreated) {
            subscribe('crop-damage', 'crop-damage.created', onCropDamageCreated);
        }

        return () => {
            unsubscribeAll();
        };
    }, [enabled, onCropDamageCreated, subscribe, unsubscribeAll]);
}

/**
 * Hook for technician report events
 */
export function useTechnicianReportEvents(options: {
    onReportCreated?: (data: any) => void;
    enabled?: boolean;
} = {}) {
    const { onReportCreated, enabled = true } = options;
    const { subscribe, unsubscribeAll } = useWebSocket({ enabled });

    useEffect(() => {
        if (!enabled) return;

        if (onReportCreated) {
            subscribe('reports', 'technician-report.created', onReportCreated);
        }

        return () => {
            unsubscribeAll();
        };
    }, [enabled, onReportCreated, subscribe, unsubscribeAll]);
}

/**
 * Hook for task events
 */
export function useTaskEvents(options: {
    onTaskCreated?: (data: any) => void;
    onTaskUpdated?: (data: any) => void;
    enabled?: boolean;
} = {}) {
    const { onTaskCreated, onTaskUpdated, enabled = true } = options;
    const { subscribe, unsubscribeAll } = useWebSocket({ enabled });

    useEffect(() => {
        if (!enabled) return;

        if (onTaskCreated) {
            subscribe('admin', 'task.created', onTaskCreated);
        }

        if (onTaskUpdated) {
            subscribe('admin', 'task.updated', onTaskUpdated);
        }

        return () => {
            unsubscribeAll();
        };
    }, [enabled, onTaskCreated, onTaskUpdated, subscribe, unsubscribeAll]);
}

/**
 * Hook for announcement events
 */
export function useAnnouncementEvents(options: {
    onAnnouncementCreated?: (data: any) => void;
    enabled?: boolean;
} = {}) {
    const { onAnnouncementCreated, enabled = true } = options;
    const { subscribe, unsubscribeAll } = useWebSocket({ enabled });

    useEffect(() => {
        if (!enabled) return;

        if (onAnnouncementCreated) {
            subscribe('farmers', 'announcement.created', onAnnouncementCreated);
        }

        return () => {
            unsubscribeAll();
        };
    }, [enabled, onAnnouncementCreated, subscribe, unsubscribeAll]);
}

export default useWebSocket;
