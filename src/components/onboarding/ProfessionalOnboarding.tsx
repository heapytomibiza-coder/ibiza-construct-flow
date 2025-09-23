import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import { SkillsChips } from './SkillsChips';
import { ServiceAreasChips } from './ServiceAreasChips';
import { ExperienceChips } from './ExperienceChips';
import { LanguageChips } from './LanguageChips';
import { AvailabilityChips } from './AvailabilityChips';

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
}

export const ProfessionalOnboarding = ({ onComplete, onSkip }: ProfessionalOnboardingProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<OnboardingData>({
    skills: [],
    serviceAreas: [],
    experience: [],
    languages: ['english'], // Default to English
    availability: [],
  });

  const totalSteps = 5;
  const progress = (currentStep / totalSteps) * 100;

  const steps = [
    {
      title: "What services do you offer?",
      description: "Help clients find you by selecting your specialties",
      component: (
        <SkillsChips
          selectedOptions={data.skills}
          onSelectionChange={(options) => setData(prev => ({ ...prev, skills: options }))}
        />
      ),
      validation: () => data.skills.length > 0
    },
    {
      title: "Where do you provide services?",
      description: "Select the areas where you're willing to work",
      component: (
        <ServiceAreasChips
          selectedOptions={data.serviceAreas}
          onSelectionChange={(options) => setData(prev => ({ ...prev, serviceAreas: options }))}
        />
      ),
      validation: () => data.serviceAreas.length > 0
    },
    {
      title: "What's your experience level?",
      description: "This helps set appropriate expectations",
      component: (
        <ExperienceChips
          selectedOptions={data.experience}
          onSelectionChange={(options) => setData(prev => ({ ...prev, experience: options }))}
        />
      ),
      validation: () => data.experience.length > 0
    },
    {
      title: "Languages you speak",
      description: "Communicate effectively with more clients",
      component: (
        <LanguageChips
          selectedOptions={data.languages}
          onSelectionChange={(options) => setData(prev => ({ ...prev, languages: options }))}
        />
      ),
      validation: () => data.languages.length > 0
    },
    {
      title: "When are you available?",
      description: "Set your working hours and availability",
      component: (
        <AvailabilityChips
          selectedOptions={data.availability}
          onSelectionChange={(options) => setData(prev => ({ ...prev, availability: options }))}
        />
      ),
      validation: () => data.availability.length > 0
    },
  ];

  const currentStepData = steps[currentStep - 1];
  const canProceed = currentStepData.validation();

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete(data);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card>
          <CardHeader className="text-center">
            <div className="mb-4">
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-muted-foreground mt-2">
                Step {currentStep} of {totalSteps}
              </p>
            </div>
            <CardTitle className="text-2xl">{currentStepData.title}</CardTitle>
            <CardDescription>{currentStepData.description}</CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {currentStepData.component}
            
            <div className="flex justify-between items-center pt-4">
              <div className="flex gap-2">
                {currentStep > 1 && (
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Previous
                  </Button>
                )}
                
                <Button
                  variant="ghost"
                  onClick={onSkip}
                  className="text-muted-foreground"
                >
                  Skip for now
                </Button>
              </div>
              
              <Button
                onClick={handleNext}
                disabled={!canProceed}
                className="flex items-center gap-2"
              >
                {currentStep === totalSteps ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Complete Setup
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="w-4 h-4" />
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