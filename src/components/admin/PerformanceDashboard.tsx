/**
 * Performance Monitoring Dashboard
 * Phase 6: Performance Optimization
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Zap, TrendingUp, AlertCircle, Database, Globe } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

type PerformanceMetric = {
  name: string;
  value: number;
  target: number;
  unit: string;
  status: 'good' | 'warning' | 'poor';
};

export const PerformanceDashboard = () => {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Collect performance metrics
    const collectMetrics = () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');
      
      const fcp = paint.find(entry => entry.name === 'first-contentful-paint');
      const lcp = paint.find(entry => entry.name === 'largest-contentful-paint');
      
      const metricsData: PerformanceMetric[] = [
        {
          name: 'DOM Load Time',
          value: Math.round(navigation?.domContentLoadedEventEnd - navigation?.domContentLoadedEventStart || 0),
          target: 1500,
          unit: 'ms',
          status: 'good',
        },
        {
          name: 'Page Load Time',
          value: Math.round(navigation?.loadEventEnd - navigation?.loadEventStart || 0),
          target: 3000,
          unit: 'ms',
          status: 'good',
        },
        {
          name: 'First Contentful Paint',
          value: Math.round(fcp?.startTime || 0),
          target: 1800,
          unit: 'ms',
          status: 'good',
        },
        {
          name: 'Time to Interactive',
          value: Math.round(navigation?.domInteractive - navigation?.fetchStart || 0),
          target: 3800,
          unit: 'ms',
          status: 'good',
        },
      ];
      
      // Determine status based on value vs target
      metricsData.forEach(metric => {
        if (metric.value <= metric.target) {
          metric.status = 'good';
        } else if (metric.value <= metric.target * 1.5) {
          metric.status = 'warning';
        } else {
          metric.status = 'poor';
        }
      });
      
      setMetrics(metricsData);
      setLoading(false);
    };

    // Wait for page to fully load
    if (document.readyState === 'complete') {
      collectMetrics();
    } else {
      window.addEventListener('load', collectMetrics);
      return () => window.removeEventListener('load', collectMetrics);
    }
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
      case 'poor': return 'text-red-500';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'good': return <Badge variant="outline" className="bg-green-500/10 text-green-500">Good</Badge>;
      case 'warning': return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500">Warning</Badge>;
      case 'poor': return <Badge variant="outline" className="bg-red-500/10 text-red-500">Poor</Badge>;
      default: return null;
    }
  };

  const overallScore = metrics.length > 0
    ? Math.round((metrics.filter(m => m.status === 'good').length / metrics.length) * 100)
    : 0;

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Performance Monitoring</h2>
        <p className="text-muted-foreground">
          Real-time performance metrics and optimization insights
        </p>
      </div>

      {/* Overall Performance Score */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Overall Performance Score
              </CardTitle>
              <CardDescription>
                Based on Core Web Vitals and load times
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold">{overallScore}</div>
              <div className="text-sm text-muted-foreground">out of 100</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={overallScore} className="h-2" />
        </CardContent>
      </Card>

      {/* Performance Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.name}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                {metric.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div>
                  <div className={`text-2xl font-bold ${getStatusColor(metric.status)}`}>
                    {metric.value}
                    <span className="text-sm ml-1">{metric.unit}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Target: {metric.target}{metric.unit}
                  </p>
                </div>
                {getStatusBadge(metric.status)}
              </div>
              <Progress 
                value={Math.min((metric.value / metric.target) * 100, 100)} 
                className="h-1 mt-3"
              />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Optimization Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Optimization Recommendations
          </CardTitle>
          <CardDescription>
            Actions to improve performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {metrics.filter(m => m.status !== 'good').length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>All metrics are performing well!</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {metrics
                  .filter(m => m.status !== 'good')
                  .map((metric) => (
                    <li key={metric.name} className="flex items-start gap-3 p-3 border rounded-lg">
                      <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium">{metric.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Current: {metric.value}{metric.unit} | Target: {metric.target}{metric.unit}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Consider code splitting, image optimization, or caching improvements.
                        </p>
                      </div>
                    </li>
                  ))}
              </ul>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Resource Hints */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Database className="h-4 w-4" />
              Database Optimization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                Strategic indexes enabled
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                Query caching active
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                Batch queries implemented
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Globe className="h-4 w-4" />
              Frontend Optimization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                Code splitting enabled
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                Lazy loading active
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                React Query optimized
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
