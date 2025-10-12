import { useState } from 'react';
import { Star, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface ReviewPromptProps {
  contractId: string;
  professionalId: string;
  professionalName: string;
  onReviewSubmitted?: () => void;
}

export const ReviewPrompt = ({
  contractId,
  professionalId,
  professionalName,
  onReviewSubmitted,
}: ReviewPromptProps) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({
        title: 'Rating Required',
        description: 'Please select a star rating before submitting.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.from('professional_reviews').insert({
        professional_id: professionalId,
        client_id: user.id,
        rating,
        review_text: comment.trim() || null,
        service_quality: rating,
        communication: rating,
        professionalism: rating,
        value_for_money: rating,
      });

      if (error) throw error;

      toast({
        title: 'Review Submitted',
        description: 'Thank you for your feedback!',
      });

      onReviewSubmitted?.();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit review. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rate Your Experience</CardTitle>
        <CardDescription>
          How was working with {professionalName}? Your feedback helps the community.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="transition-transform hover:scale-110 focus:outline-none"
            >
              <Star
                className={cn(
                  'h-8 w-8 transition-colors',
                  (hoveredRating >= star || rating >= star)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-muted-foreground'
                )}
              />
            </button>
          ))}
        </div>

        <Textarea
          placeholder="Share your experience (optional)"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          className="resize-none"
        />

        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || rating === 0}
          className="w-full"
        >
          {isSubmitting ? (
            'Submitting...'
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Submit Review
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
