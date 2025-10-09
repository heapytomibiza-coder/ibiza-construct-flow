import React from 'react';
import { JobsMarketplace } from '@/components/marketplace/JobsMarketplace';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { Briefcase, Bell, BellOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function JobBoardPage() {
  const { profile, isProfessional } = useAuth();
  const navigate = useNavigate();
  
  // Get subscription tier from profile - adjust based on your actual profile structure
  const subscriptionTier = (profile as any)?.subscription_tier || 'basic';
  
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-foreground mb-2 flex items-center">
            <Briefcase className="inline w-8 h-8 mr-3 text-copper" />
            Job Board
          </h1>
          <p className="text-muted-foreground">
            Browse all open job opportunities in Ibiza
          </p>
        </div>

        {/* Subscription Tier Info (only for professionals) */}
        {isProfessional() && (
          <>
            {subscriptionTier === 'basic' && (
              <Card className="p-4 mb-6 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <BellOff className="w-5 h-5 text-amber-600 dark:text-amber-500 mt-0.5 shrink-0" />
                    <div>
                      <h3 className="font-semibold text-amber-900 dark:text-amber-100">Basic Tier</h3>
                      <p className="text-sm text-amber-700 dark:text-amber-300">
                        You can see all jobs, but you won't receive notifications when new jobs are posted. Check back regularly to find new opportunities!
                      </p>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => navigate('/settings/subscription')}
                    className="bg-copper hover:bg-copper/90 text-white shrink-0"
                  >
                    Upgrade to Pro
                  </Button>
                </div>
              </Card>
            )}

            {(subscriptionTier === 'pro' || subscriptionTier === 'premium') && (
              <Card className="p-4 mb-6 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
                <div className="flex items-start gap-3">
                  <Bell className="w-5 h-5 text-green-600 dark:text-green-500 mt-0.5 shrink-0" />
                  <div>
                    <h3 className="font-semibold text-green-900 dark:text-green-100">
                      {subscriptionTier === 'premium' ? 'Premium' : 'Pro'} Access
                    </h3>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      You receive instant notifications when new jobs matching your services are posted. Check your notifications for the latest opportunities!
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </>
        )}

        {/* Job Listings - All jobs visible to everyone */}
        <JobsMarketplace />
      </div>
    </div>
  );
}
