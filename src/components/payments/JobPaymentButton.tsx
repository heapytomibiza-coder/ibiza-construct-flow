import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CreditCard, Loader2 } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { CurrencySelector } from './CurrencySelector';
import { ConvertedAmount } from './ConvertedAmount';
import { useCurrencyConverter } from '@/hooks/useCurrencyConverter';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

interface JobPaymentButtonProps {
  jobId: string;
  amount: number;
  currency?: string;
  onSuccess?: () => void;
  allowCurrencyChange?: boolean;
}

function PaymentForm({ 
  clientSecret, 
  amount, 
  onSuccess 
}: { 
  clientSecret: string; 
  amount: number; 
  onSuccess?: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
      });

      if (error) {
        toast({
          title: "Payment failed",
          description: error.message,
          variant: "destructive",
        });
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Confirm payment on backend
        const { data: { session } } = await supabase.auth.getSession();
        await supabase.functions.invoke('confirm-payment', {
          body: { paymentIntentId: paymentIntent.id },
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
          },
        });

        toast({
          title: "Payment successful",
          description: `Payment of €${amount} completed successfully`,
        });
        
        onSuccess?.();
      }
    } catch (err: any) {
      toast({
        title: "Payment error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      <Button 
        type="submit" 
        disabled={!stripe || isProcessing} 
        className="w-full"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          `Pay €${amount}`
        )}
      </Button>
    </form>
  );
}

export function JobPaymentButton({ 
  jobId, 
  amount, 
  currency = 'EUR',
  onSuccess,
  allowCurrencyChange = true,
}: JobPaymentButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState(currency);
  const { toast } = useToast();
  const { convertAmount, formatCurrency } = useCurrencyConverter();

  const handlePayment = async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      // Convert amount if different currency selected
      const finalAmount = selectedCurrency === currency 
        ? amount 
        : convertAmount(amount, currency, selectedCurrency);
      
      const { data, error } = await supabase.functions.invoke('create-job-payment', {
        body: { jobId, amount: finalAmount, currency: selectedCurrency },
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      if (error) throw error;

      setClientSecret(data.clientSecret);
      setIsOpen(true);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to initiate payment",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccess = () => {
    setIsOpen(false);
    setClientSecret(null);
    onSuccess?.();
  };

  const displayAmount = selectedCurrency === currency 
    ? amount 
    : convertAmount(amount, currency, selectedCurrency);

  return (
    <div className="space-y-4">
      {allowCurrencyChange && (
        <div className="space-y-2">
          <CurrencySelector
            value={selectedCurrency}
            onChange={setSelectedCurrency}
            label="Payment Currency"
          />
          {selectedCurrency !== currency && (
            <ConvertedAmount
              amount={amount}
              fromCurrency={currency}
              toCurrency={selectedCurrency}
              showOriginal={true}
            />
          )}
        </div>
      )}
      
      <Button 
        onClick={handlePayment} 
        disabled={isLoading}
        size="lg"
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading...
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-4 w-4" />
            Pay {formatCurrency(displayAmount, selectedCurrency)}
          </>
        )}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Complete Payment</DialogTitle>
          </DialogHeader>
          {clientSecret && (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <PaymentForm 
                clientSecret={clientSecret} 
                amount={displayAmount}
                onSuccess={handleSuccess}
              />
            </Elements>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
