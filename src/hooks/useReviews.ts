import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Review {
  id: string;
  job_id: string;
  reviewer_id: string;
  reviewee_id: string;
  rating: number;
  title: string;
  comment: string;
  category_ratings?: Record<string, number>;
  is_verified: boolean;
  helpful_count: number;
  unhelpful_count: number;
  response_text?: string;
  response_at?: string;
  created_at: string;
  moderation_status: string;
}

export interface ReviewStats {
  total_reviews: number;
  average_rating: number;
  rating_distribution: Record<string, number>;
  category_averages: Record<string, number>;
  response_rate: number;
}

export function useReviews(userId?: string) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (userId) {
      fetchReviews();
      fetchStats();
    }
  }, [userId]);

  const fetchReviews = async (filters?: { min_rating?: number; limit?: number; offset?: number }) => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_reviews_for_user', {
        p_user_id: userId,
        p_min_rating: filters?.min_rating,
        p_limit: filters?.limit || 20,
        p_offset: filters?.offset || 0,
      });

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast({
        title: 'Error',
        description: 'Failed to load reviews',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('rating_summary')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setStats(data as any);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const submitReview = async (reviewData: {
    job_id: string;
    reviewee_id: string;
    rating: number;
    title: string;
    comment: string;
    category_ratings?: Record<string, number>;
  }) => {
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('reviews')
        .insert({
          ...reviewData,
          reviewer_id: user.data.user.id,
        });

      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Review submitted successfully',
      });
      
      await fetchReviews();
      await fetchStats();
    } catch (error: any) {
      console.error('Error submitting review:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit review',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const respondToReview = async (reviewId: string, responseText: string) => {
    try {
      const { error } = await supabase
        .from('reviews')
        .update({
          response_text: responseText,
          response_at: new Date().toISOString(),
        })
        .eq('id', reviewId);

      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Response posted successfully',
      });
      
      await fetchReviews();
    } catch (error) {
      console.error('Error responding to review:', error);
      toast({
        title: 'Error',
        description: 'Failed to post response',
        variant: 'destructive',
      });
    }
  };

  const markReviewHelpful = async (reviewId: string, isHelpful: boolean) => {
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('review_helpfulness')
        .upsert({
          review_id: reviewId,
          user_id: user.data.user.id,
          is_helpful: isHelpful,
        });

      if (error) throw error;
      await fetchReviews();
    } catch (error) {
      console.error('Error marking review helpful:', error);
    }
  };

  const reportReview = async (reviewId: string, reason: string) => {
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('review_reports')
        .insert({
          review_id: reviewId,
          reported_by: user.data.user.id,
          reason,
        });

      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Review reported successfully',
      });
    } catch (error) {
      console.error('Error reporting review:', error);
      toast({
        title: 'Error',
        description: 'Failed to report review',
        variant: 'destructive',
      });
    }
  };

  return {
    reviews,
    stats,
    loading,
    fetchReviews,
    submitReview,
    respondToReview,
    markReviewHelpful,
    reportReview,
  };
}
