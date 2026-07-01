import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NarrativeCardProps {
    title?: string;
    narrative: string;
    highlights?: { text: string; value: string | number }[];
    className?: string;
}

export function NarrativeCard({ title = 'AI Insights', narrative, highlights = [], className }: NarrativeCardProps) {
    const highlightNarrative = (text: string) => {
        let result = text;
        highlights.forEach(({ text: key, value }) => {
            result = result.replace(
                new RegExp(`\\b${key}\\b`, 'gi'),
                `<span class="font-semibold text-primary">${value}</span>`
            );
        });
        return result;
    };

    return (
        <div className={cn('glass-card rounded-2xl p-6', className)}>
            <div className="mb-4 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                    <Sparkles className="h-4 w-4 text-primary" />
                </div>
                <h3 className="text-sm font-semibold tracking-wide">{title}</h3>
            </div>
            <div
                className="text-sm leading-relaxed text-muted-foreground"
                dangerouslySetInnerHTML={{ __html: highlightNarrative(narrative) }}
            />
        </div>
    );
}
