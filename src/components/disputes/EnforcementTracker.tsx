import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useMediation } from '@/hooks/useMediation';
import { Shield, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface EnforcementTrackerProps {
  disputeId: string;
}

export function EnforcementTracker({ disputeId }: EnforcementTrackerProps) {
  const { enforcement } = useMediation(disputeId);

  const getActionIcon = (action: string) => {
    if (action.includes('execute_end') || action.includes('completed')) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
    if (action.includes('execute_begin') || action.includes('pending')) {
      return <Clock className="w-4 h-4 text-yellow-500" />;
    }
    if (action.includes('failed') || action.includes('error')) {
      return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
    return <Shield className="w-4 h-4 text-blue-500" />;
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      'execute_begin': 'Execution Started',
      'execute_end': 'Execution Completed',
      'refund_issued': 'Refund Issued',
      'funds_released': 'Funds Released',
      'review_updated': 'Review Updated',
      'escrow_settled': 'Escrow Settled',
    };
    return labels[action] || action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Enforcement Tracker
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {enforcement.isLoading ? (
          <div className="text-sm text-muted-foreground">Loading enforcement log...</div>
        ) : (enforcement.data ?? []).length === 0 ? (
          <div className="p-4 rounded-lg bg-muted/50 text-center text-sm text-muted-foreground">
            No enforcement actions yet
          </div>
        ) : (
          <div className="space-y-3">
            {(enforcement.data ?? []).map((log, index) => (
              <div key={log.id} className="relative">
                {index < (enforcement.data ?? []).length - 1 && (
                  <div className="absolute left-2 top-8 bottom-0 w-px bg-border" />
                )}
                <div className="flex gap-3">
                  <div className="relative z-10 flex-shrink-0 mt-1">
                    {getActionIcon(log.action)}
                  </div>
                  <div className="flex-1 p-3 rounded-lg bg-card border border-border space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-sm">
                        {getActionLabel(log.action)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                      </div>
                    </div>
                    {log.details && Object.keys(log.details).length > 0 && (
                      <div className="text-xs text-muted-foreground">
                        <pre className="whitespace-pre-wrap break-words bg-muted/50 p-2 rounded mt-1">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
