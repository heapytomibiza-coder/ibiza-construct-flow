import { CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface EscrowMilestoneCardProps {
  milestone: {
    id: string;
    title: string;
    amount: number;
    status: string;
    due_date?: string;
    description?: string;
  };
  canApprove?: boolean;
  canRelease?: boolean;
  onApprove?: (id: string) => void;
  onRelease?: (id: string) => void;
}

export function EscrowMilestoneCard({
  milestone,
  canApprove,
  canRelease,
  onApprove,
  onRelease,
}: EscrowMilestoneCardProps) {
  const getStatusIcon = () => {
    switch (milestone.status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'in_progress':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'released':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = () => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      pending: 'secondary',
      in_progress: 'default',
      completed: 'outline',
      released: 'outline',
    };
    
    return (
      <Badge variant={variants[milestone.status] || 'default'}>
        {milestone.status.replace('_', ' ')}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <CardTitle className="text-lg">{milestone.title}</CardTitle>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {milestone.description && (
          <p className="text-sm text-muted-foreground">{milestone.description}</p>
        )}
        
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold">
            €{(milestone.amount / 100).toFixed(2)}
          </span>
          {milestone.due_date && (
            <span className="text-sm text-muted-foreground">
              Due: {new Date(milestone.due_date).toLocaleDateString()}
            </span>
          )}
        </div>

        <div className="flex gap-2">
          {canApprove && milestone.status === 'in_progress' && (
            <Button 
              onClick={() => onApprove?.(milestone.id)}
              className="flex-1"
            >
              Approve Milestone
            </Button>
          )}
          
          {canRelease && milestone.status === 'completed' && (
            <Button 
              onClick={() => onRelease?.(milestone.id)}
              className="flex-1"
            >
              Release Funds
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
