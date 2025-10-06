import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAnalytics, usePlatformAnalytics } from '@/hooks/useAnalytics';
import { useAuth } from '@/hooks/useAuth';
import { MetricCard } from './MetricCard';
import { AnalyticsChart } from './AnalyticsChart';
import { ActivityTimeline } from './ActivityTimeline';
import { ReportGenerator } from './ReportGenerator';
import { Calendar, TrendingUp, Users, Briefcase, DollarSign } from 'lucide-react';

export const AnalyticsDashboard = () => {
  const { user, isAdmin } = useAuth();
  const [dateRange, setDateRange] = useState('30');
  const { summary, activities, fetchUserSummary, fetchActivities, loading } = useAnalytics(user?.id);
  const { metrics, fetchPlatformMetrics, loading: platformLoading } = usePlatformAnalytics();

  useEffect(() => {
    if (user) {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(dateRange));
      
      fetchUserSummary(startDate, endDate);
      fetchActivities();

      if (isAdmin()) {
        fetchPlatformMetrics(startDate, endDate);
      }
    }
  }, [user, dateRange]);

  const handleDateRangeChange = (value: string) => {
    setDateRange(value);
  };

  if (loading || platformLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h2>
          <p className="text-muted-foreground">
            Track your performance and activity metrics
          </p>
        </div>
        <Select value={dateRange} onValueChange={handleDateRangeChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
            <SelectItem value="365">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          {isAdmin() && <TabsTrigger value="platform">Platform</TabsTrigger>}
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Total Activities"
              value={summary?.total_activities || 0}
              icon={Calendar}
              trend={5}
            />
            <MetricCard
              title="Activity Types"
              value={Object.keys(summary?.activity_breakdown || {}).length}
              icon={TrendingUp}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Activity Trend</CardTitle>
              <CardDescription>Your daily activity over time</CardDescription>
            </CardHeader>
            <CardContent>
              <AnalyticsChart
                data={summary?.daily_activity || []}
                xKey="date"
                yKey="count"
                title="Daily Activities"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <ActivityTimeline activities={activities} />
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <ReportGenerator />
        </TabsContent>

        {isAdmin() && (
          <TabsContent value="platform" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                title="Total Users"
                value={metrics?.total_users || 0}
                icon={Users}
              />
              <MetricCard
                title="Active Users"
                value={metrics?.active_users || 0}
                icon={TrendingUp}
              />
              <MetricCard
                title="Total Jobs"
                value={metrics?.total_jobs || 0}
                icon={Briefcase}
              />
              <MetricCard
                title="Revenue"
                value={`$${metrics?.total_revenue?.toLocaleString() || 0}`}
                icon={DollarSign}
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle>User Growth</CardTitle>
                <CardDescription>New user registrations over time</CardDescription>
              </CardHeader>
              <CardContent>
                <AnalyticsChart
                  data={metrics?.user_growth || []}
                  xKey="date"
                  yKey="new_users"
                  title="User Growth"
                />
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};
