import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, Mail, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface PaymentReminder {
  id: string;
  scheduled_payment_id: string;
  reminder_type: 'upcoming' | 'overdue' | 'failed';
  sent_at: string;
  channel: 'email' | 'sms' | 'push';
  status: 'sent' | 'failed' | 'bounced';
  metadata: {
    amount?: number;
    currency?: string;
    due_date?: string;
    installment_number?: number;
  };
}

export function PaymentRemindersList() {
  const { data: reminders, isLoading } = useQuery({
    queryKey: ['payment-reminders'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error }: any = await (supabase as any)
        .from('payment_reminders')
        .select('*')
        .eq('user_id', user.id)
        .order('sent_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data as PaymentReminder[];
    },
  });

  const getReminderTypeColor = (type: string) => {
    switch (type) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'overdue':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'failed':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'failed':
      case 'bounced':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'email':
        return <Mail className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payment Reminders</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading reminders...</p>
        </CardContent>
      </Card>
    );
  }

  if (!reminders || reminders.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Payment Reminders
          </CardTitle>
          <CardDescription>View your payment reminder history</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No reminders sent yet
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Payment Reminders
        </CardTitle>
        <CardDescription>
          Recent reminders sent for your upcoming payments
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {reminders.map((reminder) => (
            <div
              key={reminder.id}
              className="flex items-start gap-4 p-4 rounded-lg border bg-card"
            >
              <div className="flex items-center gap-2">
                {getStatusIcon(reminder.status)}
                {getChannelIcon(reminder.channel)}
              </div>
              
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <Badge className={getReminderTypeColor(reminder.reminder_type)}>
                    {reminder.reminder_type}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(reminder.sent_at), 'MMM dd, yyyy HH:mm')}
                  </span>
                </div>
                
                {reminder.metadata.installment_number && (
                  <p className="text-sm">
                    Installment #{reminder.metadata.installment_number}
                    {reminder.metadata.amount && reminder.metadata.currency && (
                      <span className="font-semibold ml-1">
                        - {reminder.metadata.currency} {reminder.metadata.amount}
                      </span>
                    )}
                  </p>
                )}
                
                {reminder.metadata.due_date && (
                  <p className="text-xs text-muted-foreground">
                    Due: {format(new Date(reminder.metadata.due_date), 'MMM dd, yyyy')}
                  </p>
                )}
              </div>
              
              <Badge variant={reminder.status === 'sent' ? 'default' : 'destructive'}>
                {reminder.status}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
