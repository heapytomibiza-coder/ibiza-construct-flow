/**
 * Professional Jobs Pipeline Hook
 * Phase 11: Data Integration & Testing
 * 
 * Fetches real job pipeline data from Supabase
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Job {
  id: string;
  title: string;
  client: string;
  status: 'lead' | 'quoted' | 'accepted' | 'in_progress' | 'review';
  value?: number;
  urgency?: 'low' | 'medium' | 'high';
  dueDate?: string;
}

export function useProfessionalPipeline(professionalId?: string) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!professionalId) {
      setLoading(false);
      return;
    }

    fetchPipeline();
  }, [professionalId]);

  const fetchPipeline = async () => {
    try {
      setLoading(true);

      // Fetch bookings for the professional (jobs are tracked via bookings table)
      const { data: bookingsData, error } = await supabase
        .from('bookings')
        .select(`
          id,
          title,
          description,
          budget_range,
          created_at,
          status,
          profiles:client_id (
            full_name
          )
        `)
        .eq('service_id', professionalId)
        .in('status', ['posted', 'matched', 'in_progress'])
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Map to pipeline format
      const mappedJobs: Job[] = (bookingsData || []).map(booking => ({
        id: booking.id,
        title: booking.title,
        client: (booking.profiles as any)?.full_name || 'Client',
        status: mapBookingStatus(booking.status),
        value: parseBudgetRange(booking.budget_range),
        urgency: calculateUrgency(booking.created_at),
        dueDate: formatDueDate(booking.created_at)
      }));

      setJobs(mappedJobs);

    } catch (error: any) {
      console.error('Error fetching pipeline:', error);
      toast({
        title: 'Error',
        description: 'Failed to load jobs pipeline',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const parseBudgetRange = (budgetRange?: string): number | undefined => {
    if (!budgetRange) return undefined;
    // Extract max value from range like "€1000-€2000"
    const match = budgetRange.match(/€?(\d+)/g);
    if (match && match.length > 0) {
      const num = match[match.length - 1].replace(/€/g, '');
      return parseInt(num);
    }
    return undefined;
  };

  const mapBookingStatus = (status: string): Job['status'] => {
    const statusMap: Record<string, Job['status']> = {
      'posted': 'lead',
      'quoted': 'quoted',
      'matched': 'accepted',
      'in_progress': 'in_progress',
      'pending_review': 'review'
    };
    return statusMap[status] || 'lead';
  };

  const calculateUrgency = (createdAt: string): Job['urgency'] => {
    const daysSinceCreated = Math.floor(
      (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (daysSinceCreated > 7) return 'high';
    if (daysSinceCreated > 3) return 'medium';
    return 'low';
  };

  const formatDueDate = (createdAt: string): string => {
    const daysSinceCreated = Math.floor(
      (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (daysSinceCreated === 0) return 'Today';
    if (daysSinceCreated === 1) return 'Tomorrow';
    if (daysSinceCreated < 7) return `In ${daysSinceCreated} days`;
    return 'Next week';
  };

  return {
    jobs,
    loading,
    refresh: fetchPipeline
  };
}
