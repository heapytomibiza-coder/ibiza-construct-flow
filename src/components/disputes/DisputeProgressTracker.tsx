/**
 * Dispute Progress Tracker
 * Visual 5-stage timeline showing dispute progression
 */

import { Check, Clock, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Stage {
  number: number;
  label: string;
  description: string;
  icon: typeof Clock;
}

const stages: Stage[] = [
  {
    number: 1,
    label: 'Issue Raised',
    description: 'Dispute filed, cooling-off period active',
    icon: AlertCircle,
  },
  {
    number: 2,
    label: 'Evidence Gathering',
    description: 'Both parties submit supporting evidence',
    icon: Clock,
  },
  {
    number: 3,
    label: 'Under Review',
    description: 'Platform reviews evidence and proposes solutions',
    icon: Clock,
  },
  {
    number: 4,
    label: 'Resolution',
    description: 'Parties respond to proposed solutions',
    icon: Clock,
  },
  {
    number: 5,
    label: 'Completed',
    description: 'Dispute resolved and closed',
    icon: Check,
  },
];

interface DisputeProgressTrackerProps {
  currentStage: number;
  className?: string;
}

export function DisputeProgressTracker({ currentStage, className }: DisputeProgressTrackerProps) {
  return (
    <div className={cn('w-full', className)}>
      <div className="relative">
        {/* Progress line */}
        <div className="absolute top-6 left-0 w-full h-0.5 bg-muted" />
        <div
          className="absolute top-6 left-0 h-0.5 bg-primary transition-all duration-500"
          style={{ width: `${((currentStage - 1) / (stages.length - 1)) * 100}%` }}
        />

        {/* Stages */}
        <div className="relative flex justify-between">
          {stages.map((stage) => {
            const isComplete = currentStage > stage.number;
            const isCurrent = currentStage === stage.number;
            const Icon = stage.icon;

            return (
              <div key={stage.number} className="flex flex-col items-center" style={{ width: '20%' }}>
                {/* Stage circle */}
                <div
                  className={cn(
                    'w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 bg-background',
                    isComplete && 'border-primary bg-primary text-primary-foreground',
                    isCurrent && 'border-primary bg-primary/10 text-primary animate-pulse',
                    !isComplete && !isCurrent && 'border-muted text-muted-foreground'
                  )}
                >
                  {isComplete ? (
                    <Check className="w-6 h-6" />
                  ) : (
                    <Icon className="w-6 h-6" />
                  )}
                </div>

                {/* Stage info */}
                <div className="mt-3 text-center">
                  <div
                    className={cn(
                      'font-semibold text-sm',
                      (isComplete || isCurrent) && 'text-foreground',
                      !isComplete && !isCurrent && 'text-muted-foreground'
                    )}
                  >
                    {stage.label}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 max-w-[120px]">
                    {stage.description}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}