import React, { Suspense, lazy } from 'react';
import { SkeletonLoader } from '@/components/loading/SkeletonLoader';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

interface LazyComponentLoaderProps {
  factory: () => Promise<{ default: React.ComponentType<any> }>;
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
  skeletonVariant?: 'card' | 'list' | 'table' | 'profile' | 'dashboard' | 'custom';
  skeletonCount?: number;
  props?: any;
}

export const LazyComponentLoader = ({
  factory,
  fallback,
  errorFallback,
  skeletonVariant = 'card',
  skeletonCount = 1,
  props = {}
}: LazyComponentLoaderProps) => {
  const LazyComponent = lazy(factory);

  const defaultFallback = fallback || (
    <SkeletonLoader variant={skeletonVariant} count={skeletonCount} />
  );

  const defaultErrorFallback = errorFallback || (
    <Card className="w-full">
      <CardContent className="flex items-center justify-center p-8">
        <div className="text-center space-y-2">
          <AlertTriangle className="w-8 h-8 mx-auto text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Failed to load component. Please try refreshing the page.
          </p>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <ErrorBoundary fallback={defaultErrorFallback}>
      <Suspense fallback={defaultFallback}>
        <LazyComponent {...props} />
      </Suspense>
    </ErrorBoundary>
  );
};

// Pre-configured lazy loaders for common components
export const LazyAdminDashboard = (props: any) => (
  <LazyComponentLoader
    factory={() => import('@/components/dashboards/AdminDashboard')}
    skeletonVariant="dashboard"
    props={props}
  />
);

export const LazyProfessionalDashboard = (props: any) => (
  <LazyComponentLoader
    factory={() => import('@/components/dashboards/ProfessionalDashboard')}
    skeletonVariant="dashboard"
    props={props}
  />
);

export const LazyClientDashboard = (props: any) => (
  <LazyComponentLoader
    factory={() => import('@/components/dashboards/ClientDashboard')}
    skeletonVariant="dashboard"
    props={props}
  />
);

export const LazyProfessionalOnboarding = (props: any) => (
  <LazyComponentLoader
    factory={() => import('@/components/onboarding/ProfessionalOnboarding').then(module => ({ default: module.ProfessionalOnboarding }))}
    skeletonVariant="profile"
    props={props}
  />
);

export const LazyServiceCreationForm = (props: any) => (
  <LazyComponentLoader
    factory={() => import('@/components/services/ServiceCreationForm').then(module => ({ default: module.ServiceCreationForm }))}
    skeletonVariant="card"
    skeletonCount={2}
    props={props}
  />
);

export const LazySmartMatchingEngine = (props: any) => (
  <LazyComponentLoader
    factory={() => import('@/components/ai/SmartMatchingEngine').then(module => ({ default: module.SmartMatchingEngine }))}
    skeletonVariant="dashboard"
    props={props}
  />
);

export const LazyPredictiveAnalytics = (props: any) => (
  <LazyComponentLoader
    factory={() => import('@/components/ai/PredictiveAnalytics').then(module => ({ default: module.PredictiveAnalytics }))}
    skeletonVariant="dashboard"
    props={props}
  />
);

export const LazyQualityAssurance = (props: any) => (
  <LazyComponentLoader
    factory={() => import('@/components/ai/QualityAssurance').then(module => ({ default: module.QualityAssurance }))}
    skeletonVariant="dashboard"
    props={props}
  />
);

// Hook for dynamic imports with error handling
export const useLazyImport = () => {
  return React.useCallback((factory: () => Promise<{ default: React.ComponentType<any> }>) => {
    return lazy(() => 
      factory().catch((error) => {
        console.error('Failed to load component:', error);
        // Return a fallback component
        return Promise.resolve({
          default: () => (
            <Card className="w-full">
              <CardContent className="flex items-center justify-center p-8">
                <div className="text-center space-y-2">
                  <AlertTriangle className="w-8 h-8 mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Component failed to load
                  </p>
                </div>
              </CardContent>
            </Card>
          )
        });
      })
    );
  }, []);
};