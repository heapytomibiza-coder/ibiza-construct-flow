import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAdminAnalytics } from '@/hooks/admin';
import { MetricsOverview } from './MetricsOverview';
import { ActivityFeedPanel } from './ActivityFeedPanel';
import { UserAnalyticsPanel } from './UserAnalyticsPanel';
import { CategoryPerformancePanel } from './CategoryPerformancePanel';
import { Loader2 } from 'lucide-react';

export function AdminDashboard() {
  const { platformMetrics, activityFeed, userAnalytics, categoryAnalytics, isLoading } = useAdminAnalytics();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">Platform analytics and monitoring</p>
      </div>

      <MetricsOverview metrics={platformMetrics} />

      <Tabs defaultValue="activity" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="activity">Activity Feed</TabsTrigger>
          <TabsTrigger value="users">User Analytics</TabsTrigger>
          <TabsTrigger value="categories">Category Performance</TabsTrigger>
          <TabsTrigger value="system">System Health</TabsTrigger>
        </TabsList>

        <TabsContent value="activity" className="space-y-4">
          <ActivityFeedPanel activities={activityFeed || []} />
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <UserAnalyticsPanel analytics={userAnalytics || []} />
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <CategoryPerformancePanel analytics={categoryAnalytics || []} />
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Health</CardTitle>
              <CardDescription>Real-time system monitoring</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">System health monitoring coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}