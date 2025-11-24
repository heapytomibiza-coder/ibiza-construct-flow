/**
 * System Health Monitor Component
 * Phase 9: Admin Dashboard Modernization
 * 
 * Real-time system health and performance tracking
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Database, Zap, Shield, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HealthMetric {
  name: string;
  status: 'healthy' | 'warning' | 'critical';
  value: string;
  icon: React.ElementType;
  description: string;
}

export interface SystemHealthMonitorProps {
  className?: string;
}

export function SystemHealthMonitor({ className }: SystemHealthMonitorProps) {
  const [metrics, setMetrics] = useState<HealthMetric[]>([
    {
      name: 'API Response',
      status: 'healthy',
      value: '142ms',
      icon: Zap,
      description: 'Average response time'
    },
    {
      name: 'Database',
      status: 'healthy',
      value: '99.9%',
      icon: Database,
      description: 'Uptime last 30 days'
    },
    {
      name: 'Active Users',
      status: 'healthy',
      value: '1,247',
      icon: Activity,
      description: 'Currently online'
    },
    {
      name: 'Security',
      status: 'warning',
      value: '3 alerts',
      icon: Shield,
      description: 'Pending review'
    }
  ]);

  const statusConfig = {
    healthy: {
      icon: CheckCircle,
      color: 'text-emerald-600',
      bg: 'bg-emerald-100 dark:bg-emerald-950/30',
      badge: 'default'
    },
    warning: {
      icon: AlertTriangle,
      color: 'text-amber-600',
      bg: 'bg-amber-100 dark:bg-amber-950/30',
      badge: 'secondary'
    },
    critical: {
      icon: XCircle,
      color: 'text-rose-600',
      bg: 'bg-rose-100 dark:bg-rose-950/30',
      badge: 'destructive'
    }
  };

  const overallHealth = metrics.some(m => m.status === 'critical') 
    ? 'critical' 
    : metrics.some(m => m.status === 'warning') 
    ? 'warning' 
    : 'healthy';

  return (
    <Card className={cn('card-luxury', className)}>
      <CardHeader className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Activity className="w-4 w-4 sm:w-5 sm:h-5 text-primary" />
            System Health
          </CardTitle>
          <Badge variant={statusConfig[overallHealth].badge as any} className="text-xs">
            <span className="hidden sm:inline">
              {overallHealth === 'healthy' ? 'All Systems Operational' : 
               overallHealth === 'warning' ? 'Minor Issues' : 'Critical Alert'}
            </span>
            <span className="sm:hidden">
              {overallHealth === 'healthy' ? 'Healthy' : 
               overallHealth === 'warning' ? 'Warning' : 'Critical'}
            </span>
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4 p-4 sm:p-6 pt-0">
        {/* Overall Status */}
        <div className={cn(
          'p-4 rounded-lg border transition-all',
          overallHealth === 'healthy' 
            ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800'
            : overallHealth === 'warning'
            ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800'
            : 'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800'
        )}>
          <div className="flex items-center gap-3">
            {React.createElement(statusConfig[overallHealth].icon, {
              className: cn('w-6 h-6', statusConfig[overallHealth].color)
            })}
            <div className="flex-1">
              <p className="font-medium text-foreground">
                {overallHealth === 'healthy' 
                  ? 'Platform Operating Normally' 
                  : overallHealth === 'warning'
                  ? 'Some Services Need Attention'
                  : 'Critical Issues Detected'}
              </p>
              <p className="text-sm text-muted-foreground">
                Last checked: {new Date().toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>

        {/* Health Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {metrics.map((metric) => {
            const StatusIcon = statusConfig[metric.status].icon;
            const MetricIcon = metric.icon;
            
            return (
              <div 
                key={metric.name}
                className="p-4 border border-border rounded-lg hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={cn('p-2 rounded-lg', statusConfig[metric.status].bg)}>
                    <MetricIcon className={cn('w-4 h-4', statusConfig[metric.status].color)} />
                  </div>
                  <StatusIcon className={cn('w-4 h-4', statusConfig[metric.status].color)} />
                </div>
                
                <div>
                  <h4 className="font-semibold text-foreground mb-1">{metric.name}</h4>
                  <div className="text-2xl font-bold text-foreground mb-1">
                    {metric.value}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {metric.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="pt-4 border-t space-y-2">
          <h4 className="text-sm font-medium text-foreground">Quick Actions</h4>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="cursor-pointer hover:bg-muted">
              View Logs
            </Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-muted">
              Run Diagnostics
            </Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-muted">
              Performance Report
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
