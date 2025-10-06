import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useScheduledCalls } from '@/hooks/useScheduledCalls';
import { Calendar, Clock, Users, Video, X } from 'lucide-react';
import { format } from 'date-fns';

export const ScheduledCallsList = () => {
  const { upcomingCalls, isLoading, cancelScheduledCall } = useScheduledCalls();

  if (isLoading) {
    return <div>Loading scheduled calls...</div>;
  }

  if (!upcomingCalls || upcomingCalls.length === 0) {
    return (
      <Card className="p-6 text-center">
        <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground">No upcoming calls scheduled</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {upcomingCalls.map((call) => (
        <Card key={call.id} className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Video className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">{call.title}</h3>
              </div>

              {call.description && (
                <p className="text-sm text-muted-foreground mb-3">{call.description}</p>
              )}

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{format(new Date(call.scheduled_start), 'MMM dd, yyyy')}</span>
                </div>

                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>
                    {format(new Date(call.scheduled_start), 'HH:mm')} -{' '}
                    {format(new Date(call.scheduled_end), 'HH:mm')}
                  </span>
                </div>

                {call.participant_ids && (
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{call.participant_ids.length} participants</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <Button size="sm" variant="default">
                Join Call
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => cancelScheduledCall(call.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};