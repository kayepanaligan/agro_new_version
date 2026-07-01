import { useState, useRef, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Calendar, ChevronDown, X, CalendarDays } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface DateRange {
    start: string; // YYYY-MM-DD
    end: string;   // YYYY-MM-DD
}

interface DashboardDateFilterProps {
    dateRange: DateRange | null;
    onApply: (range: DateRange | null) => void;
    className?: string;
}

type PresetKey = 'today' | 'yesterday' | 'this_week' | 'last_7' | 'last_28' | 'this_month' | 'last_month' | 'this_year';

interface Preset {
    key: PresetKey;
    label: string;
    getRange: () => DateRange;
}

function formatDate(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

function formatDisplay(dateStr: string): string {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function isSameDay(a: string, b: string): boolean {
    return a === b;
}

const PRESETS: Preset[] = [
    {
        key: 'today',
        label: 'Today',
        getRange: () => {
            const now = new Date();
            return { start: formatDate(now), end: formatDate(now) };
        },
    },
    {
        key: 'yesterday',
        label: 'Yesterday',
        getRange: () => {
            const d = new Date();
            d.setDate(d.getDate() - 1);
            return { start: formatDate(d), end: formatDate(d) };
        },
    },
    {
        key: 'this_week',
        label: 'This Week',
        getRange: () => {
            const now = new Date();
            const dayOfWeek = now.getDay();
            const start = new Date(now);
            start.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
            return { start: formatDate(start), end: formatDate(now) };
        },
    },
    {
        key: 'last_7',
        label: 'Last 7 Days',
        getRange: () => {
            const now = new Date();
            const start = new Date(now);
            start.setDate(now.getDate() - 6);
            return { start: formatDate(start), end: formatDate(now) };
        },
    },
    {
        key: 'last_28',
        label: 'Last 28 Days',
        getRange: () => {
            const now = new Date();
            const start = new Date(now);
            start.setDate(now.getDate() - 27);
            return { start: formatDate(start), end: formatDate(now) };
        },
    },
    {
        key: 'this_month',
        label: 'This Month',
        getRange: () => {
            const now = new Date();
            const start = new Date(now.getFullYear(), now.getMonth(), 1);
            return { start: formatDate(start), end: formatDate(now) };
        },
    },
    {
        key: 'last_month',
        label: 'Last Month',
        getRange: () => {
            const now = new Date();
            const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            const end = new Date(now.getFullYear(), now.getMonth(), 0);
            return { start: formatDate(start), end: formatDate(end) };
        },
    },
    {
        key: 'this_year',
        label: 'This Year',
        getRange: () => {
            const now = new Date();
            const start = new Date(now.getFullYear(), 0, 1);
            return { start: formatDate(start), end: formatDate(now) };
        },
    },
];

function detectActivePreset(range: DateRange | null): PresetKey | null {
    if (!range) return null;
    for (const preset of PRESETS) {
        const p = preset.getRange();
        if (isSameDay(range.start, p.start) && isSameDay(range.end, p.end)) {
            return preset.key;
        }
    }
    return null;
}

export function DashboardDateFilter({ dateRange, onApply, className }: DashboardDateFilterProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [customStart, setCustomStart] = useState('');
    const [customEnd, setCustomEnd] = useState('');
    const activePreset = useMemo(() => detectActivePreset(dateRange), [dateRange]);

    // Sync custom inputs when popover opens
    useEffect(() => {
        if (isOpen && dateRange) {
            setCustomStart(dateRange.start);
            setCustomEnd(dateRange.end);
        } else if (isOpen) {
            setCustomStart('');
            setCustomEnd('');
        }
    }, [isOpen, dateRange]);

    const handlePresetClick = (preset: Preset) => {
        const range = preset.getRange();
        onApply(range);
        setIsOpen(false);
    };

    const handleCustomApply = () => {
        if (customStart && customEnd) {
            onApply({ start: customStart, end: customEnd });
            setIsOpen(false);
        }
    };

    const handleClear = () => {
        onApply(null);
        setIsOpen(false);
    };

    // Build display label
    const displayLabel = useMemo(() => {
        if (!dateRange) return null;
        if (activePreset) {
            return PRESETS.find(p => p.key === activePreset)?.label ?? null;
        }
        return `${formatDisplay(dateRange.start)} — ${formatDisplay(dateRange.end)}`;
    }, [dateRange, activePreset]);

    return (
        <div className={cn('flex items-center gap-2', className)}>
            <Popover open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        size="sm"
                        className={cn(
                            'h-9 gap-2 border-dashed',
                            dateRange && 'border-primary bg-primary/5 text-primary'
                        )}
                    >
                        <Calendar className="h-4 w-4" />
                        {displayLabel ? (
                            <span className="max-w-[180px] truncate text-sm font-medium">{displayLabel}</span>
                        ) : (
                            <span className="text-sm text-muted-foreground">Filter period</span>
                        )}
                        <ChevronDown className="h-3 w-3 text-muted-foreground" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[320px] p-0" align="end">
                    <div className="flex flex-col">
                        {/* Presets */}
                        <div className="border-b p-2">
                            <p className="mb-1.5 px-2 text-xs font-medium text-muted-foreground">Quick Presets</p>
                            <div className="grid grid-cols-2 gap-1">
                                {PRESETS.map((preset) => (
                                    <Button
                                        key={preset.key}
                                        variant={activePreset === preset.key ? 'default' : 'ghost'}
                                        size="sm"
                                        className="h-8 justify-start text-xs"
                                        onClick={() => handlePresetClick(preset)}
                                    >
                                        <CalendarDays className="mr-1.5 h-3 w-3" />
                                        {preset.label}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        {/* Custom Range */}
                        <div className="p-3">
                            <p className="mb-2 text-xs font-medium text-muted-foreground">Custom Range</p>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <label className="w-10 text-xs text-muted-foreground">From</label>
                                    <input
                                        type="date"
                                        value={customStart}
                                        onChange={(e) => setCustomStart(e.target.value)}
                                        className="h-8 flex-1 rounded-md border border-input bg-background px-2 text-xs"
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <label className="w-10 text-xs text-muted-foreground">To</label>
                                    <input
                                        type="date"
                                        value={customEnd}
                                        onChange={(e) => setCustomEnd(e.target.value)}
                                        className="h-8 flex-1 rounded-md border border-input bg-background px-2 text-xs"
                                    />
                                </div>
                                <div className="flex gap-2 pt-1">
                                    <Button
                                        size="sm"
                                        className="h-8 flex-1 text-xs"
                                        disabled={!customStart || !customEnd}
                                        onClick={handleCustomApply}
                                    >
                                        Apply Range
                                    </Button>
                                    {dateRange && (
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-8 text-xs"
                                            onClick={handleClear}
                                        >
                                            <X className="mr-1 h-3 w-3" />
                                            Clear
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </PopoverContent>
            </Popover>

            {/* Active filter badge with clear */}
            {dateRange && (
                <Badge
                    variant="secondary"
                    className="gap-1 cursor-pointer hover:bg-destructive/10 hover:text-destructive transition-colors"
                    onClick={handleClear}
                >
                    <span className="max-w-[200px] truncate">
                        {displayLabel}
                    </span>
                    <X className="h-3 w-3" />
                </Badge>
            )}
        </div>
    );
}
