import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { 
  CreditCard, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  ArrowLeft,
  ExternalLink 
} from 'lucide-react';

export default function ProfessionalPayoutSetup() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [payoutAccount, setPayoutAccount] = useState<any>(null);

  useEffect(() => {
    if (user) {
      loadPayoutAccount();
    }
  }, [user]);

  const loadPayoutAccount = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('payout_accounts' as any)
        .select('*')
        .eq('professional_id', user.id)
        .eq('provider', 'stripe')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading payout account:', error);
      } else if (data) {
        setPayoutAccount(data);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStripeAccount = async () => {
    if (!user) return;

    setCreating(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-stripe-connect-link', {
        method: 'POST',
      });

      if (error) throw error;

      if (data?.url) {
        // Open Stripe onboarding in new tab
        window.open(data.url, '_blank');
        toast.success('Opening Stripe setup...', {
          description: 'Complete the setup in the new tab',
        });
        
        // Reload account after a short delay
        setTimeout(() => {
          loadPayoutAccount();
        }, 2000);
      }
    } catch (error: any) {
      console.error('Error creating Stripe account:', error);
      toast.error('Failed to create payout account', {
        description: error.message || 'Please try again',
      });
    } finally {
      setCreating(false);
    }
  };

  const handleContinue = async () => {
    if (!user) return;

    try {
      // Mark service setup as complete
      const { error } = await supabase
        .from('professional_profiles')
        .update({
          onboarding_phase: 'service_configured',
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('🎉 Setup complete! You\'re live');
      navigate('/dashboard/pro');
    } catch (error: any) {
      console.error('Error completing setup:', error);
      toast.error('Failed to complete setup');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const isConnected = payoutAccount?.charges_enabled && payoutAccount?.payouts_enabled;
  const isPending = payoutAccount && !isConnected;

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard/pro')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold mb-2">Payout Setup</h1>
          <p className="text-muted-foreground">
            Connect your bank account to receive payments
          </p>
        </div>

        {/* Connection Status */}
        {isConnected && (
          <Alert className="mb-6 border-green-200 bg-green-50/50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>Connected!</strong> Your payout account is active and ready to receive payments.
            </AlertDescription>
          </Alert>
        )}

        {isPending && (
          <Alert className="mb-6 border-yellow-200 bg-yellow-50/50">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              <strong>Setup incomplete</strong> — Please complete your Stripe account setup to receive payments.
            </AlertDescription>
          </Alert>
        )}

        {/* Setup Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle>Stripe Connect</CardTitle>
                <CardDescription>
                  Secure payments powered by Stripe
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Benefits */}
            <div className="space-y-3">
              <h3 className="font-medium">What you'll get:</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Direct deposits to your bank account</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Fast, secure payment processing</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Track earnings and payment history</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Automatic tax reporting</span>
                </li>
              </ul>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 pt-4 border-t">
              {!payoutAccount && (
                <Button
                  onClick={handleCreateStripeAccount}
                  disabled={creating}
                  size="lg"
                  className="w-full"
                >
                  {creating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Setting up...
                    </>
                  ) : (
                    <>
                      Connect Stripe Account
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              )}

              {isPending && (
                <Button
                  onClick={handleCreateStripeAccount}
                  disabled={creating}
                  size="lg"
                  className="w-full"
                >
                  {creating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      Complete Setup
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              )}

              <Button
                onClick={handleContinue}
                variant={isConnected ? 'default' : 'outline'}
                size="lg"
                className="w-full"
              >
                {isConnected ? 'Continue to Dashboard' : 'Set Up Later'}
              </Button>
            </div>

            {/* Info */}
            <p className="text-xs text-muted-foreground text-center pt-2">
              By connecting, you agree to Stripe's terms of service.
              You can always update your payout settings later.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
