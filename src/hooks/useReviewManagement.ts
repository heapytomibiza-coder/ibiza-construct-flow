import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ReviewReport {
  id: string;
  review_id: string;
  reporter_id?: string;
  reported_by?: string;
  reason: string;
  description?: string | null;
  notes?: string;
  status: 'pending' | 'reviewing' | 'resolved' | 'dismissed';
  reviewed_by: string | null;
  reviewed_at: string | null;
  resolution_notes?: string | null;
  created_at: string;
}

export interface ModerationQueueItem {
  id: string;
  review_id: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  flags: string[];
  auto_flagged: boolean;
  assigned_to: string | null;
  status: 'pending' | 'in_review' | 'approved' | 'rejected';
  moderator_notes: string | null;
  created_at: string;
  resolved_at: string | null;
}

export const useReviewManagement = () => {
  const [reports, setReports] = useState<ReviewReport[]>([]);
  const [moderationQueue, setModerationQueue] = useState<ModerationQueueItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchReports = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('review_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReports((data || []) as any);
    } catch (error: any) {
      console.error('Error fetching reports:', error);
      toast({
        title: 'Failed to load reports',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchModerationQueue = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('review_moderation_queue' as any)
        .select('*')
        .eq('status', 'pending')
        .order('priority', { ascending: false })
        .order('created_at', { ascending: true });

      if (error) throw error;
      setModerationQueue((data || []) as any);
    } catch (error: any) {
      console.error('Error fetching moderation queue:', error);
      toast({
        title: 'Failed to load moderation queue',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
    fetchModerationQueue();
  }, []);

  const reportReview = async (reviewId: string, reason: string, description?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase.from('review_reports').insert({
        review_id: reviewId,
        reason,
        description
      } as any);

      if (error) throw error;

      toast({
        title: 'Review reported',
        description: 'Thank you for helping maintain quality. We will review this report.'
      });

      await fetchReports();
    } catch (error: any) {
      console.error('Error reporting review:', error);
      toast({
        title: 'Failed to report review',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const resolveReport = async (
    reportId: string,
    status: 'resolved' | 'dismissed',
    resolutionNotes?: string
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('review_reports')
        .update({
          status,
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
          resolution_notes: resolutionNotes
        })
        .eq('id', reportId);

      if (error) throw error;

      toast({
        title: 'Report resolved',
        description: `Report has been marked as ${status}`
      });

      await fetchReports();
    } catch (error: any) {
      console.error('Error resolving report:', error);
      toast({
        title: 'Failed to resolve report',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const moderateReview = async (
    queueItemId: string,
    status: 'approved' | 'rejected',
    moderatorNotes?: string
  ) => {
    try {
      const { error } = await supabase
        .from('review_moderation_queue' as any)
        .update({
          status,
          moderator_notes: moderatorNotes,
          resolved_at: new Date().toISOString()
        })
        .eq('id', queueItemId);

      if (error) throw error;

      toast({
        title: 'Review moderated',
        description: `Review has been ${status}`
      });

      await fetchModerationQueue();
    } catch (error: any) {
      console.error('Error moderating review:', error);
      toast({
        title: 'Failed to moderate review',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  return {
    reports,
    moderationQueue,
    loading,
    reportReview,
    resolveReport,
    moderateReview,
    refreshData: () => {
      fetchReports();
      fetchModerationQueue();
    }
  };
};
