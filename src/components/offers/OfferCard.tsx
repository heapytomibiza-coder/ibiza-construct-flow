import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, Clock, MapPin, MessageCircle, CheckCircle, X } from 'lucide-react';

interface OfferCardProps {
  offer: {
    id: string;
    taskerId: string;
    taskerName: string;
    taskerAvatar?: string;
    taskerRating: number;
    taskerReviews: number;
    amount: number;
    type: 'fixed' | 'hourly';
    message?: string;
    estimatedDuration?: string;
    location?: string;
    status: 'sent' | 'accepted' | 'declined' | 'withdrawn';
    createdAt: string;
  };
  onAccept?: () => void;
  onDecline?: () => void;
  onMessage?: () => void;
  viewOnly?: boolean;
}

export const OfferCard = ({ 
  offer, 
  onAccept, 
  onDecline, 
  onMessage, 
  viewOnly = false 
}: OfferCardProps) => {
  const getStatusColor = () => {
    switch (offer.status) {
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'declined':
        return 'bg-red-100 text-red-800';
      case 'withdrawn':
        return 'bg-gray-100 text-gray-600';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getStatusIcon = () => {
    switch (offer.status) {
      case 'accepted':
        return <CheckCircle className="w-4 h-4" />;
      case 'declined':
        return <X className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <Card className="p-6 hover:shadow-md transition-shadow">
      <div className="space-y-4">
        {/* Header with professional info */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="w-12 h-12">
              <AvatarImage src={offer.taskerAvatar} />
              <AvatarFallback>{offer.taskerName[0]}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">{offer.taskerName}</h3>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="ml-1">{offer.taskerRating.toFixed(1)}</span>
                </div>
                <span>•</span>
                <span>{offer.taskerReviews} reviews</span>
              </div>
            </div>
          </div>
          
          <Badge className={getStatusColor()}>
            <div className="flex items-center space-x-1">
              {getStatusIcon()}
              <span className="capitalize">{offer.status}</span>
            </div>
          </Badge>
        </div>

        {/* Offer details */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-gradient-card rounded-lg">
          <div>
            <p className="text-sm text-muted-foreground">Offer Amount</p>
            <p className="text-2xl font-bold text-primary">
              €{offer.amount}
              {offer.type === 'hourly' && <span className="text-sm font-normal">/hour</span>}
            </p>
          </div>
          
          {offer.estimatedDuration && (
            <div>
              <p className="text-sm text-muted-foreground">Duration</p>
              <p className="font-medium flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {offer.estimatedDuration}
              </p>
            </div>
          )}
        </div>

        {/* Location */}
        {offer.location && (
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>{offer.location}</span>
          </div>
        )}

        {/* Message */}
        {offer.message && (
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm">{offer.message}</p>
          </div>
        )}

        {/* Actions */}
        {!viewOnly && offer.status === 'sent' && (
          <div className="flex space-x-3 pt-2">
            <Button onClick={onAccept} className="flex-1">
              <CheckCircle className="w-4 h-4 mr-2" />
              Accept Offer
            </Button>
            <Button variant="outline" onClick={onDecline}>
              <X className="w-4 h-4 mr-2" />
              Decline
            </Button>
            <Button variant="ghost" size="sm" onClick={onMessage}>
              <MessageCircle className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Created date */}
        <div className="text-xs text-muted-foreground pt-2 border-t">
          Received {new Date(offer.createdAt).toLocaleDateString()}
        </div>
      </div>
    </Card>
  );
};