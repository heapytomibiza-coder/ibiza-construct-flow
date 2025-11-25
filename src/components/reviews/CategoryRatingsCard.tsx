import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, TrendingUp } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import type { CategoryRating } from '@/hooks/reviews/useCategoryRatings';

interface CategoryRatingsCardProps {
  ratings: CategoryRating[];
}

export const CategoryRatingsCard = ({ ratings }: CategoryRatingsCardProps) => {
  if (!ratings || ratings.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Ratings by Service Category
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {ratings.map((rating) => (
          <div key={rating.id} className="space-y-3 pb-4 border-b last:border-0 last:pb-0">
            {/* Category Header */}
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold">
                  {rating.micro_service?.name || 'General'}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {rating.total_reviews} {rating.total_reviews === 1 ? 'review' : 'reviews'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">{rating.average_rating.toFixed(1)}</span>
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              </div>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-2">
              {[
                { stars: 5, count: rating.five_star_count },
                { stars: 4, count: rating.four_star_count },
                { stars: 3, count: rating.three_star_count },
                { stars: 2, count: rating.two_star_count },
                { stars: 1, count: rating.one_star_count },
              ].map(({ stars, count }) => {
                const percentage = rating.total_reviews > 0 
                  ? (count / rating.total_reviews) * 100 
                  : 0;

                return (
                  <div key={stars} className="flex items-center gap-2 text-sm">
                    <span className="w-3 text-muted-foreground">{stars}</span>
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <Progress value={percentage} className="flex-1 h-2" />
                    <span className="w-8 text-right text-muted-foreground">{count}</span>
                  </div>
                );
              })}
            </div>

            {/* Category Breakdown */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Timeliness', value: rating.avg_timeliness },
                { label: 'Communication', value: rating.avg_communication },
                { label: 'Value', value: rating.avg_value },
                { label: 'Quality', value: rating.avg_quality },
                { label: 'Professional', value: rating.avg_professionalism },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{item.label}</span>
                  <Badge variant="secondary" className="font-mono">
                    {item.value.toFixed(1)}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
