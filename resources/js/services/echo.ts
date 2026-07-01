import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

// Extend Window interface for Pusher
declare global {
    interface Window {
        Pusher: typeof Pusher;
    }
}

// Initialize Pusher
window.Pusher = Pusher;

// Create Echo instance
let echo: Echo<any> | null = null;

export const initializeEcho = (): Echo<any> => {
    if (echo) {
        return echo;
    }

    echo = new Echo({
        broadcaster: 'reverb',
        key: import.meta.env.VITE_REVERB_APP_KEY || '',
        wsHost: import.meta.env.VITE_REVERB_HOST || window.location.hostname,
        wsPort: import.meta.env.VITE_REVERB_PORT || 8080,
        wssPort: import.meta.env.VITE_REVERB_PORT || 8080,
        forceTLS: (import.meta.env.VITE_REVERB_SCHEME || 'http') === 'https',
        enabledTransports: ['ws', 'wss'],
    });

    return echo;
};

export const getEcho = (): Echo<any> | null => {
    return echo;
};

export const disconnectEcho = (): void => {
    if (echo) {
        echo.disconnect();
        echo = null;
    }
};

export default echo;
