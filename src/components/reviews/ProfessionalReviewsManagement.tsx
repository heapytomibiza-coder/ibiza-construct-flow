import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ReviewCard } from './ReviewCard';
import { useReviews } from '@/hooks/useReviews';
import { Star, TrendingUp } from 'lucide-react';

interface ProfessionalReviewsManagementProps {
  professionalId: string;
}

export const ProfessionalReviewsManagement: React.FC<ProfessionalReviewsManagementProps> = ({
  professionalId,
}) => {
  const { reviews, loading, stats, respondToReview } = useReviews({ professionalId });

  const pendingResponses = reviews.filter(r => !r.response_text);

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
    <div className="space-y-4">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <Star className="w-8 h-8 mx-auto mb-2 fill-yellow-400 text-yellow-400" />
            <div className="text-2xl font-bold">{stats?.average_rating?.toFixed(1) || 0}</div>
            <p className="text-xs text-muted-foreground">Average Rating</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <TrendingUp className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <div className="text-2xl font-bold">{stats?.total_reviews || 0}</div>
            <p className="text-xs text-muted-foreground">Total Reviews</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-2xl font-bold">{pendingResponses.length}</div>
            <p className="text-xs text-muted-foreground">Pending Responses</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-2xl font-bold">
              {Math.round((reviews.filter(r => r.response_text).length / (stats?.total_reviews || 1)) * 100)}%
            </div>
            <p className="text-xs text-muted-foreground">Response Rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Reviews Requiring Response */}
      {pendingResponses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pending Responses ({pendingResponses.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingResponses.map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  canRespond={true}
                  onRespond={respondToReview}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Reviews */}
      <Card>
        <CardHeader>
          <CardTitle>All Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          {reviews.length === 0 ? (
            <div className="text-center py-8">
              <Star className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No reviews yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  canRespond={!review.response_text}
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
