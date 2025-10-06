import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { CheckCircle, Clock, XCircle, Calendar } from 'lucide-react';
import { InstallmentPaymentButton } from './InstallmentPaymentButton';

interface PaymentScheduleViewProps {
  scheduleId: string;
}

interface ScheduledPayment {
  id: string;
  installment_number: number;
  amount: number;
  currency: string;
  due_date: string;
  paid_at: string | null;
  status: string;
}

export function PaymentScheduleView({ scheduleId }: PaymentScheduleViewProps) {
  const [schedule, setSchedule] = useState<any>(null);
  const [payments, setPayments] = useState<ScheduledPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchSchedule = async () => {
    try {
      const { data: scheduleData, error: scheduleError } = await supabase
        .from('payment_schedules')
        .select('*')
        .eq('id', scheduleId)
        .single();

      if (scheduleError) throw scheduleError;

      const { data: paymentsData, error: paymentsError } = await supabase
        .from('scheduled_payments')
        .select('*')
        .eq('schedule_id', scheduleId)
        .order('installment_number');

      if (paymentsError) throw paymentsError;

      setSchedule(scheduleData);
      setPayments(paymentsData);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load payment schedule",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('scheduled-payments-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'scheduled_payments',
          filter: `schedule_id=eq.${scheduleId}`,
        },
        () => {
          fetchSchedule();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [scheduleId]);

  if (loading) {
    return <div>Loading payment schedule...</div>;
  }

  if (!schedule) {
    return <div>Payment schedule not found</div>;
  }

  const paidCount = payments.filter((p) => p.status === 'paid').length;
  const progress = (paidCount / schedule.installment_count) * 100;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Calendar className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      paid: 'default',
      pending: 'secondary',
      processing: 'secondary',
      failed: 'destructive',
      cancelled: 'outline',
    };
    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Payment Schedule</CardTitle>
          <CardDescription>
            {schedule.frequency} payments • {paidCount} of {schedule.installment_count} completed
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span className="font-medium">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <div className="text-sm text-muted-foreground">Total Amount</div>
              <div className="text-2xl font-bold">
                {schedule.currency === 'EUR' ? '€' : '$'}
                {schedule.total_amount}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Remaining</div>
              <div className="text-2xl font-bold text-primary">
                {schedule.currency === 'EUR' ? '€' : '$'}
                {(
                  schedule.total_amount -
                  payments
                    .filter((p) => p.status === 'paid')
                    .reduce((sum, p) => sum + Number(p.amount), 0)
                ).toFixed(2)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Installments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {payments.map((payment) => (
              <div
                key={payment.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-4">
                  {getStatusIcon(payment.status)}
                  <div>
                    <div className="font-medium">
                      Installment #{payment.installment_number}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Due: {format(new Date(payment.due_date), 'PPP')}
                      {payment.paid_at && (
                        <> • Paid: {format(new Date(payment.paid_at), 'PPP')}</>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="font-bold">
                      {payment.currency === 'EUR' ? '€' : '$'}
                      {payment.amount}
                    </div>
                    {getStatusBadge(payment.status)}
                  </div>
                  {payment.status === 'pending' &&
                    new Date(payment.due_date) <= new Date() && (
                      <InstallmentPaymentButton
                        paymentId={payment.id}
                        amount={Number(payment.amount)}
                        currency={payment.currency}
                        onSuccess={fetchSchedule}
                      />
                    )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
