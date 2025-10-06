import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EnhancedReviewCard } from "./EnhancedReviewCard";
import { RatingSummary } from "./RatingSummary";
import { useEnhancedReviews } from "@/hooks/useEnhancedReviews";
import { Star, Filter } from "lucide-react";

interface ReviewsListProps {
  userId: string;
  canRespond?: boolean;
  currentUserId?: string;
}

export const ReviewsList = ({ userId, canRespond, currentUserId }: ReviewsListProps) => {
  const [minRating, setMinRating] = useState<number | undefined>(undefined);
  const { reviews, isLoading, ratingSummary } = useEnhancedReviews(userId, minRating);

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Loading reviews...</p>
      </div>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <Card className="p-12 text-center">
        <Star className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Reviews Yet</h3>
        <p className="text-muted-foreground">
          This professional hasn't received any reviews yet.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      {ratingSummary && <RatingSummary summary={ratingSummary} />}

      {/* Filters */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filter Reviews</span>
          </div>

          <Select
            value={minRating?.toString() || "all"}
            onValueChange={(value) => 
              setMinRating(value === "all" ? undefined : parseInt(value))
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All ratings" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All ratings</SelectItem>
              <SelectItem value="5">5 stars only</SelectItem>
              <SelectItem value="4">4+ stars</SelectItem>
              <SelectItem value="3">3+ stars</SelectItem>
              <SelectItem value="2">2+ stars</SelectItem>
              <SelectItem value="1">1+ star</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Reviews */}
      <div className="space-y-4">
        {reviews.map((review: any) => (
          <EnhancedReviewCard
            key={review.id}
            review={review}
            canRespond={canRespond}
            currentUserId={currentUserId}
          />
        ))}
      </div>

      {/* Load More (placeholder) */}
      {reviews.length >= 20 && (
        <div className="text-center">
          <Button variant="outline">Load More Reviews</Button>
        </div>
      )}
    </div>
  );
};
