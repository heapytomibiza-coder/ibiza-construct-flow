import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface FeedbackPromptProps {
  disputeId: string;
  onSubmit?: () => void;
  onSkip?: () => void;
}

export default function FeedbackPrompt({ disputeId, onSubmit, onSkip }: FeedbackPromptProps) {
  const [fairness, setFairness] = useState<number>(0);
  const [professionalism, setProfessionalism] = useState<number>(0);
  const [comments, setComments] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (fairness === 0 || professionalism === 0) {
      toast({
        title: "Please rate both questions",
        description: "Both ratings are required to submit feedback.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from('dispute_feedback' as any).insert({
        dispute_id: disputeId,
        fairness,
        professionalism,
        comments: comments.trim() || null,
      });

      if (error) throw error;

      toast({
        title: "Feedback submitted",
        description: "Thank you for your feedback!",
      });

      onSubmit?.();
    } catch (error: any) {
      console.error('Failed to submit feedback:', error);
      toast({
        title: "Error submitting feedback",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const StarRating = ({ value, onChange }: { value: number; onChange: (v: number) => void }) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="transition-colors hover:scale-110"
          >
            <Star
              className={`h-8 w-8 ${
                star <= value
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>How was your experience?</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <label className="text-sm font-medium mb-2 block">
            How fair was this resolution?
          </label>
          <StarRating value={fairness} onChange={setFairness} />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">
            Was communication handled professionally?
          </label>
          <StarRating value={professionalism} onChange={setProfessionalism} />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">
            Additional comments (optional)
          </label>
          <Textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="Share any additional thoughts about this dispute resolution..."
            rows={4}
          />
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleSubmit}
            disabled={submitting || fairness === 0 || professionalism === 0}
            className="flex-1"
          >
            {submitting ? "Submitting..." : "Submit Feedback"}
          </Button>
          {onSkip && (
            <Button onClick={onSkip} variant="ghost">
              Skip for now
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
