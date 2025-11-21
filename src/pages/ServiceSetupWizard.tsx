import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, CheckCircle, Tag } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ServiceTreeSelector } from '@/components/services/ServiceTreeSelector';
import { ServiceCascadeConfigurator } from '@/components/onboarding/ServiceCascadeConfigurator';
import { useAuth } from '@/hooks/useAuth';
import { Badge } from '@/components/ui/badge';
import { OnboardingProgressBar } from '@/components/onboarding/OnboardingProgressBar';
import { PricingSetupForm } from '@/components/onboarding/PricingSetupForm';
import { ProfessionalDetailsForm } from '@/components/onboarding/ProfessionalDetailsForm';

const STEPS = [
  { id: 1, title: 'Services', description: 'Choose what you offer' },
  { id: 2, title: 'Pricing', description: 'Set your rates' },
  { id: 3, title: 'Details', description: 'Professional profile' },
  { id: 4, title: 'Payout', description: 'Get paid' },
];

export default function ServiceSetupWizard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [introCategories, setIntroCategories] = useState<string[]>([]);

  // Fetch intro categories on mount
  useEffect(() => {
    const fetchIntroCategories = async () => {
      if (!user?.id) return;
      
      const { data, error } = await supabase
        .from('professional_profiles')
        .select('intro_categories')
        .eq('user_id', user.id)
        .single();
      
      if (data && data.intro_categories) {
        // Ensure it's an array of strings
        const categories = Array.isArray(data.intro_categories) 
          ? data.intro_categories.filter(c => typeof c === 'string') as string[]
          : [];
        setIntroCategories(categories);
      }
    };
    
    fetchIntroCategories();
  }, [user?.id]);

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    if (!user) return;

    setIsLoading(true);
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

      toast.success('🎉 You\'re live! Start receiving jobs now');
      navigate('/dashboard/pro');
    } catch (error: any) {
      console.error('Error completing setup:', error);
      toast.error('Failed to complete setup');
    } finally {
      setIsLoading(false);
    }
  };

  const progress = (currentStep / 4) * 100;

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-5xl mx-auto px-4 space-y-8">
        {/* Progress Bar */}
        <OnboardingProgressBar currentPhase="service_setup" />
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Service Setup</h1>
          <p className="text-muted-foreground">
            Step {currentStep} of 4 — {STEPS[currentStep - 1].description}
          </p>
          <Progress value={progress} className="mt-4 h-2" />
        </div>

        {/* Steps Navigation */}
        <div className="flex justify-between mb-8">
          {STEPS.map((step, index) => (
            <div
              key={step.id}
              className={`flex-1 text-center ${
                index < STEPS.length - 1 ? 'border-r border-border' : ''
              }`}
            >
              <div
                className={`inline-flex items-center justify-center w-10 h-10 rounded-full mb-2 ${
                  step.id < currentStep
                    ? 'bg-primary text-primary-foreground'
                    : step.id === currentStep
                    ? 'bg-primary/20 text-primary border-2 border-primary'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {step.id < currentStep ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  step.id
                )}
              </div>
              <p
                className={`text-sm font-medium ${
                  step.id === currentStep
                    ? 'text-foreground'
                    : 'text-muted-foreground'
                }`}
              >
                {step.title}
              </p>
            </div>
          ))}
        </div>

        {/* Step Content */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{STEPS[currentStep - 1].title}</CardTitle>
            <CardDescription>{STEPS[currentStep - 1].description}</CardDescription>
          </CardHeader>
          <CardContent>
            {currentStep === 1 && user && (
              <div className="space-y-6">
                {/* Show intro categories context */}
                {introCategories.length > 0 && (
                  <div className="bg-muted/50 rounded-lg p-4 border border-muted">
                    <div className="flex items-start gap-3">
                      <Tag className="w-5 h-5 text-primary mt-0.5" />
                      <div className="flex-1 space-y-2">
                        <p className="text-sm font-medium">
                          Building on your selected skill areas:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {introCategories.map((category) => (
                            <Badge key={category} variant="secondary">
                              {category}
                            </Badge>
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          Now choose the specific services you offer within these categories (e.g., "Leak Repair", "Outlet Installation")
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                <ServiceCascadeConfigurator
                  professionalId={user.id}
                  preselectedCategories={introCategories}
                  onComplete={handleNext}
                />
              </div>
            )}

            {currentStep === 2 && user && (
              <PricingSetupForm
                professionalId={user.id}
                onComplete={handleNext}
              />
            )}

            {currentStep === 3 && user && (
              <ProfessionalDetailsForm
                professionalId={user.id}
                onComplete={handleNext}
              />
            )}

            {currentStep === 4 && (
              <div className="space-y-6 py-8">
                <div className="text-center space-y-3">
                  <CheckCircle className="w-16 h-16 text-primary mx-auto" />
                  <h3 className="text-2xl font-bold">You're Almost Live!</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Last step: connect your bank account to receive payments from clients. Takes 2 minutes.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    variant="outline"
                    onClick={handleComplete}
                    disabled={isLoading}
                    size="lg"
                  >
                    Skip for Now
                  </Button>
                  <Button
                    onClick={() => navigate('/professional/payout-setup')}
                    disabled={isLoading}
                    size="lg"
                  >
                    Connect Bank Account
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>

                <p className="text-xs text-center text-muted-foreground">
                  You can always set this up later from Settings → Payouts
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        {currentStep !== 1 && currentStep !== 4 && (
          <div className="flex justify-between">
            <Button
              onClick={handleBack}
              variant="outline"
              disabled={currentStep === 1}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button onClick={handleNext} disabled={currentStep === 4}>
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
