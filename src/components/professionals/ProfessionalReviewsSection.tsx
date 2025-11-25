import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useReviewSystem } from '@/hooks/useReviewSystem';
import { ReviewsList } from '@/components/reviews/ReviewsList';
import { Skeleton } from '@/components/ui/skeleton';

interface ProfessionalReviewsSectionProps {
  professionalId: string;
}

export const ProfessionalReviewsSection = ({ 
  professionalId
}: ProfessionalReviewsSectionProps) => {
  const { 
    reviews, 
    isLoading, 
    overallRating, 
    totalReviews, 
    averageRatings,
    respondToReview 
  } = useReviewSystem(professionalId);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Reviews & Ratings</CardTitle>
        </CardHeader>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">No reviews yet</p>
        </CardContent>
      </Card>
    );
  }

  // Calculate rating distribution
  const ratingDistribution = reviews.reduce((acc, review) => {
    const rating = Math.round(review.overall_rating);
    acc[rating] = (acc[rating] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  return (
    <ReviewsList
      reviews={reviews}
      averageRating={overallRating || 0}
      totalReviews={totalReviews}
      averageRatings={averageRatings}
      ratingDistribution={ratingDistribution}
      onRespond={(reviewId, responseText) => respondToReview.mutate({ reviewId, responseText })}
      isResponding={respondToReview.isPending}
    />
  );
};
