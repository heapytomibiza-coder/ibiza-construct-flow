import { useState } from 'react';
import { Star, ThumbsUp, ThumbsDown, Flag, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';

interface ReviewCardProps {
  review: {
    id: string;
    reviewer_name: string;
    reviewer_avatar?: string;
    rating: number;
    title: string;
    comment: string;
    category_ratings?: Record<string, number>;
    is_verified: boolean;
    helpful_count: number;
    unhelpful_count?: number;
    response_text?: string;
    response_at?: string;
    created_at: string;
  };
  canRespond?: boolean;
  onMarkHelpful?: (reviewId: string, isHelpful: boolean) => void;
  onReport?: (reviewId: string, reason: string) => void;
  onRespond?: (reviewId: string, response: string) => void;
}

export function ReviewCard({
  review,
  canRespond,
  onMarkHelpful,
  onReport,
  onRespond,
}: ReviewCardProps) {
  const [showResponse, setShowResponse] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState('');

  const handleSubmitResponse = () => {
    if (responseText.trim() && onRespond) {
      onRespond(review.id, responseText);
      setShowResponse(false);
      setResponseText('');
    }
  };

  const handleSubmitReport = () => {
    if (reportReason.trim() && onReport) {
      onReport(review.id, reportReason);
      setShowReport(false);
      setReportReason('');
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={review.reviewer_avatar} />
              <AvatarFallback>
                {review.reviewer_name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold">{review.reviewer_name}</p>
                {review.is_verified && (
                  <Badge variant="secondary" className="text-xs">
                    Verified Purchase
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {format(new Date(review.created_at), 'MMM dd, yyyy')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < review.rating
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-muted-foreground'
                }`}
              />
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <h4 className="font-semibold mb-2">{review.title}</h4>
          <p className="text-muted-foreground">{review.comment}</p>
        </div>

        {review.category_ratings && Object.keys(review.category_ratings).length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(review.category_ratings).map(([category, rating]) => (
              <div key={category} className="text-sm">
                <span className="text-muted-foreground capitalize">
                  {category.replace('_', ' ')}:
                </span>
                <span className="ml-2 font-medium">{rating}/5</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2">
          {onMarkHelpful && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onMarkHelpful(review.id, true)}
              >
                <ThumbsUp className="h-4 w-4 mr-1" />
                Helpful ({review.helpful_count})
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onMarkHelpful(review.id, false)}
              >
                <ThumbsDown className="h-4 w-4 mr-1" />
                {review.unhelpful_count && `(${review.unhelpful_count})`}
              </Button>
            </>
          )}
          {onReport && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowReport(!showReport)}
            >
              <Flag className="h-4 w-4 mr-1" />
              Report
            </Button>
          )}
          {canRespond && !review.response_text && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowResponse(!showResponse)}
            >
              <MessageSquare className="h-4 w-4 mr-1" />
              Respond
            </Button>
          )}
        </div>

        {showReport && (
          <div className="space-y-2 pt-2 border-t">
            <Textarea
              placeholder="Why are you reporting this review?"
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              rows={2}
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSubmitReport}>
                Submit Report
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowReport(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {showResponse && (
          <div className="space-y-2 pt-2 border-t">
            <Textarea
              placeholder="Write your response..."
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
              rows={3}
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSubmitResponse}>
                Post Response
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowResponse(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {review.response_text && (
          <div className="bg-muted p-4 rounded-lg border-l-4 border-primary">
            <p className="text-sm font-semibold mb-1">Response from Professional</p>
            <p className="text-sm text-muted-foreground">{review.response_text}</p>
            {review.response_at && (
              <p className="text-xs text-muted-foreground mt-2">
                {format(new Date(review.response_at), 'MMM dd, yyyy')}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
