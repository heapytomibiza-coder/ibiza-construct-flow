import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { usePayouts } from '@/hooks/usePayouts';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Loader2, DollarSign } from 'lucide-react';

interface PayoutRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availableBalance: number;
}

export function PayoutRequestDialog({
  open,
  onOpenChange,
  availableBalance,
}: PayoutRequestDialogProps) {
  const { user } = useAuth();
  const { requestPayout } = usePayouts(user?.id);
  const { toast } = useToast();
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    const parsedAmount = parseFloat(amount);
    
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast({
        variant: "destructive",
        title: "Invalid Amount",
        description: "Please enter a valid amount greater than 0",
      });
      return;
    }

    if (parsedAmount > availableBalance) {
      toast({
        variant: "destructive",
        title: "Insufficient Balance",
        description: `You can only request up to $${availableBalance.toFixed(2)}`,
      });
      return;
    }

    setIsLoading(true);
    try {
      await requestPayout(parsedAmount);
      toast({
        title: "Payout Requested",
        description: `Your payout request for $${parsedAmount.toFixed(2)} has been submitted.`,
      });
      onOpenChange(false);
      setAmount('');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Request Failed",
        description: error instanceof Error ? error.message : "Failed to request payout",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request Payout</DialogTitle>
          <DialogDescription>
            Withdraw your available earnings to your connected account
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">Available Balance</p>
            <p className="text-2xl font-bold">${availableBalance.toFixed(2)}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Payout Amount ($)</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                max={availableBalance}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="pl-9"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Payouts are typically processed within 2-5 business days
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!amount || isLoading}>
            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Request Payout
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
