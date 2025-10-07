import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRevenueAnalytics } from '@/hooks/useRevenueAnalytics';
import { BarChart3, TrendingUp, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export const RevenueOverviewChart = () => {
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    end: new Date().toISOString(),
  });

  const { transactions, totalRevenue, completedTransactions, isLoading } = useRevenueAnalytics(dateRange);

  if (isLoading) {
    return <Card className="animate-pulse"><CardContent className="h-64" /></Card>;
  }

  const avgTransactionValue = completedTransactions > 0 ? totalRevenue / completedTransactions : 0;

  const revenueByCategory = transactions?.reduce((acc, t) => {
    const category = t.category || 'Other';
    acc[category] = (acc[category] || 0) + Number(t.amount);
    return acc;
  }, {} as Record<string, number>);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center space-x-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          <CardTitle>Revenue Overview</CardTitle>
        </div>
        <Button variant="outline" size="sm">
          Export Report
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-muted-foreground">
              <DollarSign className="h-4 w-4" />
              <span className="text-sm">Total Revenue</span>
            </div>
            <p className="text-2xl font-bold">€{totalRevenue.toFixed(2)}</p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm">Transactions</span>
            </div>
            <p className="text-2xl font-bold">{completedTransactions}</p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-muted-foreground">
              <BarChart3 className="h-4 w-4" />
              <span className="text-sm">Avg. Transaction</span>
            </div>
            <p className="text-2xl font-bold">€{avgTransactionValue.toFixed(2)}</p>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="space-y-4">
          <h4 className="font-semibold">Revenue by Category</h4>
          <div className="space-y-2">
            {revenueByCategory && Object.entries(revenueByCategory).map(([category, amount]) => {
              const percentage = (amount / totalRevenue) * 100;
              return (
                <div key={category} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{category}</span>
                    <span className="font-medium">€{amount.toFixed(2)}</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="space-y-4">
          <h4 className="font-semibold">Recent Transactions</h4>
          <div className="space-y-2">
            {transactions?.slice(0, 5).map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div>
                  <p className="font-medium">{transaction.category || 'Transaction'}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(transaction.processed_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">€{Number(transaction.amount).toFixed(2)}</p>
                  <p className={`text-xs ${
                    transaction.status === 'completed' ? 'text-green-600' :
                    transaction.status === 'pending' ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {transaction.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
