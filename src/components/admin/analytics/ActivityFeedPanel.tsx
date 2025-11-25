import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Database } from '@/integrations/supabase/types';
import { useAdminActions } from '@/hooks/admin';
import { formatDistanceToNow } from 'date-fns';
import { AlertCircle, AlertTriangle, Info } from 'lucide-react';

type AdminActivityFeed = Database['public']['Tables']['admin_activity_feed']['Row'];

interface ActivityFeedPanelProps {
  activities: AdminActivityFeed[];
}

export function ActivityFeedPanel({ activities }: ActivityFeedPanelProps) {
  const { markActivityRead } = useAdminActions();

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getSeverityVariant = (severity: string): 'default' | 'destructive' | 'secondary' => {
    switch (severity) {
      case 'critical':
        return 'destructive';
      case 'warning':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const unreadActivities = activities.filter(a => !a.is_read);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Feed</CardTitle>
        <CardDescription>
          {unreadActivities.length > 0 ? (
            <>
              <Badge variant="secondary">{unreadActivities.length} unread</Badge>
            </>
          ) : (
            'All caught up!'
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.length === 0 ? (
          <p className="text-sm text-muted-foreground">No recent activity</p>
        ) : (
          activities.map((activity) => (
            <div
              key={activity.id}
              className={`flex items-start gap-4 p-4 rounded-lg border ${
                activity.is_read ? 'bg-background' : 'bg-accent/50'
              }`}
            >
              <div className="mt-0.5">{getSeverityIcon(activity.severity || 'info')}</div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">{activity.title}</h4>
                  <Badge variant={getSeverityVariant(activity.severity || 'info')}>
                    {activity.activity_type}
                  </Badge>
                </div>
                {activity.description && (
                  <p className="text-sm text-muted-foreground">{activity.description}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                </p>
              </div>
              {!activity.is_read && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => markActivityRead(activity.id)}
                >
                  Mark read
                </Button>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}