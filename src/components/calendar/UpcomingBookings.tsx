import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, User } from 'lucide-react';
import { format, formatDistance } from 'date-fns';

export interface Booking {
  id: string;
  title: string;
  scheduledAt: string;
  duration: number;
  location?: string;
  clientName?: string;
  status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
}

interface UpcomingBookingsProps {
  items: Booking[];
  onReschedule: (id: string) => void;
  onCancel?: (id: string) => void;
  onViewDetails?: (id: string) => void;
  loading?: boolean;
}

export default function UpcomingBookings({ 
  items, 
  onReschedule, 
  onCancel,
  onViewDetails,
  loading = false 
}: UpcomingBookingsProps) {
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'scheduled': return 'default';
      case 'in_progress': return 'secondary';
      case 'completed': return 'outline';
      case 'cancelled': return 'destructive';
      default: return 'default';
    }
  };

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case 'scheduled': return 'Scheduled';
      case 'in_progress': return 'In Progress';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      default: return 'Scheduled';
    }
  };

  const sortedItems = [...items].sort((a, b) => 
    new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
  );

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="h-24 bg-muted rounded-lg" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Upcoming Bookings</span>
          <Badge variant="secondary">{sortedItems.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {sortedItems.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No bookings scheduled</p>
            <p className="text-xs mt-1">Your upcoming appointments will appear here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedItems.map(booking => {
              const scheduledDate = new Date(booking.scheduledAt);
              const isUpcoming = scheduledDate > new Date();
              const timeDistance = formatDistance(scheduledDate, new Date(), { addSuffix: true });

              return (
                <div 
                  key={booking.id} 
                  className="border rounded-lg p-4 space-y-3 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{booking.title}</h4>
                      <div className="space-y-1 mt-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3 flex-shrink-0" />
                          <span>{format(scheduledDate, 'EEE, MMM d, yyyy')}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3 flex-shrink-0" />
                          <span>{format(scheduledDate, 'h:mm a')} ({booking.duration} min)</span>
                        </div>
                        {booking.location && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{booking.location}</span>
                          </div>
                        )}
                        {booking.clientName && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <User className="h-3 w-3 flex-shrink-0" />
                            <span>{booking.clientName}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <Badge variant={getStatusColor(booking.status)}>
                      {getStatusLabel(booking.status)}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2 border-t">
                    <span className="text-xs text-muted-foreground">{timeDistance}</span>
                    <div className="flex gap-2">
                      {onViewDetails && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => onViewDetails(booking.id)}
                        >
                          Details
                        </Button>
                      )}
                      {isUpcoming && booking.status === 'scheduled' && (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => onReschedule(booking.id)}
                          >
                            Reschedule
                          </Button>
                          {onCancel && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => onCancel(booking.id)}
                            >
                              Cancel
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
