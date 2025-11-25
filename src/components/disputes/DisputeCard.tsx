/**
 * Dispute Card Component
 * Display dispute summary with status, stage, and quick actions
 */

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, Clock, CheckCircle, XCircle, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface DisputeCardProps {
  dispute: any;
  className?: string;
}

export function DisputeCard({ dispute, className }: DisputeCardProps) {
  const navigate = useNavigate();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <AlertCircle className="w-4 h-4" />;
      case 'resolved':
        return <CheckCircle className="w-4 h-4" />;
      case 'closed':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'destructive';
      case 'resolved':
        return 'default';
      case 'closed':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const getCategoryLabel = (category: string) => {
    return category
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <Card className={cn('p-6', className)}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={getStatusColor(dispute.workflow_state)}>
                {getStatusIcon(dispute.workflow_state)}
                <span className="ml-1">{dispute.workflow_state}</span>
              </Badge>
              <Badge variant="outline">Stage {dispute.stage}/5</Badge>
              {dispute.escrow_frozen && (
                <Badge variant="secondary">Escrow Frozen</Badge>
              )}
            </div>
            <h3 className="font-semibold text-lg truncate">{dispute.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {dispute.jobs?.title}
            </p>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Category:</span>
            <span className="font-medium">{getCategoryLabel(dispute.type)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Filed:</span>
            <span className="font-medium">
              {format(new Date(dispute.created_at), 'MMM d, yyyy')}
            </span>
          </div>
          {dispute.response_deadline && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Response Due:</span>
              <span className={cn(
                'font-medium',
                new Date(dispute.response_deadline) < new Date() && 'text-destructive'
              )}>
                {format(new Date(dispute.response_deadline), 'MMM d, yyyy')}
              </span>
            </div>
          )}
        </div>

        {/* Description preview */}
        <p className="text-sm text-muted-foreground line-clamp-2">
          {dispute.description}
        </p>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="default"
            size="sm"
            className="flex-1"
            onClick={() => navigate(`/disputes/${dispute.id}`)}
          >
            <Eye className="w-4 h-4 mr-2" />
            View Details
          </Button>
        </div>
      </div>
    </Card>
  );
}