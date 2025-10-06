import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useDisputes } from '@/hooks/useDisputes';
import { AlertTriangle, Clock, Eye, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface DisputesListProps {
  userId: string;
  onViewDispute?: (disputeId: string) => void;
}

export const DisputesList = ({ userId, onViewDispute }: DisputesListProps) => {
  const { disputes, disputesLoading } = useDisputes(userId);

  if (disputesLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      </Card>
    );
  }

  if (!disputes || disputes.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center py-8 text-muted-foreground">
          <AlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No disputes found</p>
          <p className="text-sm">Active disputes will appear here</p>
        </div>
      </Card>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-500';
      case 'in_progress': return 'bg-yellow-500';
      case 'resolved': return 'bg-green-500';
      case 'closed': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-4">
      {disputes.map((dispute: any) => (
        <Card key={dispute.id} className="p-6 hover:shadow-md transition-shadow">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                  <h3 className="font-semibold">{dispute.title}</h3>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>#{dispute.dispute_number}</span>
                  <span>•</span>
                  <span>{dispute.job?.title}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Badge className={getStatusColor(dispute.status)}>
                  {dispute.status.replace('_', ' ').toUpperCase()}
                </Badge>
                <Badge variant={getPriorityColor(dispute.priority)}>
                  {dispute.priority.toUpperCase()}
                </Badge>
              </div>
            </div>

            <p className="text-sm text-muted-foreground line-clamp-2">
              {dispute.description}
            </p>

            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{formatDistanceToNow(new Date(dispute.created_at))} ago</span>
                </div>
                {dispute.amount_disputed > 0 && (
                  <span className="font-medium">
                    ${dispute.amount_disputed.toFixed(2)} in dispute
                  </span>
                )}
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onViewDispute?.(dispute.id)}
              >
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
