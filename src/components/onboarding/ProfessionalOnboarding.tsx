import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface ProfessionalOnboardingProps {
  onComplete: (data: OnboardingData) => void;
  onSkip: () => void;
}

export interface OnboardingData {
  skills: string[];
  serviceAreas: string[];
  experience: string[];
  languages: string[];
  availability: string[];
  services: any[];
  hourlyRate: number;
  portfolioImages: string[];
  documentsUploaded: boolean;
  paymentCompleted: boolean;
  // Additional optional fields for database
  bio?: string;
  portfolioPhotos?: string[];
}

export const ProfessionalOnboarding = ({ onComplete, onSkip }: ProfessionalOnboardingProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<OnboardingData>({
    skills: [],
    serviceAreas: [],
    experience: [],
    languages: ['english'],
    availability: [],
    services: [],
    hourlyRate: 0,
    portfolioImages: [],
    documentsUploaded: false,
    paymentCompleted: false,
  });

  const steps = [
    {
      title: 'Basic Information',
      description: 'Tell us about yourself and your services',
      component: (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bio">Professional Bio</Label>
            <Textarea
              id="bio"
              value={data.bio || ''}
              onChange={(e) => setData({ ...data, bio: e.target.value })}
              placeholder="Describe your professional background and services..."
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="skills">Skills (comma-separated)</Label>
            <Input
              id="skills"
              value={data.skills.join(', ')}
              onChange={(e) => setData({ ...data, skills: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
              placeholder="e.g., Plumbing, Electrical, Carpentry"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="serviceAreas">Service Areas (comma-separated)</Label>
            <Input
              id="serviceAreas"
              value={data.serviceAreas.join(', ')}
              onChange={(e) => setData({ ...data, serviceAreas: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
              placeholder="e.g., New York, Brooklyn, Manhattan"
            />
          </div>
        </div>
      ),
      isValid: () => data.skills.length > 0 && data.serviceAreas.length > 0,
    },
    {
      title: 'Experience & Pricing',
      description: 'Set your rates and experience level',
      component: (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="experience">Years of Experience</Label>
            <Input
              id="experience"
              value={data.experience.join(', ')}
              onChange={(e) => setData({ ...data, experience: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
              placeholder="e.g., 5+ years, Beginner, Expert"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="hourly-rate">Hourly Rate (USD)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="hourly-rate"
                type="number"
                min="0"
                step="5"
                value={data.hourlyRate || ''}
                onChange={(e) => setData({ ...data, hourlyRate: Number(e.target.value) })}
                placeholder="0"
                className="pl-8"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="availability">Availability (comma-separated)</Label>
            <Input
              id="availability"
              value={data.availability.join(', ')}
              onChange={(e) => setData({ ...data, availability: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
              placeholder="e.g., Weekdays, Evenings, Weekends"
            />
          </div>
        </div>
      ),
      isValid: () => data.experience.length > 0 && data.hourlyRate > 0,
    },
    {
      title: 'Complete Setup',
      description: 'Finalize your professional profile',
      component: (
        <div className="space-y-4 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
          <div>
            <h3 className="text-lg font-semibold">Almost Ready!</h3>
            <p className="text-muted-foreground">
              Your professional profile is ready to be created. You can always update these details later from your dashboard.
            </p>
          </div>
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <div><strong>Skills:</strong> {data.skills.join(', ') || 'None'}</div>
            <div><strong>Service Areas:</strong> {data.serviceAreas.join(', ') || 'None'}</div>
            <div><strong>Hourly Rate:</strong> ${data.hourlyRate}</div>
            <div><strong>Languages:</strong> {data.languages.join(', ')}</div>
          </div>
        </div>
      ),
      isValid: () => true,
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      // Mark as completed for now - can integrate payment later
      const completedData = { 
        ...data, 
        documentsUploaded: true, 
        paymentCompleted: true 
      };
      onComplete(completedData);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    const currentStepData = steps[currentStep - 1];
    return currentStepData.isValid();
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
              
              <div className="flex gap-3">
                <Button variant="ghost" onClick={onSkip}>
                  Skip for now
                </Button>
                
                <Button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="flex items-center"
                >
                  {currentStep === steps.length ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Complete Setup
                    </>
                  ) : (
                    <>
                      Next
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};