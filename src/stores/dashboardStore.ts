/**
 * Dashboard Store
 * Phase 13: State Management Enhancement & Zustand Integration
 * 
 * Centralized dashboard state management
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface DashboardState {
  // View preferences
  professionalView: 'grid' | 'list';
  clientView: 'grid' | 'list';
  adminView: 'overview' | 'detailed';
  
  // Filter states
  dateRange: { start: Date | null; end: Date | null };
  selectedCategories: string[];
  
  // UI state
  sidebarCollapsed: boolean;
  compactMode: boolean;
  
  // Actions
  setProfessionalView: (view: 'grid' | 'list') => void;
  setClientView: (view: 'grid' | 'list') => void;
  setAdminView: (view: 'overview' | 'detailed') => void;
  setDateRange: (start: Date | null, end: Date | null) => void;
  setSelectedCategories: (categories: string[]) => void;
  toggleSidebar: () => void;
  toggleCompactMode: () => void;
  reset: () => void;
}

const initialState = {
  professionalView: 'grid' as const,
  clientView: 'grid' as const,
  adminView: 'overview' as const,
  dateRange: { start: null, end: null },
  selectedCategories: [],
  sidebarCollapsed: false,
  compactMode: false,
};

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set) => ({
      ...initialState,
      
      setProfessionalView: (view) => set({ professionalView: view }),
      setClientView: (view) => set({ clientView: view }),
      setAdminView: (view) => set({ adminView: view }),
      
      setDateRange: (start, end) => set({ dateRange: { start, end } }),
      setSelectedCategories: (categories) => set({ selectedCategories: categories }),
      
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      toggleCompactMode: () => set((state) => ({ compactMode: !state.compactMode })),
      
      reset: () => set(initialState),
    }),
    {
      name: 'dashboard-storage',
    }
  )
);
