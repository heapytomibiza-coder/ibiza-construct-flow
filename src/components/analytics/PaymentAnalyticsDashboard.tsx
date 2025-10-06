import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { usePaymentAnalytics } from '@/hooks/usePaymentAnalytics';
import { RevenueChart } from './RevenueChart';
import { PaymentMethodChart } from './PaymentMethodChart';
import { TopRevenueSourcesTable } from './TopRevenueSourcesTable';
import { AnalyticsMetricCard } from './AnalyticsMetricCard';
import { Download, TrendingUp, CreditCard, CheckCircle, XCircle, DollarSign, Percent } from 'lucide-react';
import { toast } from 'sonner';

export function PaymentAnalyticsDashboard() {
  const [period, setPeriod] = useState<number>(30);
  const { analytics, revenueTrend, paymentMethods, topRevenueSources, isLoading } = usePaymentAnalytics(period);

  const handleExport = () => {
    if (!analytics) return;

    const csvData = [
      ['Metric', 'Value'],
      ['Total Revenue', analytics.total_revenue],
      ['Total Payments', analytics.total_payments],
      ['Successful Payments', analytics.successful_payments],
      ['Failed Payments', analytics.failed_payments],
      ['Average Transaction Value', analytics.average_transaction_value],
      ['Conversion Rate', `${analytics.conversion_rate}%`],
      ['Refund Rate', `${analytics.refund_rate}%`],
    ];

    const csv = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payment-analytics-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Analytics exported successfully');
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Payment Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Loading analytics...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Payment Analytics</h2>
          <p className="text-muted-foreground">
            Comprehensive insights into your payment performance
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={period.toString()} onValueChange={(v) => setPeriod(parseInt(v))}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleExport} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      {analytics && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <AnalyticsMetricCard
            title="Total Revenue"
            value={`$${analytics.total_revenue.toFixed(2)}`}
            icon={DollarSign}
            trend={analytics.total_revenue > 0 ? 'up' : 'neutral'}
          />
          <AnalyticsMetricCard
            title="Total Payments"
            value={analytics.total_payments.toString()}
            icon={CreditCard}
            description={`${analytics.successful_payments} successful`}
          />
          <AnalyticsMetricCard
            title="Conversion Rate"
            value={`${analytics.conversion_rate.toFixed(1)}%`}
            icon={TrendingUp}
            trend={analytics.conversion_rate > 80 ? 'up' : analytics.conversion_rate > 50 ? 'neutral' : 'down'}
          />
          <AnalyticsMetricCard
            title="Avg Transaction"
            value={`$${analytics.average_transaction_value.toFixed(2)}`}
            icon={DollarSign}
          />
        </div>
      )}

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>Daily revenue over the selected period</CardDescription>
          </CardHeader>
          <CardContent>
            <RevenueChart data={revenueTrend || []} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
            <CardDescription>Distribution by payment method</CardDescription>
          </CardHeader>
          <CardContent>
            <PaymentMethodChart data={paymentMethods || []} />
          </CardContent>
        </Card>
      </div>

      {/* Top Revenue Sources */}
      <Card>
        <CardHeader>
          <CardTitle>Top Revenue Sources</CardTitle>
          <CardDescription>Jobs generating the most revenue</CardDescription>
        </CardHeader>
        <CardContent>
          <TopRevenueSourcesTable data={topRevenueSources || []} />
        </CardContent>
      </Card>

      {/* Additional Metrics */}
      {analytics && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.conversion_rate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                {analytics.successful_payments} of {analytics.total_payments} payments
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Failed Payments</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.failed_payments}</div>
              <p className="text-xs text-muted-foreground">
                {((analytics.failed_payments / Math.max(analytics.total_payments, 1)) * 100).toFixed(1)}% failure rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Refund Rate</CardTitle>
              <Percent className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.refund_rate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                Of successful payments
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
