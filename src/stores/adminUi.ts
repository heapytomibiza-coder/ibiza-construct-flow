/**
 * Zustand store for admin UI state (filters, modals, selections)
 * Keeps UI state separate from server state (React Query)
 */

import { create } from 'zustand';
import { PackStatus, PackSource } from '@/types/packs';

interface PackFilters {
  status?: PackStatus;
  source?: PackSource;
  slug?: string;
}

interface AdminUiState {
  // Pack filters
  filters: PackFilters;
  setFilters: (filters: Partial<PackFilters>) => void;
  resetFilters: () => void;

  // Compare view
  compareSlug?: string;
  setCompareSlug: (slug?: string) => void;

  // Modals
  importModalOpen: boolean;
  setImportModalOpen: (open: boolean) => void;
  
  aiDrafterModalOpen: boolean;
  setAiDrafterModalOpen: (open: boolean) => void;

  // Selected pack for actions
  selectedPackId?: string;
  setSelectedPackId: (packId?: string) => void;
}

const defaultFilters: PackFilters = {
  status: undefined,
  source: undefined,
  slug: undefined,
};

export const useAdminUi = create<AdminUiState>((set) => ({
  // Filters
  filters: defaultFilters,
  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    })),
  resetFilters: () => set({ filters: defaultFilters }),

  // Compare
  compareSlug: undefined,
  setCompareSlug: (compareSlug) => set({ compareSlug }),

  // Modals
  importModalOpen: false,
  setImportModalOpen: (importModalOpen) => set({ importModalOpen }),
  
  aiDrafterModalOpen: false,
  setAiDrafterModalOpen: (aiDrafterModalOpen) => set({ aiDrafterModalOpen }),

  // Selection
  selectedPackId: undefined,
  setSelectedPackId: (selectedPackId) => set({ selectedPackId }),
}));
