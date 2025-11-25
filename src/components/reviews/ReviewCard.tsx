import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Star, MessageSquare, CheckCircle, ThumbsUp, ThumbsDown, ShieldCheck } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';
import { CategoryRatingsDisplay } from './CategoryRatingsDisplay';
import { ReviewPhotoGallery } from './ReviewPhotoGallery';
import type { ReviewWithDetails } from '@/types/review';

interface ReviewCardProps {
  review: ReviewWithDetails;
  onRespond?: (reviewId: string, response: string) => void;
  onVote?: (reviewId: string, voteType: 'helpful' | 'not_helpful') => void;
  isResponding?: boolean;
  showCategoryRatings?: boolean;
}

export const ReviewCard = ({ 
  review, 
  onRespond,
  onVote,
  isResponding, 
  showCategoryRatings = true 
}: ReviewCardProps) => {
  const { user } = useAuth();
  const [showResponseForm, setShowResponseForm] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);

  const canRespond = user?.id === review.reviewee_id && !review.response_text && onRespond;

  const handleSubmitResponse = () => {
    if (responseText.trim() && onRespond) {
      onRespond(review.id, responseText.trim());
      setResponseText('');
      setShowResponseForm(false);
    }
  };

  const handleVote = (voteType: 'helpful' | 'not_helpful') => {
    if (onVote && user) {
      onVote(review.id, voteType);
    }
  };

  const categoryRatings = {
    timeliness: review.timeliness_rating,
    communication: review.communication_rating,
    value: review.value_rating,
    quality: review.quality_rating,
    professionalism: review.professionalism_rating,
  };

  return (
    <>
      <Card className="p-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={review.reviewer?.avatar_url || undefined} />
            <AvatarFallback>
              {(review.reviewer?.full_name || 'U').charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold">
                    {review.reviewer?.full_name || 'Anonymous'}
                  </p>
                  {review.is_verified && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge variant="secondary" className="text-xs flex items-center gap-1 cursor-help">
                            <ShieldCheck className="w-3 h-3" />
                            Verified Purchase
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">
                            Verified review from a completed contract. This review comes from a real transaction.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                </p>
              </div>

              {/* Overall Rating */}
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold">{review.overall_rating.toFixed(1)}</span>
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= review.overall_rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-muted-foreground'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Title */}
            {review.title && (
              <h4 className="font-semibold">{review.title}</h4>
            )}

            {/* Comment */}
            {review.comment && (
              <p className="text-muted-foreground whitespace-pre-wrap">
                {review.comment}
              </p>
            )}

            {/* Category Ratings */}
            {showCategoryRatings && (
              <CategoryRatingsDisplay ratings={categoryRatings} size="sm" />
            )}

            {/* Photos */}
            {review.photos && review.photos.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {review.photos.map((photo, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedPhotoIndex(index)}
                    className="relative w-24 h-24 rounded-lg overflow-hidden hover:opacity-90 transition-opacity border border-border"
                  >
                    <img
                      src={photo}
                      alt={`Review photo ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Professional Response */}
            {review.response_text && (
              <div className="bg-muted rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="w-4 h-4 text-muted-foreground" />
                  <p className="text-sm font-medium">Professional Response</p>
                </div>
                <p className="text-sm text-muted-foreground">{review.response_text}</p>
                {review.response_at && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {formatDistanceToNow(new Date(review.response_at), { addSuffix: true })}
                  </p>
                )}
              </div>
            )}

            {/* Response Form */}
            {canRespond && !showResponseForm && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowResponseForm(true)}
                className="mt-2"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Respond
              </Button>
            )}

            {showResponseForm && (
              <div className="mt-4 space-y-2">
                <Textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder="Write your response..."
                  rows={3}
                />
                <div className="flex gap-2">
                  <Button
                    onClick={handleSubmitResponse}
                    disabled={!responseText.trim() || isResponding}
                    size="sm"
                  >
                    Post Response
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowResponseForm(false);
                      setResponseText('');
                    }}
                    size="sm"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {/* Actions */}
            {user && (
              <div className="flex items-center gap-4 pt-2 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2"
                  onClick={() => handleVote('helpful')}
                >
                  <ThumbsUp className="w-4 h-4" />
                  Helpful ({review.helpful_count})
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2"
                  onClick={() => handleVote('not_helpful')}
                >
                  <ThumbsDown className="w-4 h-4" />
                  ({review.not_helpful_count})
                </Button>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Photo Gallery */}
      {review.photos && selectedPhotoIndex !== null && (
        <ReviewPhotoGallery
          photos={review.photos}
          isOpen={selectedPhotoIndex !== null}
          onClose={() => setSelectedPhotoIndex(null)}
          initialIndex={selectedPhotoIndex}
        />
      )}
    </>
  );
};
