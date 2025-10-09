import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ReviewCard } from './ReviewCard';
import { useReviews } from '@/hooks/useReviews';
import { Star } from 'lucide-react';

interface ReviewsSectionProps {
  professionalId: string;
  canRespond?: boolean;
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({
  professionalId,
  canRespond = false,
}) => {
  const { reviews, loading, stats, respondToReview } = useReviews({ professionalId });
  const [sortBy, setSortBy] = useState<'recent' | 'highest' | 'lowest'>('recent');

  const sortedReviews = [...reviews].sort((a, b) => {
    switch (sortBy) {
      case 'highest':
        return b.rating - a.rating;
      case 'lowest':
        return a.rating - b.rating;
      case 'recent':
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  const renderRatingBar = (rating: number, count: number, total: number) => {
    const percentage = total > 0 ? (count / total) * 100 : 0;
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 w-12">
          <span className="text-sm font-medium">{rating}</span>
          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
        </div>
        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-yellow-400 transition-all"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="text-sm text-muted-foreground w-8">{count}</span>
      </div>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">Loading reviews...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Rating Overview - Left Side */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5" />
            Reviews & Ratings
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Overall Rating */}
          <div className="text-center mb-6">
            <div className="text-5xl font-bold mb-2">{stats?.average_rating?.toFixed(1) || 0}</div>
            <div className="flex items-center justify-center gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-5 h-5 ${
                    star <= Math.round(stats?.average_rating || 0)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              Based on {stats?.total_reviews || 0} {stats?.total_reviews === 1 ? 'review' : 'reviews'}
            </p>
          </div>

          {/* Rating Distribution */}
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) =>
              renderRatingBar(
                rating,
                stats?.rating_distribution?.[rating] || 0,
                stats?.total_reviews || 0
              )
            )}
          </div>
        </CardContent>
      </Card>

      {/* Reviews List - Right Side with Scroll */}
      <Card className="flex flex-col">
        <CardHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle>All Reviews ({reviews.length})</CardTitle>
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="highest">Highest Rated</SelectItem>
                <SelectItem value="lowest">Lowest Rated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="overflow-y-auto max-h-[600px]">
          {sortedReviews.length === 0 ? (
            <div className="text-center py-8">
              <Star className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No reviews yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedReviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  canRespond={canRespond}
                  onRespond={respondToReview}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
