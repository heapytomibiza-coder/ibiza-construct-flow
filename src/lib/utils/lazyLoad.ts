import { lazy, ComponentType } from 'react';

/**
 * Lazy Loading Utilities
 * Phase 10: Production Readiness & Performance Optimization
 * 
 * Provides retry logic for lazy-loaded components
 */

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

export const lazyWithRetry = <T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  retries = MAX_RETRIES
): React.LazyExoticComponent<T> => {
  return lazy(async () => {
    let lastError: Error | undefined;

    for (let i = 0; i < retries; i++) {
      try {
        return await importFn();
      } catch (error) {
        lastError = error as Error;
        console.warn(`Failed to load component (attempt ${i + 1}/${retries}):`, error);
        
        if (i < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (i + 1)));
        }
      }
    }

    throw lastError || new Error('Failed to load component');
  });
};

/**
 * Preload a lazy-loaded component
 */
export const preloadComponent = (importFn: () => Promise<any>) => {
  importFn().catch(err => console.warn('Failed to preload component:', err));
};
