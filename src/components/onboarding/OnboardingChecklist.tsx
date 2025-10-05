import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  XCircle,
  User,
  ShieldCheck,
  Briefcase,
  Calendar,
  Images,
  CreditCard,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useOnboardingChecklist, OnboardingStep } from '@/hooks/useOnboardingChecklist';
import { getChecklistStepUrl, getStepConfig, getProgressBadge } from '@/utils/checklistNavigation';
import { CompletionCelebration } from './CompletionCelebration';
import { OnboardingProgress } from './OnboardingProgress';
import { cn } from '@/lib/utils';

interface OnboardingChecklistProps {
  compact?: boolean;
  onStepClick?: (step: OnboardingStep) => void;
}

const iconMap = {
  User,
  ShieldCheck,
  Briefcase,
  Calendar,
  Images,
  CreditCard
};

export const OnboardingChecklist: React.FC<OnboardingChecklistProps> = ({ 
  compact = false,
  onStepClick 
}) => {
  const navigate = useNavigate();
  const { 
    checklist, 
    loading, 
    completionPercentage, 
    markStepStarted,
    skipStep 
  } = useOnboardingChecklist();

  const [showCelebration, setShowCelebration] = useState(false);
  const [previousCompletion, setPreviousCompletion] = useState(completionPercentage);

  // Detect completion and trigger celebration
  useEffect(() => {
    if (completionPercentage === 100 && previousCompletion < 100) {
      setShowCelebration(true);
    }
    setPreviousCompletion(completionPercentage);
  }, [completionPercentage, previousCompletion]);

  const progressBadge = getProgressBadge(completionPercentage);

  const handleStepAction = async (step: OnboardingStep, started: boolean) => {
    if (!started) {
      await markStepStarted(step);
    }
    
    if (onStepClick) {
      onStepClick(step);
    } else {
      const url = getChecklistStepUrl(step);
      navigate(url);
    }
  };

  const handleSkip = async (step: OnboardingStep, e: React.MouseEvent) => {
    e.stopPropagation();
    await skipStep(step);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  if (completionPercentage === 100 && compact) {
    return null; // Hide when complete in compact mode
  }

  const completedSteps = checklist.filter(item => item.completed_at).length;
  const totalSteps = checklist.length;
  const estimatedTimeRemaining = checklist
    .filter(item => !item.completed_at && !item.skipped)
    .reduce((acc, item) => {
      const config = getStepConfig(item.step);
      return acc + (parseInt(config.estimatedTime) || 5);
    }, 0);

  return (
    <>
      <CompletionCelebration
        isComplete={completionPercentage === 100}
        onDismiss={() => setShowCelebration(false)}
      />

      {!compact && (
        <OnboardingProgress
          completedSteps={completedSteps}
          totalSteps={totalSteps}
          estimatedTimeRemaining={estimatedTimeRemaining}
          className="mb-4"
        />
      )}

      <Card className={cn('w-full', compact && 'border-none shadow-none')}>
        <CardHeader className={cn(compact && 'pb-3')}>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className={cn(compact ? 'text-lg' : 'text-xl', 'flex items-center gap-2')}>
                {completionPercentage === 100 && <Sparkles className="h-5 w-5 text-primary" />}
                Complete Your Profile
              </CardTitle>
              {!compact && (
                <CardDescription className="mt-1">
                  Finish these steps to start accepting jobs
                </CardDescription>
              )}
            </div>
            <Badge variant="outline" className={progressBadge.color}>
              {progressBadge.text}
            </Badge>
          </div>
          {compact && (
            <div className="pt-4">
              <Progress value={completionPercentage} className="h-2" />
            </div>
          )}
        </CardHeader>
        
        <CardContent className="space-y-3">
          {checklist.map((item) => {
            const config = getStepConfig(item.step);
            const IconComponent = iconMap[config.icon as keyof typeof iconMap];
            const isCompleted = !!item.completed_at;
            const isSkipped = item.skipped;
            const isStarted = !!item.started_at && !isCompleted;
            
            return (
              <div
                key={item.id}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-lg border transition-all duration-200",
                  isCompleted && "bg-muted/50 border-primary/50",
                  isSkipped && "bg-muted/30 border-muted opacity-60",
                  !isCompleted && !isSkipped && "hover:bg-muted/50 hover:scale-[1.01] cursor-pointer hover:shadow-sm"
                )}
                onClick={() => !isCompleted && !isSkipped && handleStepAction(item.step, isStarted)}
              >
                {/* Status Icon */}
                <div className="flex-shrink-0">
                  {isCompleted && (
                    <CheckCircle2 className="h-6 w-6 text-primary" />
                  )}
                  {isSkipped && (
                    <XCircle className="h-6 w-6 text-muted-foreground" />
                  )}
                  {isStarted && !isCompleted && !isSkipped && (
                    <Clock className="h-6 w-6 text-primary animate-pulse" />
                  )}
                  {!isStarted && !isCompleted && !isSkipped && (
                    <Circle className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>

                {/* Step Icon & Info */}
                <div className="flex items-center gap-3 flex-1">
                  <div className="flex-shrink-0 p-2 rounded-md bg-background">
                    <IconComponent className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className={cn(
                      "font-medium",
                      (isCompleted || isSkipped) && "line-through text-muted-foreground"
                    )}>
                      {config.title}
                    </h4>
                    {!compact && (
                      <p className="text-sm text-muted-foreground">
                        {config.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Metadata & Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {!compact && !isCompleted && !isSkipped && (
                    <>
                      <Badge variant="secondary" className="text-xs">
                        {config.estimatedTime}
                      </Badge>
                      {config.priority === 'critical' && (
                        <Badge variant="destructive" className="text-xs">
                          Required
                        </Badge>
                      )}
                    </>
                  )}
                  
                  {!isCompleted && !isSkipped && (
                    <div className="flex gap-2">
                      {config.priority !== 'critical' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleSkip(item.step, e)}
                        >
                          Skip
                        </Button>
                      )}
                      <Button
                        variant={isStarted ? "default" : "outline"}
                        size="sm"
                      >
                        {isStarted ? "Continue" : "Start"}
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </>
  );
};
