import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useBookingRequests } from '@/hooks/useBookingRequests';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { Clock, Euro, CheckCircle, XCircle, MessageSquare, Eye } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

interface ClientBookingsSectionProps {
  clientId: string;
}

export const ClientBookingsSection = ({ clientId }: ClientBookingsSectionProps) => {
  const navigate = useNavigate();
  const { requests, loading, acceptQuote, declineQuote } = useBookingRequests({
    userId: clientId,
    userRole: 'client'
  });

  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  const getStatusBadge = (status: string) => {
    const config = {
      pending: { variant: 'default' as const, label: 'Pending Response', color: 'bg-yellow-500' },
      quoted: { variant: 'default' as const, label: 'Quote Received', color: 'bg-blue-500' },
      accepted: { variant: 'default' as const, label: 'Accepted', color: 'bg-green-500' },
      declined: { variant: 'outline' as const, label: 'Declined', color: 'bg-gray-400' },
      responded: { variant: 'default' as const, label: 'Quote Received', color: 'bg-blue-500' }
    };
    const { variant, label, color } = config[status as keyof typeof config] || config.pending;
    return <Badge variant={variant} className={color}>{label}</Badge>;
  };

  const handleAcceptQuote = async (request: any) => {
    if (!confirm('Accept this quote and proceed with the booking?')) return;

    try {
      await acceptQuote(request.id);
      
      // Create a contract when quote is accepted
      const { error: contractError } = await supabase
        .from('contracts')
        .insert({
          job_id: request.id,
          client_id: clientId,
          tasker_id: request.professional_id,
          agreed_amount: request.professional_quote,
          type: 'fixed',
          escrow_status: 'none',
        });

      if (contractError) {
        console.error('Failed to create contract:', contractError);
        toast.error('Quote accepted but contract creation failed');
      } else {
        toast.success('Quote accepted! Contract created. Proceed to payment.');
      }
    } catch (error) {
      toast.error('Failed to accept quote');
    }
  };

  const handleDeclineQuote = async (requestId: string) => {
    if (!confirm('Are you sure you want to decline this quote?')) return;

    try {
      await declineQuote(requestId);
    } catch (error) {
      toast.error('Failed to decline quote');
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Booking Requests</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const quotedRequests = requests.filter(r => ['quoted', 'responded'].includes(r.status));
  const activeRequests = requests.filter(r => r.status === 'accepted');
  const closedRequests = requests.filter(r => r.status === 'declined');

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>My Booking Requests</CardTitle>
            <Button size="sm" onClick={() => navigate('/discovery')}>
              + New Request
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No booking requests yet</p>
              <p className="text-sm text-muted-foreground mt-2 mb-4">
                Start by requesting quotes from professionals
              </p>
              <Button onClick={() => navigate('/discovery')}>
                Browse Professionals
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Pending Quotes */}
              {quotedRequests.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Euro className="w-4 h-4 text-blue-500" />
                    Quotes Received ({quotedRequests.length})
                  </h4>
                  <div className="space-y-3">
                    {quotedRequests.map((request) => (
                      <BookingCard
                        key={request.id}
                        request={request}
                        onViewDetails={() => {
                          setSelectedRequest(request);
                          setDetailsModalOpen(true);
                        }}
                        onAccept={() => handleAcceptQuote(request)}
                        onDecline={() => handleDeclineQuote(request.id)}
                        getStatusBadge={getStatusBadge}
                        showActions={true}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Awaiting Response */}
              {pendingRequests.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Awaiting Response ({pendingRequests.length})
                  </h4>
                  <div className="space-y-3">
                    {pendingRequests.map((request) => (
                      <BookingCard
                        key={request.id}
                        request={request}
                        onViewDetails={() => {
                          setSelectedRequest(request);
                          setDetailsModalOpen(true);
                        }}
                        getStatusBadge={getStatusBadge}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Active Bookings */}
              {activeRequests.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Active ({activeRequests.length})
                  </h4>
                  <div className="space-y-3">
                    {activeRequests.map((request) => (
                      <BookingCard
                        key={request.id}
                        request={request}
                        onViewDetails={() => {
                          setSelectedRequest(request);
                          setDetailsModalOpen(true);
                        }}
                        getStatusBadge={getStatusBadge}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Closed */}
              {closedRequests.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3">Closed ({closedRequests.length})</h4>
                  <div className="space-y-3">
                    {closedRequests.slice(0, 3).map((request) => (
                      <BookingCard
                        key={request.id}
                        request={request}
                        getStatusBadge={getStatusBadge}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Details Modal */}
      <Dialog open={detailsModalOpen} onOpenChange={setDetailsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Booking Request Details</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">{selectedRequest.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      Professional: {selectedRequest.professional?.full_name || 'To be assigned'}
                    </p>
                  </div>
                  {getStatusBadge(selectedRequest.status)}
                </div>

                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-sm mb-1">Description</h4>
                    <p className="text-sm text-muted-foreground">{selectedRequest.description}</p>
                  </div>

                  {selectedRequest.location_details && (
                    <div>
                      <h4 className="font-semibold text-sm mb-1">Location</h4>
                      <p className="text-sm text-muted-foreground">📍 {selectedRequest.location_details}</p>
                    </div>
                  )}

                  {selectedRequest.special_requirements && (
                    <div>
                      <h4 className="font-semibold text-sm mb-1">Special Requirements</h4>
                      <p className="text-sm text-muted-foreground">{selectedRequest.special_requirements}</p>
                    </div>
                  )}

                  {selectedRequest.professional_quote && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Euro className="w-4 h-4" />
                        Professional's Quote
                      </h4>
                      <p className="text-2xl font-bold text-blue-600 mb-2">
                        €{selectedRequest.professional_quote}
                      </p>
                      {selectedRequest.professional_notes && (
                        <p className="text-sm text-muted-foreground">
                          {selectedRequest.professional_notes}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="text-xs text-muted-foreground pt-2 border-t">
                    Requested on {format(new Date(selectedRequest.created_at), 'MMM dd, yyyy HH:mm')}
                  </div>
                </div>
              </div>

              {selectedRequest.status === 'quoted' && (
                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => handleDeclineQuote(selectedRequest.id)}
                    className="flex-1"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Decline
                  </Button>
                  <Button
                    onClick={() => handleAcceptQuote(selectedRequest)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Accept Quote
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

const BookingCard = ({ request, onViewDetails, onAccept, onDecline, getStatusBadge, showActions }: any) => (
  <div className="p-4 border rounded-lg hover:border-primary/50 transition-colors">
    <div className="flex items-start justify-between mb-2">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-semibold">{request.title}</h4>
          {getStatusBadge(request.status)}
        </div>
        <p className="text-sm text-muted-foreground">
          Professional: {request.professional?.full_name || 'Pending assignment'}
        </p>
      </div>
      <span className="text-xs text-muted-foreground">
        {format(new Date(request.created_at), 'MMM dd')}
      </span>
    </div>

    {request.professional_quote && (
      <div className="flex items-center gap-2 mb-3 text-sm">
        <Euro className="w-4 h-4 text-primary" />
        <span className="font-semibold">Quote: €{request.professional_quote}</span>
      </div>
    )}

    <div className="flex gap-2">
      {onViewDetails && (
        <Button size="sm" variant="outline" onClick={onViewDetails} className="flex-1">
          <Eye className="w-3 h-3 mr-2" />
          View Details
        </Button>
      )}
      {showActions && onAccept && onDecline && (
        <>
          <Button size="sm" variant="outline" onClick={onDecline}>
            <XCircle className="w-3 h-3 mr-2" />
            Decline
          </Button>
          <Button size="sm" onClick={onAccept} className="bg-green-600 hover:bg-green-700 text-white">
            <CheckCircle className="w-3 h-3 mr-2" />
            Accept
          </Button>
        </>
      )}
    </div>
  </div>
);
