import React from 'react';
import { QueryClient } from '@tanstack/react-query';
import { prefetchCategories } from '@/lib/performance/prefetchCategories';

// Dynamic import utilities for better code splitting
export const importUtils = {
  // Charts - only load when needed
  loadCharts: () => import('recharts'),
  
  // Calendar - only load when needed  
  loadCalendar: () => import('react-day-picker'),
  
  // File upload - only load when needed
  loadDropzone: () => import('react-dropzone'),
  
  // Form validation - only load when needed
  loadFormValidation: () => import('zod'),
  
  // Date utilities - only load when needed
  loadDateUtils: () => import('date-fns'),
};

// Resource preloader for critical routes
export const preloadRoute = (routePath: string, queryClient?: QueryClient) => {
  const routeMap: Record<string, () => Promise<any>> = {
    '/dashboard/pro': () => import('@/components/dashboards/UnifiedProfessionalDashboard'),
    '/dashboard/client': () => import('@/components/dashboards/UnifiedClientDashboard'),  
    '/dashboard/admin': () => import('@/pages/admin/AdminDashboardPage'),
    '/admin': () => import('@/pages/admin/AdminDashboardPage'),
    '/post': () => import('@/pages/PostJob'),
    '/discovery': () => import('@/pages/Discovery'),
    '/job-board': () => import('@/pages/JobBoardPage'),
  };

  const loader = routeMap[routePath];
  if (loader) {
    // Preload in idle time
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(() => {
        loader();
        // Also prefetch taxonomy for wizard route
        if (routePath === '/post' && queryClient) {
          prefetchCategories(queryClient);
        }
      });
    } else {
      setTimeout(() => {
        loader();
        if (routePath === '/post' && queryClient) {
          prefetchCategories(queryClient);
        }
      }, 100);
    }
  }
};

// Preload on hover for better UX
export const useRoutePreload = () => {
  const handleMouseEnter = (path: string) => {
    preloadRoute(path);
  };

  return { handleMouseEnter };
};

// Monitor bundle performance
export const logBundleMetrics = () => {
  if (import.meta.env.DEV && 'performance' in window) {
    const resources = performance.getEntriesByType('resource');
    const jsResources = resources.filter(r => r.name.endsWith('.js'));
    
    const totalSize = jsResources.reduce((acc, r: any) => acc + (r.transferSize || 0), 0);
    const totalTime = jsResources.reduce((acc, r: any) => acc + r.duration, 0);
    
    console.log('📦 Bundle Metrics:', {
      jsFiles: jsResources.length,
      totalSize: `${(totalSize / 1024).toFixed(2)} KB`,
      totalTime: `${totalTime.toFixed(2)} ms`,
      avgSize: `${(totalSize / jsResources.length / 1024).toFixed(2)} KB`,
    });
  }
};

// Bundle size analyzer component (development only)
export const BundleAnalyzer = () => {
  // Use Vite's import.meta.env.DEV for correct production detection
  if (!import.meta.env.DEV) return null;
  
  const getMemoryUsage = () => {
    // @ts-ignore - performance.memory is not in all browsers
    const memory = (performance as any).memory;
    return memory ? (memory.usedJSHeapSize / 1024 / 1024).toFixed(1) : 'N/A';
  };
  
  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-2 rounded text-xs">
      <div>Bundle: {getMemoryUsage()}MB</div>
      <div>Route: {window.location.pathname}</div>
    </div>
  );
};