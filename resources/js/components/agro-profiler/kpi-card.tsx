import { type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KpiCardProps {
    label: string;
    value: string | number;
    icon: LucideIcon;
    trend?: {
        value: number;
        label: string;
    };
    className?: string;
}

export function KpiCard({ label, value, icon: Icon, trend, className }: KpiCardProps) {
    return (
        <div
            className={cn(
                'glass-card relative overflow-hidden rounded-2xl p-5',
                className
            )}
        >
            {/* Accent left border */}
            <div className="absolute inset-y-0 left-0 w-1 rounded-l-2xl bg-primary" />

            {/* Subtle primary tint background */}
            <div className="absolute inset-0 bg-primary/[0.02] dark:bg-primary/[0.04]" />

            <div className="relative flex items-start justify-between">
                <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">{label}</p>
                    <p className="text-3xl font-bold tracking-tight text-foreground">{value}</p>
                    {trend && (
                        <div className="flex items-center gap-1">
                            <span
                                className={cn(
                                    'text-xs font-medium',
                                    trend.value >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                                )}
                            >
                                {trend.value >= 0 ? '+' : ''}{trend.value}%
                            </span>
                            <span className="text-xs text-muted-foreground">{trend.label}</span>
                        </div>
                    )}
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20">
                    <Icon className="h-5 w-5 text-primary" />
                </div>
            </div>
        </div>
    );
}
