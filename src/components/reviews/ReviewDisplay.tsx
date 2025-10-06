import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Star, ThumbsUp, Flag, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

export interface Review {
  id: string;
  rating: number;
  comment?: string;
  created_at: string;
  reviewer_name?: string;
  reviewer_avatar?: string;
  verified?: boolean;
  photos?: string[];
  helpful_count?: number;
  response?: {
    text: string;
    created_at: string;
  };
  category_ratings?: Record<string, number>;
}

interface ReviewDisplayProps {
  reviews: Review[];
  onMarkHelpful?: (reviewId: string) => void;
  onReport?: (reviewId: string) => void;
  currentUserId?: string;
  loading?: boolean;
}

export default function ReviewDisplay({ 
  reviews, 
  onMarkHelpful,
  onReport,
  currentUserId,
  loading = false 
}: ReviewDisplayProps) {
  const renderStars = (rating: number, size: 'sm' | 'md' = 'md') => {
    const starSize = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4';
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${starSize} ${
              star <= rating 
                ? 'fill-yellow-400 text-yellow-400' 
                : 'text-muted-foreground'
            }`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i} className="p-4 animate-pulse">
            <div className="space-y-3">
              <div className="h-4 bg-muted rounded w-1/3" />
              <div className="h-20 bg-muted rounded" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (!reviews.length) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Star className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p className="text-sm">No reviews yet.</p>
        <p className="text-xs mt-1">Be the first to leave a review!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <Card key={review.id} className="p-4">
          {/* Header */}
          <div className="flex items-start gap-3 mb-3">
            <Avatar>
              <AvatarImage src={review.reviewer_avatar} />
              <AvatarFallback>
                {review.reviewer_name?.[0] || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium">{review.reviewer_name || 'Anonymous'}</span>
                {review.verified && (
                  <Badge variant="secondary" className="text-xs gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Verified
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                {renderStars(review.rating)}
                <span className="text-xs text-muted-foreground">
                  {format(new Date(review.created_at), 'MMM d, yyyy')}
                </span>
              </div>
            </div>
          </div>

          {/* Category ratings */}
          {review.category_ratings && Object.keys(review.category_ratings).length > 0 && (
            <div className="mb-3 space-y-1">
              {Object.entries(review.category_ratings).map(([category, rating]) => (
                <div key={category} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{category}</span>
                  <div className="flex items-center gap-1">
                    {renderStars(rating, 'sm')}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Comment */}
          {review.comment && (
            <p className="text-sm mb-3 whitespace-pre-wrap">{review.comment}</p>
          )}

          {/* Photos */}
          {review.photos && review.photos.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mb-3">
              {review.photos.map((url, idx) => (
                <img
                  key={idx}
                  src={url}
                  alt={`Review photo ${idx + 1}`}
                  className="rounded-lg object-cover h-24 w-full cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => window.open(url, '_blank')}
                />
              ))}
            </div>
          )}

          {/* Response */}
          {review.response && (
            <div className="mt-3 ml-8 p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium">Response</span>
                <span className="text-xs text-muted-foreground">
                  {format(new Date(review.response.created_at), 'MMM d, yyyy')}
                </span>
              </div>
              <p className="text-sm">{review.response.text}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 mt-3 pt-3 border-t">
            {onMarkHelpful && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onMarkHelpful(review.id)}
                className="text-xs"
              >
                <ThumbsUp className="h-3 w-3 mr-1" />
                Helpful {review.helpful_count ? `(${review.helpful_count})` : ''}
              </Button>
            )}
            {onReport && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onReport(review.id)}
                className="text-xs"
              >
                <Flag className="h-3 w-3 mr-1" />
                Report
              </Button>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}
