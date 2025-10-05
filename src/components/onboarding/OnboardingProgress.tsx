import { motion } from 'framer-motion';
import { CheckCircle, Circle, Clock } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface OnboardingProgressProps {
  completedSteps: number;
  totalSteps: number;
  estimatedTimeRemaining: number; // in minutes
  className?: string;
}

export function OnboardingProgress({
  completedSteps,
  totalSteps,
  estimatedTimeRemaining,
  className,
}: OnboardingProgressProps) {
  const percentage = Math.round((completedSteps / totalSteps) * 100);
  const isComplete = percentage === 100;

  const getProgressColor = () => {
    if (isComplete) return 'text-green-600';
    if (percentage >= 70) return 'text-blue-600';
    if (percentage >= 40) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const getProgressMessage = () => {
    if (isComplete) return '🎉 All done!';
    if (percentage >= 70) return 'Almost there!';
    if (percentage >= 40) return 'Great progress!';
    return 'Just getting started';
  };

  return (
    <Card className={cn('border-2', isComplete && 'border-green-500/50', className)}>
      <CardContent className="pt-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              animate={isComplete ? { scale: [1, 1.2, 1], rotate: [0, 360] } : {}}
              transition={{ duration: 0.5 }}
            >
              {isComplete ? (
                <CheckCircle className="h-6 w-6 text-green-600" />
              ) : (
                <Circle className="h-6 w-6 text-muted-foreground" />
              )}
            </motion.div>
            <div>
              <h3 className="font-semibold">Profile Completion</h3>
              <p className="text-sm text-muted-foreground">{getProgressMessage()}</p>
            </div>
          </div>
          <Badge
            variant={isComplete ? 'default' : 'secondary'}
            className={cn('text-lg px-3 py-1', getProgressColor())}
          >
            {percentage}%
          </Badge>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <Progress value={percentage} className="h-3" />
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {completedSteps} of {totalSteps} steps completed
            </span>
            {!isComplete && estimatedTimeRemaining > 0 && (
              <span className="flex items-center gap-1 text-muted-foreground">
                <Clock className="h-3 w-3" />
                ~{estimatedTimeRemaining} min remaining
              </span>
            )}
          </div>
        </div>

        {/* Milestone Indicators */}
        <div className="flex items-center justify-between pt-2">
          {Array.from({ length: totalSteps }).map((_, index) => (
            <motion.div
              key={index}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                'h-2 w-2 rounded-full',
                index < completedSteps
                  ? 'bg-primary'
                  : 'bg-muted-foreground/20'
              )}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
