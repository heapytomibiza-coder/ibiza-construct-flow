/**
 * Presence Hook
 * Phase 18: Real-time Collaboration & Presence System
 * 
 * React hook for user presence
 */

import { useState, useEffect, useCallback } from 'react';
import { presenceManager, PresenceUser, UserStatus } from '@/lib/collaboration';

export function usePresence() {
  const [users, setUsers] = useState<PresenceUser[]>([]);

  useEffect(() => {
    const unsubscribe = presenceManager.subscribe(setUsers);
    return unsubscribe;
  }, []);

  const joinSession = useCallback((user: PresenceUser) => {
    presenceManager.addUser(user);
    presenceManager.setCurrentUser(user.id);
  }, []);

  const leaveSession = useCallback((userId: string) => {
    presenceManager.removeUser(userId);
  }, []);

  const updateStatus = useCallback((userId: string, status: UserStatus) => {
    presenceManager.updateStatus(userId, status);
  }, []);

  const updateCursor = useCallback((userId: string, x: number, y: number, elementId?: string) => {
    presenceManager.updateCursor(userId, x, y, elementId);
  }, []);

  return {
    users,
    onlineUsers: users.filter(u => u.status === 'online'),
    userCount: users.length,
    onlineCount: users.filter(u => u.status === 'online').length,
    joinSession,
    leaveSession,
    updateStatus,
    updateCursor,
    isUserOnline: presenceManager.isUserOnline.bind(presenceManager),
  };
}
