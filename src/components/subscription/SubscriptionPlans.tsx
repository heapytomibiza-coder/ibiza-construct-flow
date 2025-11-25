import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import { SUBSCRIPTION_TIERS } from '@/lib/subscriptionTiers';
import { useProfessionalSubscription } from '@/hooks/useProfessionalSubscription';

export function SubscriptionPlans() {
  const { subscriptionStatus, createSubscriptionPayment, isCreatingPayment } = useProfessionalSubscription();
  const currentTier = subscriptionStatus?.tier || 'free';

  const handleSubscribe = (tier: string, priceId: string) => {
    if (!priceId) return;
    createSubscriptionPayment({ priceId, tier });
  };

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {Object.entries(SUBSCRIPTION_TIERS)
        .filter(([key]) => key !== 'free')
        .map(([key, tier]) => {
          const isCurrentPlan = currentTier === key;
          
          return (
            <Card 
              key={key} 
              className={`relative ${isCurrentPlan ? 'border-primary shadow-lg' : ''}`}
            >
              {isCurrentPlan && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                  Current Plan
                </Badge>
              )}
              
              <CardHeader>
                <CardTitle className="text-2xl">{tier.name}</CardTitle>
                <CardDescription>
                  <span className="text-3xl font-bold">€{tier.price}</span>
                  <span className="text-muted-foreground">/month</span>
                </CardDescription>
                <div className="text-sm text-muted-foreground">
                  {tier.commissionRate * 100}% commission per job
                </div>
              </CardHeader>
              
              <CardContent>
                <ul className="space-y-2">
                  {tier.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              
              <CardFooter>
                <Button 
                  className="w-full" 
                  variant={isCurrentPlan ? 'outline' : 'default'}
                  disabled={isCurrentPlan || isCreatingPayment}
                  onClick={() => handleSubscribe(key, tier.priceId!)}
                >
                  {isCurrentPlan ? 'Active' : 'Subscribe'}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
    </div>
  );
}
