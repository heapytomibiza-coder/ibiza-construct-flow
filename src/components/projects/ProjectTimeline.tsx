import { Check, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface TimelineEvent {
  id: string;
  title: string;
  description?: string;
  date: string;
  status: 'completed' | 'current' | 'upcoming' | 'blocked';
  type: 'milestone' | 'payment' | 'status_change' | 'communication';
}

interface ProjectTimelineProps {
  events: TimelineEvent[];
  className?: string;
}

const statusConfig = {
  completed: {
    icon: CheckCircle2,
    color: 'text-success',
    bgColor: 'bg-success/10',
    borderColor: 'border-success/20',
    label: 'Completed'
  },
  current: {
    icon: Clock,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    borderColor: 'border-primary/20',
    label: 'In Progress'
  },
  upcoming: {
    icon: Clock,
    color: 'text-muted-foreground',
    bgColor: 'bg-muted/50',
    borderColor: 'border-muted',
    label: 'Upcoming'
  },
  blocked: {
    icon: AlertCircle,
    color: 'text-destructive',
    bgColor: 'bg-destructive/10',
    borderColor: 'border-destructive/20',
    label: 'Blocked'
  }
};

export function ProjectTimeline({ events, className }: ProjectTimelineProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">Project Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative space-y-6">
          {/* Vertical line */}
          <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-border" />

          {events.map((event, index) => {
            const config = statusConfig[event.status];
            const Icon = config.icon;
            const isLast = index === events.length - 1;

            return (
              <div key={event.id} className="relative flex gap-4">
                {/* Timeline dot */}
                <div className="relative z-10 flex-shrink-0">
                  <div
                    className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center border-2',
                      config.bgColor,
                      config.borderColor
                    )}
                  >
                    <Icon className={cn('w-5 h-5', config.color)} />
                  </div>
                </div>

                {/* Content */}
                <div className={cn('flex-1 pb-6', isLast && 'pb-0')}>
                  <div className="flex items-start justify-between gap-4 mb-1">
                    <h4 className="font-semibold text-foreground">{event.title}</h4>
                    <Badge
                      variant="outline"
                      className={cn(
                        'flex-shrink-0',
                        config.bgColor,
                        config.borderColor
                      )}
                    >
                      {config.label}
                    </Badge>
                  </div>
                  
                  {event.description && (
                    <p className="text-sm text-muted-foreground mb-2">
                      {event.description}
                    </p>
                  )}
                  
                  <time className="text-xs text-muted-foreground">
                    {new Date(event.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </time>
                </div>
              </div>
            );
          })}
        </div>

        {events.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No timeline events yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
