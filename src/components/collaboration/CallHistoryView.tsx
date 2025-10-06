import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCallHistory } from '@/hooks/useCallHistory';
import { Phone, Clock, Calendar, Download } from 'lucide-react';
import { format } from 'date-fns';

export const CallHistoryView = () => {
  const { callHistory, isLoading } = useCallHistory();

  if (isLoading) {
    return <div>Loading call history...</div>;
  }

  if (!callHistory || callHistory.length === 0) {
    return (
      <Card className="p-6 text-center">
        <Phone className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground">No call history yet</p>
      </Card>
    );
  }

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="space-y-4">
      {callHistory.map((call) => (
        <Card key={call.id} className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Phone className="h-5 w-5 text-primary" />
                <h3 className="font-semibold capitalize">{call.call_type} Call</h3>
                {call.quality_score && (
                  <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                    Quality: {call.quality_score}%
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{format(new Date(call.started_at), 'MMM dd, yyyy HH:mm')}</span>
                </div>

                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>Duration: {formatDuration(call.duration_seconds)}</span>
                </div>

                <div className="text-xs">
                  {call.participants.length} participant(s)
                </div>
              </div>

              {call.recording_url && (
                <div className="mt-2">
                  <span className="text-xs text-green-600 dark:text-green-400">
                    ● Recording available
                  </span>
                </div>
              )}

              {call.transcription_url && (
                <div className="mt-1">
                  <span className="text-xs text-blue-600 dark:text-blue-400">
                    ● Transcription available
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2">
              {call.recording_url && (
                <Button size="sm" variant="outline">
                  <Download className="h-4 w-4 mr-1" />
                  Recording
                </Button>
              )}
              {call.transcription_url && (
                <Button size="sm" variant="outline">
                  View Transcript
                </Button>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};