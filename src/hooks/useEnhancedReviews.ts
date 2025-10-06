import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CreateReviewParams {
  jobId: string;
  contractId?: string;
  revieweeId: string;
  rating: number;
  title?: string;
  comment?: string;
  categoryRatings?: Record<string, number>;
}

interface VoteHelpfulParams {
  reviewId: string;
  isHelpful: boolean;
}

export const useEnhancedReviews = (userId?: string, minRating?: number) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch reviews for a user
  const { data: reviews, isLoading } = useQuery({
    queryKey: ['enhanced-reviews', userId, minRating],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase.rpc('get_reviews_for_user', {
        p_user_id: userId,
        p_min_rating: minRating,
        p_limit: 50,
        p_offset: 0,
      });

      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
  });

  // Fetch rating summary
  const { data: ratingSummary } = useQuery({
    queryKey: ['rating-summary', userId],
    queryFn: async () => {
      if (!userId) return null;

      const { data, error } = await supabase
        .from('rating_summary')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!userId,
  });

  // Create review
  const createReview = useMutation({
    mutationFn: async (params: CreateReviewParams) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('reviews')
        .insert({
          job_id: params.jobId,
          contract_id: params.contractId,
          reviewer_id: user.id,
          reviewee_id: params.revieweeId,
          rating: params.rating,
          title: params.title,
          comment: params.comment,
          category_ratings: params.categoryRatings || {},
          is_verified: true,
          moderation_status: 'approved',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enhanced-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['rating-summary'] });
      toast({
        title: "Review Submitted",
        description: "Thank you for your feedback!",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Failed to Submit Review",
        description: error.message || "An error occurred",
      });
    },
  });

  // Vote helpful/unhelpful
  const voteHelpful = useMutation({
    mutationFn: async ({ reviewId, isHelpful }: VoteHelpfulParams) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('review_helpful_votes')
        .upsert({
          review_id: reviewId,
          user_id: user.id,
          is_helpful: isHelpful,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enhanced-reviews'] });
    },
  });

  // Respond to review
  const respondToReview = useMutation({
    mutationFn: async ({ reviewId, responseText }: { reviewId: string; responseText: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('reviews')
        .update({
          response_text: responseText,
          response_at: new Date().toISOString(),
        })
        .eq('id', reviewId)
        .eq('reviewee_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enhanced-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['rating-summary'] });
      toast({
        title: "Response Posted",
        description: "Your response has been added to the review.",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Failed to Post Response",
        description: error.message || "An error occurred",
      });
    },
  });

  // Flag review
  const flagReview = useMutation({
    mutationFn: async ({ reviewId, reason }: { reviewId: string; reason: string }) => {
      const { data, error } = await supabase
        .from('reviews')
        .update({
          flagged_at: new Date().toISOString(),
          flag_reason: reason,
          moderation_status: 'flagged',
        })
        .eq('id', reviewId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enhanced-reviews'] });
      toast({
        title: "Review Flagged",
        description: "Thank you for helping us maintain quality reviews.",
      });
    },
  });

  return {
    reviews,
    isLoading,
    ratingSummary,
    createReview,
    voteHelpful,
    respondToReview,
    flagReview,
  };
};
