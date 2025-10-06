import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { UserActivity } from '@/hooks/useAnalytics';
import { Clock, User, Briefcase, MessageSquare, Star, FileText } from 'lucide-react';

interface ActivityTimelineProps {
  activities: UserActivity[];
}

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'job_created':
    case 'job_updated':
      return Briefcase;
    case 'message_sent':
      return MessageSquare;
    case 'review_created':
      return Star;
    case 'profile_updated':
      return User;
    default:
      return FileText;
  }
};

const getActivityColor = (type: string) => {
  switch (type) {
    case 'job_created':
      return 'bg-green-500';
    case 'job_updated':
      return 'bg-blue-500';
    case 'message_sent':
      return 'bg-purple-500';
    case 'review_created':
      return 'bg-yellow-500';
    case 'profile_updated':
      return 'bg-pink-500';
    default:
      return 'bg-gray-500';
  }
};

const formatActivityType = (type: string) => {
  return type
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export const ActivityTimeline = ({ activities }: ActivityTimelineProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Activity Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px] pr-4">
          <div className="space-y-4">
            {activities.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No activities recorded yet
              </div>
            ) : (
              activities.map((activity, index) => {
                const activityType = activity.action || activity.entity_type || 'activity';
                const Icon = getActivityIcon(activityType);
                const colorClass = getActivityColor(activityType);

                return (
                  <div key={activity.id} className="flex gap-4">
                    <div className="relative">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full ${colorClass}`}
                      >
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      {index < activities.length - 1 && (
                        <div className="absolute top-10 left-1/2 h-full w-0.5 -translate-x-1/2 bg-border" />
                      )}
                    </div>
                    <div className="flex-1 space-y-1 pb-4">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">
                          {formatActivityType(activityType)}
                        </p>
                        <span className="text-xs text-muted-foreground">
                          {formatTimestamp(activity.created_at)}
                        </span>
                      </div>
                      {activity.entity_type && (
                        <Badge variant="secondary" className="text-xs">
                          {activity.entity_type}
                        </Badge>
                      )}
                      {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {Object.entries(activity.metadata).map(([key, value]) => (
                            <div key={key}>
                              {key}: {String(value)}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
