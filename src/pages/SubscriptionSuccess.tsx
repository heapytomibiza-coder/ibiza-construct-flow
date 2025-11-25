import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Sparkles } from 'lucide-react';
import { useProfessionalSubscription } from '@/hooks/useProfessionalSubscription';

const SubscriptionSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const tier = searchParams.get('tier');
  const { verifySubscriptionPayment, subscriptionStatus } = useProfessionalSubscription();

  useEffect(() => {
    if (sessionId && tier) {
      verifySubscriptionPayment({ sessionId, tier });
    }
  }, [sessionId, tier]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="p-8 text-center space-y-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground">
              Professional Subscription Activated! 🎉
            </h1>
            <p className="text-muted-foreground">
              Your professional subscription has been successfully activated. 
              You can now accept jobs with your reduced commission rate.
            </p>
          </div>

          <div className="bg-primary/5 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Sparkles className="w-4 h-4 text-copper" />
              <span>Accept unlimited job offers</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Sparkles className="w-4 h-4 text-copper" />
              <span>Reduced commission: {subscriptionStatus?.commissionRate ? (subscriptionStatus.commissionRate * 100) : '20'}%</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Sparkles className="w-4 h-4 text-copper" />
              <span>Priority in search results</span>
            </div>
            {subscriptionStatus?.tier === 'premium' && (
              <div className="flex items-center gap-2 text-sm">
                <Sparkles className="w-4 h-4 text-copper" />
                <span>Verified professional badge</span>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Button 
              onClick={() => navigate('/marketplace')}
              className="w-full"
            >
              Browse Jobs
            </Button>
            <Button 
              onClick={() => navigate('/dashboard')}
              variant="outline"
              className="w-full"
            >
              Go to Dashboard
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            You can manage your subscription anytime from your dashboard
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionSuccess;
