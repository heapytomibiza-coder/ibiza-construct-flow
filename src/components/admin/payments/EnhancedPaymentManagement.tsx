import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BulkPaymentActions } from './BulkPaymentActions';
import { AdvancedPaymentFilters, PaymentFilters } from './AdvancedPaymentFilters';
import { AutomatedWorkflowManager } from './AutomatedWorkflowManager';
import { TransactionOverview } from './TransactionOverview';
import { RefundApprovalList } from './RefundApprovalList';
import { DisputeResolutionList } from './DisputeResolutionList';
import { useAdminPayments } from '@/hooks/admin/useAdminPayments';
import { DollarSign, AlertTriangle, RefreshCw, XCircle, FileText, AlertCircle, Zap } from 'lucide-react';

export const EnhancedPaymentManagement = () => {
  const [selectedPayments, setSelectedPayments] = useState<string[]>([]);
  const [filters, setFilters] = useState<PaymentFilters>({});
  const [refreshKey, setRefreshKey] = useState(0);
  const { statistics } = useAdminPayments();

  const handleActionComplete = () => {
    setRefreshKey(prev => prev + 1);
  };

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
        <h2 className="text-2xl font-bold">Payment Management</h2>
        <p className="text-muted-foreground">
          Advanced tools for managing payments, refunds, and disputes
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

      <AdvancedPaymentFilters filters={filters} onFiltersChange={setFilters} />

      {selectedPayments.length > 0 && (
        <BulkPaymentActions
          selectedPayments={selectedPayments}
          onSelectionChange={setSelectedPayments}
          onActionComplete={handleActionComplete}
        />
      )}

      <Tabs defaultValue="transactions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="transactions" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Transactions
          </TabsTrigger>
          <TabsTrigger value="refunds" className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Refunds
          </TabsTrigger>
          <TabsTrigger value="disputes" className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Disputes
          </TabsTrigger>
          <TabsTrigger value="automation" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Automation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="transactions">
          <TransactionOverview 
            filters={filters}
            onSelectionChange={setSelectedPayments}
            refreshKey={refreshKey}
          />
        </TabsContent>

        <TabsContent value="refunds">
          <RefundApprovalList />
        </TabsContent>

        <TabsContent value="disputes">
          <DisputeResolutionList />
        </TabsContent>

        <TabsContent value="automation">
          <AutomatedWorkflowManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};
