import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ChevronRight, ChevronLeft, Check } from 'lucide-react';

interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  fields: Array<{
    name: string;
    label: string;
    type: string;
    placeholder?: string;
    required?: boolean;
  }>;
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 1,
    title: 'Welcome!',
    description: 'Let\'s get you set up with your account',
    fields: [
      { name: 'display_name', label: 'Display Name', type: 'text', placeholder: 'How should we call you?', required: true },
      { name: 'bio', label: 'Bio', type: 'textarea', placeholder: 'Tell us a bit about yourself' }
    ]
  },
  {
    id: 2,
    title: 'Preferences',
    description: 'Customize your experience',
    fields: [
      { name: 'notifications_enabled', label: 'Enable Notifications', type: 'checkbox' },
      { name: 'theme', label: 'Preferred Theme', type: 'select', required: true }
    ]
  },
  {
    id: 3,
    title: 'All Set!',
    description: 'You\'re ready to get started',
    fields: []
  }
];

export function OnboardingWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const progress = ((currentStep + 1) / ONBOARDING_STEPS.length) * 100;
  const step = ONBOARDING_STEPS[currentStep];

  const handleNext = async () => {
    if (currentStep === ONBOARDING_STEPS.length - 1) {
      await completeOnboarding();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(0, prev - 1));
  };

  const completeOnboarding = async () => {
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      // Update user profile with onboarding data
      const { error } = await supabase
        .from('profiles')
        .update(formData)
        .eq('id', user.id);

      if (error) throw error;

      toast.success('Welcome aboard! Your account is all set up.');
      navigate('/dashboard');
    } catch (error) {
      console.error('Onboarding error:', error);
      toast.error('Failed to complete onboarding. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <Card className="max-w-2xl w-full">
        <CardHeader>
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Step {currentStep + 1} of {ONBOARDING_STEPS.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
          </div>
          <CardTitle className="text-2xl mt-4">{step.title}</CardTitle>
          <CardDescription>{step.description}</CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {currentStep < ONBOARDING_STEPS.length - 1 ? (
            <div className="space-y-4">
              {step.fields.map(field => (
                <div key={field.name} className="space-y-2">
                  <Label htmlFor={field.name}>
                    {field.label}
                    {field.required && <span className="text-destructive ml-1">*</span>}
                  </Label>
                  {field.type === 'text' && (
                    <Input
                      id={field.name}
                      type="text"
                      placeholder={field.placeholder}
                      value={formData[field.name] || ''}
                      onChange={(e) => handleInputChange(field.name, e.target.value)}
                      required={field.required}
                    />
                  )}
                  {field.type === 'textarea' && (
                    <textarea
                      id={field.name}
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      placeholder={field.placeholder}
                      value={formData[field.name] || ''}
                      onChange={(e) => handleInputChange(field.name, e.target.value)}
                    />
                  )}
                  {field.type === 'checkbox' && (
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={field.name}
                        checked={formData[field.name] || false}
                        onChange={(e) => handleInputChange(field.name, e.target.checked)}
                        className="h-4 w-4 rounded border-input"
                      />
                      <Label htmlFor={field.name} className="font-normal">
                        {field.label}
                      </Label>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 space-y-4">
              <div className="flex justify-center">
                <div className="rounded-full bg-primary/10 p-3">
                  <Check className="w-8 h-8 text-primary" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">You're all set!</h3>
                <p className="text-muted-foreground">
                  Your account has been configured. Click below to start exploring.
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 0 || isSubmitting}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            
            <Button
              onClick={handleNext}
              disabled={isSubmitting}
            >
              {currentStep === ONBOARDING_STEPS.length - 1 ? (
                isSubmitting ? 'Completing...' : 'Get Started'
              ) : (
                <>
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
