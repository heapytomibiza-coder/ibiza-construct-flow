import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Shield } from 'lucide-react';
import { usePaymentMethods } from '@/hooks/usePaymentMethods';
import { useAuth } from '@/hooks/useAuth';

interface FundEscrowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  milestoneId: string;
}

export const FundEscrowDialog = ({
  open,
  onOpenChange,
  milestoneId,
}: FundEscrowDialogProps) => {
  const [processing, setProcessing] = useState(false);
  const { user } = useAuth();
  const { paymentMethods } = usePaymentMethods(user?.id);

  const handleFundEscrow = async () => {
    try {
      setProcessing(true);

      if (paymentMethods.length === 0) {
        toast.error('Please add a payment method first');
        return;
      }

      const defaultMethod = paymentMethods.find(m => m.is_default) || paymentMethods[0];

      const { data, error } = await supabase.functions.invoke('create-escrow-payment', {
        body: {
          milestoneId,
          paymentMethodId: defaultMethod.stripe_payment_method_id,
        },
      });

      if (error) throw error;

      toast.success('Escrow funded successfully');
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error funding escrow:', error);
      toast.error(error.message || 'Failed to fund escrow');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Fund Escrow
          </DialogTitle>
          <DialogDescription>
            Secure payment into escrow for this milestone
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h4 className="font-medium mb-2">How Escrow Works</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Your payment is held securely in escrow</li>
              <li>• Professional completes the milestone</li>
              <li>• You review and approve the work</li>
              <li>• Payment is released to the professional</li>
            </ul>
          </div>

          {paymentMethods.length === 0 ? (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                You need to add a payment method before funding escrow
              </p>
            </div>
          ) : (
            <div className="p-4 border rounded-lg">
              <p className="text-sm font-medium mb-2">Payment Method</p>
              {(() => {
                const defaultMethod = paymentMethods.find(m => m.is_default) || paymentMethods[0];
                return (
                  <p className="text-sm text-muted-foreground">
                    {defaultMethod.brand} •••• {defaultMethod.last4}
                  </p>
                );
              })()}
            </div>
          )}

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={processing}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleFundEscrow}
              disabled={processing || paymentMethods.length === 0}
              className="flex-1 bg-gradient-hero"
            >
              {processing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                'Fund Escrow'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
