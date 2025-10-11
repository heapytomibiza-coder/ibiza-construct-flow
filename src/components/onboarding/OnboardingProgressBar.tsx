import { CheckCircle, Circle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type OnboardingPhase = 'profile' | 'verification' | 'verification_review' | 'service_setup';

interface OnboardingProgressBarProps {
  currentPhase: OnboardingPhase;
  className?: string;
}

const STEPS = [
  { id: 'profile', label: 'Profile Setup', order: 1 },
  { id: 'verification', label: 'Verification', order: 2 },
  { id: 'service_setup', label: 'Service Setup', order: 3 },
];

export function OnboardingProgressBar({ currentPhase, className }: OnboardingProgressBarProps) {
  const getCurrentStepOrder = () => {
    if (currentPhase === 'profile') return 1;
    if (currentPhase === 'verification' || currentPhase === 'verification_review') return 2;
    if (currentPhase === 'service_setup') return 3;
    return 1;
  };

  const currentOrder = getCurrentStepOrder();

  return (
    <div className={cn("w-full max-w-2xl mx-auto", className)}>
      <div className="flex items-center justify-between relative">
        {/* Progress Line */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-muted -z-10">
          <div 
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${((currentOrder - 1) / (STEPS.length - 1)) * 100}%` }}
          />
        </div>

        {STEPS.map((step) => {
          const isCompleted = step.order < currentOrder;
          const isCurrent = step.order === currentOrder;
          const isUpcoming = step.order > currentOrder;

          return (
            <div key={step.id} className="flex flex-col items-center gap-2 relative bg-background">
              {/* Step Circle */}
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all",
                  isCompleted && "bg-primary border-primary text-primary-foreground",
                  isCurrent && "border-primary bg-background",
                  isUpcoming && "border-muted bg-background text-muted-foreground"
                )}
              >
                {isCompleted && <CheckCircle className="w-5 h-5" />}
                {isCurrent && <Loader2 className="w-5 h-5 text-primary animate-spin" />}
                {isUpcoming && <Circle className="w-5 h-5" />}
              </div>

              {/* Step Label */}
              <span
                className={cn(
                  "text-xs font-medium text-center whitespace-nowrap",
                  (isCompleted || isCurrent) && "text-foreground",
                  isUpcoming && "text-muted-foreground"
                )}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Current Step Description */}
      <div className="mt-6 text-center">
        <p className="text-sm text-muted-foreground">
          Step {currentOrder} of {STEPS.length}
        </p>
      </div>
    </div>
  );
}
