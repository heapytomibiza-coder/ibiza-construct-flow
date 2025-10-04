import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Package, User, Calendar, CheckCheck } from 'lucide-react';
import { BookingWizardSummary } from './BookingWizardSummary';
import { BookingStep1Service } from './BookingStep1Service';
import { BookingStep2Information } from './BookingStep2Information';
import { BookingStep3DateTime } from './BookingStep3DateTime';
import { BookingStep4Confirmation } from './BookingStep4Confirmation';
import { useBookingWizard } from '@/hooks/useBookingWizard';
import { cn } from '@/lib/utils';

interface BookingWizardProps {
  professionalId: string;
  serviceId?: string;
}

const steps = [
  { number: 1, title: 'Select Services', icon: Package },
  { number: 2, title: 'Your Information', icon: User },
  { number: 3, title: 'Date & Time', icon: Calendar },
  { number: 4, title: 'Confirmation', icon: CheckCheck },
];

export const BookingWizard = ({ professionalId, serviceId }: BookingWizardProps) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const wizard = useBookingWizard();

  useEffect(() => {
    const step = searchParams.get('step');
    if (step) {
      const stepNum = parseInt(step);
      if (stepNum >= 1 && stepNum <= 4) {
        wizard.goToStep(stepNum);
      }
    }
  }, [searchParams]);

  const handleStepClick = (stepNumber: number) => {
    if (stepNumber < wizard.currentStep) {
      wizard.goToStep(stepNumber);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      <div className="container mx-auto px-4 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2 md:gap-4">
            {steps.map((step, idx) => {
              const StepIcon = step.icon;
              const isActive = wizard.currentStep === step.number;
              const isCompleted = wizard.currentStep > step.number;
              const isClickable = wizard.currentStep > step.number;

              return (
                <div key={step.number} className="flex items-center">
                  <button
                    onClick={() => isClickable && handleStepClick(step.number)}
                    disabled={!isClickable}
                    className={cn(
                      "flex flex-col items-center gap-2 transition-all",
                      isClickable && "cursor-pointer hover:opacity-80",
                      !isClickable && !isActive && "opacity-40"
                    )}
                  >
                    <div className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center transition-all",
                      isCompleted && "bg-primary text-primary-foreground",
                      isActive && "bg-primary/20 text-primary ring-2 ring-primary",
                      !isCompleted && !isActive && "bg-secondary text-secondary-foreground"
                    )}>
                      {isCompleted ? (
                        <CheckCircle2 className="w-6 h-6" />
                      ) : (
                        <StepIcon className="w-6 h-6" />
                      )}
                    </div>
                    <span className={cn(
                      "text-xs md:text-sm font-medium hidden md:block",
                      isActive && "text-primary",
                      isCompleted && "text-foreground",
                      !isActive && !isCompleted && "text-muted-foreground"
                    )}>
                      {step.title}
                    </span>
                  </button>
                  {idx < steps.length - 1 && (
                    <div className={cn(
                      "h-0.5 w-8 md:w-16 mx-2 transition-colors",
                      isCompleted ? "bg-primary" : "bg-border"
                    )} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Wizard Content */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            {wizard.currentStep === 1 && (
              <BookingStep1Service 
                professionalId={professionalId}
                serviceId={serviceId}
                wizard={wizard}
              />
            )}
            {wizard.currentStep === 2 && (
              <BookingStep2Information wizard={wizard} />
            )}
            {wizard.currentStep === 3 && (
              <BookingStep3DateTime wizard={wizard} />
            )}
            {wizard.currentStep === 4 && (
              <BookingStep4Confirmation 
                wizard={wizard}
                professionalId={professionalId}
              />
            )}
          </div>

          {/* Summary Sidebar */}
          <div className="lg:col-span-1 order-1 lg:order-2">
            <BookingWizardSummary wizard={wizard} />
          </div>
        </div>
      </div>
    </div>
  );
};
