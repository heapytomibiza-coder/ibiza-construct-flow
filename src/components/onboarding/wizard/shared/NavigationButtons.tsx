import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';

interface NavigationButtonsProps {
  onBack?: () => void;
  onNext?: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  isLoading?: boolean;
  nextLabel?: string;
  backLabel?: string;
  canGoNext?: boolean;
}

export function NavigationButtons({
  onBack,
  onNext,
  isFirstStep,
  isLastStep,
  isLoading,
  nextLabel,
  backLabel,
  canGoNext = true
}: NavigationButtonsProps) {
  return (
    <div className="flex justify-between items-center pt-6 border-t">
      <Button
        type="button"
        variant="ghost"
        onClick={onBack}
        disabled={isFirstStep || isLoading}
        className={cn(isFirstStep && 'invisible')}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        {backLabel || 'Back'}
      </Button>

      <Button
        type="button"
        onClick={onNext}
        disabled={isLoading || !canGoNext}
        size="lg"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            {nextLabel || (isLastStep ? 'Submit for Verification' : 'Continue')}
            {!isLastStep && <ArrowRight className="w-4 h-4 ml-2" />}
          </>
        )}
      </Button>
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
