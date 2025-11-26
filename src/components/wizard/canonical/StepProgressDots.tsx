/**
 * Enhanced Step Progress with Dots
 * Shows completed, current, and future steps
 */
import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StepProgressDotsProps {
  currentStep: number;
  totalSteps: number;
  stepLabels: string[];
}

export const StepProgressDots: React.FC<StepProgressDotsProps> = ({
  currentStep,
  totalSteps,
  stepLabels,
}) => {
  return (
    <div className="w-full space-y-3">
      {/* Dots with connecting lines */}
      <div className="relative flex items-center justify-between">
        {/* Connecting line behind dots */}
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-border" />
        <div 
          className="absolute top-4 left-0 h-0.5 bg-primary transition-all duration-500 ease-out"
          style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
        />

        {/* Step dots */}
        {stepLabels.map((label, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          const isFuture = stepNumber > currentStep;

          return (
            <div key={index} className="relative flex flex-col items-center gap-2 z-10">
              {/* Dot */}
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300",
                  isCompleted && "bg-primary text-primary-foreground",
                  isCurrent && "bg-primary text-primary-foreground ring-4 ring-primary/20 animate-pulse",
                  isFuture && "bg-muted text-muted-foreground"
                )}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4" />
                ) : (
                  stepNumber
                )}
              </div>

              {/* Label - hidden on mobile, shown on desktop */}
              <span
                className={cn(
                  "text-xs font-medium hidden sm:block text-center max-w-[80px]",
                  isCurrent ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Mobile: Show current step label */}
      <div className="text-center sm:hidden">
        <span className="text-sm font-medium text-foreground">
          {stepLabels[currentStep - 1]}
        </span>
      </div>
    </div>
  );
};
