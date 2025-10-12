import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Clock, User, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface BookingRequestCardProps {
  request: {
    id: string;
    title: string;
    description: string;
    status: string;
    created_at: string;
    preferred_dates: string[];
    location_details?: string;
    special_requirements?: string;
    client?: {
      full_name?: string;
      display_name?: string;
    };
    professional?: {
      full_name?: string;
      display_name?: string;
    };
  };
  onAccept?: (id: string) => void;
  onDecline?: (id: string) => void;
  onMessage?: (id: string) => void;
  userType: 'client' | 'professional';
}

export function BookingRequestCard({
  request,
  onAccept,
  onDecline,
  onMessage,
  userType,
}: BookingRequestCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'accepted':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'declined':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'completed':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const otherParty =
    userType === 'client'
      ? request.professional?.full_name || request.professional?.display_name
      : request.client?.full_name || request.client?.display_name;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{request.title}</CardTitle>
            {otherParty && (
              <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span>{userType === 'client' ? 'Professional' : 'Client'}: {otherParty}</span>
              </div>
            )}
          </div>
          <Badge className={getStatusColor(request.status)} variant="outline">
            {request.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{request.description}</p>

        {request.location_details && (
          <div className="flex items-start gap-2 text-sm">
            <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
            <span>{request.location_details}</span>
          </div>
        )}

        {request.preferred_dates && request.preferred_dates.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Calendar className="h-4 w-4" />
              <span>Preferred Dates:</span>
            </div>
            <div className="pl-6 space-y-1">
              {request.preferred_dates.map((date, index) => (
                <div key={index} className="text-sm text-muted-foreground">
                  {new Date(date).toLocaleString('en-US', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </div>
              ))}
            </div>
          </div>
        )}

        {request.special_requirements && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Clock className="h-4 w-4" />
              <span>Special Requirements:</span>
            </div>
            <p className="pl-6 text-sm text-muted-foreground">
              {request.special_requirements}
            </p>
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t">
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
          </span>

          <div className="flex gap-2">
            {onMessage && (
              <Button variant="outline" size="sm" onClick={() => onMessage(request.id)}>
                <MessageSquare className="h-4 w-4 mr-1" />
                Message
              </Button>
            )}

            {request.status === 'pending' && userType === 'professional' && (
              <>
                {onDecline && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDecline(request.id)}
                  >
                    Decline
                  </Button>
                )}
                {onAccept && (
                  <Button size="sm" onClick={() => onAccept(request.id)}>
                    Accept
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
