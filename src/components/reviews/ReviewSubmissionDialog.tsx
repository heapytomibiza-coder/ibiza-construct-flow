import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star, Loader2 } from "lucide-react";
import { useEnhancedReviews } from "@/hooks/useEnhancedReviews";

interface ReviewSubmissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobId: string;
  contractId?: string;
  revieweeId: string;
  revieweeName: string;
}

export const ReviewSubmissionDialog = ({
  open,
  onOpenChange,
  jobId,
  contractId,
  revieweeId,
  revieweeName,
}: ReviewSubmissionDialogProps) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [categoryRatings, setCategoryRatings] = useState({
    professionalism: 0,
    quality: 0,
    communication: 0,
    timeliness: 0,
  });

  const { createReview } = useEnhancedReviews();

  const handleSubmit = async () => {
    if (rating === 0) return;

    await createReview.mutateAsync({
      jobId,
      contractId,
      revieweeId,
      rating,
      title,
      comment,
      categoryRatings,
    });

    // Reset form
    setRating(0);
    setTitle("");
    setComment("");
    setCategoryRatings({
      professionalism: 0,
      quality: 0,
      communication: 0,
      timeliness: 0,
    });
    
    onOpenChange(false);
  };

  const CategoryRating = ({ 
    label, 
    value, 
    onChange 
  }: { 
    label: string; 
    value: number; 
    onChange: (value: number) => void;
  }) => {
    const [hover, setHover] = useState(0);
    
    return (
      <div className="flex items-center justify-between">
        <Label className="text-sm">{label}</Label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`w-4 h-4 cursor-pointer transition-colors ${
                star <= (hover || value)
                  ? "fill-warning text-warning"
                  : "text-muted-foreground"
              }`}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
              onClick={() => onChange(star)}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Write a Review</DialogTitle>
          <DialogDescription>
            Share your experience working with {revieweeName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Overall Rating */}
          <div className="space-y-2">
            <Label>Overall Rating *</Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-8 h-8 cursor-pointer transition-colors ${
                    star <= (hoverRating || rating)
                      ? "fill-warning text-warning"
                      : "text-muted-foreground"
                  }`}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                />
              ))}
            </div>
            {rating > 0 && (
              <p className="text-sm text-muted-foreground">
                {rating === 5 && "Excellent!"}
                {rating === 4 && "Good"}
                {rating === 3 && "Average"}
                {rating === 2 && "Below Average"}
                {rating === 1 && "Poor"}
              </p>
            )}
          </div>

          {/* Category Ratings */}
          <div className="space-y-3">
            <Label>Category Ratings</Label>
            <div className="space-y-2">
              <CategoryRating
                label="Professionalism"
                value={categoryRatings.professionalism}
                onChange={(value) =>
                  setCategoryRatings({ ...categoryRatings, professionalism: value })
                }
              />
              <CategoryRating
                label="Quality"
                value={categoryRatings.quality}
                onChange={(value) =>
                  setCategoryRatings({ ...categoryRatings, quality: value })
                }
              />
              <CategoryRating
                label="Communication"
                value={categoryRatings.communication}
                onChange={(value) =>
                  setCategoryRatings({ ...categoryRatings, communication: value })
                }
              />
              <CategoryRating
                label="Timeliness"
                value={categoryRatings.timeliness}
                onChange={(value) =>
                  setCategoryRatings({ ...categoryRatings, timeliness: value })
                }
              />
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Review Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Summarize your experience..."
              maxLength={100}
            />
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <Label htmlFor="comment">Your Review</Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share details about your experience..."
              rows={5}
              maxLength={1000}
            />
            <p className="text-xs text-muted-foreground text-right">
              {comment.length}/1000 characters
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={createReview.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={rating === 0 || createReview.isPending}
          >
            {createReview.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Submit Review
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
