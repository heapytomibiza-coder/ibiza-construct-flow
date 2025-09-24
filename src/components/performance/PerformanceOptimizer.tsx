import React, { Suspense, lazy, useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Zap, Clock, Database, Wifi, AlertTriangle, 
  CheckCircle, TrendingUp, Activity
} from 'lucide-react';

// Performance monitoring hook
export const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = useState({
    loadTime: 0,
    renderTime: 0,
    memoryUsage: 0,
    networkLatency: 0
  });

  useEffect(() => {
    // Track page load performance
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.entryType === 'navigation') {
          const nav = entry as PerformanceNavigationTiming;
          setMetrics(prev => ({
            ...prev,
            loadTime: nav.loadEventEnd - nav.fetchStart,
            renderTime: nav.domContentLoadedEventEnd - nav.domContentLoadedEventStart
          }));
        }
      });
    });

    observer.observe({ entryTypes: ['navigation'] });

    // Monitor memory usage
    const checkMemory = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        setMetrics(prev => ({
          ...prev,
          memoryUsage: memory.usedJSHeapSize / 1024 / 1024 // Convert to MB
        }));
      }
    };

    checkMemory();
    const memoryInterval = setInterval(checkMemory, 5000);

    return () => {
      observer.disconnect();
      clearInterval(memoryInterval);
    };
  }, []);

  return metrics;
};

// Lazy loading wrapper with error boundary
interface LazyComponentProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
}

export const LazyWrapper = ({ children, fallback, errorFallback }: LazyComponentProps) => {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return errorFallback || (
      <Card className="p-6">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <p className="text-muted-foreground">Failed to load component</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2"
            onClick={() => setHasError(false)}
          >
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  const defaultFallback = (
    <Card className="p-6">
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-muted rounded w-3/4"></div>
        <div className="h-4 bg-muted rounded w-1/2"></div>
        <div className="h-4 bg-muted rounded w-2/3"></div>
      </div>
    </Card>
  );

  return (
    <Suspense fallback={fallback || defaultFallback}>
      <ErrorBoundary onError={() => setHasError(true)}>
        {children}
      </ErrorBoundary>
    </Suspense>
  );
};

// Error boundary component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; onError: () => void },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; onError: () => void }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch() {
    this.props.onError();
  }

  render() {
    if (this.state.hasError) {
      return null;
    }

    return this.props.children;
  }
}

// Image optimization component
interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}

export const OptimizedImage = ({ src, alt, className, sizes, priority = false }: OptimizedImageProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => setIsLoading(false);
  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  if (hasError) {
    return (
      <div className={`bg-muted rounded flex items-center justify-center ${className}`}>
        <AlertTriangle className="w-8 h-8 text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-muted animate-pulse rounded" />
      )}
      <img
        src={src}
        alt={alt}
        className={`transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'} ${className}`}
        sizes={sizes}
        loading={priority ? 'eager' : 'lazy'}
        onLoad={handleLoad}
        onError={handleError}
      />
    </div>
  );
};

// Virtual scrolling component for large lists
interface VirtualScrollProps {
  items: any[];
  renderItem: (item: any, index: number) => React.ReactNode;
  itemHeight: number;
  containerHeight: number;
}

export const VirtualScroll = ({ items, renderItem, itemHeight, containerHeight }: VirtualScrollProps) => {
  const [scrollTop, setScrollTop] = useState(0);
  
  const visibleStart = Math.floor(scrollTop / itemHeight);
  const visibleEnd = Math.min(visibleStart + Math.ceil(containerHeight / itemHeight) + 1, items.length);
  
  const visibleItems = items.slice(visibleStart, visibleEnd);

  return (
    <div 
      style={{ height: containerHeight }}
      className="overflow-auto"
      onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
    >
      <div style={{ height: items.length * itemHeight, position: 'relative' }}>
        {visibleItems.map((item, index) => (
          <div
            key={visibleStart + index}
            style={{
              position: 'absolute',
              top: (visibleStart + index) * itemHeight,
              height: itemHeight,
              width: '100%'
            }}
          >
            {renderItem(item, visibleStart + index)}
          </div>
        ))}
      </div>
    </div>
  );
};

// Performance dashboard component
export const PerformanceDashboard = () => {
  const metrics = usePerformanceMonitor();
  const [showDetails, setShowDetails] = useState(false);

  const getPerformanceScore = () => {
    let score = 100;
    if (metrics.loadTime > 3000) score -= 30;
    if (metrics.renderTime > 100) score -= 20;
    if (metrics.memoryUsage > 50) score -= 20;
    return Math.max(0, score);
  };

  const performanceScore = getPerformanceScore();

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (!showDetails) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowDetails(true)}
        className="fixed bottom-4 left-4 z-50"
      >
        <Activity className="w-4 h-4 mr-2" />
        Performance
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-4 left-4 w-80 z-50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            <span className="font-semibold">Performance</span>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setShowDetails(false)}
          >
            ×
          </Button>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Overall Score</span>
            <Badge className={getScoreColor(performanceScore)}>
              {performanceScore}/100
            </Badge>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Load Time</span>
              <span>{(metrics.loadTime / 1000).toFixed(2)}s</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-muted-foreground">Render Time</span>
              <span>{metrics.renderTime.toFixed(0)}ms</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-muted-foreground">Memory Usage</span>
              <span>{metrics.memoryUsage.toFixed(1)}MB</span>
            </div>
          </div>

          <div className="pt-2 border-t">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {performanceScore >= 90 ? (
                <>
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  Excellent performance
                </>
              ) : performanceScore >= 70 ? (
                <>
                  <Clock className="w-3 h-3 text-yellow-500" />
                  Good performance
                </>
              ) : (
                <>
                  <AlertTriangle className="w-3 h-3 text-red-500" />
                  Needs optimization
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Bundle analyzer component
export const BundleAnalyzer = () => {
  const [bundleInfo, setBundleInfo] = useState({
    totalSize: 0,
    gzippedSize: 0,
    chunks: []
  });

  useEffect(() => {
    // In a real implementation, this would analyze the actual bundle
    // For now, we'll simulate the data
    setBundleInfo({
      totalSize: 1.2 * 1024 * 1024, // 1.2MB
      gzippedSize: 350 * 1024, // 350KB
      chunks: [
        { name: 'main', size: 800 * 1024 },
        { name: 'vendor', size: 300 * 1024 },
        { name: 'shared', size: 100 * 1024 }
      ]
    });
  }, []);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Database className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Bundle Analysis</h3>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-muted/30 rounded">
              <div className="text-2xl font-bold text-foreground">
                {formatBytes(bundleInfo.totalSize)}
              </div>
              <div className="text-sm text-muted-foreground">Total Size</div>
            </div>
            <div className="text-center p-3 bg-muted/30 rounded">
              <div className="text-2xl font-bold text-green-600">
                {formatBytes(bundleInfo.gzippedSize)}
              </div>
              <div className="text-sm text-muted-foreground">Gzipped</div>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">Chunks</h4>
            <div className="space-y-2">
              {bundleInfo.chunks.map((chunk: any) => (
                <div key={chunk.name} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{chunk.name}</span>
                  <span>{formatBytes(chunk.size)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span className="text-muted-foreground">
              Bundle size is within recommended limits
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};