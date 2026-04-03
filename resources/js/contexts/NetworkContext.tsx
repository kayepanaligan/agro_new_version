import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { OnlineStatus, SyncStatus } from '@/types';

interface NetworkContextType extends SyncStatus {
    setSyncing: (syncing: boolean) => void;
    updateLastSyncTime: () => void;
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

export function NetworkProvider({ children }: { children: ReactNode }) {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [isSyncing, setIsSyncing] = useState(false);
    const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
    const [unsyncedCount, setUnsyncedCount] = useState(0);

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            // Trigger auto-sync event
            window.dispatchEvent(new CustomEvent('app-online'));
        };

        const handleOffline = () => {
            setIsOnline(false);
            window.dispatchEvent(new CustomEvent('app-offline'));
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // Listen for queue updates
    useEffect(() => {
        const updateQueueCount = () => {
            import('@/db/operations/queue').then(({ getQueuedItemCount }) => {
                getQueuedItemCount().then(setUnsyncedCount);
            });
        };

        updateQueueCount();
        
        // Update count when queue changes
        window.addEventListener('queue-updated', updateQueueCount);
        return () => window.removeEventListener('queue-updated', updateQueueCount);
    }, []);

    const updateLastSyncTime = () => {
        setLastSyncTime(new Date().toISOString());
    };

    const value: NetworkContextType = {
        is_online: isOnline,
        is_syncing: isSyncing,
        last_sync_time: lastSyncTime,
        unsynced_count: unsyncedCount,
        setSyncing: setIsSyncing,
        updateLastSyncTime,
    };

    return (
        <NetworkContext.Provider value={value}>
            {children}
        </NetworkContext.Provider>
    );
}

export function useNetworkStatus() {
    const context = useContext(NetworkContext);
    if (context === undefined) {
        throw new Error('useNetworkStatus must be used within a NetworkProvider');
    }
    return context;
}
