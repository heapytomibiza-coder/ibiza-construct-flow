import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useWebVitals, WEB_VITALS_THRESHOLDS, getPerformanceStatus } from '@/hooks/useWebVitals';
import { AssetOptimizationMonitor } from './AssetOptimizationMonitor';
import { 
  Activity, 
  Zap, 
  Clock, 
  Database, 
  Globe, 
  Server,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  status: 'excellent' | 'good' | 'warning' | 'critical';
  threshold: number;
  trend: 'up' | 'down' | 'stable';
  change_percentage: number;
}

interface APIEndpointMetric {
  endpoint: string;
  avg_response_time: number;
  requests_per_minute: number;
  error_rate: number;
  status_code_distribution: { [key: string]: number };
}

export const PerformanceMonitor = () => {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [apiMetrics, setApiMetrics] = useState<APIEndpointMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const webVitals = useWebVitals();

  useEffect(() => {
    loadPerformanceData();
    const interval = setInterval(loadPerformanceData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [webVitals]);

  const loadPerformanceData = async () => {
    try {
      const getStatus = (value: number, threshold: number): PerformanceMetric['status'] => {
        const ratio = value / threshold;
        if (ratio < 0.5) return 'excellent';
        if (ratio < 0.75) return 'good';
        if (ratio < 1.0) return 'warning';
        return 'critical';
      };

      // Build metrics from real Web Vitals
      const realMetrics: PerformanceMetric[] = [
        {
          name: 'First Contentful Paint',
          value: webVitals.FCP ? webVitals.FCP / 1000 : 0,
          unit: 's',
          status: getStatus(webVitals.FCP || 0, WEB_VITALS_THRESHOLDS.FCP.good),
          threshold: WEB_VITALS_THRESHOLDS.FCP.good / 1000,
          trend: 'stable',
          change_percentage: 0
        },
        {
          name: 'Largest Contentful Paint',
          value: webVitals.LCP ? webVitals.LCP / 1000 : 0,
          unit: 's',
          status: getStatus(webVitals.LCP || 0, WEB_VITALS_THRESHOLDS.LCP.good),
          threshold: WEB_VITALS_THRESHOLDS.LCP.good / 1000,
          trend: 'stable',
          change_percentage: 0
        },
        {
          name: 'Cumulative Layout Shift',
          value: webVitals.CLS || 0,
          unit: '',
          status: getStatus(webVitals.CLS || 0, WEB_VITALS_THRESHOLDS.CLS.good),
          threshold: WEB_VITALS_THRESHOLDS.CLS.good,
          trend: 'stable',
          change_percentage: 0
        },
        {
          name: 'Interaction to Next Paint',
          value: webVitals.INP || 0,
          unit: 'ms',
          status: getStatus(webVitals.INP || 0, WEB_VITALS_THRESHOLDS.INP.good),
          threshold: WEB_VITALS_THRESHOLDS.INP.good,
          trend: 'stable',
          change_percentage: 0
        },
        {
          name: 'Time to First Byte',
          value: webVitals.TTFB || 0,
          unit: 'ms',
          status: getStatus(webVitals.TTFB || 0, WEB_VITALS_THRESHOLDS.TTFB.good),
          threshold: WEB_VITALS_THRESHOLDS.TTFB.good,
          trend: 'stable',
          change_percentage: 0
        }
      ];

      // Get browser performance data (Chrome only)
      const perfWithMemory = performance as any;
      if (perfWithMemory.memory) {
        const memory = perfWithMemory.memory;
        const memoryUsagePercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
        realMetrics.push({
          name: 'Memory Usage',
          value: Math.round(memoryUsagePercent),
          unit: '%',
          status: getStatus(memoryUsagePercent, 85),
          threshold: 85,
          trend: 'stable',
          change_percentage: 0
        });
      }

      const mockApiMetrics: APIEndpointMetric[] = [
        {
          endpoint: '/api/auth/login',
          avg_response_time: 120,
          requests_per_minute: 45,
          error_rate: 0.5,
          status_code_distribution: { '200': 95, '400': 3, '500': 2 }
        },
        {
          endpoint: '/api/jobs/search',
          avg_response_time: 280,
          requests_per_minute: 123,
          error_rate: 1.2,
          status_code_distribution: { '200': 92, '404': 5, '500': 3 }
        },
        {
          endpoint: '/api/professionals/match',
          avg_response_time: 450,
          requests_per_minute: 34,
          error_rate: 2.1,
          status_code_distribution: { '200': 89, '400': 8, '500': 3 }
        },
        {
          endpoint: '/api/payments/process',
          avg_response_time: 890,
          requests_per_minute: 18,
          error_rate: 0.8,
          status_code_distribution: { '200': 96, '400': 3, '500': 1 }
        }
      ];

      setMetrics(realMetrics);
      setApiMetrics(mockApiMetrics);
      setLoading(false);
    } catch (error) {
      console.error('Error loading performance data:', error);
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent':
        return 'text-green-500';
      case 'good':
        return 'text-blue-500';
      case 'warning':
        return 'text-orange-500';
      case 'critical':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'excellent':
        return <Badge variant="default" className="bg-green-500">Excellent</Badge>;
      case 'good':
        return <Badge variant="default" className="bg-blue-500">Good</Badge>;
      case 'warning':
        return <Badge variant="default" className="bg-orange-500">Warning</Badge>;
      case 'critical':
        return <Badge variant="destructive">Critical</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTrendIcon = (trend: string, changePercentage: number) => {
    const color = changePercentage < 0 ? 'text-green-500' : 'text-red-500';
    switch (trend) {
      case 'up':
        return <TrendingUp className={`w-4 h-4 ${color}`} />;
      case 'down':
        return <TrendingDown className={`w-4 h-4 ${color}`} />;
      default:
        return <Activity className="w-4 h-4 text-blue-500" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="text-center">Loading Performance Monitor...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Performance Monitor</h2>
          <p className="text-muted-foreground">Real-time application performance monitoring</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="animate-pulse">
            <Activity className="w-3 h-3 mr-1" />
            Live Data
          </Badge>
          <Button>
            <Zap className="w-4 h-4 mr-2" />
            Optimize
          </Button>
        </div>
      </div>

      {/* Core Web Vitals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Globe className="w-5 h-5" />
            <span>Core Web Vitals</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {metrics.slice(0, 5).map((metric) => (
              <div key={metric.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{metric.name}</span>
                  {getStatusBadge(metric.status)}
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-2xl font-bold ${getStatusColor(metric.status)}`}>
                    {metric.value}{metric.unit}
                  </span>
                  <div className="flex items-center space-x-1">
                    {getTrendIcon(metric.trend, metric.change_percentage)}
                    <span className="text-sm text-muted-foreground">
                      {metric.change_percentage > 0 ? '+' : ''}{metric.change_percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <Progress 
                  value={Math.min((metric.value / metric.threshold) * 100, 100)} 
                  className="h-2"
                />
                <p className="text-xs text-muted-foreground">
                  Threshold: {metric.threshold}{metric.unit}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Server className="w-5 h-5" />
              <span>System Resources</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {metrics.slice(5).map((metric) => (
              <div key={metric.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{metric.name}</span>
                  <div className="flex items-center space-x-2">
                    <span className={`font-bold ${getStatusColor(metric.status)}`}>
                      {metric.value}{metric.unit}
                    </span>
                    {getTrendIcon(metric.trend, metric.change_percentage)}
                  </div>
                </div>
                <Progress 
                  value={Math.min((metric.value / metric.threshold) * 100, 100)} 
                  className="h-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0{metric.unit}</span>
                  <span>{metric.threshold}{metric.unit}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* API Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Database className="w-5 h-5" />
              <span>API Endpoints</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {apiMetrics.map((api) => (
              <div key={api.endpoint} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{api.endpoint}</span>
                  <Badge variant={api.error_rate > 2 ? 'destructive' : 'default'}>
                    {api.error_rate}% errors
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Response Time:</span>
                    <span className="ml-1 font-medium">{api.avg_response_time}ms</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Requests/min:</span>
                    <span className="ml-1 font-medium">{api.requests_per_minute}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Status Codes</span>
                  </div>
                  <div className="flex space-x-1">
                    {Object.entries(api.status_code_distribution).map(([code, percentage]) => (
                      <div key={code} className="flex-1">
                        <div 
                          className={`h-2 rounded ${
                            code.startsWith('2') ? 'bg-green-500' :
                            code.startsWith('4') ? 'bg-orange-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                        <span className="text-xs text-muted-foreground">{code}: {percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Performance Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5" />
            <span>Performance Recommendations</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium">Optimize Images</span>
              </div>
              <p className="text-xs text-muted-foreground ml-6">
                Monitor real Web Vitals metrics using Chrome DevTools Performance tab
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-medium">Enable Compression</span>
              </div>
              <p className="text-xs text-muted-foreground ml-6">
                Enable gzip compression for API responses to reduce bandwidth usage
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium">Cache Static Assets</span>
              </div>
              <p className="text-xs text-muted-foreground ml-6">
                Implement CDN caching for static assets to improve global load times
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-medium">Optimize Database Queries</span>
              </div>
              <p className="text-xs text-muted-foreground ml-6">
                Add indexes to frequently queried fields to reduce query time
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Asset Optimization Monitor */}
      <AssetOptimizationMonitor />
    </div>
  );
};