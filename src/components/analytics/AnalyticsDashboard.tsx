import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAnalyticsDashboard } from '@/hooks/useAnalyticsDashboard';
import { TrendingUp, DollarSign, Star, Clock, Briefcase, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UXMetricsDashboard } from './UXMetricsDashboard';
import { UXRayDashboard } from './UXRayDashboard';

export const AnalyticsDashboard = () => {
  const { stats, insights, isLoading, markInsightAsRead, generateInsights } = useAnalyticsDashboard();

  if (isLoading) {
    return <div className="space-y-4">
      {[1, 2, 3].map(i => (
        <Card key={i} className="animate-pulse">
          <CardContent className="h-32" />
        </Card>
      ))}
    </div>;
  }

  const statCards = [
    {
      title: 'Total Revenue',
      value: `€${stats?.summary?.total_revenue?.toFixed(2) || '0.00'}`,
      icon: DollarSign,
      trend: '+12%',
      color: 'text-green-600',
    },
    {
      title: 'Jobs Completed',
      value: stats?.summary?.total_jobs_completed || 0,
      icon: Briefcase,
      trend: '+8%',
      color: 'text-blue-600',
    },
    {
      title: 'Average Rating',
      value: stats?.summary?.average_rating?.toFixed(1) || '0.0',
      icon: Star,
      trend: '+0.3',
      color: 'text-yellow-600',
    },
    {
      title: 'Response Time',
      value: `${Math.floor((stats?.summary?.response_time_avg || 0) / 60)}h`,
      icon: Clock,
      trend: '-15%',
      color: 'text-purple-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                <span className={stat.color}>{stat.trend}</span> from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Business Insights */}
      {insights && insights.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <CardTitle>Business Insights</CardTitle>
            </div>
            <Button variant="outline" size="sm" onClick={() => generateInsights()}>
              Refresh Insights
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {insights.map((insight: any) => (
              <div
                key={insight.id}
                className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <AlertCircle className={`h-5 w-5 mt-0.5 ${
                  insight.priority === 'high' ? 'text-red-500' :
                  insight.priority === 'medium' ? 'text-yellow-500' :
                  'text-blue-500'
                }`} />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">{insight.insight_title}</h4>
                    <Badge variant={
                      insight.priority === 'high' ? 'destructive' :
                      insight.priority === 'medium' ? 'default' :
                      'secondary'
                    }>
                      {insight.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{insight.insight_description}</p>
                  {insight.action_items && insight.action_items.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Action Items:</p>
                      <ul className="list-disc list-inside text-sm text-muted-foreground">
                        {insight.action_items.map((item: string, i: number) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => markInsightAsRead(insight.id)}
                  >
                    Mark as Read
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Tabs for detailed analytics */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="ux">UX Metrics</TabsTrigger>
          <TabsTrigger value="ux-ray">UX-Ray</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Chart visualization will be displayed here
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ux" className="space-y-4">
          <UXMetricsDashboard />
        </TabsContent>

        <TabsContent value="ux-ray" className="space-y-4">
          <UXRayDashboard />
        </TabsContent>

        <TabsContent value="revenue">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <p className="text-sm text-muted-foreground">This Month</p>
                    <p className="text-2xl font-bold">€{stats?.monthlyRevenue?.toFixed(2) || '0.00'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Completion Rate</p>
                    <p className="text-2xl font-bold">{(stats?.summary?.completion_rate * 100)?.toFixed(0) || 0}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Spending</p>
                    <p className="text-2xl font-bold">€{stats?.summary?.total_spending?.toFixed(2) || '0.00'}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Performance metrics visualization
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>User Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Activity timeline will be displayed here
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
