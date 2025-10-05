import { useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
  id: string;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  content: React.ReactNode;
  completed?: boolean;
  disabled?: boolean;
}

interface ProgressiveStepAccordionProps {
  steps: Step[];
  currentStep: string;
  onStepChange: (stepId: string) => void;
  className?: string;
}

export const ProgressiveStepAccordion = ({
  steps,
  currentStep,
  onStepChange,
  className
}: ProgressiveStepAccordionProps) => {
  const [openStep, setOpenStep] = useState(currentStep);

  const handleValueChange = (value: string) => {
    if (value) {
      setOpenStep(value);
      onStepChange(value);
    }
  };

  return (
    <Accordion
      type="single"
      collapsible
      value={openStep}
      onValueChange={handleValueChange}
      className={cn("space-y-3", className)}
    >
      {steps.map((step, index) => {
        const isCompleted = step.completed;
        const isCurrent = step.id === openStep;
        const isDisabled = step.disabled;

        return (
          <AccordionItem
            key={step.id}
            value={step.id}
            className={cn(
              "border-2 rounded-xl overflow-hidden transition-all",
              isCurrent && "border-primary shadow-md",
              isCompleted && !isCurrent && "border-green-500/30 bg-green-50/30",
              isDisabled && "opacity-50 pointer-events-none",
              !isCurrent && !isCompleted && !isDisabled && "border-border"
            )}
            disabled={isDisabled}
          >
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center gap-4 w-full">
                {/* Step number/status */}
                <div className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-full shrink-0 font-semibold",
                  isCompleted && "bg-green-500 text-white",
                  isCurrent && !isCompleted && "bg-primary text-primary-foreground",
                  !isCurrent && !isCompleted && "bg-secondary text-secondary-foreground"
                )}>
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>

                {/* Step info */}
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <p className={cn(
                      "font-semibold",
                      isCurrent && "text-primary",
                      isCompleted && "text-green-700"
                    )}>
                      {step.title}
                    </p>
                    {isCompleted && (
                      <Badge variant="secondary" className="bg-green-100 text-green-700">
                        Complete
                      </Badge>
                    )}
                  </div>
                  {step.subtitle && (
                    <p className="text-sm text-muted-foreground">
                      {step.subtitle}
                    </p>
                  )}
                </div>

                {/* Icon */}
                {step.icon && (
                  <div className="text-muted-foreground shrink-0">
                    {step.icon}
                  </div>
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="pt-4 border-t">
                {step.content}
              </div>
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
};
