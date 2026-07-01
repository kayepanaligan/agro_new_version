import React, { createContext, useContext, ReactNode } from 'react';
import { useWebSocket } from '@/hooks/use-websocket';

interface WebSocketContextType {
    subscribe: (channel: string, event: string, callback: (data: any) => void) => void;
    unsubscribe: (channel: string, event: string) => void;
    unsubscribeAll: () => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

interface WebSocketProviderProps {
    children: ReactNode;
    enabled?: boolean;
}

export function WebSocketProvider({ children, enabled = true }: WebSocketProviderProps) {
    const { subscribe, unsubscribe, unsubscribeAll } = useWebSocket({
        enabled,
        onConnect: () => {
            console.log('✅ WebSocket connected');
        },
        onDisconnect: () => {
            console.log('❌ WebSocket disconnected');
        },
        onError: (error) => {
            console.error('⚠️ WebSocket error:', error);
        },
    });

    return (
        <WebSocketContext.Provider value={{ subscribe, unsubscribe, unsubscribeAll }}>
            {children}
        </WebSocketContext.Provider>
    );
}

export function useWebSocketContext() {
    const context = useContext(WebSocketContext);
    if (!context) {
        throw new Error('useWebSocketContext must be used within a WebSocketProvider');
    }
    return context;
}

export default WebSocketProvider;
