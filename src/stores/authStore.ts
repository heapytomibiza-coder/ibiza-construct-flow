/**
 * Authentication Store
 * Phase 13: State Management Enhancement & Zustand Integration
 * 
 * Centralized auth state with persistence
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  email: string;
  role: 'client' | 'professional' | 'admin';
  displayName?: string;
  avatarUrl?: string;
  isVerified: boolean;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  setUser: (user: User | null) => void;
  setLoading: (isLoading: boolean) => void;
  logout: () => void;
}

/**
 * Authentication store with persistence
 * Syncs across tabs automatically
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      
      setUser: (user) => set({ 
        user, 
        isAuthenticated: !!user,
        isLoading: false,
      }),
      
      setLoading: (isLoading) => set({ isLoading }),
      
      logout: () => set({ 
        user: null, 
        isAuthenticated: false,
        isLoading: false,
      }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
