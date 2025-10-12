import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { MessageCircle, X, ThumbsUp, ThumbsDown, Bug, Lightbulb } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

type FeedbackType = 'positive' | 'negative' | 'bug' | 'feature';

export function FeedbackWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState<FeedbackType | null>(null);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async () => {
    if (!feedback.trim()) {
      toast.error('Please enter your feedback');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await (supabase as any)
        .from('user_feedback')
        .insert({
          user_id: user?.id,
          feedback_type: feedbackType,
          message: feedback,
          page_url: window.location.href,
          user_agent: navigator.userAgent
        });

      if (error) throw error;

      toast.success('Thank you for your feedback!');
      setIsOpen(false);
      setFeedback('');
      setFeedbackType(null);
    } catch (error) {
      console.error('Feedback submission error:', error);
      toast.error('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const feedbackOptions = [
    { type: 'positive' as FeedbackType, icon: ThumbsUp, label: 'Positive', color: 'text-green-500' },
    { type: 'negative' as FeedbackType, icon: ThumbsDown, label: 'Negative', color: 'text-red-500' },
    { type: 'bug' as FeedbackType, icon: Bug, label: 'Bug Report', color: 'text-orange-500' },
    { type: 'feature' as FeedbackType, icon: Lightbulb, label: 'Feature Idea', color: 'text-blue-500' }
  ];

  return (
    <>
      {/* Feedback Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 z-50 rounded-full shadow-lg"
          size="lg"
        >
          <MessageCircle className="w-5 h-5 mr-2" />
          Feedback
        </Button>
      )}

      {/* Feedback Panel */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 z-50 w-96 max-w-[calc(100vw-2rem)] animate-in slide-in-from-bottom">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Send Feedback</CardTitle>
                  <CardDescription>
                    Help us improve by sharing your thoughts
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Feedback Type</Label>
                <div className="grid grid-cols-2 gap-2">
                  {feedbackOptions.map(option => (
                    <Button
                      key={option.type}
                      variant={feedbackType === option.type ? 'default' : 'outline'}
                      className="h-auto py-3 flex flex-col items-center gap-1"
                      onClick={() => setFeedbackType(option.type)}
                    >
                      <option.icon className={`w-5 h-5 ${feedbackType === option.type ? '' : option.color}`} />
                      <span className="text-xs">{option.label}</span>
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="feedback-message">Your Feedback</Label>
                <Textarea
                  id="feedback-message"
                  placeholder="Tell us what's on your mind..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
              </div>

              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !feedbackType || !feedback.trim()}
                className="w-full"
              >
                {isSubmitting ? 'Sending...' : 'Send Feedback'}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
