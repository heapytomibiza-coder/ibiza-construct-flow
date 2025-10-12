/**
 * UI State Store
 * Phase 13: State Management Enhancement & Zustand Integration
 * 
 * Global UI state management (modals, sidebars, theme, etc.)
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  // Sidebar
  isSidebarOpen: boolean;
  isSidebarCollapsed: boolean;
  
  // Modals
  activeModal: string | null;
  modalData: any;
  
  // Theme (persisted)
  theme: 'light' | 'dark' | 'system';
  
  // Mobile
  isMobileMenuOpen: boolean;
  
  // Search
  isSearchOpen: boolean;
  searchQuery: string;
  
  // Actions
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
  toggleSidebarCollapse: () => void;
  
  openModal: (modalId: string, data?: any) => void;
  closeModal: () => void;
  
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  
  toggleMobileMenu: () => void;
  setMobileMenuOpen: (isOpen: boolean) => void;
  
  toggleSearch: () => void;
  setSearchQuery: (query: string) => void;
  clearSearch: () => void;
}

/**
 * UI store with theme persistence
 * Handles all global UI state
 */
export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      // Initial state
      isSidebarOpen: true,
      isSidebarCollapsed: false,
      activeModal: null,
      modalData: null,
      theme: 'system',
      isMobileMenuOpen: false,
      isSearchOpen: false,
      searchQuery: '',
      
      // Sidebar actions
      toggleSidebar: () => set((state) => ({ 
        isSidebarOpen: !state.isSidebarOpen 
      })),
      
      setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
      
      toggleSidebarCollapse: () => set((state) => ({ 
        isSidebarCollapsed: !state.isSidebarCollapsed 
      })),
      
      // Modal actions
      openModal: (modalId, data) => set({ 
        activeModal: modalId, 
        modalData: data 
      }),
      
      closeModal: () => set({ 
        activeModal: null, 
        modalData: null 
      }),
      
      // Theme actions
      setTheme: (theme) => set({ theme }),
      
      // Mobile menu actions
      toggleMobileMenu: () => set((state) => ({ 
        isMobileMenuOpen: !state.isMobileMenuOpen 
      })),
      
      setMobileMenuOpen: (isOpen) => set({ isMobileMenuOpen: isOpen }),
      
      // Search actions
      toggleSearch: () => set((state) => ({ 
        isSearchOpen: !state.isSearchOpen 
      })),
      
      setSearchQuery: (query) => set({ searchQuery: query }),
      
      clearSearch: () => set({ 
        searchQuery: '', 
        isSearchOpen: false 
      }),
    }),
    {
      name: 'ui-storage',
      partialize: (state) => ({
        theme: state.theme,
        isSidebarCollapsed: state.isSidebarCollapsed,
      }),
    }
  )
);
