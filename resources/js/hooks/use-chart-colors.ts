import { useMemo } from 'react';

/**
 * Reads CSS custom properties (--chart-1 through --chart-5, --primary, --muted, --foreground, --border)
 * from the computed style and returns them as resolved HSL color strings.
 * Re-renders when the document theme/accent changes (via class or data attribute).
 */
export function useChartColors() {
    return useMemo(() => {
        const style = getComputedStyle(document.documentElement);
        const get = (prop: string) => style.getPropertyValue(prop).trim();

        const chartColors = [
            get('--chart-1') || 'hsl(142, 72%, 34%)',
            get('--chart-2') || 'hsl(210, 70%, 50%)',
            get('--chart-3') || 'hsl(38, 92%, 50%)',
            get('--chart-4') || 'hsl(280, 65%, 55%)',
            get('--chart-5') || 'hsl(0, 84%, 60%)',
        ];

        return {
            chartColors,
            primary: get('--primary') || 'hsl(142, 72%, 34%)',
            muted: get('--muted-foreground') || 'hsl(215, 16%, 47%)',
            foreground: get('--foreground') || 'hsl(222, 47%, 11%)',
            border: get('--border') || 'hsl(214, 24%, 88%)',
            gridColor: get('--border') || 'hsl(214, 24%, 88%)',
        };
    }, []);
}
