import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  FileText, 
  DollarSign, 
  Calendar, 
  ExternalLink,
  Clock
} from 'lucide-react';
import { useJobTimeline } from '@/hooks/messaging/useJobTimeline';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ChatSidebarProps {
  jobId: string | null;
  agreedPrice?: number;
}

export const ChatSidebar = ({ jobId, agreedPrice }: ChatSidebarProps) => {
  const { events, isLoading } = useJobTimeline(jobId);
  const navigate = useNavigate();

  if (!jobId) return null;

  return (
    <div className="w-80 border-l bg-muted/30 flex flex-col h-full">
      <div className="p-4 border-b">
        <h3 className="font-semibold text-foreground">Job Details</h3>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Key Information */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">Key Information</h4>
            {agreedPrice && (
              <Card className="p-3 bg-background">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Agreed Price</span>
                  <span className="font-semibold text-foreground">
                    €{agreedPrice.toLocaleString()}
                  </span>
                </div>
              </Card>
            )}
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">Quick Links</h4>
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => navigate(`/jobs/${jobId}`)}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View Job Details
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => navigate(`/contracts?job=${jobId}`)}
              >
                <FileText className="w-4 h-4 mr-2" />
                View Contract
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => navigate(`/milestones?job=${jobId}`)}
              >
                <Calendar className="w-4 h-4 mr-2" />
                View Milestones
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => navigate(`/payments?job=${jobId}`)}
              >
                <DollarSign className="w-4 h-4 mr-2" />
                View Payments
              </Button>
            </div>
          </div>

          <Separator />

          {/* Timeline */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">Activity Timeline</h4>
            {isLoading ? (
              <div className="text-sm text-muted-foreground">Loading timeline...</div>
            ) : events.length === 0 ? (
              <Card className="p-4 bg-background">
                <p className="text-sm text-muted-foreground text-center">
                  No activity yet
                </p>
              </Card>
            ) : (
              <div className="space-y-3">
                {events.map((event) => (
                  <Card key={event.id} className="p-3 bg-background">
                    <div className="space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium text-foreground">
                          {event.event_title}
                        </p>
                        <Clock className="w-3 h-3 text-muted-foreground flex-shrink-0 mt-0.5" />
                      </div>
                      {event.event_description && (
                        <p className="text-xs text-muted-foreground">
                          {event.event_description}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};
