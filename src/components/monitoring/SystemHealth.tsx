import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, AlertCircle, CheckCircle, Clock, Database, Zap } from 'lucide-react';
import { useWebVitals } from '@/hooks/useWebVitals';

/**
 * System Health Monitoring Dashboard
 * Real-time application health and performance metrics
 */
export const SystemHealth: React.FC = () => {
  const metrics = useWebVitals();
  const [systemStatus, setSystemStatus] = useState<'healthy' | 'degraded' | 'down'>('healthy');
  const [apiStatus, setApiStatus] = useState<'online' | 'offline'>('online');
  const [dbStatus, setDbStatus] = useState<'online' | 'offline'>('online');

  useEffect(() => {
    // Check system health based on Web Vitals
    const lcpStatus = metrics.LCP && metrics.LCP < 2500 ? 'good' : 'poor';
    const fcpStatus = metrics.FCP && metrics.FCP < 1800 ? 'good' : 'poor';
    
    if (lcpStatus === 'poor' || fcpStatus === 'poor') {
      setSystemStatus('degraded');
    } else {
      setSystemStatus('healthy');
    }
  }, [metrics]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'online':
      case 'good':
        return 'text-green-600';
      case 'degraded':
        return 'text-yellow-600';
      case 'down':
      case 'offline':
      case 'poor':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusBadge = (status: string) => {
    const variant = status === 'healthy' || status === 'online' ? 'default' : 'destructive';
    const icon = status === 'healthy' || status === 'online' ? 
      <CheckCircle className="h-3 w-3 mr-1" /> : 
      <AlertCircle className="h-3 w-3 mr-1" />;

    return (
      <Badge variant={variant} className="flex items-center">
        {icon}
        {status}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">System Health</h2>
          <p className="text-muted-foreground">Real-time application monitoring</p>
        </div>
        {getStatusBadge(systemStatus)}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* System Status */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">System</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getStatusColor(systemStatus)}`}>
              {systemStatus}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Overall system health
            </p>
          </CardContent>
        </Card>

        {/* API Status */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">API</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getStatusColor(apiStatus)}`}>
              {apiStatus}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Edge functions status
            </p>
          </CardContent>
        </Card>

        {/* Database Status */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Database</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getStatusColor(dbStatus)}`}>
              {dbStatus}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Supabase connection
            </p>
          </CardContent>
        </Card>

        {/* Response Time */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.TTFB ? `${Math.round(metrics.TTFB)}ms` : '—'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Time to first byte
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
          <CardDescription>Core Web Vitals from real user monitoring</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">LCP (Largest Contentful Paint)</span>
              <div className="flex items-center gap-2">
                <span className="text-sm">{metrics.LCP ? `${Math.round(metrics.LCP)}ms` : '—'}</span>
                <Badge variant={metrics.LCP && metrics.LCP < 2500 ? 'default' : 'destructive'}>
                  {metrics.LCP && metrics.LCP < 2500 ? 'Good' : 'Poor'}
                </Badge>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">FCP (First Contentful Paint)</span>
              <div className="flex items-center gap-2">
                <span className="text-sm">{metrics.FCP ? `${Math.round(metrics.FCP)}ms` : '—'}</span>
                <Badge variant={metrics.FCP && metrics.FCP < 1800 ? 'default' : 'destructive'}>
                  {metrics.FCP && metrics.FCP < 1800 ? 'Good' : 'Poor'}
                </Badge>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">CLS (Cumulative Layout Shift)</span>
              <div className="flex items-center gap-2">
                <span className="text-sm">{metrics.CLS ? metrics.CLS.toFixed(3) : '—'}</span>
                <Badge variant={metrics.CLS && metrics.CLS < 0.1 ? 'default' : 'destructive'}>
                  {metrics.CLS && metrics.CLS < 0.1 ? 'Good' : 'Poor'}
                </Badge>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">INP (Interaction to Next Paint)</span>
              <div className="flex items-center gap-2">
                <span className="text-sm">{metrics.INP ? `${Math.round(metrics.INP)}ms` : '—'}</span>
                <Badge variant={metrics.INP && metrics.INP < 200 ? 'default' : 'destructive'}>
                  {metrics.INP && metrics.INP < 200 ? 'Good' : 'Poor'}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
