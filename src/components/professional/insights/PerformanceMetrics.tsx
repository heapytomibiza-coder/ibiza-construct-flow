/**
 * Performance Metrics Component
 * Phase 11: Professional Tools & Insights
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Database } from '@/integrations/supabase/types';

type ProfessionalMetric = Database['public']['Tables']['professional_metrics']['Row'];

interface PerformanceMetricsProps {
  metrics: ProfessionalMetric[];
}

export function PerformanceMetrics({ metrics }: PerformanceMetricsProps) {
  if (metrics.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
          <CardDescription>Your business performance over time</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No metrics available yet. Complete jobs to see your performance data.
          </p>
        </CardContent>
      </Card>
    );
  }

  const latest = metrics[0];
  const previous = metrics[1];

  const calculateTrend = (current: number, prev: number | undefined) => {
    if (!prev || prev === 0) return { value: 0, direction: 'neutral' as const };
    const change = ((current - prev) / prev) * 100;
    return {
      value: Math.abs(change),
      direction: change > 0 ? 'up' as const : change < 0 ? 'down' as const : 'neutral' as const,
    };
  };

  const metrics_data = [
    {
      label: 'Jobs Won',
      value: latest.jobs_won,
      trend: calculateTrend(latest.jobs_won, previous?.jobs_won),
    },
    {
      label: 'Revenue Earned',
      value: `$${latest.revenue_earned.toLocaleString()}`,
      trend: calculateTrend(Number(latest.revenue_earned), Number(previous?.revenue_earned)),
    },
    {
      label: 'Completion Rate',
      value: `${(latest.completion_rate * 100).toFixed(1)}%`,
      trend: calculateTrend(Number(latest.completion_rate), Number(previous?.completion_rate)),
    },
    {
      label: 'Client Satisfaction',
      value: latest.client_satisfaction.toFixed(1),
      trend: calculateTrend(Number(latest.client_satisfaction), Number(previous?.client_satisfaction)),
    },
    {
      label: 'Quote Acceptance',
      value: `${(latest.quote_acceptance_rate * 100).toFixed(1)}%`,
      trend: calculateTrend(Number(latest.quote_acceptance_rate), Number(previous?.quote_acceptance_rate)),
    },
    {
      label: 'Avg Response Time',
      value: `${latest.avg_response_time_hours.toFixed(1)}h`,
      trend: calculateTrend(-Number(latest.avg_response_time_hours), -Number(previous?.avg_response_time_hours)),
    },
  ];

  const getTrendIcon = (direction: 'up' | 'down' | 'neutral') => {
    switch (direction) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-500" />;
      default: return <Minus className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Metrics</CardTitle>
        <CardDescription>Your business performance over the last 30 days</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {metrics_data.map((metric) => (
            <div key={metric.label} className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">{metric.label}</p>
              <div className="flex items-center justify-between">
                <p className="text-2xl font-bold">{metric.value}</p>
                <div className="flex items-center gap-1">
                  {getTrendIcon(metric.trend.direction)}
                  {metric.trend.value > 0 && (
                    <span className={`text-sm ${metric.trend.direction === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                      {metric.trend.value.toFixed(1)}%
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
