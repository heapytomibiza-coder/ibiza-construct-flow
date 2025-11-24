/**
 * Client Projects Timeline Hook
 * Phase 11: Data Integration & Testing
 * 
 * Fetches real project data from Supabase
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Project {
  id: string;
  title: string;
  category: string;
  status: 'draft' | 'posted' | 'matched' | 'in_progress' | 'completed' | 'disputed';
  budget?: string;
  startDate?: string;
  professionalName?: string;
  progress?: number;
}

export function useClientProjects(clientId?: string) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!clientId) {
      setLoading(false);
      return;
    }

    fetchProjects();
  }, [clientId]);

  const fetchProjects = async () => {
    try {
      setLoading(true);

      // Fetch bookings with related data
      const { data: bookings, error } = await supabase
        .from('bookings')
        .select(`
          id,
          title,
          status,
          created_at,
          budget_range,
          services:service_id (
            category
          )
        `)
        .eq('client_id', clientId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      // Fetch contracts to get professional info
      const bookingIds = (bookings || []).map(b => b.id);
      const { data: contracts, error: contractsError } = await supabase
        .from('contracts')
        .select(`
          job_id,
          profiles:tasker_id (
            full_name
          )
        `)
        .in('job_id', bookingIds);

      if (contractsError) throw contractsError;

      // Map to project format
      const mappedProjects: Project[] = (bookings || []).map(booking => {
        const contract = (contracts || []).find(c => c.job_id === booking.id);
        const professionalName = (contract?.profiles as any)?.full_name;

        return {
          id: booking.id,
          title: booking.title,
          category: (booking.services as any)?.category || 'Service',
          status: mapBookingStatus(booking.status),
          budget: booking.budget_range,
          startDate: new Date(booking.created_at).toLocaleDateString(),
          professionalName,
          progress: calculateProgress(booking.status)
        };
      });

      setProjects(mappedProjects);

    } catch (error: any) {
      console.error('Error fetching projects:', error);
      toast({
        title: 'Error',
        description: 'Failed to load projects',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const mapBookingStatus = (status: string): Project['status'] => {
    const statusMap: Record<string, Project['status']> = {
      'draft': 'draft',
      'posted': 'posted',
      'matched': 'matched',
      'in_progress': 'in_progress',
      'completed': 'completed',
      'disputed': 'disputed'
    };
    return statusMap[status] || 'posted';
  };

  const calculateProgress = (status: string): number | undefined => {
    if (status === 'in_progress') {
      // Return a random progress between 25-75% for demo
      // In production, this would come from actual progress tracking
      return Math.floor(Math.random() * 50) + 25;
    }
    if (status === 'completed') return 100;
    return undefined;
  };

  return {
    projects,
    loading,
    refresh: fetchProjects
  };
}
