import { useState } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

interface ReviewSubmissionFormProps {
  jobId: string;
  revieweeId: string;
  onSubmit: (data: {
    job_id: string;
    reviewee_id: string;
    rating: number;
    title: string;
    comment: string;
    category_ratings?: Record<string, number>;
  }) => Promise<void>;
  onCancel?: () => void;
}

const REVIEW_CATEGORIES = [
  { key: 'professionalism', label: 'Professionalism' },
  { key: 'communication', label: 'Communication' },
  { key: 'quality', label: 'Quality of Work' },
  { key: 'timeliness', label: 'Timeliness' },
  { key: 'value', label: 'Value for Money' },
];

export function ReviewSubmissionForm({
  jobId,
  revieweeId,
  onSubmit,
  onCancel,
}: ReviewSubmissionFormProps) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [categoryRatings, setCategoryRatings] = useState<Record<string, number>>(
    Object.fromEntries(REVIEW_CATEGORIES.map(c => [c.key, 5]))
  );
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !comment.trim()) {
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        job_id: jobId,
        reviewee_id: revieweeId,
        rating,
        title,
        comment,
        category_ratings: categoryRatings,
      });
      
      // Reset form
      setRating(5);
      setTitle('');
      setComment('');
      setCategoryRatings(Object.fromEntries(REVIEW_CATEGORIES.map(c => [c.key, 5])));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Write a Review</CardTitle>
        <CardDescription>
          Share your experience to help others make informed decisions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Overall Rating */}
          <div className="space-y-2">
            <Label>Overall Rating</Label>
            <div className="flex items-center gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setRating(i + 1)}
                  onMouseEnter={() => setHoverRating(i + 1)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-8 w-8 ${
                      i < (hoverRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-muted-foreground'
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 text-lg font-semibold">{rating}/5</span>
            </div>
          </div>

          {/* Review Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Review Title</Label>
            <Input
              id="title"
              placeholder="Summarize your experience"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Review Comment */}
          <div className="space-y-2">
            <Label htmlFor="comment">Your Review</Label>
            <Textarea
              id="comment"
              placeholder="Tell us about your experience..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              required
            />
          </div>

          {/* Category Ratings */}
          <div className="space-y-4">
            <Label>Rate Specific Aspects</Label>
            {REVIEW_CATEGORIES.map((category) => (
              <div key={category.key} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">{category.label}</span>
                  <span className="text-sm font-medium">
                    {categoryRatings[category.key]}/5
                  </span>
                </div>
                <Slider
                  value={[categoryRatings[category.key]]}
                  onValueChange={([value]) =>
                    setCategoryRatings((prev) => ({
                      ...prev,
                      [category.key]: value,
                    }))
                  }
                  min={1}
                  max={5}
                  step={1}
                  className="w-full"
                />
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button type="submit" disabled={submitting} className="flex-1">
              {submitting ? 'Submitting...' : 'Submit Review'}
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={submitting}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
