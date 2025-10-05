import { useJobPayments } from '@/hooks/useJobPayments';
import { Badge } from '@/components/ui/badge';
import { DollarSign } from 'lucide-react';

interface JobPaymentWidgetProps {
  jobId: string;
}

export function JobPaymentWidget({ jobId }: JobPaymentWidgetProps) {
  const { jobPayments, loadingPayments } = useJobPayments(jobId);

  if (loadingPayments || !jobPayments || jobPayments.length === 0) {
    return null;
  }

  const latestPayment = jobPayments[0];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'succeeded':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'failed':
      case 'cancelled':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <div className="flex items-center gap-2 text-sm">
      <DollarSign className="h-4 w-4 text-muted-foreground" />
      <span className="font-medium">${latestPayment.amount}</span>
      <Badge variant={getStatusColor(latestPayment.status)} className="text-xs">
        {latestPayment.status}
      </Badge>
    </div>
  );
}
