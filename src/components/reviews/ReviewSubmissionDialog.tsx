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
import { useReviewSystem } from "@/hooks/useReviewSystem";
import type { CategoryRatings } from "@/types/review";

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
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [categoryRatings, setCategoryRatings] = useState<CategoryRatings>({
    timeliness: 0,
    communication: 0,
    value: 0,
    quality: 0,
    professionalism: 0,
  });

  const { submitReview } = useReviewSystem();

  const handleSubmit = async () => {
    const allRatingsSet = Object.values(categoryRatings).every(r => r > 0);
    if (!allRatingsSet) return;

    submitReview.mutate({
      jobId,
      contractId,
      revieweeId,
      ratings: categoryRatings,
      title,
      comment,
    });

    // Reset form
    setTitle("");
    setComment("");
    setCategoryRatings({
      timeliness: 0,
      communication: 0,
      value: 0,
      quality: 0,
      professionalism: 0,
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
          {/* Category Ratings */}
          <div className="space-y-3">
            <Label>Rate Your Experience *</Label>
            <div className="space-y-2">
              <CategoryRating
                label="Timeliness"
                value={categoryRatings.timeliness}
                onChange={(value) =>
                  setCategoryRatings({ ...categoryRatings, timeliness: value })
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
                label="Value for Money"
                value={categoryRatings.value}
                onChange={(value) =>
                  setCategoryRatings({ ...categoryRatings, value: value })
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
                label="Professionalism"
                value={categoryRatings.professionalism}
                onChange={(value) =>
                  setCategoryRatings({ ...categoryRatings, professionalism: value })
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
            disabled={submitReview.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!Object.values(categoryRatings).every(r => r > 0) || submitReview.isPending}
          >
            {submitReview.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Submit Review
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
