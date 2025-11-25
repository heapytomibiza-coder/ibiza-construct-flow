import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { CategoryRatingsDisplay } from './CategoryRatingsDisplay';
import type { CategoryRatings } from '@/types/review';

interface ReviewsSummaryCardProps {
  overallRating: number;
  totalReviews: number;
  averageRatings?: Partial<CategoryRatings>;
  ratingDistribution?: { [key: number]: number };
}

export function ReviewsSummaryCard({
  overallRating,
  totalReviews,
  averageRatings,
  ratingDistribution = {},
}: ReviewsSummaryCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-400" />
          Reviews & Ratings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Rating */}
        <div className="text-center">
          <div className="text-6xl font-bold mb-2">{overallRating.toFixed(1)}</div>
          <div className="flex items-center justify-center gap-1 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-6 h-6 ${
                  star <= Math.round(overallRating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            Based on {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
          </p>
        </div>

        {/* Rating Distribution */}
        {Object.keys(ratingDistribution).length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold text-sm mb-3">Rating Distribution</h4>
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = ratingDistribution[rating] || 0;
              const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
              
              return (
                <div key={rating} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 w-12">
                    <span className="text-sm font-medium">{rating}</span>
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  </div>
                  <Progress value={percentage} className="flex-1 h-2" />
                  <span className="text-sm text-muted-foreground w-8 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Category Ratings */}
        {averageRatings && Object.keys(averageRatings).length > 0 && (
          <div>
            <h4 className="font-semibold text-sm mb-3">Category Ratings</h4>
            <CategoryRatingsDisplay ratings={averageRatings} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
