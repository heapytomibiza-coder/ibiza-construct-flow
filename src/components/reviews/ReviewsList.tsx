import { useState } from 'react';
import { ReviewCard } from './ReviewCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, ImageIcon, CheckCircle } from 'lucide-react';
import { ReviewsSummaryCard } from './ReviewsSummaryCard';
import { AISummaryCard } from './AISummaryCard';
import { CategoryRatingsCard } from './CategoryRatingsCard';
import { Badge } from '@/components/ui/badge';
import { useCategoryRatings } from '@/hooks/reviews/useCategoryRatings';
import { useReviewSummary } from '@/hooks/reviews/useReviewSummary';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { ReviewWithDetails } from '@/types/review';

interface ReviewsListProps {
  reviews: ReviewWithDetails[];
  averageRating: number;
  totalReviews: number;
  averageRatings?: any;
  ratingDistribution?: Record<number, number>;
  professionalId?: string;
  microServiceId?: string;
  onRespond?: (reviewId: string, response: string) => void;
  onVote?: (reviewId: string, voteType: 'helpful' | 'not_helpful') => void;
  isResponding?: boolean;
  showAISummary?: boolean;
  showCategoryRatings?: boolean;
}

export const ReviewsList = ({
  reviews,
  averageRating,
  totalReviews,
  averageRatings,
  ratingDistribution,
  professionalId,
  microServiceId,
  onRespond,
  onVote,
  isResponding,
  showAISummary = true,
  showCategoryRatings = true,
}: ReviewsListProps) => {
  // Fetch AI summary and category ratings
  const { data: categoryRatings } = useCategoryRatings(professionalId || '');
  const { 
    summary, 
    generateSummary, 
    isGenerating 
  } = useReviewSummary(professionalId || '', microServiceId);
  const [sortBy, setSortBy] = useState<'recent' | 'helpful' | 'rating_high' | 'rating_low'>('recent');
  const [filterRating, setFilterRating] = useState<number | 'all'>('all');
  const [filterVerified, setFilterVerified] = useState(false);
  const [filterPhotos, setFilterPhotos] = useState(false);

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

  // Filter reviews
  const filteredReviews = reviews.filter((review) => {
    if (filterRating !== 'all' && Math.round(review.overall_rating) !== filterRating) {
      return false;
    }
    if (filterVerified && !review.is_verified) {
      return false;
    }
    if (filterPhotos && (!review.photos || review.photos.length === 0)) {
      return false;
    }
    return true;
  });

  // Sort reviews
  const sortedReviews = [...filteredReviews].sort((a, b) => {
    switch (sortBy) {
      case 'helpful':
        return (b.helpful_count || 0) - (a.helpful_count || 0);
      case 'rating_high':
        return b.overall_rating - a.overall_rating;
      case 'rating_low':
        return a.overall_rating - b.overall_rating;
      case 'recent':
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  const activeFiltersCount =
    (filterRating !== 'all' ? 1 : 0) +
    (filterVerified ? 1 : 0) +
    (filterPhotos ? 1 : 0);

  const clearFilters = () => {
    setFilterRating('all');
    setFilterVerified(false);
    setFilterPhotos(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Reviews Summary - Left Side (1/3) */}
      <div className="lg:col-span-1 space-y-6">
        {/* AI-Powered Summary */}
        {showAISummary && professionalId && (
          <AISummaryCard
            summary={summary}
            onRegenerate={() => generateSummary.mutate()}
            isGenerating={isGenerating}
            showRegenerateButton={totalReviews >= 3}
          />
        )}
        
        {/* Category Ratings */}
        {showCategoryRatings && categoryRatings && categoryRatings.length > 0 && (
          <CategoryRatingsCard ratings={categoryRatings} />
        )}
        
        {/* Overall Summary */}
        <ReviewsSummaryCard
          overallRating={averageRating}
          totalReviews={totalReviews}
          averageRatings={averageRatings}
          ratingDistribution={ratingDistribution}
        />
      </div>

      {/* Reviews List - Right Side (2/3) */}
      <div className="lg:col-span-2 space-y-4">
        {/* Filters & Sort Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <CardTitle>Reviews ({filteredReviews.length})</CardTitle>
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary">
                    {activeFiltersCount} filter{activeFiltersCount > 1 ? 's' : ''}
                  </Badge>
                )}
              </div>
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="helpful">Most Helpful</SelectItem>
                  <SelectItem value="rating_high">Highest Rating</SelectItem>
                  <SelectItem value="rating_low">Lowest Rating</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center gap-2 flex-wrap mt-4">
              <Select
                value={filterRating === 'all' ? 'all' : String(filterRating)}
                onValueChange={(value) =>
                  setFilterRating(value === 'all' ? 'all' : Number(value))
                }
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="All Ratings" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ratings</SelectItem>
                  <SelectItem value="5">5 Stars</SelectItem>
                  <SelectItem value="4">4 Stars</SelectItem>
                  <SelectItem value="3">3 Stars</SelectItem>
                  <SelectItem value="2">2 Stars</SelectItem>
                  <SelectItem value="1">1 Star</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant={filterVerified ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterVerified(!filterVerified)}
                className="gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                Verified Only
              </Button>

              <Button
                variant={filterPhotos ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterPhotos(!filterPhotos)}
                className="gap-2"
              >
                <ImageIcon className="h-4 w-4" />
                With Photos
              </Button>

              {activeFiltersCount > 0 && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear Filters
                </Button>
              )}
            </div>
          </CardHeader>
        </Card>

        {/* Reviews */}
        {sortedReviews.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No reviews match your filters</p>
            </CardContent>
          </Card>
        ) : (
          sortedReviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              onRespond={onRespond}
              onVote={onVote}
              isResponding={isResponding}
              showCategoryRatings={true}
            />
          ))
        )}
      </div>
    </div>
  );
};
