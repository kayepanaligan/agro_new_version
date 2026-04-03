import { Wifi, WifiOff, Loader2 } from 'lucide-react';
import { useNetworkStatus } from '@/contexts/NetworkContext';
import { triggerManualSync } from '@/services/sync';
import { useState } from 'react';

export default function OfflineStatusIndicator() {
    const { is_online, is_syncing, unsynced_count, updateLastSyncTime } = useNetworkStatus();
    const [syncInProgress, setSyncInProgress] = useState(false);

    const handleManualSync = async () => {
        if (syncInProgress || !is_online) return;
        
        setSyncInProgress(true);
        try {
            const result = await triggerManualSync();
            updateLastSyncTime();
            
            if (result.synced_count > 0) {
                console.log(`Synced ${result.synced_count} items`);
            }
        } catch (error) {
            console.error('Manual sync failed:', error);
        } finally {
            setSyncInProgress(false);
        }
    };

    // Don't show anything when online and no pending syncs
    if (is_online && unsynced_count === 0) {
        return null;
    }

    return (
        <div className="flex items-center gap-2">
            {/* Online/Offline Status */}
            <div
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
                    is_online
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                }`}
            >
                {is_online ? (
                    <Wifi className="h-3.5 w-3.5" />
                ) : (
                    <WifiOff className="h-3.5 w-3.5" />
                )}
                <span>{is_online ? 'Online' : 'Offline'}</span>
            </div>

            {/* Unsynced Changes Badge */}
            {unsynced_count > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                    <span>{unsynced_count} unsynced</span>
                    
                    {is_online && (
                        <button
                            onClick={handleManualSync}
                            disabled={syncInProgress || is_syncing}
                            className="ml-1 hover:bg-amber-200 dark:hover:bg-amber-800/50 rounded-full p-0.5 transition-colors disabled:opacity-50"
                            title="Sync now"
                        >
                            {(syncInProgress || is_syncing) ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                                <Wifi className="h-3.5 w-3.5" />
                            )}
                        </button>
                    )}
                </div>
            )}

            {/* Syncing Indicator */}
            {is_syncing && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Syncing...</span>
                </div>
            )}
        </div>
    );
}
