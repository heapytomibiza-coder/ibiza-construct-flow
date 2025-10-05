import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { SkillsChips } from './SkillsChips';
import { AvailabilityChips } from './AvailabilityChips';
import { supabase } from '@/integrations/supabase/client';

interface ProfessionalOnboardingProps {
  onComplete: (data: OnboardingData) => void;
  initialData?: Partial<OnboardingData>;
}

export interface OnboardingData {
  displayName: string;
  skills: string[];
  zones: string[];
  bio: string;
  hourlyRate: number;
  availability: string[];
}

const IBIZA_ZONES = [
  'Ibiza Town', 'San Antonio', 'Santa Eulalia', 'Playa d\'en Bossa',
  'San José', 'San Juan', 'San Carlos', 'Es Canar'
];

export const ProfessionalOnboarding = ({ onComplete, initialData }: ProfessionalOnboardingProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [data, setData] = useState<OnboardingData>({
    displayName: initialData?.displayName || '',
    skills: initialData?.skills || [],
    zones: initialData?.zones || [],
    bio: initialData?.bio || '',
    hourlyRate: initialData?.hourlyRate || 30,
    availability: initialData?.availability || [],
  });

  // Auto-save to form_sessions
  useEffect(() => {
    const saveSession = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Check if session exists
        const { data: existing } = await supabase
          .from('form_sessions')
          .select('id')
          .eq('user_id', user.id)
          .eq('form_type', 'professional_onboarding')
          .single();

        if (existing) {
          // Update existing
          await supabase
            .from('form_sessions')
            .update({
              payload: data as any,
              updated_at: new Date().toISOString()
            })
            .eq('id', existing.id);
        } else {
          // Insert new
          await supabase
            .from('form_sessions')
            .insert({
              user_id: user.id,
              form_type: 'professional_onboarding',
              payload: data as any,
            });
        }
      } catch (error) {
        console.error('Failed to save session:', error);
      }
    };

    const timeoutId = setTimeout(saveSession, 1000);
    return () => clearTimeout(timeoutId);
  }, [data]);

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!data.displayName?.trim()) {
        newErrors.displayName = 'Name is required';
      }
      if (data.skills.length === 0) {
        newErrors.skills = 'Select at least one skill';
      }
      if (data.zones.length === 0) {
        newErrors.zones = 'Select at least one service area';
      }
    }

    if (step === 2) {
      if (!data.bio?.trim()) {
        newErrors.bio = 'Please tell us about yourself';
      }
      if (data.hourlyRate < 10 || data.hourlyRate > 500) {
        newErrors.hourlyRate = 'Rate must be between €10-€500';
      }
      if (data.availability.length === 0) {
        newErrors.availability = 'Select your availability';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const steps = [
    {
      title: 'Basic Information',
      description: 'Your name, skills and service areas',
      component: (
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="displayName">
              Your Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="displayName"
              value={data.displayName}
              onChange={(e) => setData({ ...data, displayName: e.target.value })}
              placeholder="e.g., John Smith"
              className={errors.displayName ? 'border-destructive' : ''}
            />
            {errors.displayName && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.displayName}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <SkillsChips
              selectedOptions={data.skills}
              onSelectionChange={(skills) => setData({ ...data, skills })}
            />
            {errors.skills && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.skills}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>
              Service Areas <span className="text-destructive">*</span>
            </Label>
            <p className="text-sm text-muted-foreground mb-3">
              Select zones where you work
            </p>
            <div className="flex flex-wrap gap-2">
              {IBIZA_ZONES.map((zone) => (
                <Badge
                  key={zone}
                  variant={data.zones.includes(zone) ? 'default' : 'outline'}
                  className="cursor-pointer hover:opacity-80"
                  onClick={() => {
                    setData({
                      ...data,
                      zones: data.zones.includes(zone)
                        ? data.zones.filter((z) => z !== zone)
                        : [...data.zones, zone]
                    });
                  }}
                >
                  {zone}
                </Badge>
              ))}
            </div>
            {errors.zones && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.zones}
              </p>
            )}
          </div>
        </div>
      ),
    },
    {
      title: 'Profile Details',
      description: 'Tell us about your experience and availability',
      component: (
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="bio">
              Professional Bio <span className="text-destructive">*</span>
            </Label>
            <p className="text-sm text-muted-foreground">
              Describe your experience and what makes you great
            </p>
            <Textarea
              id="bio"
              value={data.bio}
              onChange={(e) => setData({ ...data, bio: e.target.value })}
              placeholder="I'm a certified plumber with 10+ years of experience..."
              rows={4}
              className={errors.bio ? 'border-destructive' : ''}
            />
            {errors.bio && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.bio}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="hourly-rate">
              Hourly Rate (€) <span className="text-destructive">*</span>
            </Label>
            <p className="text-sm text-muted-foreground">
              Recommended: €25-€60/hour
            </p>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">€</span>
              <Input
                id="hourly-rate"
                type="number"
                min="10"
                max="500"
                step="5"
                value={data.hourlyRate}
                onChange={(e) => setData({ ...data, hourlyRate: Number(e.target.value) })}
                className={`pl-8 ${errors.hourlyRate ? 'border-destructive' : ''}`}
              />
            </div>
            {errors.hourlyRate && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.hourlyRate}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <AvailabilityChips
              selectedOptions={data.availability}
              onSelectionChange={(availability) => setData({ ...data, availability })}
            />
            {errors.availability && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.availability}
              </p>
            )}
          </div>
        </div>
      ),
    },
    {
      title: 'Review & Launch',
      description: 'Everything looks good! Let\'s get started',
      component: (
        <div className="space-y-6 text-center">
          <CheckCircle className="w-16 h-16 text-primary mx-auto" />
          <div>
            <h3 className="text-xl font-semibold mb-2">Ready to Go!</h3>
            <p className="text-muted-foreground">
              Your profile is complete. You can start receiving job notifications immediately.
            </p>
          </div>
          <div className="bg-muted/50 p-6 rounded-lg space-y-3 text-left">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Name:</span>
              <span className="font-medium">{data.displayName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Skills:</span>
              <span className="font-medium">{data.skills.join(', ')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Service Areas:</span>
              <span className="font-medium">{data.zones.join(', ')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Hourly Rate:</span>
              <span className="font-medium">€{data.hourlyRate}/hour</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Availability:</span>
              <span className="font-medium">{data.availability.join(', ')}</span>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const handleNext = async () => {
    if (!validateStep(currentStep)) {
      return;
    }

    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      // Clear session on completion
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('form_sessions')
            .delete()
            .eq('user_id', user.id)
            .eq('form_type', 'professional_onboarding');
        }
      } catch (error) {
        console.error('Failed to clear session:', error);
      }
      onComplete(data);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setErrors({});
    }
  };

  const currentStepData = steps[currentStep - 1];
  const progress = (currentStep / steps.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card className="shadow-xl">
          <CardHeader className="text-center pb-2">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-muted-foreground">
                Step {currentStep} of {steps.length}
              </div>
              <div className="text-sm font-medium">
                {Math.round(progress)}% Complete
              </div>
            </div>
            <Progress value={progress} className="mb-4" />
            <CardTitle className="text-2xl">{currentStepData.title}</CardTitle>
            <CardDescription className="text-lg">
              {currentStepData.description}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="min-h-[300px]">
              {currentStepData.component}
            </div>
            
            <div className="flex justify-between pt-6 border-t">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className="flex items-center"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              
              <Button
                onClick={handleNext}
                className="flex items-center"
              >
                {currentStep === steps.length ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Launch Profile
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};