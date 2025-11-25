import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ReviewCard } from './ReviewCard';
import { ReviewsList } from './ReviewsList';
import { useReviewSystem } from '@/hooks/useReviewSystem';
import { Star } from 'lucide-react';

interface ReviewsSectionProps {
  professionalId: string;
  canRespond?: boolean;
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({
  professionalId,
  canRespond = false,
}) => {
  const { 
    reviews, 
    isLoading: loading, 
    overallRating, 
    totalReviews, 
    averageRatings,
    respondToReview,
    voteReview 
  } = useReviewSystem(professionalId);

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">Loading reviews...</p>
        </CardContent>
      </Card>
    );
  }

  // Calculate rating distribution
  const ratingDistribution = reviews?.reduce((acc, review) => {
    const rating = Math.round(review.overall_rating);
    acc[rating] = (acc[rating] || 0) + 1;
    return acc;
  }, {} as Record<number, number>) || {};

  return (
    <ReviewsList
      reviews={reviews || []}
      averageRating={overallRating || 0}
      totalReviews={totalReviews}
      averageRatings={averageRatings}
      ratingDistribution={ratingDistribution}
      onRespond={canRespond ? (reviewId, responseText) => respondToReview.mutate({ reviewId, responseText }) : undefined}
      onVote={(reviewId, voteType) => voteReview.mutate({ reviewId, voteType })}
      isResponding={respondToReview.isPending}
    />
  );
};
