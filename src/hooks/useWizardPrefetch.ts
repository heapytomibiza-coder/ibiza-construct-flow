/**
 * Wizard Prefetch Hook
 * Sprint 3: Performance Optimization
 * 
 * Prefetches wizard dependencies on hover/focus for instant loading
 */

import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { prefetchCategories, prefetchAllTaxonomy } from '@/lib/performance/prefetchCategories';

/**
 * Hook to prefetch wizard data on user intent signals
 * 
 * Usage:
 * const { prefetchOnHover, prefetchOnFocus } = useWizardPrefetch();
 * <Button {...prefetchOnHover} onClick={navigateToWizard}>Post a Job</Button>
 */
export const useWizardPrefetch = () => {
  const queryClient = useQueryClient();

  const prefetch = useCallback(() => {
    // Prefetch categories (fast, first level)
    prefetchCategories(queryClient).catch(() => {
      // Silent fail - data will load on demand
    });
  }, [queryClient]);

  const prefetchAggressive = useCallback(() => {
    // Prefetch all taxonomy levels (for high-intent signals)
    prefetchAllTaxonomy(queryClient).catch(() => {
      // Silent fail
    });
  }, [queryClient]);

  return {
    // Event handlers for declarative use
    prefetchOnHover: {
      onMouseEnter: prefetch,
    },
    prefetchOnFocus: {
      onFocus: prefetch,
    },
    // Combined for buttons
    prefetchHandlers: {
      onMouseEnter: prefetch,
      onFocus: prefetch,
    },
    // For aggressive prefetch (e.g., on link in viewport)
    prefetchAll: prefetchAggressive,
    // Direct prefetch function
    prefetch,
  };
};
