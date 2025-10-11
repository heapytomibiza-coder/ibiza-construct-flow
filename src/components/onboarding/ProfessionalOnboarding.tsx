import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { CategoryIconCards } from './CategoryIconCards';
import { AvailabilityChips } from './AvailabilityChips';
import { ServiceTreeSelector } from '@/components/services/ServiceTreeSelector';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

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
  const [professionalId, setProfessionalId] = useState<string | null>(null);
  const [data, setData] = useState<OnboardingData>({
    displayName: initialData?.displayName || '',
    skills: initialData?.skills || [],
    zones: initialData?.zones || [],
    bio: initialData?.bio || '',
    hourlyRate: initialData?.hourlyRate || 30,
    availability: initialData?.availability || [],
  });

  // Get user ID on mount
  useEffect(() => {
    const getUserId = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setProfessionalId(user.id);
      }
    };
    getUserId();
  }, []);

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
      if (data.skills.length === 0) {
        newErrors.skills = 'Select at least one category';
      }
    }

    // Step 2 is service selection - handled by ServiceTreeSelector component

    if (step === 3) {
      if (!data.displayName?.trim()) {
        newErrors.displayName = 'Name is required';
      }
      if (data.zones.length === 0) {
        newErrors.zones = 'Select at least one service area';
      }
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
      title: 'Service Categories',
      description: 'Choose your main service areas',
      component: (
        <div>
          <CategoryIconCards
            selectedCategories={data.skills}
            onSelectionChange={(skills) => setData({ ...data, skills })}
          />
          {errors.skills && (
            <p className="text-sm text-destructive flex items-center justify-center gap-1 mt-4">
              <AlertCircle className="w-3 h-3" />
              {errors.skills}
            </p>
          )}
        </div>
      ),
    },
    {
      title: 'Build Your Service Menu',
      description: 'Select exactly what services you offer',
      component: professionalId ? (
        <ServiceTreeSelector
          professionalId={professionalId}
          preselectedCategories={data.skills}
          onComplete={() => {
            setCurrentStep(currentStep + 1);
          }}
        />
      ) : (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ),
    },
    {
      title: 'Your Details & Profile',
      description: 'Complete your professional profile',
      component: (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
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

            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="bio">
                  Professional Bio <span className="text-destructive">*</span>
                </Label>
                <p className="text-sm text-muted-foreground">
                  Describe your experience
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
          </div>
        </div>
      ),
    },
    {
      title: 'Review & Launch',
      description: 'Final check before going live',
      component: (
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <CheckCircle className="w-16 h-16 text-primary mx-auto" />
            <h3 className="text-2xl font-bold">🎉 You're Ready to Launch!</h3>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Your profile is looking great! Review your details below.
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="p-6 border rounded-lg space-y-4 bg-muted/30">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Display Name</div>
                <div className="font-semibold">{data.displayName}</div>
              </div>

              <div>
                <div className="text-sm text-muted-foreground mb-1">Service Categories</div>
                <div className="flex flex-wrap gap-2">
                  {data.skills.map(skill => (
                    <Badge key={skill} variant="default">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-sm text-muted-foreground mb-1">Service Zones</div>
                <div className="flex flex-wrap gap-2">
                  {data.zones.map(zone => (
                    <Badge key={zone} variant="secondary">
                      {zone}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-sm text-muted-foreground mb-1">Bio</div>
                <div className="text-sm">{data.bio}</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Hourly Rate</div>
                  <div className="font-semibold">€{data.hourlyRate}/hour</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Availability</div>
                  <div className="text-sm">{data.availability.join(', ')}</div>
                </div>
              </div>
            </div>

            <div className="text-center text-sm text-muted-foreground mt-4">
              💡 You can update these details anytime from your profile settings
            </div>
          </div>
        </div>
      ),
    },
  ];

  const handleNext = async () => {
    // Skip validation for Step 2 (service selection) as it has its own completion flow
    if (currentStep !== 2 && !validateStep(currentStep)) {
      return;
    }

    if (currentStep < steps.length) {
      // Step 2 handles its own navigation via onComplete
      if (currentStep !== 2) {
        setCurrentStep(currentStep + 1);
      }
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
      <div className={cn(
        "w-full transition-all duration-300",
        currentStep === 2 ? "max-w-5xl" : "max-w-2xl"
      )}>
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