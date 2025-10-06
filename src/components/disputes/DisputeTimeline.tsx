import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CheckCircle2, Clock, AlertTriangle, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface TimelineEvent {
  id: string;
  event_type: string;
  description: string;
  created_at: string;
  actor_id?: string;
}

interface DisputeTimelineProps {
  timeline: TimelineEvent[];
}

export const DisputeTimeline = ({ timeline }: DisputeTimelineProps) => {
  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'created':
        return <AlertTriangle className="w-4 h-4" />;
      case 'status_changed':
        return <Clock className="w-4 h-4" />;
      case 'resolved':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'message':
        return <MessageSquare className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  if (!timeline || timeline.length === 0) {
    return (
      <Card className="p-6">
        <p className="text-center text-muted-foreground">No timeline events yet.</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        {timeline.map((event, index) => (
          <div key={event.id} className="flex gap-4">
            <div className="relative flex flex-col items-center">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary">
                {getEventIcon(event.event_type)}
              </div>
              {index < timeline.length - 1 && (
                <div className="w-px h-full bg-border mt-2" />
              )}
            </div>
              <div className="flex-1 pb-8">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">{event.description}</p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(event.created_at))} ago
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
