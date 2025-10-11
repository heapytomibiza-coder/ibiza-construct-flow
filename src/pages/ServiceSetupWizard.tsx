import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ServiceTreeSelector } from '@/components/services/ServiceTreeSelector';
import { useAuth } from '@/hooks/useAuth';

const STEPS = [
  { id: 1, title: 'Services', description: 'Choose what you offer' },
  { id: 2, title: 'Pricing', description: 'Set your rates' },
  { id: 3, title: 'Questions', description: 'Booking requirements' },
  { id: 4, title: 'Payout', description: 'Get paid' },
];

export default function ServiceSetupWizard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

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
      <div className="max-w-5xl mx-auto px-4">
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
              <ServiceTreeSelector
                professionalId={user.id}
                onComplete={handleNext}
              />
            )}

            {currentStep === 2 && (
              <div className="space-y-4 py-8 text-center">
                <p className="text-muted-foreground">
                  Pricing configuration coming soon. For now, proceed to next step.
                </p>
                <Button onClick={handleNext} size="lg">
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4 py-8 text-center">
                <p className="text-muted-foreground">
                  Booking questions library coming soon. For now, proceed to payout setup.
                </p>
                <Button onClick={handleNext} size="lg">
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-6 py-8">
                <div className="text-center space-y-3">
                  <CheckCircle className="w-16 h-16 text-primary mx-auto" />
                  <h3 className="text-2xl font-bold">Almost There!</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Set up Stripe Connect to receive payments. You can do this later from your settings.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    variant="outline"
                    onClick={handleComplete}
                    disabled={isLoading}
                    size="lg"
                  >
                    Set Up Later
                  </Button>
                  <Button
                    onClick={() => {
                      navigate('/professional/payout-setup');
                    }}
                    size="lg"
                  >
                    Set Up Payout Now
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
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
