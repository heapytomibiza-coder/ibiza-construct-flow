import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type Job = Database['public']['Tables']['jobs']['Row'];

interface RealtimeJobUpdate {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: Job;
  old: Job;
}

export const useRealtimeJobUpdates = (clientId?: string) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!clientId) {
      setLoading(false);
      return;
    }

    // Initial fetch
    const fetchJobs = async () => {
      try {
        const { data, error } = await supabase
          .from('jobs')
          .select('*')
          .eq('client_id', clientId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setJobs(data || []);
      } catch (error) {
        console.error('Error fetching jobs:', error);
        toast({
          title: 'Error',
          description: 'Failed to load jobs',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();

    // Set up realtime subscription
    const channel = supabase
      .channel('client-jobs-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'jobs',
          filter: `client_id=eq.${clientId}`
        },
        (payload) => {
          console.log('[Realtime] Job update:', payload);

          if (payload.eventType === 'INSERT') {
            const newJob = payload.new as Job;
            setJobs(prev => [newJob, ...prev]);
            
            toast({
              title: 'New Job Created',
              description: `Your job "${newJob.title}" is now live`
            });
          } else if (payload.eventType === 'UPDATE') {
            const updatedJob = payload.new as Job;
            setJobs(prev => prev.map(job => 
              job.id === updatedJob.id ? updatedJob : job
            ));

            // Notify on status changes
            const oldJob = payload.old as Job;
            if (oldJob.status !== updatedJob.status) {
              toast({
                title: 'Job Status Updated',
                description: `"${updatedJob.title}" is now ${updatedJob.status}`
              });
            }
          } else if (payload.eventType === 'DELETE') {
            const deletedJob = payload.old as Job;
            setJobs(prev => prev.filter(job => job.id !== deletedJob.id));
            
            toast({
              title: 'Job Removed',
              description: 'A job has been removed'
            });
          }
        }
      )
      .subscribe();

    // Cleanup
    return () => {
      supabase.removeChannel(channel);
    };
  }, [clientId, toast]);

  return { jobs, loading };
};
