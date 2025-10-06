import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, XCircle, Download, RefreshCw } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface BulkPaymentActionsProps {
  selectedPayments: string[];
  onSelectionChange: (ids: string[]) => void;
  onActionComplete: () => void;
}

export const BulkPaymentActions = ({
  selectedPayments,
  onSelectionChange,
  onActionComplete,
}: BulkPaymentActionsProps) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [action, setAction] = useState<'approve' | 'reject' | 'refund' | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleBulkAction = async () => {
    if (!action || selectedPayments.length === 0) return;

    setProcessing(true);
    try {
      if (action === 'approve' || action === 'reject') {
        // Bulk update refund requests
        const { error } = await supabase
          .from('refund_requests')
          .update({
            status: action === 'approve' ? 'approved' : 'rejected',
            reviewed_at: new Date().toISOString(),
          })
          .in('id', selectedPayments);

        if (error) throw error;
      } else if (action === 'refund') {
        // Process bulk refunds
        for (const paymentId of selectedPayments) {
          const { error } = await supabase
            .from('payment_transactions')
            .update({ status: 'refunded' })
            .eq('id', paymentId);

          if (error) throw error;
        }
      }

      toast.success(`Successfully ${action}ed ${selectedPayments.length} payment(s)`);
      onSelectionChange([]);
      onActionComplete();
    } catch (error) {
      console.error('Bulk action error:', error);
      toast.error(`Failed to ${action} payments`);
    } finally {
      setProcessing(false);
      setShowConfirm(false);
      setAction(null);
    }
  };

  const handleExportSelected = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_transactions')
        .select('*')
        .in('id', selectedPayments);

      if (error) throw error;

      // Convert to CSV
      const headers = ['ID', 'Amount', 'Status', 'Currency', 'Created At'];
      const rows = data?.map(t => [
        t.id,
        t.amount.toFixed(2),
        t.status,
        t.currency,
        new Date(t.created_at).toISOString(),
      ]);

      const csv = [
        headers.join(','),
        ...(rows?.map(row => row.join(',')) || []),
      ].join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bulk-payments-${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success('Selected payments exported');
    } catch (error) {
      toast.error('Failed to export payments');
    }
  };

  const triggerAction = (actionType: 'approve' | 'reject' | 'refund') => {
    setAction(actionType);
    setShowConfirm(true);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Bulk Actions</CardTitle>
          <CardDescription>
            {selectedPayments.length} payment(s) selected
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => triggerAction('approve')}
              disabled={selectedPayments.length === 0 || processing}
              variant="outline"
              size="sm"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Approve Selected
            </Button>

            <Button
              onClick={() => triggerAction('reject')}
              disabled={selectedPayments.length === 0 || processing}
              variant="outline"
              size="sm"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Reject Selected
            </Button>

            <Button
              onClick={() => triggerAction('refund')}
              disabled={selectedPayments.length === 0 || processing}
              variant="outline"
              size="sm"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refund Selected
            </Button>

            <Button
              onClick={handleExportSelected}
              disabled={selectedPayments.length === 0}
              variant="outline"
              size="sm"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Selected
            </Button>

            {selectedPayments.length > 0 && (
              <Button
                onClick={() => onSelectionChange([])}
                variant="ghost"
                size="sm"
              >
                Clear Selection
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Bulk Action</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {action} {selectedPayments.length} payment(s)?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkAction} disabled={processing}>
              {processing ? 'Processing...' : 'Confirm'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
