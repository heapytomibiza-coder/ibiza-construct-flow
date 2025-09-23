import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Clock, ArrowRight, X, Sparkles } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface SavedSession {
  id: string;
  form_type: string;
  payload: any;
  updated_at: string;
}

interface ResumeJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResumeSession: (sessionData: any) => void;
  onStartFresh: () => void;
  savedSession: SavedSession | null;
}

export const ResumeJobModal: React.FC<ResumeJobModalProps> = ({
  isOpen,
  onClose,
  onResumeSession,
  onStartFresh,
  savedSession
}) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (savedSession && isOpen) {
      // Calculate progress based on completed wizard steps
      const payload = savedSession.payload;
      let completedSteps = 0;
      const totalSteps = 6;

      if (payload.category) completedSteps++;
      if (payload.subcategory) completedSteps++;
      if (payload.serviceId) completedSteps++;
      if (payload.generalAnswers?.title) completedSteps++;
      if (payload.generalAnswers?.location) completedSteps++;
      if (Object.keys(payload.microAnswers || {}).length > 0) completedSteps++;

      setProgress((completedSteps / totalSteps) * 100);
    }
  }, [savedSession, isOpen]);

  if (!savedSession) return null;

  const formatSessionAge = (updatedAt: string) => {
    try {
      return formatDistanceToNow(new Date(updatedAt), { addSuffix: true });
    } catch {
      return 'recently';
    }
  };

  const getStepDescription = () => {
    const payload = savedSession.payload;
    
    if (payload.microService) {
      return `Working on: ${payload.microService}`;
    }
    if (payload.subcategory) {
      return `In: ${payload.category} → ${payload.subcategory}`;
    }
    if (payload.category) {
      return `Selected: ${payload.category}`;
    }
    return 'Just getting started';
  };

  const getNextStepAction = () => {
    const payload = savedSession.payload;
    
    if (payload.generalAnswers?.location && payload.microAnswers) {
      return 'Continue to review & post';
    }
    if (payload.generalAnswers?.title) {
      return 'Add location & timing';
    }
    if (payload.serviceId) {
      return 'Answer job questions';
    }
    if (payload.subcategory) {
      return 'Select specific service';
    }
    if (payload.category) {
      return 'Choose subcategory';
    }
    return 'Continue setup';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Continue Your Job Post?
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="w-6 h-6 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Session Preview */}
          <div className="bg-gradient-subtle rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                Saved {formatSessionAge(savedSession.updated_at)}
              </div>
              <Badge variant="secondary" className="text-xs">
                {Math.round(progress)}% complete
              </Badge>
            </div>

            <Progress value={progress} className="h-2" />

            <div>
              <p className="font-medium text-sm">{getStepDescription()}</p>
              <p className="text-sm text-muted-foreground mt-1">
                Next: {getNextStepAction()}
              </p>
            </div>

            {/* Quick Preview of Data */}
            {savedSession.payload.generalAnswers?.title && (
              <div className="pt-2 border-t border-border/50">
                <p className="text-xs text-muted-foreground">Job Title:</p>
                <p className="text-sm font-medium">
                  {savedSession.payload.generalAnswers.title}
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button 
              onClick={() => onResumeSession(savedSession.payload)}
              className="w-full justify-between"
              size="lg"
            >
              <span>Continue Where I Left Off</span>
              <ArrowRight className="w-4 h-4" />
            </Button>

            <Button 
              onClick={onStartFresh}
              variant="outline"
              className="w-full"
              size="lg"
            >
              Start Fresh Instead
            </Button>
          </div>

          {/* Benefits */}
          <div className="text-center space-y-2 pt-2 border-t border-border/50">
            <p className="text-xs text-muted-foreground">
              Your progress is automatically saved as you work
            </p>
            <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                Cross-device sync
              </div>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                AI suggestions preserved
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};