/**
 * Performance Dashboard Component
 * Phase 15: Performance Monitoring & Optimization
 */

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Activity, AlertTriangle, TrendingUp, Zap } from 'lucide-react';
import { metricsStore, getPerformanceSummary, PerformanceMetrics } from '@/lib/performance/metrics';
import { PERFORMANCE_BUDGETS, getBudgetViolations } from '@/lib/performance/budgets';

export const PerformanceDashboard = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [summary, setSummary] = useState<ReturnType<typeof getPerformanceSummary> | null>(null);
  const [violations, setViolations] = useState<ReturnType<typeof getBudgetViolations>>([]);

  useEffect(() => {
    // Subscribe to metrics updates
    const unsubscribe = metricsStore.subscribe((newMetrics) => {
      setMetrics(newMetrics);
      const newSummary = getPerformanceSummary();
      setSummary(newSummary);
      
      // Check budget violations
      const metricsForBudget: Record<string, number> = {};
      if (newMetrics.lcp) metricsForBudget['LCP'] = newMetrics.lcp;
      if (newMetrics.fid) metricsForBudget['FID'] = newMetrics.fid;
      if (newMetrics.cls) metricsForBudget['CLS'] = newMetrics.cls;
      if (newMetrics.fcp) metricsForBudget['FCP'] = newMetrics.fcp;
      if (newMetrics.ttfb) metricsForBudget['TTFB'] = newMetrics.ttfb;
      
      setViolations(getBudgetViolations(metricsForBudget));
    });

    // Initial load
    const initialMetrics = metricsStore.getMetrics();
    setMetrics(initialMetrics);
    const initialSummary = getPerformanceSummary();
    setSummary(initialSummary);

    return () => {
      unsubscribe();
    };
  }, []);

  const getRatingColor = (rating: 'good' | 'needs-improvement' | 'poor' | null) => {
    if (!rating) return 'text-muted-foreground';
    if (rating === 'good') return 'text-green-500';
    if (rating === 'needs-improvement') return 'text-yellow-500';
    return 'text-destructive';
  };

  const getRatingBadge = (rating: 'good' | 'needs-improvement' | 'poor' | null) => {
    if (!rating) return null;
    if (rating === 'good') return <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500">Good</Badge>;
    if (rating === 'needs-improvement') return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500">Needs Work</Badge>;
    return <Badge variant="destructive">Poor</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Performance Dashboard</h2>
        <p className="text-muted-foreground">Real-time Core Web Vitals and performance metrics</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Performance Score</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary?.overall || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Overall rating (0-100)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Device</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">
              {metrics?.deviceType || '-'}
            </div>
            <p className="text-xs text-muted-foreground">
              Current device type
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Connection</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold uppercase">
              {metrics?.connection || 'Unknown'}
            </div>
            <p className="text-xs text-muted-foreground">
              Network type
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Violations</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {violations.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Budget violations
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Core Web Vitals */}
      <Card>
        <CardHeader>
          <CardTitle>Core Web Vitals</CardTitle>
          <CardDescription>Key performance metrics that impact user experience</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { key: 'lcp', name: 'Largest Contentful Paint (LCP)', unit: 'ms', description: 'Visual loading performance' },
              { key: 'fid', name: 'First Input Delay (FID)', unit: 'ms', description: 'Interactivity and responsiveness' },
              { key: 'cls', name: 'Cumulative Layout Shift (CLS)', unit: 'score', description: 'Visual stability' },
              { key: 'fcp', name: 'First Contentful Paint (FCP)', unit: 'ms', description: 'Loading responsiveness' },
              { key: 'ttfb', name: 'Time to First Byte (TTFB)', unit: 'ms', description: 'Server response time' },
              { key: 'inp', name: 'Interaction to Next Paint (INP)', unit: 'ms', description: 'Overall responsiveness' },
            ].map(({ key, name, unit, description }) => {
              const value = metrics?.[key as keyof PerformanceMetrics];
              const rating = summary?.ratings[key as keyof typeof summary.ratings];
              
              return (
                <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-1">
                    <div className="font-medium">{name}</div>
                    <div className="text-sm text-muted-foreground">{description}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`text-2xl font-bold ${getRatingColor(rating)}`}>
                      {value !== undefined && typeof value === 'number' ? `${value.toFixed(value < 1 ? 3 : 0)}${unit}` : '-'}
                    </div>
                    {getRatingBadge(rating)}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Budget Violations */}
      {violations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Budget Violations</CardTitle>
            <CardDescription>Performance metrics exceeding defined budgets</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {violations.map((violation, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {violation.severity === 'error' ? (
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    )}
                    <div>
                      <div className="font-medium">{violation.metric}</div>
                      <div className="text-sm text-muted-foreground">
                        Current: {violation.value.toFixed(2)} | Budget: {violation.budget}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{violation.percentage.toFixed(0)}%</Badge>
                    <Badge variant={violation.severity === 'error' ? 'destructive' : 'secondary'}>
                      {violation.severity === 'error' ? 'Critical' : 'Warning'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
