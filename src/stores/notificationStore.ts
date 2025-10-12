/**
 * Notification Store
 * Phase 13: State Management Enhancement & Zustand Integration
 * 
 * Global notification state with unread count
 */

import { create } from 'zustand';

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  createdAt: Date;
  read: boolean;
  actionUrl?: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  
  // Actions
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  setNotifications: (notifications: Notification[]) => void;
}

/**
 * Notification store for in-app notifications
 * Separate from toast notifications
 */
export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,
  
  addNotification: (notification) => set((state) => {
    const newNotification: Notification = {
      ...notification,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      read: false,
    };
    
    const notifications = [newNotification, ...state.notifications].slice(0, 50); // Keep last 50
    const unreadCount = notifications.filter(n => !n.read).length;
    
    return { notifications, unreadCount };
  }),
  
  markAsRead: (id) => set((state) => {
    const notifications = state.notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    );
    const unreadCount = notifications.filter(n => !n.read).length;
    
    return { notifications, unreadCount };
  }),
  
  markAllAsRead: () => set((state) => ({
    notifications: state.notifications.map(n => ({ ...n, read: true })),
    unreadCount: 0,
  })),
  
  removeNotification: (id) => set((state) => {
    const notifications = state.notifications.filter(n => n.id !== id);
    const unreadCount = notifications.filter(n => !n.read).length;
    
    return { notifications, unreadCount };
  }),
  
  clearAll: () => set({ 
    notifications: [], 
    unreadCount: 0 
  }),
  
  setNotifications: (notifications) => set({
    notifications,
    unreadCount: notifications.filter(n => !n.read).length,
  }),
}));
