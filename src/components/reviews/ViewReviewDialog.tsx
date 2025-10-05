import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ViewReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  review: {
    rating: number;
    title?: string;
    comment?: string;
    created_at: string;
  } | null;
  professional: {
    name: string;
    avatar?: string;
  };
  milestone: {
    title: string;
    amount: number;
  };
}

export const ViewReviewDialog = ({
  open,
  onOpenChange,
  review,
  professional,
  milestone,
}: ViewReviewDialogProps) => {
  if (!review) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Your Review</DialogTitle>
          <DialogDescription>
            Review for "{milestone.title}"
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
                ${milestone.amount.toFixed(2)} released
              </p>
            </div>
          </div>

          {/* Rating Display */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Your Rating</label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={cn(
                    'w-8 h-8 transition-colors',
                    star <= review.rating
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-muted-foreground/30'
                  )}
                />
              ))}
              <span className="ml-2 text-lg font-semibold">{review.rating}/5</span>
            </div>
          </div>

          {/* Title */}
          {review.title && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Review Title</label>
              <p className="text-foreground">{review.title}</p>
            </div>
          )}

          {/* Comment */}
          {review.comment && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Your Comments</label>
              <p className="text-muted-foreground whitespace-pre-wrap">{review.comment}</p>
            </div>
          )}

          {/* Date */}
          <div className="text-xs text-muted-foreground text-right">
            Submitted on {new Date(review.created_at).toLocaleDateString()}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
