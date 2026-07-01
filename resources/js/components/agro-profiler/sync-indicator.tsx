import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SyncIndicatorProps {
    lastSyncedAt: string | null;
    onRefresh?: () => void;
    isRefreshing?: boolean;
    className?: string;
}

export function SyncIndicator({ lastSyncedAt, onRefresh, isRefreshing = false, className }: SyncIndicatorProps) {
    const formatTime = (iso: string) => {
        const date = new Date(iso);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffSec = Math.floor(diffMs / 1000);
        const diffMin = Math.floor(diffSec / 60);
        const diffHr = Math.floor(diffMin / 60);

        if (diffSec < 60) return 'Just now';
        if (diffMin < 60) return `${diffMin}m ago`;
        if (diffHr < 24) return `${diffHr}h ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className={cn('glass-surface flex items-center justify-between rounded-xl px-4 py-2.5', className)}>
            <div className="flex items-center gap-2.5">
                <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                </span>
                <span className="text-sm text-muted-foreground">
                    Last synced: <span className="font-medium text-foreground">{lastSyncedAt ? formatTime(lastSyncedAt) : 'N/A'}</span>
                </span>
            </div>
            {onRefresh && (
                <button
                    onClick={onRefresh}
                    disabled={isRefreshing}
                    className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
                >
                    <RefreshCw className={cn('h-3.5 w-3.5', isRefreshing && 'animate-spin')} />
                    Refresh
                </button>
            )}
        </div>
    );
}
