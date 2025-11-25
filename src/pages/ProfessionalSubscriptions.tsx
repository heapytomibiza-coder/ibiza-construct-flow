import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useProfessionalSubscription } from '@/hooks/useProfessionalSubscription';
import { SubscriptionPlans } from '@/components/subscription/SubscriptionPlans';
import { format } from 'date-fns';

export default function ProfessionalSubscriptions() {
  const navigate = useNavigate();
  const { subscriptionStatus, isLoading, refetch } = useProfessionalSubscription();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <h1 className="text-3xl font-bold mb-2">Professional Subscriptions</h1>
          <p className="text-muted-foreground">
            Choose the plan that best fits your needs and start accepting jobs with reduced commission rates.
          </p>
        </div>

        {/* Current Subscription Status */}
        {!isLoading && subscriptionStatus?.hasActiveSubscription && (
          <Card className="mb-8 border-primary">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Active Subscription
                  </CardTitle>
                  <CardDescription>
                    Your current professional plan
                  </CardDescription>
                </div>
                <Badge variant="default">
                  {subscriptionStatus.subscription?.tier.toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <p className="text-sm text-muted-foreground">Commission Rate</p>
                  <p className="text-2xl font-bold">
                    {(subscriptionStatus.commissionRate * 100).toFixed(0)}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Expires On</p>
                  <p className="text-lg font-semibold flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {subscriptionStatus.subscription?.expires_at 
                      ? format(new Date(subscriptionStatus.subscription.expires_at), 'MMM dd, yyyy')
                      : 'N/A'
                    }
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant="outline" className="mt-1">
                    {subscriptionStatus.subscription?.status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Subscription Plans */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            {subscriptionStatus?.hasActiveSubscription ? 'Upgrade Your Plan' : 'Choose Your Plan'}
          </h2>
          <SubscriptionPlans />
        </div>

        {/* Additional Info */}
        <Card>
          <CardHeader>
            <CardTitle>How it works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">💳 Monthly Billing</h4>
              <p className="text-sm text-muted-foreground">
                Pay a fixed monthly fee for your subscription tier. Payment is processed securely through Stripe.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">💰 Reduced Commissions</h4>
              <p className="text-sm text-muted-foreground">
                Your commission rate applies to all completed jobs. Higher tiers get significantly lower commission rates.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">🔒 Transaction Fees</h4>
              <p className="text-sm text-muted-foreground">
                A 2.5% payment processing fee covers SafePay escrow, payment processing, and dispute resolution.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">⚡ Instant Activation</h4>
              <p className="text-sm text-muted-foreground">
                Your subscription activates immediately after payment and lasts for 30 days from activation.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
