import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookingRequestCard } from '@/components/booking/BookingRequestCard';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Inbox } from 'lucide-react';

export default function BookingManagementPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('received');

  // Check if user is a professional
  const { data: professionalProfile } = useQuery({
    queryKey: ['professional-profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from('professional_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      return data;
    },
    enabled: !!user,
  });

  const isProfessional = !!professionalProfile;

  // Fetch booking requests received (for professionals)
  const { data: receivedRequests, isLoading: loadingReceived } = useQuery({
    queryKey: ['booking-requests-received', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('booking_requests')
        .select(`
          *,
          client:profiles!booking_requests_client_id_fkey(
            id,
            full_name,
            display_name
          )
        `)
        .eq('professional_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user && isProfessional,
  });

  // Fetch booking requests sent (for clients)
  const { data: sentRequests, isLoading: loadingSent } = useQuery({
    queryKey: ['booking-requests-sent', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('booking_requests')
        .select(`
          *,
          professional:profiles!booking_requests_professional_id_fkey(
            id,
            full_name,
            display_name
          )
        `)
        .eq('client_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const updateRequestStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from('booking_requests')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['booking-requests-received', user?.id] });
      toast({
        title: variables.status === 'accepted' ? 'Request Accepted' : 'Request Declined',
        description:
          variables.status === 'accepted'
            ? 'The booking request has been accepted. You can now create a contract.'
            : 'The booking request has been declined.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update booking request. Please try again.',
        variant: 'destructive',
      });
      console.error('Update request error:', error);
    },
  });

  const handleAccept = (id: string) => {
    updateRequestStatus.mutate({ id, status: 'accepted' });
  };

  const handleDecline = (id: string) => {
    updateRequestStatus.mutate({ id, status: 'declined' });
  };

  const handleMessage = (id: string) => {
    // Navigate to messages with the request
    navigate(`/messages?booking_request=${id}`);
  };

  if (!user) {
    return (
      <div className="container mx-auto py-8 px-4">
        <p className="text-center text-muted-foreground">
          Please log in to view your bookings.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Booking Management</h1>
        <p className="text-muted-foreground">
          Manage your booking requests and appointments
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          {isProfessional && (
            <TabsTrigger value="received" className="flex items-center gap-2">
              <Inbox className="h-4 w-4" />
              Received Requests
              {receivedRequests && receivedRequests.length > 0 && (
                <span className="ml-1 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                  {receivedRequests.filter((r: any) => r.status === 'pending').length}
                </span>
              )}
            </TabsTrigger>
          )}
          <TabsTrigger value="sent" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            My Requests
          </TabsTrigger>
        </TabsList>

        {isProfessional && (
          <TabsContent value="received" className="space-y-4 mt-6">
            {loadingReceived && <p>Loading...</p>}
            
            {!loadingReceived && receivedRequests && receivedRequests.length === 0 && (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">No booking requests yet</p>
              </div>
            )}

            {receivedRequests?.map((request: any) => (
              <BookingRequestCard
                key={request.id}
                request={request}
                onAccept={handleAccept}
                onDecline={handleDecline}
                onMessage={handleMessage}
                userType="professional"
              />
            ))}
          </TabsContent>
        )}

        <TabsContent value="sent" className="space-y-4 mt-6">
          {loadingSent && <p>Loading...</p>}
          
          {!loadingSent && sentRequests && sentRequests.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">No booking requests sent yet</p>
              <p className="text-sm text-muted-foreground mt-2">
                Browse professionals to send booking requests
              </p>
            </div>
          )}

          {sentRequests?.map((request: any) => (
            <BookingRequestCard
              key={request.id}
              request={request}
              onMessage={handleMessage}
              userType="client"
            />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
