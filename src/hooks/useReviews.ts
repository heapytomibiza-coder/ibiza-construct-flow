import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Review {
  id: string;
  job_id?: string;
  contract_id?: string;
  reviewer_id: string;
  reviewee_id: string;
  rating: number;
  comment?: string;
  response?: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export const useReviews = (entityId?: string, entityType: 'job' | 'contract' | 'professional' = 'professional') => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: reviews, isLoading } = useQuery({
    queryKey: ["reviews", entityType, entityId],
    queryFn: async () => {
      if (!entityId) return [];

      let query = supabase
        .from("reviews")
        .select(`
          *,
          reviewer:profiles!reviews_reviewer_id_fkey(id, full_name, display_name, avatar_url),
          reviewee:profiles!reviews_reviewee_id_fkey(id, full_name, display_name, avatar_url)
        `)
        .order("created_at", { ascending: false });

      if (entityType === 'job') {
        query = query.eq('job_id', entityId);
      } else if (entityType === 'contract') {
        query = query.eq('contract_id', entityId);
      } else if (entityType === 'professional') {
        query = query.eq('reviewee_id', entityId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Review[];
    },
    enabled: !!entityId,
  });

  const submitReview = useMutation({
    mutationFn: async ({
      jobId,
      contractId,
      revieweeId,
      rating,
      comment,
    }: {
      jobId?: string;
      contractId?: string;
      revieweeId: string;
      rating: number;
      comment?: string;
    }) => {
      const { data, error } = await supabase
        .from("reviews")
        .insert({
          job_id: jobId,
          contract_id: contractId,
          reviewee_id: revieweeId,
          rating,
          comment,
          is_verified: true,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      toast({
        title: "Review submitted",
        description: "Thank you for your feedback!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to submit review",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const respondToReview = useMutation({
    mutationFn: async ({ reviewId, response }: { reviewId: string; response: string }) => {
      const { data, error} = await supabase
        .from("reviews")
        .update({ response })
        .eq("id", reviewId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      toast({
        title: "Response posted",
        description: "Your response has been added to the review.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to post response",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const averageRating = reviews?.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  const ratingDistribution = reviews?.reduce((acc, review) => {
    acc[review.rating] = (acc[review.rating] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  return {
    reviews,
    isLoading,
    submitReview: submitReview.mutate,
    isSubmitting: submitReview.isPending,
    respondToReview: respondToReview.mutate,
    isResponding: respondToReview.isPending,
    averageRating,
    ratingDistribution,
    totalReviews: reviews?.length || 0,
  };
};
