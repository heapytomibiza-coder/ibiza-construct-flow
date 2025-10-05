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
import { useJobPayments } from '@/hooks/useJobPayments';
import { DollarSign } from 'lucide-react';

interface JobPaymentButtonProps {
  jobId: string;
  jobTitle: string;
  estimatedAmount?: number;
  disabled?: boolean;
}

export function JobPaymentButton({
  jobId,
  jobTitle,
  estimatedAmount,
  disabled,
}: JobPaymentButtonProps) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(estimatedAmount?.toString() || '');
  const { createJobPayment } = useJobPayments(jobId);

  const handleSubmit = async () => {
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return;
    }

    await createJobPayment.mutateAsync({
      jobId,
      amount: parsedAmount,
      currency: 'USD',
    });

    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" disabled={disabled}>
          <DollarSign className="h-4 w-4 mr-2" />
          Make Payment
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Payment</DialogTitle>
          <DialogDescription>
            Make a payment for: {jobTitle}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="amount">Payment Amount ($)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
            />
            <p className="text-xs text-muted-foreground mt-1">
              A 5% platform fee will be deducted
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!amount || createJobPayment.isPending}
          >
            {createJobPayment.isPending ? 'Processing...' : 'Create Payment'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
