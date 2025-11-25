import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Database } from '@/integrations/supabase/types';

type UserAnalytics = Database['public']['Tables']['user_analytics']['Row'];

interface UserAnalyticsPanelProps {
  analytics: UserAnalytics[];
}

export function UserAnalyticsPanel({ analytics }: UserAnalyticsPanelProps) {
  // Aggregate analytics
  const totalJobsPosted = analytics.reduce((sum, a) => sum + (a.jobs_posted || 0), 0);
  const totalJobsCompleted = analytics.reduce((sum, a) => sum + (a.jobs_completed || 0), 0);
  const totalMessages = analytics.reduce((sum, a) => sum + (a.messages_sent || 0), 0);
  const avgCompletionRate =
    analytics.length > 0
      ? analytics.reduce((sum, a) => sum + (a.completion_rate || 0), 0) / analytics.length
      : 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Jobs Posted</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalJobsPosted}</div>
          <p className="text-xs text-muted-foreground">Last 30 days</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Jobs Completed</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalJobsCompleted}</div>
          <p className="text-xs text-muted-foreground">Last 30 days</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Messages Sent</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalMessages}</div>
          <p className="text-xs text-muted-foreground">Last 30 days</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Avg Completion Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{avgCompletionRate.toFixed(1)}%</div>
          <p className="text-xs text-muted-foreground">Last 30 days</p>
        </CardContent>
      </Card>
    </div>
  );
}