import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useJobPayments } from '@/hooks/useJobPayments';
import { format } from 'date-fns';
import { DollarSign, FileText, Unlock } from 'lucide-react';

interface JobPaymentStatusProps {
  jobId: string;
  jobStatus: string;
  isJobOwner: boolean;
}

export function JobPaymentStatus({
  jobId,
  jobStatus,
  isJobOwner,
}: JobPaymentStatusProps) {
  const { jobPayments, loadingPayments, releaseEscrow, generateInvoice } = useJobPayments(jobId);

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

  if (loadingPayments) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-4 bg-muted rounded w-1/2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!jobPayments || jobPayments.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground text-center">
            No payments yet for this job
          </p>
        </CardContent>
      </Card>
    );
  }

  const latestPayment = jobPayments[0];
  const hasPendingPayment = latestPayment.status === 'pending';
  const canReleaseEscrow = isJobOwner && hasPendingPayment && jobStatus === 'completed';

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Payment Status</CardTitle>
            <CardDescription>Track payments for this job</CardDescription>
          </div>
          <DollarSign className="h-5 w-5 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {jobPayments.map((payment) => (
            <div
              key={payment.id}
              className="flex items-center justify-between border-b pb-3 last:border-0"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium">
                    ${payment.amount} {payment.currency}
                  </p>
                  <Badge variant={getStatusColor(payment.status)}>
                    {payment.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(payment.created_at), 'PPp')}
                </p>
              </div>
            </div>
          ))}

          {canReleaseEscrow && (
            <div className="pt-2 space-y-2">
              <Button
                size="sm"
                variant="outline"
                className="w-full"
                onClick={() => releaseEscrow.mutate(jobId)}
                disabled={releaseEscrow.isPending}
              >
                <Unlock className="h-4 w-4 mr-2" />
                {releaseEscrow.isPending ? 'Releasing...' : 'Release Escrow'}
              </Button>
            </div>
          )}

          {latestPayment.status === 'completed' && (
            <Button
              size="sm"
              variant="outline"
              className="w-full"
              onClick={() => generateInvoice.mutate(jobId)}
              disabled={generateInvoice.isPending}
            >
              <FileText className="h-4 w-4 mr-2" />
              {generateInvoice.isPending ? 'Generating...' : 'Generate Invoice'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
