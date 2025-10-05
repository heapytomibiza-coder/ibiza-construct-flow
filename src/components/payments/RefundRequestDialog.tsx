import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useUserPayments } from '@/hooks/useUserPayments';
import { RefreshCw } from 'lucide-react';

interface RefundRequestDialogProps {
  paymentId: string;
  maxAmount: number;
  trigger?: React.ReactNode;
}

export function RefundRequestDialog({ 
  paymentId, 
  maxAmount, 
  trigger 
}: RefundRequestDialogProps) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(maxAmount.toString());
  const [reason, setReason] = useState('');
  const { requestRefund } = useUserPayments();

  const handleSubmit = async () => {
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0 || parsedAmount > maxAmount) {
      return;
    }

    await requestRefund.mutateAsync({
      paymentId,
      amount: parsedAmount,
      reason,
    });

    setOpen(false);
    setAmount(maxAmount.toString());
    setReason('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-1" />
            Request Refund
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request Refund</DialogTitle>
          <DialogDescription>
            Submit a refund request for this payment. Our team will review it shortly.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="amount">Refund Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              max={maxAmount}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Maximum: ${maxAmount.toFixed(2)}
            </p>
          </div>
          <div>
            <Label htmlFor="reason">Reason for Refund</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please explain why you're requesting a refund..."
              rows={4}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!reason.trim() || requestRefund.isPending}
          >
            {requestRefund.isPending ? 'Submitting...' : 'Submit Request'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
