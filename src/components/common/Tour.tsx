import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TourStep {
  target: string;
  title: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

interface TourProps {
  steps: TourStep[];
  isActive: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

export const Tour: React.FC<TourProps> = ({ steps, isActive, onComplete, onSkip }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (isActive && steps[currentStep]) {
      const element = document.querySelector(steps[currentStep].target) as HTMLElement;
      setTargetElement(element);
      
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Add highlight effect
        element.style.position = 'relative';
        element.style.zIndex = '1000';
        element.style.boxShadow = '0 0 0 4px hsl(var(--copper) / 0.5)';
        element.style.borderRadius = '8px';
      }
    }

    return () => {
      if (targetElement) {
        targetElement.style.boxShadow = '';
        targetElement.style.zIndex = '';
        targetElement.style.position = '';
      }
    };
  }, [currentStep, isActive, steps, targetElement]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    if (targetElement) {
      targetElement.style.boxShadow = '';
      targetElement.style.zIndex = '';
      targetElement.style.position = '';
    }
    onSkip();
  };

  if (!isActive || !steps[currentStep]) return null;

  const currentStepData = steps[currentStep];

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-50" />
      
      {/* Tour Card */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-background border-copper/20 shadow-xl">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-copper" />
                <CardTitle className="text-lg">Welcome Tour</CardTitle>
              </div>
              <Button variant="ghost" size="sm" onClick={handleSkip}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                Step {currentStep + 1} of {steps.length}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-charcoal mb-2">
                {currentStepData.title}
              </h3>
              <p className="text-muted-foreground text-sm">
                {currentStepData.content}
              </p>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-sand-light rounded-full h-2">
              <div 
                className="bg-gradient-hero h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              />
            </div>
            
            {/* Navigation */}
            <div className="flex justify-between items-center pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevious}
                disabled={currentStep === 0}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>
              
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={handleSkip}>
                  Skip Tour
                </Button>
                <Button
                  onClick={handleNext}
                  size="sm"
                  className="bg-gradient-hero hover:bg-copper text-white"
                >
                  {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
                  {currentStep !== steps.length - 1 && (
                    <ChevronRight className="w-4 h-4 ml-1" />
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export const useTour = (tourKey: string, steps: TourStep[]) => {
  const [isActive, setIsActive] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    const completed = localStorage.getItem(`tour_${tourKey}_completed`);
    if (!completed) {
      // Delay to ensure DOM is ready
      setTimeout(() => setIsActive(true), 1000);
    } else {
      setIsCompleted(true);
    }
  }, [tourKey]);

  const completeTour = () => {
    localStorage.setItem(`tour_${tourKey}_completed`, 'true');
    setIsActive(false);
    setIsCompleted(true);
  };

  const skipTour = () => {
    localStorage.setItem(`tour_${tourKey}_completed`, 'true');
    setIsActive(false);
    setIsCompleted(true);
  };

  const resetTour = () => {
    localStorage.removeItem(`tour_${tourKey}_completed`);
    setIsCompleted(false);
    setIsActive(true);
  };

  return {
    isActive,
    isCompleted,
    completeTour,
    skipTour,
    resetTour,
    TourComponent: () => (
      <Tour
        steps={steps}
        isActive={isActive}
        onComplete={completeTour}
        onSkip={skipTour}
      />
    )
  };
};