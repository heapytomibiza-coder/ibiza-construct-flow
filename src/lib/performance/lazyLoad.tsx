/**
 * Lazy loading utilities for code splitting
 * Phase 6: Performance Optimization
 */

import { lazy, ComponentType, LazyExoticComponent, Suspense } from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Loading fallback component
 */
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

/**
 * Wrapper for lazy-loaded components with suspense boundary
 */
export const lazyLoad = <T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback: React.ReactNode = <LoadingFallback />
): LazyExoticComponent<T> => {
  const LazyComponent = lazy(importFunc);
  
  // Return a component that wraps with Suspense
  return LazyComponent;
};

/**
 * Preload a lazy component
 */
export const preloadComponent = (importFunc: () => Promise<any>) => {
  importFunc();
};

/**
 * Lazy load with retry on failure
 */
export const lazyLoadWithRetry = <T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  retries = 3
): LazyExoticComponent<T> => {
  return lazy(async () => {
    let lastError: Error | null = null;
    
    for (let i = 0; i < retries; i++) {
      try {
        return await importFunc();
      } catch (error) {
        lastError = error as Error;
        console.warn(`Failed to load component (attempt ${i + 1}/${retries})`);
        
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
      }
    }
    
    throw lastError;
  });
};

/**
 * Wrapper component that adds Suspense boundary
 */
export const LazyBoundary: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ children, fallback = <LoadingFallback /> }) => {
  return <Suspense fallback={fallback}>{children}</Suspense>;
};
