import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

interface Applicant {
  id: string;
  job_id: string;
  professional_id: string;
  status: string;
  availability_status: string;
  notes: string | null;
  applied_at: string;
  viewed_at: string | null;
  updated_at: string;
  rating?: number | null;
  tags?: string[] | null;
  interview_scheduled_at?: string | null;
  interview_notes?: string | null;
  professional?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  };
}

const APPLICANTS_QUERY_KEY = (jobId: string) => ['applicants', jobId];

export const useOptimisticApplicants = (jobId?: string) => {
  const queryClient = useQueryClient();

  // Fetch applicants
  const { data: applicants = [], isLoading } = useQuery({
    queryKey: jobId ? APPLICANTS_QUERY_KEY(jobId) : ['applicants', 'none'],
    queryFn: async () => {
      if (!jobId) return [];
      
      const { data, error } = await supabase
        .from('job_applicants')
        .select(`
          *,
          professional:profiles!professional_id (
            id,
            full_name,
            avatar_url
          )
        `)
        .eq('job_id', jobId)
        .order('applied_at', { ascending: false });

      if (error) throw error;
      return data as Applicant[];
    },
    enabled: !!jobId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  // Real-time subscription
  useEffect(() => {
    if (!jobId) return;

    const channel = supabase
      .channel(`job-applicants:${jobId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'job_applicants',
          filter: `job_id=eq.${jobId}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: APPLICANTS_QUERY_KEY(jobId) });
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [jobId, queryClient]);

  // Update applicant status with optimistic update
  const updateStatusMutation = useMutation({
    mutationFn: async ({ 
      applicantId, 
      status, 
      notes 
    }: { 
      applicantId: string; 
      status: string; 
      notes?: string;
    }) => {
      const updates: any = { status };
      if (notes) updates.notes = notes;
      if (status === 'viewed') updates.viewed_at = new Date().toISOString();

      const { error } = await supabase
        .from('job_applicants')
        .update(updates)
        .eq('id', applicantId);

      if (error) throw error;
      return { applicantId, ...updates };
    },
    onMutate: async ({ applicantId, status, notes }) => {
      if (!jobId) return;
      
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: APPLICANTS_QUERY_KEY(jobId) });

      // Snapshot previous value
      const previousApplicants = queryClient.getQueryData<Applicant[]>(
        APPLICANTS_QUERY_KEY(jobId)
      );

      // Optimistically update
      queryClient.setQueryData<Applicant[]>(
        APPLICANTS_QUERY_KEY(jobId),
        (old = []) => 
          old.map(app => 
            app.id === applicantId 
              ? { 
                  ...app, 
                  status, 
                  notes: notes || app.notes,
                  viewed_at: status === 'viewed' ? new Date().toISOString() : app.viewed_at,
                  updated_at: new Date().toISOString()
                }
              : app
          )
      );

      return { previousApplicants };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (jobId && context?.previousApplicants) {
        queryClient.setQueryData(APPLICANTS_QUERY_KEY(jobId), context.previousApplicants);
      }
    },
    onSettled: () => {
      if (jobId) {
        queryClient.invalidateQueries({ queryKey: APPLICANTS_QUERY_KEY(jobId) });
      }
    },
  });

  // Bulk update with optimistic updates
  const bulkUpdateMutation = useMutation({
    mutationFn: async ({ 
      applicantIds, 
      status 
    }: { 
      applicantIds: string[]; 
      status: string;
    }) => {
      const { error } = await supabase
        .from('job_applicants')
        .update({ status })
        .in('id', applicantIds);

      if (error) throw error;
      return { applicantIds, status };
    },
    onMutate: async ({ applicantIds, status }) => {
      if (!jobId) return;
      
      await queryClient.cancelQueries({ queryKey: APPLICANTS_QUERY_KEY(jobId) });

      const previousApplicants = queryClient.getQueryData<Applicant[]>(
        APPLICANTS_QUERY_KEY(jobId)
      );

      queryClient.setQueryData<Applicant[]>(
        APPLICANTS_QUERY_KEY(jobId),
        (old = []) => 
          old.map(app => 
            applicantIds.includes(app.id)
              ? { ...app, status, updated_at: new Date().toISOString() }
              : app
          )
      );

      return { previousApplicants };
    },
    onError: (err, variables, context) => {
      if (jobId && context?.previousApplicants) {
        queryClient.setQueryData(APPLICANTS_QUERY_KEY(jobId), context.previousApplicants);
      }
    },
    onSettled: () => {
      if (jobId) {
        queryClient.invalidateQueries({ queryKey: APPLICANTS_QUERY_KEY(jobId) });
      }
    },
  });

  // Invite professional
  const inviteMutation = useMutation({
    mutationFn: async (professionalId: string) => {
      if (!jobId) throw new Error('No job ID provided');

      const { error } = await supabase
        .from('job_applicants')
        .insert({
          job_id: jobId,
          professional_id: professionalId,
          status: 'invited'
        });

      if (error) throw error;
    },
    onSuccess: () => {
      if (jobId) {
        queryClient.invalidateQueries({ queryKey: APPLICANTS_QUERY_KEY(jobId) });
      }
    },
  });

  const stats = {
    total: applicants.length,
    new: applicants.filter(a => a.status === 'applied').length,
    shortlisted: applicants.filter(a => a.status === 'shortlisted').length,
    invited: applicants.filter(a => a.status === 'invited').length,
  };

  return {
    applicants,
    loading: isLoading,
    updateApplicantStatus: (applicantId: string, status: string, notes?: string) => 
      updateStatusMutation.mutateAsync({ applicantId, status, notes }),
    bulkUpdateStatus: (applicantIds: string[], status: string) => 
      bulkUpdateMutation.mutateAsync({ applicantIds, status }),
    inviteProfessional: inviteMutation.mutateAsync,
    stats,
  };
};

// Prefetch function for hover
export const prefetchApplicants = (queryClient: any, jobId: string) => {
  queryClient.prefetchQuery({
    queryKey: APPLICANTS_QUERY_KEY(jobId),
    queryFn: async () => {
      const { data } = await supabase
        .from('job_applicants')
        .select(`
          *,
          professional:profiles!professional_id (
            id,
            full_name,
            avatar_url
          )
        `)
        .eq('job_id', jobId)
        .order('applied_at', { ascending: false });
      return data;
    },
    staleTime: 1000 * 60 * 2,
  });
};
