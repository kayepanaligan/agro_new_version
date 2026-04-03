import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { route as routeFn } from 'ziggy-js';
import { initializeTheme } from './hooks/use-appearance';
import { NetworkProvider } from './contexts/NetworkContext';
import { preCacheReferenceData } from './services/reference-data';
import { startAutoSync } from './services/sync';

declare global {
    const route: typeof routeFn;
}

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

// Initialize offline-first features
if (typeof window !== 'undefined') {
    // Pre-cache reference data on app load
    preCacheReferenceData().catch(console.error);
    
    // Setup auto-sync listener
    startAutoSync().catch(console.error);
}

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <NetworkProvider>
                <App {...props} />
            </NetworkProvider>
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();
