import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, TrendingDown, TrendingUp, Zap, Clock } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export function PerformanceDashboard() {
  const { data: performanceSummary, isLoading } = useQuery({
    queryKey: ['performance-summary'],
    queryFn: async () => {
      const client: any = supabase;
      const { data, error } = await client.rpc('get_performance_summary');
      if (error) throw error;
      return data || [];
    },
    refetchInterval: 60000 // Refresh every minute
  });

  const { data: slowQueries } = useQuery({
    queryKey: ['slow-queries'],
    queryFn: async () => {
      const client: any = supabase;
      const { data, error } = await client.rpc('get_slow_queries_report', {
        p_min_execution_time: 1000,
        p_limit: 10
      });
      if (error) throw error;
      return data || [];
    }
  });

  const getMetricStatus = (metricName: string, p95Value: number) => {
    const thresholds: Record<string, number> = {
      lcp: 2500,
      fid: 100,
      cls: 0.1,
      ttfb: 800,
      fcp: 1800
    };

    const threshold = thresholds[metricName];
    if (!threshold) return 'neutral';
    
    return p95Value <= threshold ? 'good' : 'poor';
  };

  const formatMetricValue = (metricName: string, value: number) => {
    if (metricName === 'cls') return value.toFixed(3);
    return `${Math.round(value)}ms`;
  };

  if (isLoading) {
    return <div className="p-8 text-center">Loading performance data...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Performance Dashboard</h2>
        <p className="text-muted-foreground">Monitor app performance and identify bottlenecks</p>
      </div>

      {/* Core Web Vitals */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {performanceSummary?.map((metric: any) => {
          const status = getMetricStatus(metric.metric_name, metric.p95_value);
          return (
            <Card key={metric.metric_name}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium uppercase">
                  {metric.metric_name}
                </CardTitle>
                {status === 'good' ? (
                  <TrendingDown className="h-4 w-4 text-green-600" />
                ) : (
                  <TrendingUp className="h-4 w-4 text-red-600" />
                )}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatMetricValue(metric.metric_name, metric.p95_value)}
                </div>
                <p className="text-xs text-muted-foreground">
                  P95 • Avg: {formatMetricValue(metric.metric_name, metric.avg_value)}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <Badge variant={status === 'good' ? 'default' : 'destructive'}>
                    {status === 'good' ? 'Good' : 'Needs Improvement'}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {metric.sample_count} samples
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Slow Queries */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Slow Queries
          </CardTitle>
          <CardDescription>
            Database queries taking longer than 1 second
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!slowQueries || slowQueries.length === 0 ? (
            <p className="text-sm text-muted-foreground">No slow queries detected</p>
          ) : (
            <div className="space-y-3">
              {slowQueries.map((query: any, index: number) => (
                <div key={index} className="p-3 border rounded-lg space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <code className="text-xs font-mono break-all">{query.query_text}</code>
                      <p className="text-xs text-muted-foreground mt-1">
                        Table: {query.table_name || 'Unknown'}
                      </p>
                    </div>
                    <Badge variant="destructive" className="ml-2">
                      {Math.round(query.avg_execution_time)}ms
                    </Badge>
                  </div>
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <span>Max: {query.max_execution_time}ms</span>
                    <span>Count: {query.occurrence_count}</span>
                    <span>Last: {new Date(query.last_occurrence).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Optimization Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <Activity className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <span>LCP should be under 2.5s - optimize images and defer non-critical resources</span>
            </li>
            <li className="flex items-start gap-2">
              <Activity className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <span>FID should be under 100ms - minimize JavaScript execution time</span>
            </li>
            <li className="flex items-start gap-2">
              <Activity className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <span>Add database indexes for frequently queried columns</span>
            </li>
            <li className="flex items-start gap-2">
              <Activity className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <span>Use code splitting and lazy loading for routes</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
