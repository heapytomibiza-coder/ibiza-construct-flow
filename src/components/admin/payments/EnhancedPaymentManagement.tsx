import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BulkPaymentActions } from './BulkPaymentActions';
import { AdvancedPaymentFilters, PaymentFilters } from './AdvancedPaymentFilters';
import { AutomatedWorkflowManager } from './AutomatedWorkflowManager';
import { TransactionOverview } from './TransactionOverview';
import { RefundApprovalList } from './RefundApprovalList';
import { DisputeResolutionList } from './DisputeResolutionList';
import { Settings, FileText, AlertCircle, Zap } from 'lucide-react';

export const EnhancedPaymentManagement = () => {
  const [selectedPayments, setSelectedPayments] = useState<string[]>([]);
  const [filters, setFilters] = useState<PaymentFilters>({});
  const [refreshKey, setRefreshKey] = useState(0);

  const handleActionComplete = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Enhanced Payment Management</h2>
        <p className="text-muted-foreground">
          Advanced tools for managing payments, refunds, and disputes
        </p>
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
