import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { JobsMarketplace } from '@/components/marketplace/JobsMarketplace';
import { ProfessionalFinderFlow } from '@/components/marketplace/ProfessionalFinderFlow';
import { QuickQuestionnaire } from '@/components/marketplace/QuickQuestionnaire';
import { PathRecommendation } from '@/components/marketplace/PathRecommendation';
import { useAuth } from '@/hooks/useAuth';
import { useMarketplaceContext } from '@/hooks/useMarketplaceContext';
import { useRole } from '@/lib/roleHelpers';
import { Briefcase, Users, Sparkles } from 'lucide-react';

export default function MarketplacePage() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { context, updateContext, parseContextFromUrl } = useMarketplaceContext();
  
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [showRecommendation, setShowRecommendation] = useState(false);
  const [recommendationResult, setRecommendationResult] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<string>('');
  
  const { isTasker: isProfessional, isAsker: isClient } = useRole();

  // Initialize from URL params or show questionnaire for first-time clients
  useEffect(() => {
    const urlContext = parseContextFromUrl(window.location.href);
    if (Object.keys(urlContext).length > 0) {
      updateContext(urlContext);
    }
    
    // Show questionnaire for clients who haven't seen it and don't have URL context
    const hasSeenQuestionnaire = localStorage.getItem('marketplace-questionnaire-seen');
    const isFirstTimeClient = isClient && !isProfessional && !hasSeenQuestionnaire && Object.keys(urlContext).length === 0;
    
    if (isFirstTimeClient) {
      setShowQuestionnaire(true);
    } else {
      // Set default tab based on role
      setActiveTab(isProfessional ? "jobs" : "professionals");
    }
  }, [isClient, isProfessional, parseContextFromUrl, updateContext]);

  const handleQuestionnaireComplete = (result: any) => {
    setRecommendationResult(result);
    setShowQuestionnaire(false);
    setShowRecommendation(true);
    
    // Update context with questionnaire results
    updateContext(result.context);
    localStorage.setItem('marketplace-questionnaire-seen', 'true');
  };

  const handleSkipQuestionnaire = () => {
    setShowQuestionnaire(false);
    setActiveTab(isProfessional ? "jobs" : "professionals");
    localStorage.setItem('marketplace-questionnaire-seen', 'true');
  };

  const handleSelectPath = (path: 'browse' | 'post') => {
    updateContext({ currentPath: path });
    
    if (path === 'browse') {
      // Redirect to discovery with context
      const discoveryUrl = `/discovery?${new URLSearchParams({
        ...(context.searchTerm && { q: context.searchTerm }),
        ...(context.category && { category: context.category }),
        ...(context.location?.address && { location: context.location.address }),
        ...(context.urgency && { urgency: context.urgency })
      }).toString()}`;
      navigate(discoveryUrl);
    } else {
      // Redirect to post job with context
      const postUrl = `/post?${new URLSearchParams({
        ...(context.searchTerm && { service: context.searchTerm }),
        ...(context.category && { category: context.category }),
        ...(context.location?.address && { location: context.location.address }),
        ...(context.budget && { budget: context.budget })
      }).toString()}`;
      navigate(postUrl);
    }
    
    setShowRecommendation(false);
  };

  const handleShowBothPaths = () => {
    setShowRecommendation(false);
    setActiveTab(isProfessional ? "jobs" : "professionals");
  };

  // If showing questionnaire
  if (showQuestionnaire) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-display font-bold text-foreground mb-2">
              Welcome to the Marketplace
            </h1>
            <p className="text-muted-foreground">
              Let's find the best way to help you get your project done
            </p>
          </div>

          <QuickQuestionnaire
            onComplete={handleQuestionnaireComplete}
            onSkip={handleSkipQuestionnaire}
          />
        </div>
      </div>
    );
  }

  // If showing recommendation
  if (showRecommendation && recommendationResult) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-display font-bold text-foreground mb-2">
              Your Perfect Path
            </h1>
            <p className="text-muted-foreground">
              Based on your answers, here's the best way forward
            </p>
          </div>

          <PathRecommendation
            recommendedPath={recommendationResult.recommendedPath}
            confidence={recommendationResult.confidence}
            reasons={recommendationResult.reasons}
            onSelectPath={handleSelectPath}
            onShowBoth={handleShowBothPaths}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-display font-bold text-foreground mb-2">
                Marketplace
              </h1>
              <p className="text-muted-foreground">
                {isProfessional && "Find jobs and grow your business"}
                {isClient && "Find trusted professionals for your projects"}
                {!isProfessional && !isClient && "Connect with jobs and professionals"}
              </p>
            </div>
            
            {/* Smart path suggestion for clients */}
            {isClient && !isProfessional && (
              <Card className="p-3 bg-primary/5 border-primary/20">
                <CardContent className="p-0">
                  <button
                    onClick={() => setShowQuestionnaire(true)}
                    className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
                  >
                    <Sparkles className="w-4 h-4" />
                    Get personalized path recommendations
                  </button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="jobs" className="flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              Browse Jobs
            </TabsTrigger>
            <TabsTrigger value="professionals" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Find Professionals
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="jobs" className="mt-6">
            <JobsMarketplace />
          </TabsContent>
          
          <TabsContent value="professionals" className="mt-6">
            <ProfessionalFinderFlow />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}