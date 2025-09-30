import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Image, FileImage, Zap } from 'lucide-react';

interface ImageMetrics {
  totalImages: number;
  optimizedImages: number;
  lazyLoadedImages: number;
  avgLoadTime: number;
  webpSupported: boolean;
}

/**
 * Asset Optimization Monitor
 * Tracks image optimization metrics in real-time
 */
export const AssetOptimizationMonitor = () => {
  const [metrics, setMetrics] = useState<ImageMetrics>({
    totalImages: 0,
    optimizedImages: 0,
    lazyLoadedImages: 0,
    avgLoadTime: 0,
    webpSupported: false,
  });

  useEffect(() => {
    // Check WebP support
    const checkWebPSupport = () => {
      const canvas = document.createElement('canvas');
      if (canvas.getContext && canvas.getContext('2d')) {
        return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
      }
      return false;
    };

    // Collect image metrics
    const collectMetrics = () => {
      const images = document.querySelectorAll('img');
      const pictureElements = document.querySelectorAll('picture');
      
      let lazyCount = 0;
      let optimizedCount = 0;
      let totalLoadTime = 0;
      let loadedCount = 0;

      images.forEach((img) => {
        // Check if lazy loaded
        if (img.loading === 'lazy') lazyCount++;
        
        // Check if optimized (has srcset or is in picture element)
        if (img.srcset || img.closest('picture')) optimizedCount++;
        
        // Measure load time for recently loaded images
        const performanceEntry = performance.getEntriesByName(img.src, 'resource')[0];
        if (performanceEntry) {
          totalLoadTime += performanceEntry.duration;
          loadedCount++;
        }
      });

      setMetrics({
        totalImages: images.length,
        optimizedImages: optimizedCount + pictureElements.length,
        lazyLoadedImages: lazyCount,
        avgLoadTime: loadedCount > 0 ? Math.round(totalLoadTime / loadedCount) : 0,
        webpSupported: checkWebPSupport(),
      });
    };

    collectMetrics();
    
    // Refresh metrics every 5 seconds
    const interval = setInterval(collectMetrics, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const optimizationRate = metrics.totalImages > 0 
    ? Math.round((metrics.optimizedImages / metrics.totalImages) * 100) 
    : 0;

  const lazyLoadRate = metrics.totalImages > 0 
    ? Math.round((metrics.lazyLoadedImages / metrics.totalImages) * 100) 
    : 0;

  const getStatusColor = (value: number) => {
    if (value >= 80) return 'bg-green-500/10 text-green-700';
    if (value >= 50) return 'bg-yellow-500/10 text-yellow-700';
    return 'bg-red-500/10 text-red-700';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Image className="w-5 h-5" />
              Asset Optimization
            </CardTitle>
            <CardDescription>
              Image loading and optimization metrics
            </CardDescription>
          </div>
          {metrics.webpSupported && (
            <Badge variant="outline" className="bg-green-500/10 text-green-700">
              <Zap className="w-3 h-3 mr-1" />
              WebP Supported
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Image Count */}
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            <FileImage className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Total Images</span>
          </div>
          <span className="text-lg font-bold">{metrics.totalImages}</span>
        </div>

        {/* Optimization Rate */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Optimization Rate</span>
            <Badge className={getStatusColor(optimizationRate)}>
              {optimizationRate}%
            </Badge>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-gradient-hero h-2 rounded-full transition-all duration-300"
              style={{ width: `${optimizationRate}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {metrics.optimizedImages} of {metrics.totalImages} images optimized
          </p>
        </div>

        {/* Lazy Loading Rate */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Lazy Loading Rate</span>
            <Badge className={getStatusColor(lazyLoadRate)}>
              {lazyLoadRate}%
            </Badge>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${lazyLoadRate}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {metrics.lazyLoadedImages} of {metrics.totalImages} images lazy loaded
          </p>
        </div>

        {/* Average Load Time */}
        {metrics.avgLoadTime > 0 && (
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <span className="text-sm font-medium">Avg. Load Time</span>
            <span className="text-lg font-bold">
              {metrics.avgLoadTime}ms
            </span>
          </div>
        )}

        {/* Recommendations */}
        {optimizationRate < 80 && (
          <div className="p-3 bg-yellow-500/10 rounded-lg">
            <p className="text-sm text-yellow-700 font-medium">
              💡 Tip: Use OptimizedImage component for better performance
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
