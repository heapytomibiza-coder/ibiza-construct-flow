/**
 * Subscription Plans Component
 * LAUNCH MODE: Shows "Free Access" message until paid subscriptions are enabled
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Gift } from 'lucide-react';
import { SUBSCRIPTION_TIERS } from '@/lib/subscriptionTiers';

// LAUNCH MODE: Set to false when enabling paid subscriptions
const LAUNCH_MODE_FREE_ACCESS = true;

export function SubscriptionPlans() {
  // LAUNCH MODE: Show free access message
  if (LAUNCH_MODE_FREE_ACCESS) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <Gift className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Free Access During Launch</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          All premium features are currently free while we're in launch mode. 
          Enjoy full access to the platform!
        </p>
        <Badge variant="secondary" className="mt-4">
          Premium Features Unlocked
        </Badge>
      </div>
    );
  }

  // Original subscription plans code below (disabled during launch)
  return (
    <div className="grid md:grid-cols-3 gap-6">
      {Object.entries(SUBSCRIPTION_TIERS)
        .filter(([key]) => key !== 'free')
        .map(([key, tier]) => {
          return (
            <Card key={key} className="relative">
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
                      <Check className="h-5 w-5 text-primary mr-2 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          );
        })}
    </div>
  );
}
