/**
 * Payment Status Badge
 * Visual indicator for payment transaction status
 */

import { Badge } from '@/components/ui/badge';

interface PaymentStatusBadgeProps {
  status: string | null;
  className?: string;
}

export function PaymentStatusBadge({ status, className }: PaymentStatusBadgeProps) {
  if (!status) return null;

  const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    pending: { label: 'Payment Pending', variant: 'secondary' },
    processing: { label: 'Processing', variant: 'secondary' },
    completed: { label: 'Paid', variant: 'default' },
    succeeded: { label: 'Succeeded', variant: 'default' },
    failed: { label: 'Failed', variant: 'destructive' },
    cancelled: { label: 'Cancelled', variant: 'outline' },
    refunded: { label: 'Refunded', variant: 'outline' },
  };

  const config = statusConfig[status] || { label: status, variant: 'outline' };

  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  );
}
