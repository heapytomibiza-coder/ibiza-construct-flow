import React, { Suspense } from 'react';
import { SkeletonLoader } from '@/components/loading/SkeletonLoader';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';

interface LazyRouteLoaderProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  variant?: 'dashboard' | 'card' | 'list' | 'table' | 'profile' | 'custom';
}

export const LazyRouteLoader = ({ 
  children, 
  fallback, 
  variant = 'dashboard' 
}: LazyRouteLoaderProps) => {
  const defaultFallback = fallback || (
    <div className="min-h-screen bg-background">
      <SkeletonLoader variant={variant} />
    </div>
  );

  return (
    <ErrorBoundary>
      <Suspense fallback={defaultFallback}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
};