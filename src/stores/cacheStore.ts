/**
 * Cache Store
 * Phase 13: State Management Enhancement & Zustand Integration
 * 
 * Client-side cache management for offline support
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface CacheState {
  // Cache storage
  cache: Record<string, CacheEntry>;
  
  // Network state
  isOnline: boolean;
  
  // Actions
  setCache: <T>(key: string, data: T, ttl?: number) => void;
  getCache: <T>(key: string) => T | null;
  invalidateCache: (key: string) => void;
  clearCache: () => void;
  setOnlineStatus: (status: boolean) => void;
  pruneExpired: () => void;
}

const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

export const useCacheStore = create<CacheState>()(
  persist(
    (set, get) => ({
      cache: {},
      isOnline: navigator.onLine,
      
      setCache: (key, data, ttl = DEFAULT_TTL) => {
        const now = Date.now();
        set((state) => ({
          cache: {
            ...state.cache,
            [key]: {
              data,
              timestamp: now,
              expiresAt: now + ttl,
            },
          },
        }));
      },
      
      getCache: (key) => {
        const entry = get().cache[key];
        if (!entry) return null;
        
        // Check if expired
        if (Date.now() > entry.expiresAt) {
          get().invalidateCache(key);
          return null;
        }
        
        return entry.data;
      },
      
      invalidateCache: (key) => {
        set((state) => {
          const newCache = { ...state.cache };
          delete newCache[key];
          return { cache: newCache };
        });
      },
      
      clearCache: () => set({ cache: {} }),
      
      setOnlineStatus: (status) => set({ isOnline: status }),
      
      pruneExpired: () => {
        const now = Date.now();
        set((state) => {
          const newCache = Object.entries(state.cache).reduce((acc, [key, entry]) => {
            if (now <= entry.expiresAt) {
              acc[key] = entry;
            }
            return acc;
          }, {} as Record<string, CacheEntry>);
          return { cache: newCache };
        });
      },
    }),
    {
      name: 'app-cache',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// Setup online/offline listeners
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    useCacheStore.getState().setOnlineStatus(true);
  });
  
  window.addEventListener('offline', () => {
    useCacheStore.getState().setOnlineStatus(false);
  });
  
  // Prune expired cache entries every 5 minutes
  setInterval(() => {
    useCacheStore.getState().pruneExpired();
  }, 5 * 60 * 1000);
}
