/**
 * Transparency Dashboard
 * Real-time view of all actions, deadlines, and status
 */

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Shield, FileText } from 'lucide-react';
import { format } from 'date-fns';

interface DisputeData {
  stage: number;
  escrow_frozen: boolean;
  escrow_amount?: number;
  evidence_deadline?: string;
  response_deadline?: string;
  cooling_off_period_end?: string;
}

interface TransparencyDashboardProps {
  dispute: DisputeData;
}

export function TransparencyDashboard({ dispute }: TransparencyDashboardProps) {
  return (
    <Card className="p-6">
      <h3 className="font-semibold mb-4 flex items-center gap-2">
        <Shield className="w-5 h-5 text-primary" />
        Dispute Status Dashboard
      </h3>

      <div className="space-y-4">
        {/* Escrow Status */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            <span className="font-medium">Escrow Status</span>
          </div>
          <Badge variant={dispute.escrow_frozen ? 'destructive' : 'secondary'}>
            {dispute.escrow_frozen ? 'Frozen' : 'Active'}
          </Badge>
        </div>

        {/* Deadlines */}
        {dispute.evidence_deadline && (
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              <span className="font-medium">Evidence Deadline</span>
            </div>
            <span className="text-sm">
              {format(new Date(dispute.evidence_deadline), 'MMM d, yyyy')}
            </span>
          </div>
        )}

        {dispute.response_deadline && (
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              <span className="font-medium">Response Deadline</span>
            </div>
            <span className="text-sm">
              {format(new Date(dispute.response_deadline), 'MMM d, yyyy')}
            </span>
          </div>
        )}

        {/* Current Stage */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/20">
          <span className="font-medium">Current Stage</span>
          <Badge variant="default">Stage {dispute.stage} of 5</Badge>
        </div>
      </div>
    </Card>
  );
}