import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

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

export const useApplicantTracking = (jobId?: string) => {
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!jobId) {
      setLoading(false);
      return;
    }

    const fetchApplicants = async () => {
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

      if (error) {
        console.error('Error fetching applicants:', error);
      } else {
        setApplicants(data || []);
      }
      setLoading(false);
    };

    fetchApplicants();

    // Subscribe to real-time updates
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
          fetchApplicants();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [jobId]);

  const updateApplicantStatus = useCallback(async (
    applicantId: string,
    status: Applicant['status'],
    notes?: string
  ) => {
    const updates: any = { status };
    if (notes) updates.notes = notes;
    if (status === 'viewed') updates.viewed_at = new Date().toISOString();

    const { error } = await supabase
      .from('job_applicants')
      .update(updates)
      .eq('id', applicantId);

    if (error) {
      console.error('Error updating applicant status:', error);
      throw error;
    }
  }, []);

  const inviteProfessional = useCallback(async (professionalId: string) => {
    if (!jobId) throw new Error('No job ID provided');

    const { error } = await supabase
      .from('job_applicants')
      .insert({
        job_id: jobId,
        professional_id: professionalId,
        status: 'invited'
      });

    if (error) throw error;
  }, [jobId]);

  const bulkUpdateStatus = useCallback(async (
    applicantIds: string[],
    status: Applicant['status']
  ) => {
    const { error } = await supabase
      .from('job_applicants')
      .update({ status })
      .in('id', applicantIds);

    if (error) throw error;
  }, []);

  return {
    applicants,
    loading,
    updateApplicantStatus,
    inviteProfessional,
    bulkUpdateStatus,
    stats: {
      total: applicants.length,
      new: applicants.filter(a => a.status === 'applied').length,
      shortlisted: applicants.filter(a => a.status === 'shortlisted').length,
      invited: applicants.filter(a => a.status === 'invited').length
    }
  };
};
