import { useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { formatDistanceToNow } from 'date-fns';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  MessageSquare,
  FileText,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

interface TimelineEvent {
  id: string;
  event_type: string;
  description: string;
  created_at: string;
  metadata?: any;
}

interface AutomatedTimelineTrackerProps {
  disputeId: string;
  timeline: TimelineEvent[];
  deadlineAt?: string;
  escalationLevel?: number;
  status: string;
}

export function AutomatedTimelineTracker({
  disputeId,
  timeline,
  deadlineAt,
  escalationLevel = 1,
  status,
}: AutomatedTimelineTrackerProps) {
  const queryClient = useQueryClient();

  // Real-time subscription for timeline events
  useEffect(() => {
    const channel = supabase
      .channel(`dispute-timeline:${disputeId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'dispute_timeline',
          filter: `dispute_id=eq.${disputeId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['dispute-timeline', disputeId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [disputeId, queryClient]);

  const timeLeft = useMemo(() => {
    if (!deadlineAt) return null;
    const ms = new Date(deadlineAt).getTime() - Date.now();
    if (isNaN(ms) || ms < 0) return { expired: true, hours: 0, minutes: 0 };
    return {
      expired: false,
      hours: Math.floor(ms / (1000 * 60 * 60)),
      minutes: Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60)),
    };
  }, [deadlineAt]);

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'created':
      case 'filed':
        return AlertTriangle;
      case 'status_changed':
      case 'status_change':
        return TrendingUp;
      case 'resolved':
        return CheckCircle2;
      case 'message':
      case 'message_sent':
        return MessageSquare;
      case 'evidence_uploaded':
      case 'evidence_added':
        return FileText;
      case 'deadline_warning':
        return AlertCircle;
      default:
        return Clock;
    }
  };

  const getEventVariant = (eventType: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (eventType) {
      case 'resolved':
        return 'default';
      case 'deadline_warning':
        return 'destructive';
      case 'evidence_uploaded':
      case 'message_sent':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const deadlineProgress = useMemo(() => {
    if (!deadlineAt || !timeLeft) return 0;
    if (timeLeft.expired) return 100;
    const totalMs = new Date(deadlineAt).getTime() - (Date.now() - 7 * 24 * 60 * 60 * 1000);
    const elapsedMs = totalMs - (timeLeft.hours * 60 * 60 * 1000 + timeLeft.minutes * 60 * 1000);
    return Math.min(100, Math.max(0, (elapsedMs / totalMs) * 100));
  }, [deadlineAt, timeLeft]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Timeline</span>
          <div className="flex items-center gap-2">
            <Badge variant={escalationLevel > 2 ? 'destructive' : 'secondary'}>
              Level {escalationLevel}
            </Badge>
            <Badge variant={status === 'resolved' ? 'default' : 'outline'}>{status}</Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {timeLeft && (
          <div className="p-4 rounded-lg bg-muted space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Response Deadline</span>
              {timeLeft.expired ? (
                <Badge variant="destructive">Overdue</Badge>
              ) : (
                <span className="text-muted-foreground">
                  {timeLeft.hours}h {timeLeft.minutes}m remaining
                </span>
              )}
            </div>
            <Progress value={deadlineProgress} className="h-2" />
          </div>
        )}

        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
          {timeline.map((event, index) => {
            const Icon = getEventIcon(event.event_type);
            const variant = getEventVariant(event.event_type);

            return (
              <div key={event.id} className="flex gap-3">
                <div className="relative flex flex-col items-center">
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full ${
                      variant === 'destructive'
                        ? 'bg-destructive/10 text-destructive'
                        : variant === 'default'
                        ? 'bg-primary/10 text-primary'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  {index < timeline.length - 1 && (
                    <div className="w-px h-full bg-border mt-2" />
                  )}
                </div>
                <div className="flex-1 pb-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant={variant} className="text-xs">
                          {event.event_type.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                      <p className="text-sm">{event.description}</p>
                      {event.metadata && Object.keys(event.metadata).length > 0 && (
                        <div className="text-xs text-muted-foreground">
                          {JSON.stringify(event.metadata, null, 2)}
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDistanceToNow(new Date(event.created_at))} ago
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
          {timeline.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No timeline events yet.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
