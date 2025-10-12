/**
 * Realtime Presence Hook
 * Phase 20: WebSocket & Real-time Communication
 * 
 * React hook for presence tracking via WebSocket
 */

import { useState, useEffect, useCallback } from 'react';
import { useRealtimeChannel } from './useRealtimeChannel';

interface PresenceUser {
  id: string;
  name: string;
  status: 'online' | 'away' | 'busy';
  joinedAt: number;
}

interface UseRealtimePresenceOptions {
  channel: string;
  user: {
    id: string;
    name: string;
  };
}

export function useRealtimePresence({ channel, user }: UseRealtimePresenceOptions) {
  const [users, setUsers] = useState<PresenceUser[]>([]);

  const handlePresenceSync = useCallback((data: { users: PresenceUser[] }) => {
    setUsers(data.users);
  }, []);

  const handleUserJoin = useCallback((data: PresenceUser) => {
    setUsers(prev => [...prev.filter(u => u.id !== data.id), data]);
  }, []);

  const handleUserLeave = useCallback((data: { userId: string }) => {
    setUsers(prev => prev.filter(u => u.id !== data.userId));
  }, []);

  const { send } = useRealtimeChannel({
    channel,
    events: {
      'presence:sync': handlePresenceSync,
      'presence:join': handleUserJoin,
      'presence:leave': handleUserLeave,
    },
  });

  useEffect(() => {
    // Announce presence
    send('presence:join', {
      id: user.id,
      name: user.name,
      status: 'online',
      joinedAt: Date.now(),
    });

    // Heartbeat
    const interval = setInterval(() => {
      send('presence:heartbeat', { userId: user.id });
    }, 30000);

    return () => {
      clearInterval(interval);
      send('presence:leave', { userId: user.id });
    };
  }, [user.id, user.name, send]);

  const updateStatus = useCallback((status: 'online' | 'away' | 'busy') => {
    send('presence:update', {
      userId: user.id,
      status,
    });
  }, [user.id, send]);

  return {
    users,
    onlineCount: users.length,
    updateStatus,
  };
}
