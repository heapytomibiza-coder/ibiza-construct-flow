import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Shield, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface StripePaymentSetupProps {
  type: 'registration' | 'escrow';
  amount?: number;
  description?: string;
  onSuccess?: () => void;
}

export function StripePaymentSetup({ 
  type, 
  amount = 35000, // Default to €350 for registration
  description,
  onSuccess 
}: StripePaymentSetupProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handlePayment = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: { type, amount }
      });

      if (error) throw error;

      if (data?.url) {
        // Open Stripe Checkout in new tab
        window.open(data.url, '_blank');
        onSuccess?.();
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Error",
        description: "Unable to process payment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const displayAmount = (amount / 100).toFixed(2);
  const currency = 'EUR';

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          {type === 'registration' ? (
            <Shield className="h-12 w-12 text-primary" />
          ) : (
            <CreditCard className="h-12 w-12 text-primary" />
          )}
        </div>
        <CardTitle className="text-xl">
          {type === 'registration' ? 'Professional Registration' : 'Secure Payment'}
        </CardTitle>
        <CardDescription>
          {description || (
            type === 'registration' 
              ? 'Complete your professional verification with a one-time registration fee'
              : 'Secure escrow payment for your booking'
          )}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-3xl font-bold text-primary">
            €{displayAmount}
          </div>
          <Badge variant="secondary" className="mt-2">
            One-time payment
          </Badge>
        </div>

        {type === 'registration' && (
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Platform verification and background check</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Access to premium job opportunities</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Professional badge and credibility</span>
            </div>
          </div>
        )}

        <Button 
          onClick={handlePayment} 
          disabled={loading}
          className="w-full"
          size="lg"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
              Processing...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Pay with Stripe
            </div>
          )}
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          Secure payment powered by Stripe. Your payment information is encrypted and secure.
        </p>
      </CardContent>
    </Card>
  );
}