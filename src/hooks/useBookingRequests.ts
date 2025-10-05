import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface BookingRequest {
  id: string;
  client_id: string;
  professional_id: string | null;
  service_id: string;
  title: string;
  description: string | null;
  status: string;
  total_estimated_price: number | null;
  professional_quote: number | null;
  professional_notes: string | null;
  location_details: string | null;
  special_requirements: string | null;
  preferred_dates: any;
  selected_items: any;
  created_at: string;
  updated_at: string;
  client?: {
    full_name: string;
  };
  professional?: {
    full_name: string;
  };
}

interface UseBookingRequestsParams {
  userId?: string;
  userRole?: 'client' | 'professional';
}

export const useBookingRequests = ({ userId, userRole }: UseBookingRequestsParams) => {
  const [requests, setRequests] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    fetchRequests();
    setupRealtimeSubscription();
  }, [userId, userRole]);

  const fetchRequests = async () => {
    if (!userId) return;

    try {
      let query = supabase
        .from('booking_requests')
        .select(`
          *,
          client:profiles!booking_requests_client_id_fkey(full_name),
          professional:profiles!booking_requests_professional_id_fkey(full_name)
        `)
        .order('created_at', { ascending: false });

      if (userRole === 'client') {
        query = query.eq('client_id', userId);
      } else if (userRole === 'professional') {
        query = query.eq('professional_id', userId);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Transform data to handle joined arrays
      const transformedData = (data || []).map((item: any) => ({
        ...item,
        client: item.client?.[0] || undefined,
        professional: item.professional?.[0] || undefined
      }));
      
      setRequests(transformedData as BookingRequest[]);
    } catch (error) {
      console.error('Error fetching booking requests:', error);
      toast.error('Failed to load booking requests');
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('booking_requests_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'booking_requests',
          filter: userRole === 'client' 
            ? `client_id=eq.${userId}`
            : `professional_id=eq.${userId}`
        },
        () => {
          fetchRequests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const createRequest = async (requestData: {
    professional_id: string;
    service_id: string;
    title: string;
    description: string;
    location_details?: string;
    special_requirements?: string;
    preferred_dates?: any[];
    selected_items?: any[];
  }) => {
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('booking_requests')
      .insert({
        client_id: userId,
        ...requestData,
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;
    
    toast.success('Quote request sent successfully!');
    return data;
  };

  const updateRequestStatus = async (requestId: string, status: string) => {
    const { error } = await supabase
      .from('booking_requests')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', requestId);

    if (error) throw error;
    toast.success('Status updated successfully');
  };

  const sendQuote = async (requestId: string, quote: number, notes: string) => {
    const { error } = await supabase
      .from('booking_requests')
      .update({
        professional_quote: quote,
        professional_notes: notes,
        status: 'quoted',
        updated_at: new Date().toISOString()
      })
      .eq('id', requestId);

    if (error) throw error;
    toast.success('Quote sent successfully!');
  };

  const acceptQuote = async (requestId: string) => {
    const { error } = await supabase
      .from('booking_requests')
      .update({
        status: 'accepted',
        updated_at: new Date().toISOString()
      })
      .eq('id', requestId);

    if (error) throw error;
    toast.success('Quote accepted!');
  };

  const declineQuote = async (requestId: string) => {
    const { error } = await supabase
      .from('booking_requests')
      .update({
        status: 'declined',
        updated_at: new Date().toISOString()
      })
      .eq('id', requestId);

    if (error) throw error;
    toast.success('Quote declined');
  };

  return {
    requests,
    loading,
    createRequest,
    updateRequestStatus,
    sendQuote,
    acceptQuote,
    declineQuote,
    refetch: fetchRequests
  };
};
