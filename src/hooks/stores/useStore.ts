/**
 * Store Hook Utilities
 * Phase 13: State Management Enhancement & Zustand Integration
 * 
 * Type-safe selectors and utilities for Zustand stores
 */

import { useAuthStore, useUIStore, useNotificationStore, useCartStore, useDashboardStore, useFilterStore, useCacheStore } from '@/stores';

/**
 * Selector hooks for better performance
 * Only re-render when selected values change
 */

// Auth selectors
export const useCurrentUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
export const useAuthLoading = () => useAuthStore((state) => state.isLoading);

// UI selectors
export const useSidebarState = () => useUIStore((state) => ({
  isOpen: state.isSidebarOpen,
  isCollapsed: state.isSidebarCollapsed,
}));

export const useActiveModal = () => useUIStore((state) => ({
  modalId: state.activeModal,
  data: state.modalData,
}));

export const useTheme = () => useUIStore((state) => state.theme);

// Notification selectors
export const useUnreadCount = () => useNotificationStore((state) => state.unreadCount);
export const useNotifications = () => useNotificationStore((state) => state.notifications);

// Cart selectors
export const useCartItems = () => useCartStore((state) => state.items);
export const useCartTotal = () => useCartStore((state) => state.total);
export const useCartItemCount = () => useCartStore((state) => state.getItemCount());

/**
 * Combined selectors for complex state
 */
export const useAuthState = () => useAuthStore((state) => ({
  user: state.user,
  isAuthenticated: state.isAuthenticated,
  isLoading: state.isLoading,
}));

export const useUIState = () => useUIStore((state) => ({
  sidebar: {
    isOpen: state.isSidebarOpen,
    isCollapsed: state.isSidebarCollapsed,
  },
  modal: {
    id: state.activeModal,
    data: state.modalData,
  },
  theme: state.theme,
  search: {
    isOpen: state.isSearchOpen,
    query: state.searchQuery,
  },
}));

// Dashboard selectors
export const useDashboardView = (type: 'professional' | 'client' | 'admin') => 
  useDashboardStore((state) => {
    if (type === 'professional') return state.professionalView;
    if (type === 'client') return state.clientView;
    return state.adminView;
  });

export const useDashboardFilters = () => useDashboardStore((state) => ({
  dateRange: state.dateRange,
  categories: state.selectedCategories,
  compactMode: state.compactMode,
}));

// Filter selectors
export const useSearchTerm = () => useFilterStore((state) => state.searchTerm);
export const useServiceFilters = () => useFilterStore((state) => state.serviceFilters);
export const useJobFilters = () => useFilterStore((state) => state.jobFilters);

// Cache selectors (online status is available via hooks/cache/useOnlineStatus)
export const useCachedData = <T>(key: string) => {
  const getCache = useCacheStore((state) => state.getCache);
  return getCache<T>(key);
};
