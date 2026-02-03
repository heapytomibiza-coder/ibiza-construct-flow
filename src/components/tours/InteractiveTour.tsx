import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, ArrowRight, ArrowLeft } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { TOURS_ENABLED } from '@/config/toursEnabled';

interface TourStep {
  target: string;
  title: string;
  description: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
}

interface InteractiveTourProps {
  steps: TourStep[];
  onComplete?: () => void;
  onSkip?: () => void;
}

export function InteractiveTour({ steps, onComplete, onSkip }: InteractiveTourProps) {
  const isMobile = useIsMobile();
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  const isCoarsePointer =
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia('(pointer: coarse)').matches
      : false;
  
  // CRITICAL: Tours are globally disabled
  const toursDisabled = !TOURS_ENABLED || isMobile || isCoarsePointer;

  const step = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  useEffect(() => {
    if (toursDisabled || !step) return;

    const element = document.querySelector(step.target);
    if (element) {
      const rect = element.getBoundingClientRect();
      const placement = step.placement || 'bottom';

      let top = 0;
      let left = 0;

      switch (placement) {
        case 'top':
          top = rect.top - 200;
          left = rect.left + rect.width / 2 - 150;
          break;
        case 'bottom':
          top = rect.bottom + 20;
          left = rect.left + rect.width / 2 - 150;
          break;
        case 'left':
          top = rect.top + rect.height / 2 - 100;
          left = rect.left - 320;
          break;
        case 'right':
          top = rect.top + rect.height / 2 - 100;
          left = rect.right + 20;
          break;
      }

      setPosition({ top, left });

      element.classList.add('tour-highlight');
      const htmlElement = element as HTMLElement;
      htmlElement.style.position = 'relative';
      htmlElement.style.zIndex = '61';
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });

      return () => {
        element.classList.remove('tour-highlight');
        htmlElement.style.position = '';
        htmlElement.style.zIndex = '';
      };
    }
  }, [currentStep, step, toursDisabled]);

  // CRITICAL: Return null if tours disabled - after all hooks
  if (toursDisabled || !isVisible || !step) return null;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  };

  const handleComplete = () => {
    setIsVisible(false);
    onComplete?.();
  };

  const handleSkip = () => {
    setIsVisible(false);
    onSkip?.();
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-[60]" style={{ pointerEvents: 'none' }} />

      {/* Close button */}
      <button
        onClick={handleSkip}
        className="fixed top-4 right-4 z-[63] p-3 rounded-full bg-background/90 hover:bg-background shadow-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
        style={{ pointerEvents: 'auto' }}
        aria-label="Close tour"
      >
        <X className="h-5 w-5" />
      </button>

      {/* Tour Card */}
      <div
        className="fixed z-[62] w-[300px] sm:w-[350px] animate-in fade-in max-w-[calc(100vw-2rem)]"
        style={{
          top: window.innerWidth < 640 ? '50%' : `${position.top}px`,
          left: window.innerWidth < 640 ? '50%' : `${position.left}px`,
          transform: window.innerWidth < 640 ? 'translate(-50%, -50%)' : 'none',
          maxHeight: '90vh',
          overflowY: 'auto',
          pointerEvents: 'auto',
        }}
      >
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <CardTitle className="text-lg">{step.title}</CardTitle>
                <CardDescription className="text-xs mt-1">
                  Step {currentStep + 1} of {steps.length}
                </CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={handleSkip} className="h-6 w-6">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="mt-2">
              <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">{step.description}</p>

            <div className="flex flex-col sm:flex-row justify-between gap-2">
              <Button
                variant="outline"
                className="min-h-[44px]"
                onClick={handleBack}
                disabled={currentStep === 0}
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back
              </Button>

              <div className="flex gap-2 flex-1 sm:flex-initial">
                {currentStep < steps.length - 1 && (
                  <Button
                    variant="ghost"
                    className="min-h-[44px] flex-1 sm:flex-initial"
                    onClick={handleSkip}
                  >
                    Skip Tour
                  </Button>
                )}
                <Button
                  className="min-h-[44px] flex-1 sm:flex-initial"
                  onClick={handleNext}
                >
                  {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

// Enhanced usage hook with manual triggers
export function useTour(tourKey: string, steps: TourStep[]) {
  const isMobile = useIsMobile();
  const [showTour, setShowTour] = useState(false);

  const isCoarsePointer =
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia('(pointer: coarse)').matches
      : false;
  
  // CRITICAL: Tours are globally disabled
  const toursDisabled = !TOURS_ENABLED || isMobile || isCoarsePointer;

  useEffect(() => {
    if (toursDisabled) {
      setShowTour(false);
      return;
    }

    const hasSeenTour = localStorage.getItem(`tour-${tourKey}`);
    if (!hasSeenTour) {
      setShowTour(true);
    }
  }, [tourKey, toursDisabled]);

  const completeTour = () => {
    localStorage.setItem(`tour-${tourKey}`, 'true');
    setShowTour(false);
  };

  const skipTour = () => {
    localStorage.setItem(`tour-${tourKey}`, 'skipped');
    setShowTour(false);
  };

  const startTour = () => {
    if (toursDisabled) return;
    setShowTour(true);
  };

  const resetTour = () => {
    if (toursDisabled) return;
    localStorage.removeItem(`tour-${tourKey}`);
    setShowTour(true);
  };

  // CRITICAL: Always return null if tours are disabled
  const shouldShow = !toursDisabled && showTour;

  return {
    showTour: shouldShow,
    startTour,
    resetTour,
    TourComponent: shouldShow ? (
      <InteractiveTour steps={steps} onComplete={completeTour} onSkip={skipTour} />
    ) : null,
  };
}
