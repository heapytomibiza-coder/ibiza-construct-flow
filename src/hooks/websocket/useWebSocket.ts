/**
 * WebSocket Hook
 * Phase 20: WebSocket & Real-time Communication
 * 
 * React hook for WebSocket connections
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { WebSocketClient, WebSocketStatus, WebSocketMessage } from '@/lib/websocket';

interface UseWebSocketOptions {
  url: string;
  reconnect?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
  onMessage?: (message: WebSocketMessage) => void;
}

export function useWebSocket(options: UseWebSocketOptions) {
  const [status, setStatus] = useState<WebSocketStatus>('disconnected');
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const clientRef = useRef<WebSocketClient | null>(null);

  useEffect(() => {
    const client = new WebSocketClient({
      url: options.url,
      reconnect: options.reconnect ?? true,
      onOpen: options.onOpen,
      onClose: options.onClose,
      onMessage: (message) => {
        setLastMessage(message);
        options.onMessage?.(message);
      },
    });

    client.onStatusChange(setStatus);
    client.connect();
    clientRef.current = client;

    return () => {
      client.disconnect();
    };
  }, [options.url]);

  const send = useCallback(<T = any>(type: string, payload: T) => {
    clientRef.current?.send(type, payload);
  }, []);

  const subscribe = useCallback((channel: string, handler: (data: any) => void) => {
    return clientRef.current?.subscribe(channel, handler) || (() => {});
  }, []);

  return {
    status,
    lastMessage,
    send,
    subscribe,
    isConnected: status === 'connected',
    isConnecting: status === 'connecting',
    stats: clientRef.current?.getStats(),
  };
}
