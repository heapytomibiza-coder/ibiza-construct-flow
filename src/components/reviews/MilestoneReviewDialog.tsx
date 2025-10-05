import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { VisualRatingInput } from './VisualRatingInput';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Shield } from 'lucide-react';

interface MilestoneReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  milestone: {
    id: string;
    title: string;
    amount: number;
  };
  professional: {
    id: string;
    name: string;
    avatar?: string;
  };
  isAdmin: boolean;
  onSubmit: (data: {
    rating?: number;
    title?: string;
    comment?: string;
    override?: boolean;
  }) => Promise<void>;
  isSubmitting: boolean;
}

export const MilestoneReviewDialog = ({
  open,
  onOpenChange,
  milestone,
  professional,
  isAdmin,
  onSubmit,
  isSubmitting,
}: MilestoneReviewDialogProps) => {
  const [rating, setRating] = useState<number>(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [showValidation, setShowValidation] = useState(false);

  const handleSubmit = async (override: boolean = false) => {
    if (!override && !rating) {
      setShowValidation(true);
      return;
    }

    await onSubmit({
      rating: override ? undefined : rating,
      title: title || undefined,
      comment: comment || undefined,
      override,
    });
    
    // Reset form
    setRating(5);
    setTitle('');
    setComment('');
    setShowValidation(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Release Funds & Review Work</DialogTitle>
          <DialogDescription>
            Rate the work completed for "{milestone.title}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Professional Info */}
          <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
            <Avatar>
              <AvatarImage src={professional.avatar} />
              <AvatarFallback>{professional.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{professional.name}</p>
              <p className="text-sm text-muted-foreground">
                ${milestone.amount.toFixed(2)} to be released
              </p>
            </div>
          </div>

          {/* Rating (Required) */}
          <VisualRatingInput
            value={rating}
            onChange={setRating}
            label="Quality of Work"
            required
          />
          {showValidation && !rating && (
            <p className="text-sm text-destructive">Rating is required</p>
          )}

          {/* Title (Optional) */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Review Title (Optional)</label>
            <Input
              placeholder="e.g., Excellent work, highly professional"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
            />
          </div>

          {/* Comment (Optional) */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Additional Comments (Optional)</label>
            <Textarea
              placeholder="Share details about your experience..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground text-right">
              {comment.length}/500
            </p>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {/* Admin Override Button */}
          {isAdmin && (
            <Button
              variant="outline"
              onClick={() => handleSubmit(true)}
              disabled={isSubmitting}
              className="w-full sm:w-auto border-amber-500 text-amber-700 hover:bg-amber-50"
            >
              <Shield className="w-4 h-4 mr-2" />
              Release Without Review (Admin)
            </Button>
          )}
          
          {/* Primary Submit */}
          <Button
            onClick={() => handleSubmit(false)}
            disabled={isSubmitting}
            className="w-full sm:flex-1"
          >
            {isSubmitting ? 'Releasing...' : 'Submit Review & Release Funds'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
