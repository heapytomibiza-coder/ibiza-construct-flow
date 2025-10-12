/**
 * @deprecated This hook is deprecated and maintained only for legacy data viewing.
 * Use useProfessionalJobQuotes or useJobQuotes instead for the unified quote system.
 * 
 * Legacy booking_requests table is no longer actively used for new quotes.
 * All new quote functionality uses the job_quotes table.
 */

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

/**
 * @deprecated Use useProfessionalJobQuotes or useJobQuotes instead
 */
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

  const createRequest = async () => {
    throw new Error('Creating new booking requests is deprecated. Use job_quotes system instead.');
  };

  const updateRequestStatus = async () => {
    throw new Error('Updating booking requests is deprecated. Use job_quotes system instead.');
  };

  const sendQuote = async () => {
    throw new Error('Sending quotes through booking_requests is deprecated. Use job_quotes system instead.');
  };

  const acceptQuote = async () => {
    throw new Error('Accepting quotes through booking_requests is deprecated. Use job_quotes system instead.');
  };

  const declineQuote = async () => {
    throw new Error('Declining quotes through booking_requests is deprecated. Use job_quotes system instead.');
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
