import { AlertTriangle, TrendingUp, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface EscalationIndicatorProps {
  escalationLevel: number;
  maxEscalations?: number;
  responseDeadline?: string | null;
  lastActivityAt?: string | null;
}

export function EscalationIndicator({
  escalationLevel,
  maxEscalations = 3,
  responseDeadline,
  lastActivityAt,
}: EscalationIndicatorProps) {
  const progressPercentage = (escalationLevel / maxEscalations) * 100;
  
  const getSeverityColor = () => {
    if (escalationLevel === 0) return 'text-muted-foreground';
    if (escalationLevel === 1) return 'text-yellow-600';
    if (escalationLevel === 2) return 'text-orange-600';
    return 'text-destructive';
  };

  const getSeverityLabel = () => {
    if (escalationLevel === 0) return 'Normal';
    if (escalationLevel === 1) return 'Escalated Once';
    if (escalationLevel === 2) return 'Escalated Twice';
    return 'Critical - Max Escalation';
  };

  const getTimeUntilDeadline = () => {
    if (!responseDeadline) return null;
    
    const deadline = new Date(responseDeadline);
    const now = new Date();
    const diff = deadline.getTime() - now.getTime();
    
    if (diff < 0) return 'Overdue';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ${hours % 24}h remaining`;
    return `${hours}h remaining`;
  };

  const timeRemaining = getTimeUntilDeadline();

  return (
    <Card className="p-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className={`w-5 h-5 ${getSeverityColor()}`} />
            <h3 className="font-semibold">Escalation Status</h3>
          </div>
          <Badge
            variant={escalationLevel >= maxEscalations ? 'destructive' : 'secondary'}
            className={escalationLevel === 0 ? '' : getSeverityColor()}
          >
            Level {escalationLevel} / {maxEscalations}
          </Badge>
        </div>

        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className={getSeverityColor()}>{getSeverityLabel()}</span>
            <span className="text-muted-foreground">
              {escalationLevel} escalation{escalationLevel !== 1 ? 's' : ''}
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        {responseDeadline && (
          <div className="flex items-center gap-2 text-sm pt-2 border-t">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Response deadline:</span>
            <span className={timeRemaining === 'Overdue' ? 'text-destructive font-medium' : 'font-medium'}>
              {timeRemaining}
            </span>
          </div>
        )}

        {escalationLevel >= 2 && (
          <div className="flex items-start gap-2 p-3 bg-destructive/10 rounded-lg border border-destructive/20">
            <AlertTriangle className="w-4 h-4 text-destructive mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-destructive">High Priority</p>
              <p className="text-muted-foreground mt-1">
                This dispute requires immediate attention. Further escalation may result in
                administrative review.
              </p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
