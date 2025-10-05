import { useAuth } from '@/hooks/useAuth';
import { usePaymentAnalytics } from '@/hooks/usePaymentAnalytics';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  Loader2, TrendingUp, TrendingDown, DollarSign, 
  Activity, Users, CreditCard, Download, FileText,
  BarChart3, PieChart, Calendar
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export const PaymentAnalyticsDashboard = () => {
  const { user } = useAuth();
  const { analytics, reports, loading, summary, comparison } = usePaymentAnalytics(user?.id);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const getTrendIndicator = (change: number) => {
    if (change > 0) {
      return (
        <div className="flex items-center gap-1 text-green-600">
          <TrendingUp className="w-4 h-4" />
          <span className="text-sm font-medium">+{change.toFixed(1)}%</span>
        </div>
      );
    }
    if (change < 0) {
      return (
        <div className="flex items-center gap-1 text-red-600">
          <TrendingDown className="w-4 h-4" />
          <span className="text-sm font-medium">{change.toFixed(1)}%</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1 text-muted-foreground">
        <span className="text-sm font-medium">0%</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.totalRevenue)}</div>
            {comparison && getTrendIndicator(comparison.revenue.change)}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalTransactions}</div>
            {comparison && getTrendIndicator(comparison.transactions.change)}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Transaction</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.averageTransaction)}</div>
            {comparison && getTrendIndicator(comparison.average.change)}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Escrow</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.totalEscrow)}</div>
            <p className="text-xs text-muted-foreground">Protected funds</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Details */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">
            <BarChart3 className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="breakdown">
            <PieChart className="w-4 h-4 mr-2" />
            Breakdown
          </TabsTrigger>
          <TabsTrigger value="reports">
            <FileText className="w-4 h-4 mr-2" />
            Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Performance</CardTitle>
              <CardDescription>Last 12 months financial overview</CardDescription>
            </CardHeader>
            <CardContent>
              {analytics.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No analytics data available yet
                </p>
              ) : (
                <div className="space-y-4">
                  {analytics.slice(0, 6).map((period) => (
                    <div
                      key={period.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <Calendar className="w-8 h-8 text-muted-foreground" />
                        <div>
                          <p className="font-medium">
                            {format(new Date(period.period_start), 'MMMM yyyy')}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {period.transaction_count} transactions
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">
                          {formatCurrency(period.total_revenue)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Avg: {formatCurrency(period.average_transaction)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="breakdown" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
                <CardDescription>Distribution by payment type</CardDescription>
              </CardHeader>
              <CardContent>
                {analytics.length > 0 && analytics[0].payment_method_breakdown ? (
                  <div className="space-y-2">
                    {Object.entries(analytics[0].payment_method_breakdown).map(([method, count]) => (
                      <div key={method} className="flex items-center justify-between">
                        <span className="text-sm capitalize">{method}</span>
                        <Badge variant="outline">{count}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No data available</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Transaction Status</CardTitle>
                <CardDescription>Breakdown by status</CardDescription>
              </CardHeader>
              <CardContent>
                {analytics.length > 0 && analytics[0].status_breakdown ? (
                  <div className="space-y-2">
                    {Object.entries(analytics[0].status_breakdown).map(([status, count]) => (
                      <div key={status} className="flex items-center justify-between">
                        <span className="text-sm capitalize">{status}</span>
                        <Badge variant="outline">{count}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No data available</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Financial Reports</CardTitle>
                  <CardDescription>Generated reports and exports</CardDescription>
                </div>
                <Button>
                  <Download className="w-4 h-4 mr-2" />
                  Generate Report
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {reports.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No reports generated yet
                </p>
              ) : (
                <div className="space-y-3">
                  {reports.map((report) => (
                    <div
                      key={report.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{report.report_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(report.created_at), 'MMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={
                          report.status === 'completed'
                            ? 'default'
                            : report.status === 'failed'
                            ? 'destructive'
                            : 'secondary'
                        }
                      >
                        {report.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
