import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Star, 
  ThumbsUp, 
  ThumbsDown, 
  MessageSquare, 
  Flag,
  CheckCircle 
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useEnhancedReviews } from "@/hooks/useEnhancedReviews";

interface EnhancedReviewCardProps {
  review: any;
  canRespond?: boolean;
  currentUserId?: string;
}

export const EnhancedReviewCard = ({ review, canRespond, currentUserId }: EnhancedReviewCardProps) => {
  const [showResponseForm, setShowResponseForm] = useState(false);
  const [responseText, setResponseText] = useState("");
  const { voteHelpful, respondToReview, flagReview } = useEnhancedReviews();

  const handleVote = (isHelpful: boolean) => {
    voteHelpful.mutate({ reviewId: review.id, isHelpful });
  };

  const handleRespond = async () => {
    if (!responseText.trim()) return;

    await respondToReview.mutateAsync({
      reviewId: review.id,
      responseText,
    });

    setResponseText("");
    setShowResponseForm(false);
  };

  const handleFlag = () => {
    const reason = prompt("Please provide a reason for flagging this review:");
    if (reason) {
      flagReview.mutate({ reviewId: review.id, reason });
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-start gap-4">
        <Avatar className="w-12 h-12">
          <AvatarImage src={review.reviewer_avatar} />
          <AvatarFallback>
            {review.reviewer_name?.[0]?.toUpperCase() || "?"}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">{review.reviewer_name}</span>
                {review.is_verified && (
                  <Badge variant="secondary" className="text-xs">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
              </p>
            </div>

            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${
                    star <= review.rating
                      ? "fill-warning text-warning"
                      : "text-muted-foreground"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Title */}
          {review.title && (
            <h4 className="font-semibold">{review.title}</h4>
          )}

          {/* Comment */}
          {review.comment && (
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {review.comment}
            </p>
          )}

          {/* Category Ratings */}
          {review.category_ratings && Object.keys(review.category_ratings).length > 0 && (
            <div className="flex flex-wrap gap-3">
              {Object.entries(review.category_ratings).map(([category, rating]: [string, any]) => (
                <div key={category} className="flex items-center gap-1 text-xs">
                  <span className="capitalize text-muted-foreground">{category}:</span>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-3 h-3 ${
                          star <= rating
                            ? "fill-warning text-warning"
                            : "text-muted-foreground"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Response */}
          {review.response_text && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="w-4 h-4" />
                <span className="text-sm font-semibold">Response from Professional</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {review.response_text}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                {formatDistanceToNow(new Date(review.response_at), { addSuffix: true })}
              </p>
            </div>
          )}

          {/* Response Form */}
          {canRespond && !review.response_text && showResponseForm && (
            <div className="mt-4 space-y-2">
              <Textarea
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                placeholder="Write your response..."
                rows={3}
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleRespond} disabled={respondToReview.isPending}>
                  Post Response
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setShowResponseForm(false);
                    setResponseText("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-4 pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleVote(true)}
              className="gap-2"
            >
              <ThumbsUp className="w-4 h-4" />
              Helpful ({review.helpful_count})
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleVote(false)}
              className="gap-2"
            >
              <ThumbsDown className="w-4 h-4" />
              ({review.unhelpful_count})
            </Button>

            {canRespond && !review.response_text && !showResponseForm && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowResponseForm(true)}
                className="gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                Respond
              </Button>
            )}

            {currentUserId !== review.reviewer_id && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleFlag}
                className="gap-2 text-muted-foreground"
              >
                <Flag className="w-4 h-4" />
                Flag
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};
