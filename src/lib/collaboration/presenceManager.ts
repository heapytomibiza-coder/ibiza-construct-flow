/**
 * Presence Manager
 * Phase 18: Real-time Collaboration & Presence System
 * 
 * Manages user presence and online status
 */

import { PresenceUser, UserStatus } from './types';

const PRESENCE_TIMEOUT = 30000; // 30 seconds
const HEARTBEAT_INTERVAL = 10000; // 10 seconds

class PresenceManager {
  private users = new Map<string, PresenceUser>();
  private listeners = new Set<(users: PresenceUser[]) => void>();
  private heartbeatInterval?: number;
  private currentUserId?: string;

  constructor() {
    this.startHeartbeat();
    this.startPresenceCleanup();
  }

  addUser(user: PresenceUser): void {
    this.users.set(user.id, {
      ...user,
      lastSeen: new Date(),
    });
    this.notifyListeners();
  }

  removeUser(userId: string): void {
    this.users.delete(userId);
    this.notifyListeners();
  }

  updateUser(userId: string, updates: Partial<PresenceUser>): void {
    const user = this.users.get(userId);
    if (user) {
      this.users.set(userId, {
        ...user,
        ...updates,
        lastSeen: new Date(),
      });
      this.notifyListeners();
    }
  }

  updateStatus(userId: string, status: UserStatus): void {
    this.updateUser(userId, { status });
  }

  updateCursor(userId: string, x: number, y: number, elementId?: string): void {
    this.updateUser(userId, {
      cursor: { x, y, elementId },
    });
  }

  heartbeat(userId: string): void {
    const user = this.users.get(userId);
    if (user) {
      this.updateUser(userId, { lastSeen: new Date() });
    }
  }

  getUsers(): PresenceUser[] {
    return Array.from(this.users.values());
  }

  getOnlineUsers(): PresenceUser[] {
    return this.getUsers().filter(u => u.status === 'online');
  }

  getUserCount(): number {
    return this.users.size;
  }

  isUserOnline(userId: string): boolean {
    const user = this.users.get(userId);
    return user?.status === 'online' && this.isUserActive(user);
  }

  private isUserActive(user: PresenceUser): boolean {
    const now = Date.now();
    const lastSeen = user.lastSeen.getTime();
    return now - lastSeen < PRESENCE_TIMEOUT;
  }

  subscribe(listener: (users: PresenceUser[]) => void): () => void {
    this.listeners.add(listener);
    listener(this.getUsers());

    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    const users = this.getUsers();
    this.listeners.forEach(listener => listener(users));
  }

  private startHeartbeat(): void {
    if (typeof window !== 'undefined') {
      this.heartbeatInterval = window.setInterval(() => {
        if (this.currentUserId) {
          this.heartbeat(this.currentUserId);
        }
      }, HEARTBEAT_INTERVAL);
    }
  }

  private startPresenceCleanup(): void {
    if (typeof window !== 'undefined') {
      setInterval(() => {
        const now = Date.now();
        const usersToRemove: string[] = [];

        this.users.forEach((user, userId) => {
          if (now - user.lastSeen.getTime() > PRESENCE_TIMEOUT) {
            usersToRemove.push(userId);
          }
        });

        usersToRemove.forEach(userId => {
          this.updateStatus(userId, 'offline');
        });
      }, PRESENCE_TIMEOUT);
    }
  }

  setCurrentUser(userId: string): void {
    this.currentUserId = userId;
  }

  cleanup(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    this.users.clear();
    this.listeners.clear();
  }
}

export const presenceManager = new PresenceManager();
