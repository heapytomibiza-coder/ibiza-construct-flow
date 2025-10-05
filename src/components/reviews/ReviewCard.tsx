import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, CheckCircle, MessageSquare } from 'lucide-react';
import { Review } from '@/hooks/useReviews';
import { format } from 'date-fns';

interface ReviewCardProps {
  review: Review;
  canRespond?: boolean;
  onRespond?: (reviewId: string, response: string) => void;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({
  review,
  canRespond = false,
  onRespond,
}) => {
  const [showResponseForm, setShowResponseForm] = useState(false);
  const [response, setResponse] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitResponse = async () => {
    if (!response.trim() || !onRespond) return;
    
    setSubmitting(true);
    try {
      await onRespond(review.id, response);
      setShowResponseForm(false);
      setResponse('');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <Card>
      <CardContent className="pt-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={review.client?.avatar_url} />
              <AvatarFallback>
                {review.client?.full_name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold">{review.client?.full_name || 'Anonymous'}</h4>
                {review.is_verified && (
                  <Badge variant="secondary" className="text-xs">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
              {renderStars(review.rating)}
              <p className="text-xs text-muted-foreground mt-1">
                {format(new Date(review.created_at), 'MMM dd, yyyy')}
              </p>
            </div>
          </div>
        </div>

        {/* Comment */}
        {review.comment && (
          <p className="text-sm mb-4">{review.comment}</p>
        )}

        {/* Professional Response */}
        {review.response && (
          <div className="mt-4 p-4 bg-muted rounded-lg border-l-4 border-primary">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold">Response from Professional</span>
              <span className="text-xs text-muted-foreground">
                {format(new Date(review.responded_at!), 'MMM dd, yyyy')}
              </span>
            </div>
            <p className="text-sm">{review.response}</p>
          </div>
        )}

        {/* Response Form */}
        {canRespond && !review.response && (
          <div className="mt-4">
            {!showResponseForm ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowResponseForm(true)}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Respond
              </Button>
            ) : (
              <div className="space-y-3">
                <Textarea
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  placeholder="Write a professional response..."
                  rows={3}
                  maxLength={500}
                />
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowResponseForm(false);
                      setResponse('');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSubmitResponse}
                    disabled={!response.trim() || submitting}
                  >
                    {submitting ? 'Posting...' : 'Post Response'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
