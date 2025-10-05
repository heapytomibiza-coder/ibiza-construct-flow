import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useUserPayments } from '@/hooks/useUserPayments';
import { DollarSign, TrendingUp, CreditCard, Calendar } from 'lucide-react';
import { format } from 'date-fns';

export function EarningsDashboard() {
  const { earningsSummary, loadingEarnings } = useUserPayments();

  if (loadingEarnings) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="h-20 animate-pulse bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!earningsSummary) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            No earnings data available
          </p>
        </CardContent>
      </Card>
    );
  }

  const stats = [
    {
      title: 'Total Earnings',
      value: `$${earningsSummary.total_earnings.toFixed(2)}`,
      icon: DollarSign,
      description: 'All-time earnings',
    },
    {
      title: 'Pending Earnings',
      value: `$${earningsSummary.pending_earnings.toFixed(2)}`,
      icon: TrendingUp,
      description: 'Awaiting completion',
    },
    {
      title: 'Completed Transactions',
      value: earningsSummary.completed_transactions,
      icon: CreditCard,
      description: `of ${earningsSummary.total_transactions} total`,
    },
    {
      title: 'Average Transaction',
      value: `$${earningsSummary.average_transaction.toFixed(2)}`,
      icon: Calendar,
      description: earningsSummary.last_payment_date
        ? `Last: ${format(new Date(earningsSummary.last_payment_date), 'PP')}`
        : 'No payments yet',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Earnings Dashboard</h2>
        <p className="text-muted-foreground">
          Track your earnings and payment history
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
