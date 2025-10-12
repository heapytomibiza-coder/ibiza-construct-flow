import { ReviewCard } from './ReviewCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, TrendingUp } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface ReviewsListProps {
  reviews: any[];
  averageRating: number;
  totalReviews: number;
  ratingDistribution?: Record<number, number>;
  onRespond?: (reviewId: string, response: string) => void;
  isResponding?: boolean;
}

export const ReviewsList = ({
  reviews,
  averageRating,
  totalReviews,
  ratingDistribution,
  onRespond,
  isResponding,
}: ReviewsListProps) => {
  if (!reviews || reviews.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Star className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">No reviews yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Rating Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Average Rating */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-4xl font-bold">{averageRating.toFixed(1)}</span>
                <Star className="w-8 h-8 fill-yellow-400 text-yellow-400" />
              </div>
              <p className="text-sm text-muted-foreground">
                Based on {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
              </p>
            </div>

            {/* Rating Distribution */}
            {ratingDistribution && (
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = ratingDistribution[star] || 0;
                  const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                  return (
                    <div key={star} className="flex items-center gap-2">
                      <span className="text-sm w-12">{star} stars</span>
                      <Progress value={percentage} className="flex-1" />
                      <span className="text-sm text-muted-foreground w-8 text-right">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <ReviewCard
            key={review.id}
            review={review}
            onRespond={onRespond}
            isResponding={isResponding}
          />
        ))}
      </div>
    </div>
  );
};
