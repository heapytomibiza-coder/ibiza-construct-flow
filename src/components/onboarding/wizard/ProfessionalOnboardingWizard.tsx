import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { StepProgress } from './shared/StepProgress';
import { NavigationButtons } from './shared/NavigationButtons';
import { Step1Welcome } from './steps/Step1Welcome';
import { Step2Story } from './steps/Step2Story';
import { Step3Categories } from './steps/Step3Categories';
import { Step4Coverage } from './steps/Step4Coverage';
import { Step5Review } from './steps/Step5Review';
import { useWizardAutosave } from '@/hooks/useWizardAutosave';
import { toast } from 'sonner';

export interface OnboardingData {
  displayName: string;
  tagline: string;
  experienceYears: string;
  bio: string;
  contactEmail: string;
  contactPhone: string;
  coverImageUrl?: string;
  categories: string[];
  regions: string[];
  availability: string[];
}

interface ProfessionalOnboardingWizardProps {
  onSubmit: (data: OnboardingData) => void;
  isLoading?: boolean;
}

const STEP_TITLES = ['Welcome', 'Your Story', 'Services', 'Coverage', 'Review'];
const AUTOSAVE_KEY = 'pro-onboarding-draft';

export function ProfessionalOnboardingWizard({ 
  onSubmit, 
  isLoading 
}: ProfessionalOnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [data, setData] = useState<OnboardingData>({
    displayName: '',
    tagline: '',
    experienceYears: '',
    bio: '',
    contactEmail: '',
    contactPhone: '',
    coverImageUrl: undefined,
    categories: [],
    regions: [],
    availability: [],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Auto-save functionality
  const { loadDraft, clearDraft, hasDraft } = useWizardAutosave(data, {
    key: AUTOSAVE_KEY,
    debounceMs: 1000,
    showToast: false,
  });

  // Load draft on mount
  useEffect(() => {
    if (hasDraft()) {
      const draft = loadDraft();
      if (draft && Object.keys(draft).length > 0) {
        setData({ ...data, ...draft });
        toast.info('Draft restored', { duration: 2000 });
      }
    }
  }, []);

  const updateData = (field: string, value: any) => {
    setData({ ...data, [field]: value });
    // Clear error for this field
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 0) {
      if (!data.displayName.trim()) newErrors.displayName = 'Name is required';
      if (!data.tagline.trim()) newErrors.tagline = 'Tagline is required';
      if (data.tagline.length > 60) newErrors.tagline = 'Keep it under 60 characters';
      if (!data.experienceYears) newErrors.experienceYears = 'Select your experience level';
    }

    if (step === 1) {
      if (!data.bio.trim() || data.bio.length < 50) {
        newErrors.bio = 'Please write at least 50 characters about yourself';
      }
      if (data.bio.length > 500) newErrors.bio = 'Keep it under 500 characters';
      if (!data.contactEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.contactEmail)) {
        newErrors.contactEmail = 'Valid email is required';
      }
      if (!data.contactPhone.trim() || !/^\+?[\d\s\-()]+$/.test(data.contactPhone)) {
        newErrors.contactPhone = 'Valid phone number is required';
      }
    }

    if (step === 2) {
      if (data.categories.length === 0) {
        newErrors.categories = 'Select at least one service category';
      }
    }

    if (step === 3) {
      if (data.regions.length === 0) {
        newErrors.regions = 'Select at least one service area';
      }
      if (data.availability.length === 0) {
        newErrors.availability = 'Select your availability preference';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < STEP_TITLES.length - 1) {
        setCurrentStep(currentStep + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        // Final submit
        clearDraft();
        onSubmit(data);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleEdit = (step: number) => {
    setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const canGoNext = (): boolean => {
    if (currentStep === 0) {
      return !!(data.displayName.trim() && data.tagline.trim() && data.experienceYears);
    }
    if (currentStep === 1) {
      return !!(data.bio.trim().length >= 50 && data.contactEmail.trim() && data.contactPhone.trim());
    }
    if (currentStep === 2) {
      return data.categories.length > 0;
    }
    if (currentStep === 3) {
      return data.regions.length > 0 && data.availability.length > 0;
    }
    return true;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-8 px-4">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Progress */}
        <StepProgress
          currentStep={currentStep}
          totalSteps={STEP_TITLES.length}
          stepTitles={STEP_TITLES}
        />

        {/* Content */}
        <Card className="shadow-xl">
          <CardContent className="p-8 md:p-12">
            {currentStep === 0 && (
              <Step1Welcome data={data} onChange={updateData} errors={errors} />
            )}
            {currentStep === 1 && (
              <Step2Story 
                data={data} 
                onChange={updateData} 
                errors={errors}
                coverImageFile={coverImageFile}
                onCoverImageChange={setCoverImageFile}
              />
            )}
            {currentStep === 2 && (
              <Step3Categories data={data} onChange={updateData} errors={errors} />
            )}
            {currentStep === 3 && (
              <Step4Coverage data={data} onChange={updateData} errors={errors} />
            )}
            {currentStep === 4 && (
              <Step5Review data={data} onEdit={handleEdit} />
            )}

            {/* Navigation */}
            <NavigationButtons
              onBack={handleBack}
              onNext={handleNext}
              isFirstStep={currentStep === 0}
              isLastStep={currentStep === STEP_TITLES.length - 1}
              isLoading={isLoading}
              canGoNext={canGoNext()}
            />
          </CardContent>
        </Card>

        {/* Auto-save indicator */}
        <p className="text-center text-xs text-muted-foreground">
          ✨ Your progress is automatically saved
        </p>
      </div>
    </div>
  );
}
