import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/ibiza-defaults';
import { ShieldCheck, Clock, CheckCircle2 } from 'lucide-react';
import { FeeBreakdownTooltip } from './FeeBreakdownTooltip';

interface EscrowSummaryCardProps {
  amount: number;
  status: 'held' | 'in_progress' | 'partial_release' | 'completed';
  milestone?: string;
  releaseDate?: Date;
  fees?: {
    platformFee: number;
    processingFee: number;
    total: number;
  };
}

export const EscrowSummaryCard = ({
  amount,
  status,
  milestone,
  releaseDate,
  fees
}: EscrowSummaryCardProps) => {
  const statusConfig = {
    held: {
      icon: ShieldCheck,
      label: 'Held Safely',
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    in_progress: {
      icon: Clock,
      label: 'In Progress',
      color: 'text-yellow-600',
      bg: 'bg-yellow-50',
    },
    partial_release: {
      icon: CheckCircle2,
      label: 'Partial Release',
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    completed: {
      icon: CheckCircle2,
      label: 'Completed',
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Card className="p-6">
      <div className="space-y-4">
        {/* Line 1: Main escrow status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${config.bg}`}>
              <Icon className={`w-5 h-5 ${config.color}`} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Escrow</p>
              <p className="text-2xl font-bold">
                {formatCurrency(amount)}
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="h-7">
            {config.label}
          </Badge>
        </div>

        {/* Line 2: Release info and fees */}
        <div className="flex items-center justify-between text-sm pt-2 border-t">
          <div className="flex items-center gap-2 text-muted-foreground">
            {milestone && (
              <>
                <span>Released when both confirm {milestone}</span>
                {releaseDate && (
                  <span className="text-xs">
                    • Est. {releaseDate.toLocaleDateString()}
                  </span>
                )}
              </>
            )}
            {!milestone && status === 'held' && (
              <span>You can pause, partial-release, or refund</span>
            )}
          </div>
          
          {fees && <FeeBreakdownTooltip fees={fees} />}
        </div>

        {/* Visual timeline */}
        <div className="flex items-center gap-2 pt-2">
          <div className={`h-2 flex-1 rounded-full ${
            status === 'held' ? 'bg-blue-200' : 'bg-blue-600'
          }`} />
          <div className={`h-2 flex-1 rounded-full ${
            status === 'in_progress' || status === 'partial_release' || status === 'completed'
              ? 'bg-yellow-600'
              : 'bg-muted'
          }`} />
          <div className={`h-2 flex-1 rounded-full ${
            status === 'partial_release' || status === 'completed'
              ? 'bg-green-600'
              : 'bg-muted'
          }`} />
          <div className={`h-2 flex-1 rounded-full ${
            status === 'completed' ? 'bg-green-600' : 'bg-muted'
          }`} />
        </div>
        
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Hold</span>
          <span>In Progress</span>
          <span>Partial</span>
          <span>Complete</span>
        </div>
      </div>
    </Card>
  );
};
