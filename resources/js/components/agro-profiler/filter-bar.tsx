import { X, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FilterChip {
    key: string;
    label: string;
    value: string;
}

interface FilterBarProps {
    filters: FilterChip[];
    onRemove: (key: string) => void;
    onClearAll: () => void;
    children?: React.ReactNode;
    className?: string;
}

export function FilterBar({ filters, onRemove, onClearAll, children, className }: FilterBarProps) {
    if (filters.length === 0 && !children) return null;

    return (
        <div className={cn('flex flex-wrap items-center gap-2', className)}>
            <Filter className="h-4 w-4 text-muted-foreground" />
            {filters.map((f) => (
                <Badge key={f.key} variant="secondary" className="gap-1 pr-1 font-normal">
                    <span className="text-xs">
                        <span className="text-muted-foreground">{f.label}:</span> {f.value}
                    </span>
                    <button
                        onClick={() => onRemove(f.key)}
                        className="ml-0.5 rounded-full p-0.5 hover:bg-muted"
                    >
                        <X className="h-3 w-3" />
                    </button>
                </Badge>
            ))}
            {filters.length > 0 && (
                <Button variant="ghost" size="sm" className="h-6 text-xs text-muted-foreground" onClick={onClearAll}>
                    Clear all
                </Button>
            )}
            {children}
        </div>
    );
}
