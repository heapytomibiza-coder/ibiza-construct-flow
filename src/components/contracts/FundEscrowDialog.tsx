import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CreditCard, Lock, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface FundEscrowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contractId: string;
  amount: number;
  jobTitle: string;
}

export const FundEscrowDialog = ({ 
  open, 
  onOpenChange, 
  contractId, 
  amount, 
  jobTitle 
}: FundEscrowDialogProps) => {
  const [loading, setLoading] = useState(false);

  const handleFundEscrow = async () => {
    setLoading(true);
    try {
      // Call edge function to create Stripe checkout session
      const { data, error } = await supabase.functions.invoke('create-escrow-payment', {
        body: { contractId, amount }
      });

      if (error) throw error;

      // Redirect to Stripe Checkout
      if (data?.url) {
        window.open(data.url, '_blank');
        toast.success('Redirecting to secure payment...');
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Error funding escrow:', error);
      toast.error('Failed to initiate payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Fund Escrow Account</DialogTitle>
          <DialogDescription>
            Secure the payment for "{jobTitle}" with escrow protection
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-muted-foreground">Total Amount</span>
                <span className="text-2xl font-bold">€{amount.toFixed(2)}</span>
              </div>
              
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-start gap-2">
                  <Lock className="h-4 w-4 mt-0.5" />
                  <p>Funds held securely in escrow until work is completed</p>
                </div>
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 mt-0.5" />
                  <p>Payment released only after milestone approval</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <h4 className="font-medium text-sm">How it works:</h4>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Fund the escrow account securely</li>
              <li>Professional completes the work</li>
              <li>Review and approve milestones</li>
              <li>Payment automatically released</li>
            </ol>
          </div>

          <Button 
            onClick={handleFundEscrow} 
            disabled={loading}
            className="w-full"
            size="lg"
          >
            <CreditCard className="mr-2 h-4 w-4" />
            {loading ? 'Processing...' : `Fund €${amount.toFixed(2)} with Stripe`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
