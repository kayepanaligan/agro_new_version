import { createContext, useContext, useEffect, useState } from 'react';

export type ThemeMode = 'light' | 'dark';
export type AccentTheme = 'nature' | 'harvest' | 'aurora' | 'ocean' | 'sunrise' | 'blossom';

interface ThemeContextType {
    mode: ThemeMode;
    accent: AccentTheme;
    setMode: (mode: ThemeMode) => void;
    setAccent: (accent: AccentTheme) => void;
    toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const MODE_KEY = 'agro-theme-mode';
const ACCENT_KEY = 'agro-theme-accent';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [mode, setModeState] = useState<ThemeMode>(() => {
        if (typeof window === 'undefined') return 'light';
        const saved = localStorage.getItem(MODE_KEY) as ThemeMode | null;
        if (saved) return saved;
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    });

    const [accent, setAccentState] = useState<AccentTheme>(() => {
        if (typeof window === 'undefined') return 'nature';
        return (localStorage.getItem(ACCENT_KEY) as AccentTheme) || 'nature';
    });

    useEffect(() => {
        const root = document.documentElement;
        if (mode === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        localStorage.setItem(MODE_KEY, mode);
    }, [mode]);

    useEffect(() => {
        document.documentElement.setAttribute('data-accent', accent);
        localStorage.setItem(ACCENT_KEY, accent);
    }, [accent]);

    const setMode = (m: ThemeMode) => setModeState(m);
    const setAccent = (a: AccentTheme) => setAccentState(a);
    const toggleMode = () => setModeState((prev) => (prev === 'light' ? 'dark' : 'light'));

    return (
        <ThemeContext.Provider value={{ mode, accent, setMode, setAccent, toggleMode }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
    return ctx;
}
