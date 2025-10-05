import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useUserPayments } from '@/hooks/useUserPayments';
import { format } from 'date-fns';
import { Download, RefreshCw } from 'lucide-react';

export function PaymentHistory() {
  const { paymentHistory, loadingHistory, generateReceipt } = useUserPayments();

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

  if (loadingHistory) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!paymentHistory || paymentHistory.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground py-8">
            No payment history available
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment History</CardTitle>
        <CardDescription>View your past transactions and receipts</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {paymentHistory.map((payment) => (
            <div
              key={payment.id}
              className="flex items-center justify-between border rounded-lg p-4 hover:bg-accent/50 transition-colors"
            >
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium">
                    ${payment.amount} {payment.currency?.toUpperCase()}
                  </p>
                  <Badge variant={getStatusColor(payment.status)}>
                    {payment.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Payment ID: {payment.stripe_payment_intent_id || payment.id.slice(0, 8)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(payment.created_at), 'PPp')}
                </p>
                {payment.payment_method_id && (
                  <p className="text-xs text-muted-foreground">
                    Method ID: {payment.payment_method_id}
                  </p>
                )}
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => generateReceipt.mutate(payment.id)}
                disabled={generateReceipt.isPending}
              >
                <Download className="h-4 w-4 mr-1" />
                Receipt
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
