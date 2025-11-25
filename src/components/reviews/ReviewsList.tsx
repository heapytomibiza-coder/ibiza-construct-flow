import { ReviewCard } from './ReviewCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { ReviewsSummaryCard } from './ReviewsSummaryCard';
import type { ReviewWithDetails } from '@/types/review';

interface ReviewsListProps {
  reviews: ReviewWithDetails[];
  averageRating: number;
  totalReviews: number;
  averageRatings?: any;
  ratingDistribution?: Record<number, number>;
  onRespond?: (reviewId: string, response: string) => void;
  isResponding?: boolean;
}

export const ReviewsList = ({
  reviews,
  averageRating,
  totalReviews,
  averageRatings,
  ratingDistribution,
  onRespond,
  isResponding,
}: ReviewsListProps) => {
  if (!reviews || reviews.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Star className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-lg font-semibold mb-2">No reviews yet</p>
          <p className="text-sm text-muted-foreground">Be the first to leave a review!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Reviews Summary - Left Side (1/3) */}
      <div className="lg:col-span-1">
        <ReviewsSummaryCard
          overallRating={averageRating}
          totalReviews={totalReviews}
          averageRatings={averageRatings}
          ratingDistribution={ratingDistribution}
        />
      </div>

      {/* Reviews List - Right Side (2/3) */}
      <div className="lg:col-span-2 space-y-4">
        <h3 className="text-xl font-semibold mb-4">All Reviews ({totalReviews})</h3>
        {reviews.map((review) => (
          <ReviewCard
            key={review.id}
            review={review}
            onRespond={onRespond}
            isResponding={isResponding}
            showCategoryRatings={true}
          />
        ))}
      </div>
    </div>
  );
};
