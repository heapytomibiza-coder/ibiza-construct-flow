import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Download, TrendingUp, DollarSign, CreditCard, AlertCircle } from 'lucide-react';
import { PaymentTrendsChart } from './PaymentTrendsChart';
import { RevenueBreakdownChart } from './RevenueBreakdownChart';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { format } from 'date-fns';

export const AdvancedPaymentAnalytics = () => {
  const { user } = useAuth();

  const { data: metrics } = useQuery({
    queryKey: ['payment-metrics', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payment_transactions')
        .select('amount, status, created_at')
        .eq('user_id', user?.id!);

      if (error) throw error;

      const completed = data?.filter(t => t.status === 'completed' || t.status === 'succeeded') || [];
      const pending = data?.filter(t => t.status === 'pending') || [];
      const failed = data?.filter(t => t.status === 'failed') || [];

      return {
        totalRevenue: completed.reduce((sum, t) => sum + t.amount, 0),
        totalTransactions: data?.length || 0,
        pendingAmount: pending.reduce((sum, t) => sum + t.amount, 0),
        failedTransactions: failed.length,
        averageTransaction: completed.length > 0 
          ? completed.reduce((sum, t) => sum + t.amount, 0) / completed.length 
          : 0,
      };
    },
    enabled: !!user?.id,
  });

  const handleExport = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_transactions')
        .select('*')
        .eq('user_id', user?.id!)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Convert to CSV
      const headers = ['Date', 'Amount', 'Status', 'Payment Method', 'Payment Intent ID'];
      const rows = data?.map(t => [
        format(new Date(t.created_at), 'yyyy-MM-dd HH:mm:ss'),
        t.amount.toFixed(2),
        t.status,
        t.payment_method_id || 'N/A',
        t.stripe_payment_intent_id || 'N/A',
      ]);

      const csv = [
        headers.join(','),
        ...(rows?.map(row => row.join(',')) || []),
      ].join('\n');

      // Download
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payment-analytics-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success('Analytics exported successfully');
    } catch (error) {
      toast.error('Failed to export analytics');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Payment Analytics</h2>
          <p className="text-muted-foreground">Comprehensive insights into your payment data</p>
        </div>
        <Button onClick={handleExport} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export Data
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics?.totalRevenue.toFixed(2) || '0.00'}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.totalTransactions || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Amount</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics?.pendingAmount.toFixed(2) || '0.00'}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Transaction</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics?.averageTransaction.toFixed(2) || '0.00'}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Transactions</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.failedTransactions || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trends">Payment Trends</TabsTrigger>
          <TabsTrigger value="breakdown">Revenue Breakdown</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-1">
            <PaymentTrendsChart userId={user?.id} days={30} />
          </div>
        </TabsContent>

        <TabsContent value="breakdown" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-1">
            <RevenueBreakdownChart userId={user?.id} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
