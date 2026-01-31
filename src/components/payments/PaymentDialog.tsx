import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { DollarSign, Loader2 } from 'lucide-react';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { getStripePromise, isStripeConfigured } from '@/lib/stripe/stripePromise';

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amount?: number;
  jobId?: string;
  onSuccess?: () => void;
}

const PaymentForm = ({ 
  amount, 
  onSuccess, 
  onCancel 
}: { 
  amount: number; 
  onSuccess: () => void;
  onCancel: () => void;
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    try {
      setProcessing(true);

      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success`,
        },
        redirect: 'if_required',
      });

      if (error) {
        console.error('Payment error:', error);
      } else {
        onSuccess();
      }
    } catch (error) {
      console.error('Payment processing error:', error);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 bg-muted rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Amount to pay:</span>
          <span className="text-lg font-bold">${amount.toFixed(2)}</span>
        </div>
      </div>

      <PaymentElement />

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={processing}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!stripe || processing}
          className="flex-1 bg-gradient-hero"
        >
          {processing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <DollarSign className="w-4 h-4 mr-2" />
              Pay ${amount.toFixed(2)}
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

export const PaymentDialog = ({
  open,
  onOpenChange,
  amount: initialAmount = 0,
  jobId,
  onSuccess,
}: PaymentDialogProps) => {
  const [amount, setAmount] = useState(initialAmount);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleInitiatePayment = async () => {
    try {
      setProcessing(true);
      const { data, error } = await supabase.functions.invoke('create-payment-intent', {
        body: { amount, currency: 'USD', jobId }
      });
      
      if (error) throw error;
      setClientSecret(data.clientSecret);
    } catch (error) {
      console.error('Error initiating payment:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleSuccess = () => {
    onSuccess?.();
    onOpenChange(false);
    setClientSecret(null);
    setAmount(initialAmount);
  };

  const handleCancel = () => {
    onOpenChange(false);
    setClientSecret(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Make a Payment</DialogTitle>
          <DialogDescription>
            Enter the amount and complete your payment securely
          </DialogDescription>
        </DialogHeader>

        {!clientSecret ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (USD)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>

            <Button
              onClick={handleInitiatePayment}
              disabled={!amount || amount <= 0 || processing}
              className="w-full bg-gradient-hero"
            >
              {processing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                'Continue to Payment'
              )}
            </Button>
          </div>
        ) : (
          <Elements
            stripe={getStripePromise()}
            options={{
              clientSecret,
              appearance: { theme: 'stripe' },
            }}
          >
            <PaymentForm 
              amount={amount} 
              onSuccess={handleSuccess}
              onCancel={handleCancel}
            />
          </Elements>
        )}
      </DialogContent>
    </Dialog>
  );
};
