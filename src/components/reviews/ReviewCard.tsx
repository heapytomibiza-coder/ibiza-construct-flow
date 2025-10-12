import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';

interface ReviewCardProps {
  review: {
    id: string;
    rating: number;
    comment?: string;
    response?: string;
    created_at: string;
    reviewer: {
      id: string;
      full_name?: string;
      display_name?: string;
      avatar_url?: string;
    };
    reviewee: {
      id: string;
      full_name?: string;
      display_name?: string;
    };
  };
  onRespond?: (reviewId: string, response: string) => void;
  isResponding?: boolean;
}

export const ReviewCard = ({ review, onRespond, isResponding }: ReviewCardProps) => {
  const { user } = useAuth();
  const [showResponseForm, setShowResponseForm] = useState(false);
  const [responseText, setResponseText] = useState('');

  const canRespond = user?.id === review.reviewee.id && !review.response && onRespond;

  const handleSubmitResponse = () => {
    if (responseText.trim() && onRespond) {
      onRespond(review.id, responseText.trim());
      setResponseText('');
      setShowResponseForm(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-start gap-4">
        <Avatar className="h-12 w-12">
          <AvatarImage src={review.reviewer.avatar_url} />
          <AvatarFallback>
            {(review.reviewer.full_name || review.reviewer.display_name || 'U').charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="font-semibold">
                {review.reviewer.full_name || review.reviewer.display_name || 'Anonymous'}
              </p>
              <p className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
              </p>
            </div>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-5 h-5 ${
                    star <= review.rating
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>

          {review.comment && (
            <p className="text-sm text-foreground mb-4">{review.comment}</p>
          )}

          {review.response && (
            <div className="bg-muted rounded-lg p-4 mt-4">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="w-4 h-4 text-muted-foreground" />
                <p className="text-sm font-medium">Response from {review.reviewee.full_name || review.reviewee.display_name}</p>
              </div>
              <p className="text-sm text-muted-foreground">{review.response}</p>
            </div>
          )}

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
        </div>
      </div>
    </Card>
  );
};
