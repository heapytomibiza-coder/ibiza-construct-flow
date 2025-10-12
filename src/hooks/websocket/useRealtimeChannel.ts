/**
 * Realtime Channel Hook
 * Phase 20: WebSocket & Real-time Communication
 * 
 * React hook for channel-based messaging
 */

import { useEffect, useCallback, useRef } from 'react';
import { realtimeManager } from '@/lib/websocket';

interface UseRealtimeChannelOptions {
  channel: string;
  events?: Record<string, (data: any) => void>;
  enabled?: boolean;
}

export function useRealtimeChannel({
  channel: channelName,
  events = {},
  enabled = true,
}: UseRealtimeChannelOptions) {
  const channelRef = useRef(realtimeManager.channel(channelName));

  useEffect(() => {
    if (!enabled) return;

    const channel = channelRef.current;
    channel.subscribe();

    // Register event handlers
    Object.entries(events).forEach(([event, handler]) => {
      channel.on(event, handler);
    });

    return () => {
      channel.unsubscribe();
    };
  }, [channelName, enabled, events]);

  const send = useCallback(<T = any>(event: string, payload: T) => {
    channelRef.current.send(event, payload);
  }, []);

  return {
    send,
    channel: channelRef.current,
  };
}
