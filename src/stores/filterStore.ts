/**
 * Filter Store
 * Phase 13: State Management Enhancement & Zustand Integration
 * 
 * Centralized filter state for search and filtering across the app
 */

import { create } from 'zustand';

interface FilterState {
  // Search
  searchTerm: string;
  
  // Service filters
  serviceFilters: {
    categories: string[];
    priceRange: [number, number];
    availability: string[];
    rating: number | null;
  };
  
  // Job filters
  jobFilters: {
    status: string[];
    dateRange: { start: Date | null; end: Date | null };
    sortBy: 'date' | 'price' | 'status';
    sortOrder: 'asc' | 'desc';
  };
  
  // Actions
  setSearchTerm: (term: string) => void;
  setServiceFilters: (filters: Partial<FilterState['serviceFilters']>) => void;
  setJobFilters: (filters: Partial<FilterState['jobFilters']>) => void;
  resetServiceFilters: () => void;
  resetJobFilters: () => void;
  resetAll: () => void;
}

const initialServiceFilters = {
  categories: [],
  priceRange: [0, 10000] as [number, number],
  availability: [],
  rating: null,
};

const initialJobFilters = {
  status: [],
  dateRange: { start: null, end: null },
  sortBy: 'date' as const,
  sortOrder: 'desc' as const,
};

export const useFilterStore = create<FilterState>((set) => ({
  searchTerm: '',
  serviceFilters: initialServiceFilters,
  jobFilters: initialJobFilters,
  
  setSearchTerm: (term) => set({ searchTerm: term }),
  
  setServiceFilters: (filters) =>
    set((state) => ({
      serviceFilters: { ...state.serviceFilters, ...filters },
    })),
  
  setJobFilters: (filters) =>
    set((state) => ({
      jobFilters: { ...state.jobFilters, ...filters },
    })),
  
  resetServiceFilters: () => set({ serviceFilters: initialServiceFilters }),
  resetJobFilters: () => set({ jobFilters: initialJobFilters }),
  resetAll: () =>
    set({
      searchTerm: '',
      serviceFilters: initialServiceFilters,
      jobFilters: initialJobFilters,
    }),
}));
