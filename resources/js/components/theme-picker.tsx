import { Sun, Moon, Palette, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useTheme, type AccentTheme } from '@/context/theme-context';

const accentOptions: { value: AccentTheme; label: string; color: string }[] = [
    { value: 'nature', label: 'Nature', color: 'hsl(142, 72%, 34%)' },
    { value: 'harvest', label: 'Harvest', color: 'hsl(42, 92%, 46%)' },
    { value: 'aurora', label: 'Aurora', color: 'hsl(270, 70%, 50%)' },
    { value: 'ocean', label: 'Ocean', color: 'hsl(215, 80%, 50%)' },
    { value: 'sunrise', label: 'Sunrise', color: 'hsl(24, 90%, 52%)' },
    { value: 'blossom', label: 'Blossom', color: 'hsl(330, 75%, 52%)' },
];

export function ThemePicker() {
    const { mode, accent, setMode, setAccent } = useTheme();

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9" title="Appearance">
                    <Palette className="h-4 w-4" />
                    <span className="sr-only">Appearance settings</span>
                </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-64 p-4">
                <div className="space-y-4">
                    <div>
                        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Mode
                        </h4>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={() => setMode('light')}
                                className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-all ${
                                    mode === 'light'
                                        ? 'border-primary bg-accent text-accent-foreground'
                                        : 'border-border hover:bg-accent/50'
                                }`}
                            >
                                <Sun className="h-4 w-4" />
                                Light
                            </button>
                            <button
                                onClick={() => setMode('dark')}
                                className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-all ${
                                    mode === 'dark'
                                        ? 'border-primary bg-accent text-accent-foreground'
                                        : 'border-border hover:bg-accent/50'
                                }`}
                            >
                                <Moon className="h-4 w-4" />
                                Dark
                            </button>
                        </div>
                    </div>

                    <div>
                        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Accent Color
                        </h4>
                        <div className="grid grid-cols-3 gap-2">
                            {accentOptions.map((opt) => (
                                <button
                                    key={opt.value}
                                    onClick={() => setAccent(opt.value)}
                                    className={`group relative flex flex-col items-center gap-1.5 rounded-lg border px-2 py-2.5 text-xs font-medium transition-all ${
                                        accent === opt.value
                                            ? 'border-primary bg-accent'
                                            : 'border-border hover:bg-accent/50'
                                    }`}
                                >
                                    <span
                                        className={`h-5 w-5 rounded-full ring-2 ring-offset-1 ring-offset-background ${
                                            accent === opt.value ? '' : 'ring-transparent'
                                        }`}
                                        style={{
                                            backgroundColor: opt.color,
                                            ...(accent === opt.value ? { outlineColor: opt.color } : {}),
                                        }}
                                    />
                                    <span className="text-[11px] text-muted-foreground">{opt.label}</span>
                                    {accent === opt.value && (
                                        <Check
                                            className="absolute right-1 top-1 h-3 w-3 text-primary"
                                        />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
