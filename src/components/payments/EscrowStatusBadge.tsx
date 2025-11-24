/**
 * Escrow Status Badge
 * Visual indicator for contract escrow status
 */

import { Badge } from '@/components/ui/badge';
import { Lock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface EscrowStatusBadgeProps {
  status: string | null;
  className?: string;
  showIcon?: boolean;
}

export function EscrowStatusBadge({ status, className, showIcon = true }: EscrowStatusBadgeProps) {
  if (!status) return null;

  const statusConfig: Record<string, { 
    label: string; 
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
    icon: typeof Lock;
  }> = {
    none: { label: 'No Escrow', variant: 'outline', icon: AlertCircle },
    pending: { label: 'Escrow Pending', variant: 'secondary', icon: Lock },
    funded: { label: 'Funds Held', variant: 'default', icon: Lock },
    released: { label: 'Released', variant: 'default', icon: CheckCircle },
    refunded: { label: 'Refunded', variant: 'outline', icon: XCircle },
  };

  const config = statusConfig[status] || { label: status, variant: 'outline', icon: AlertCircle };
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className={className}>
      {showIcon && <Icon className="w-3 h-3 mr-1" />}
      {config.label}
    </Badge>
  );
}
