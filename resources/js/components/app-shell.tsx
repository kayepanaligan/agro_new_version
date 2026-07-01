import { SidebarProvider } from '@/components/ui/sidebar';
import { ThemeProvider } from '@/context/theme-context';

interface AppShellProps {
    children: React.ReactNode;
    variant?: 'header' | 'sidebar';
}

export function AppShell({ children, variant = 'header' }: AppShellProps) {
    if (variant === 'header') {
        return <div className="flex min-h-screen w-full flex-col">{children}</div>;
    }

    return (
        <ThemeProvider>
            <SidebarProvider>
                {children}
            </SidebarProvider>
        </ThemeProvider>
    );
}
