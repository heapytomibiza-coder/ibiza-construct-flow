import { Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface RatingsSummaryProps {
  stats: {
    total_reviews: number;
    average_rating: number;
    rating_distribution: Record<string, number>;
    category_averages?: Record<string, number>;
    response_rate?: number;
  };
}

export function RatingsSummary({ stats }: RatingsSummaryProps) {
  const totalReviews = stats.total_reviews || 0;
  const avgRating = stats.average_rating || 0;
  const distribution = stats.rating_distribution || {};

  const getRatingPercentage = (rating: number) => {
    const count = distribution[rating.toString()] || 0;
    return totalReviews > 0 ? (count / totalReviews) * 100 : 0;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ratings Overview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Rating */}
        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="text-4xl font-bold">{avgRating.toFixed(1)}</div>
            <div className="flex items-center justify-center gap-1 my-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-5 w-5 ${
                    i < Math.round(avgRating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-muted-foreground'
                  }`}
                />
              ))}
            </div>
            <div className="text-sm text-muted-foreground">
              {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
            </div>
          </div>

          {/* Rating Distribution */}
          <div className="flex-1 space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => (
              <div key={rating} className="flex items-center gap-2">
                <div className="flex items-center gap-1 w-12">
                  <span className="text-sm">{rating}</span>
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                </div>
                <Progress
                  value={getRatingPercentage(rating)}
                  className="h-2 flex-1"
                />
                <span className="text-sm text-muted-foreground w-12 text-right">
                  {distribution[rating.toString()] || 0}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Category Averages */}
        {stats.category_averages && Object.keys(stats.category_averages).length > 0 && (
          <div className="space-y-3 pt-4 border-t">
            <h4 className="font-semibold text-sm">Category Ratings</h4>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(stats.category_averages).map(([category, rating]) => (
                <div key={category} className="flex items-center justify-between">
                  <span className="text-sm capitalize">
                    {category.replace('_', ' ')}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="font-medium text-sm">
                      {(rating as number).toFixed(1)}
                    </span>
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Response Rate */}
        {stats.response_rate !== undefined && (
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Response Rate</span>
              <span className="font-semibold">{stats.response_rate.toFixed(0)}%</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
