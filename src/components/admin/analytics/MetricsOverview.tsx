import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Users, Briefcase, DollarSign, MessageSquare, Star } from 'lucide-react';
import { Database } from '@/integrations/supabase/types';

type PlatformMetric = Database['public']['Tables']['platform_metrics']['Row'];

interface MetricsOverviewProps {
  metrics: PlatformMetric[] | undefined;
}

export function MetricsOverview({ metrics }: MetricsOverviewProps) {
  const latestMetric = metrics?.[0];
  const previousMetric = metrics?.[1];

  const calculateChange = (current: number | null, previous: number | null) => {
    if (!current || !previous) return 0;
    return ((current - previous) / previous) * 100;
  };

  const metricCards = [
    {
      title: 'Total Users',
      value: latestMetric?.total_users || 0,
      change: calculateChange(latestMetric?.total_users || 0, previousMetric?.total_users || 0),
      icon: Users,
    },
    {
      title: 'Total Jobs',
      value: latestMetric?.total_jobs || 0,
      change: calculateChange(latestMetric?.total_jobs || 0, previousMetric?.total_jobs || 0),
      icon: Briefcase,
    },
    {
      title: 'Revenue',
      value: `€${(latestMetric?.total_revenue || 0).toLocaleString()}`,
      change: calculateChange(latestMetric?.total_revenue || 0, previousMetric?.total_revenue || 0),
      icon: DollarSign,
    },
    {
      title: 'Messages',
      value: latestMetric?.total_messages || 0,
      change: calculateChange(latestMetric?.total_messages || 0, previousMetric?.total_messages || 0),
      icon: MessageSquare,
    },
    {
      title: 'Avg Rating',
      value: latestMetric?.avg_rating?.toFixed(2) || '0.00',
      change: calculateChange(latestMetric?.avg_rating || 0, previousMetric?.avg_rating || 0),
      icon: Star,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      {metricCards.map((metric) => {
        const Icon = metric.icon;
        const isPositive = metric.change >= 0;

        return (
          <Card key={metric.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                {isPositive ? (
                  <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                ) : (
                  <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
                )}
                <span className={isPositive ? 'text-green-500' : 'text-red-500'}>
                  {Math.abs(metric.change).toFixed(1)}%
                </span>
                <span className="ml-1">from last period</span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}