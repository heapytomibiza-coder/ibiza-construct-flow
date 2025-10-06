import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useMediation } from '@/hooks/useMediation';
import { Scale, AlertCircle, CheckCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface MediatorDashboardProps {
  disputeId: string;
}

export function MediatorDashboard({ disputeId }: MediatorDashboardProps) {
  const { resolutions } = useMediation(disputeId);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'agreed':
        return 'bg-green-500/10 text-green-500';
      case 'executed':
        return 'bg-blue-500/10 text-blue-500';
      case 'rejected':
        return 'bg-red-500/10 text-red-500';
      case 'proposed':
        return 'bg-yellow-500/10 text-yellow-500';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scale className="w-5 h-5" />
          Mediator Workspace
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          Latest proposals and decisions for this dispute
        </div>

        {resolutions.isLoading ? (
          <div className="text-sm text-muted-foreground">Loading resolutions...</div>
        ) : (resolutions.data ?? []).length === 0 ? (
          <div className="p-4 rounded-lg bg-muted/50 text-center text-sm text-muted-foreground">
            No resolutions proposed yet
          </div>
        ) : (
          <div className="space-y-3">
            {(resolutions.data ?? []).map((r) => (
              <div key={r.id} className="p-4 rounded-lg bg-card border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <Badge className={getStatusColor(r.status)}>
                    {r.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}
                  </span>
                </div>

                <div className="text-sm font-medium">{r.resolution_type}</div>

                {(r.fault_percentage_client !== null || r.fault_percentage_professional !== null) && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Fault split:</span>
                    <span>Client {r.fault_percentage_client ?? 0}%</span>
                    <span className="text-muted-foreground">/</span>
                    <span>Professional {r.fault_percentage_professional ?? 0}%</span>
                  </div>
                )}

                {r.mediator_decision_reasoning && (
                  <div className="text-sm space-y-1">
                    <div className="font-medium text-muted-foreground">Reasoning:</div>
                    <div className="text-foreground">{r.mediator_decision_reasoning}</div>
                  </div>
                )}

                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    {r.party_client_agreed ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-muted-foreground" />
                    )}
                    <span className="text-muted-foreground">Client</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {r.party_professional_agreed ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-muted-foreground" />
                    )}
                    <span className="text-muted-foreground">Professional</span>
                  </div>
                </div>

                {r.auto_execute_date && (
                  <div className="text-xs text-muted-foreground">
                    Auto-execute: {new Date(r.auto_execute_date).toLocaleString()}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
