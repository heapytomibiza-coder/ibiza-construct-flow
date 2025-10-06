import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { KPICard } from './KPICard';
import { RevenueChart } from './RevenueChart';
import { InsightsPanel } from './InsightsPanel';
import { useProfessionalMetrics } from '@/hooks/useProfessionalMetrics';
import { useAuth } from '@/hooks/useAuth';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export const PerformanceDashboard = () => {
  const { user } = useAuth();
  const { currentMetrics, metrics, loading } = useProfessionalMetrics(user?.id);
  const [revenueData, setRevenueData] = useState<any[]>([]);

  useEffect(() => {
    if (metrics.length > 0) {
      const data = metrics.map((m) => ({
        date: new Date(m.period_start).toLocaleDateString('en-US', { month: 'short' }),
        revenue: m.total_revenue,
        jobs: m.completed_jobs
      }));
      setRevenueData(data.reverse());
    }
  }, [metrics]);

  if (loading) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Performance Analytics</h1>
          <p className="text-muted-foreground">
            Track your performance and discover insights
          </p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard
              title="Total Revenue"
              value={currentMetrics?.total_revenue || 0}
              unit="currency"
              trend={
                currentMetrics && metrics[1]
                  ? currentMetrics.total_revenue > metrics[1].total_revenue
                    ? 'up'
                    : 'down'
                  : 'stable'
              }
              previousValue={metrics[1]?.total_revenue}
            />
            <KPICard
              title="Completed Jobs"
              value={currentMetrics?.completed_jobs || 0}
              trend={
                currentMetrics && metrics[1]
                  ? currentMetrics.completed_jobs > metrics[1].completed_jobs
                    ? 'up'
                    : 'down'
                  : 'stable'
              }
              previousValue={metrics[1]?.completed_jobs}
            />
            <KPICard
              title="Completion Rate"
              value={currentMetrics?.completion_rate || 0}
              unit="percentage"
              target={95}
              previousValue={metrics[1]?.completion_rate}
            />
            <KPICard
              title="Overall Score"
              value={currentMetrics?.overall_score || 0}
              target={90}
              previousValue={metrics[1]?.overall_score}
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RevenueChart data={revenueData} />

            <Card>
              <CardHeader>
                <CardTitle>Performance Scores</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={[
                    { name: 'Quality', score: currentMetrics?.quality_score || 0 },
                    { name: 'Reliability', score: currentMetrics?.reliability_score || 0 },
                    { name: 'Communication', score: currentMetrics?.communication_score || 0 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="name"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <YAxis 
                      domain={[0, 100]}
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="score" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <RevenueChart data={revenueData} showForecast />
          
          <Card>
            <CardHeader>
              <CardTitle>Revenue Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics.slice(0, 6).map((metric, index) => (
                  <div key={metric.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">
                        {new Date(metric.period_start).toLocaleDateString('en-US', {
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {metric.completed_jobs} jobs completed
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">
                        ${metric.total_revenue.toLocaleString()}
                      </p>
                      {index > 0 && metrics[index - 1] && (
                        <p className="text-sm text-muted-foreground">
                          {(
                            ((metric.total_revenue - metrics[index - 1].total_revenue) /
                              metrics[index - 1].total_revenue) *
                            100
                          ).toFixed(1)}
                          %
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <KPICard
              title="Quality Score"
              value={currentMetrics?.quality_score || 0}
              target={90}
            />
            <KPICard
              title="Reliability Score"
              value={currentMetrics?.reliability_score || 0}
              target={95}
            />
            <KPICard
              title="Communication Score"
              value={currentMetrics?.communication_score || 0}
              target={85}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Score Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={metrics.slice(0, 6).reverse()}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="period_start"
                    tickFormatter={(value) =>
                      new Date(value).toLocaleDateString('en-US', { month: 'short' })
                    }
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis 
                    domain={[0, 100]}
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="quality_score" fill="hsl(var(--primary))" name="Quality" />
                  <Bar dataKey="reliability_score" fill="hsl(var(--secondary))" name="Reliability" />
                  <Bar dataKey="communication_score" fill="hsl(var(--accent))" name="Communication" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights">
          <InsightsPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
};
