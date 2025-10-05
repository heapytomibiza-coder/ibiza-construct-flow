import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DollarSign, AlertTriangle, RefreshCw, XCircle } from 'lucide-react';
import { useAdminPayments } from '@/hooks/admin/useAdminPayments';
import { RefundApprovalList } from './RefundApprovalList';
import { DisputeResolutionList } from './DisputeResolutionList';
import { TransactionOverview } from './TransactionOverview';

export default function PaymentManagementDashboard() {
  const { statistics, loadingStats } = useAdminPayments();

  const statCards = [
    {
      title: 'Total Transactions',
      value: statistics?.total_transactions || 0,
      icon: DollarSign,
      description: 'Last 30 days',
    },
    {
      title: 'Pending Refunds',
      value: statistics?.pending_refunds || 0,
      icon: RefreshCw,
      description: 'Awaiting review',
    },
    {
      title: 'Active Disputes',
      value: statistics?.active_disputes || 0,
      icon: AlertTriangle,
      description: 'Require attention',
    },
    {
      title: 'Failed Transactions',
      value: statistics?.failed_transactions || 0,
      icon: XCircle,
      description: 'Last 30 days',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Payment Management</h2>
        <p className="text-muted-foreground">
          Manage transactions, refunds, and disputes
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
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

      {/* Main Content Tabs */}
      <Tabs defaultValue="refunds" className="space-y-4">
        <TabsList>
          <TabsTrigger value="refunds">Refund Requests</TabsTrigger>
          <TabsTrigger value="disputes">Disputes</TabsTrigger>
          <TabsTrigger value="transactions">All Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="refunds" className="space-y-4">
          <RefundApprovalList />
        </TabsContent>

        <TabsContent value="disputes" className="space-y-4">
          <DisputeResolutionList />
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <TransactionOverview />
        </TabsContent>
      </Tabs>
    </div>
  );
}
