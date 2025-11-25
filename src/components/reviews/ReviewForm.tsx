import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Star } from 'lucide-react';
import type { CategoryRatings } from '@/types/review';

interface ReviewFormProps {
  revieweeName: string;
  onSubmit: (ratings: CategoryRatings, title: string, comment: string) => void;
  isSubmitting: boolean;
}

export function ReviewForm({ revieweeName, onSubmit, isSubmitting }: ReviewFormProps) {
  const [ratings, setRatings] = useState<CategoryRatings>({
    timeliness: 5,
    communication: 5,
    value: 5,
    quality: 5,
    professionalism: 5,
  });
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');

  const handleSubmit = () => {
    if (comment.trim()) {
      onSubmit(ratings, title, comment);
    }
  };

  return (
    <Card className="p-6 space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Leave a Review for {revieweeName}</h3>
        <p className="text-sm text-muted-foreground">
          Share your experience to help others make informed decisions
        </p>
      </div>

      <div className="space-y-2">
        <Label>Rate Your Experience</Label>
        {(['timeliness', 'communication', 'value', 'quality', 'professionalism'] as const).map((category) => (
          <div key={category} className="flex items-center justify-between">
            <span className="text-sm capitalize">{category}</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-5 h-5 cursor-pointer ${
                    star <= ratings[category]
                      ? 'fill-yellow-500 text-yellow-500'
                      : 'text-gray-300'
                  }`}
                  onClick={() => setRatings({ ...ratings, [category]: star })}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">Review Title (Optional)</Label>
        <input
          id="title"
          type="text"
          className="w-full px-3 py-2 border border-input rounded-md"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Summarize your experience..."
          maxLength={100}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="comment">Your Review</Label>
        <Textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share details about your experience..."
          rows={6}
          maxLength={1000}
        />
        <p className="text-xs text-muted-foreground text-right">
          {comment.length}/1000 characters
        </p>
      </div>

      <div className="flex justify-end gap-3">
        <Button
          onClick={handleSubmit}
          disabled={!comment.trim() || isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Review'}
        </Button>
      </div>
    </Card>
  );
}
