import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import type { Review, ReviewWithDetails, CategoryRatings } from "@/types/review";

export const useReviewSystem = (revieweeId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Fetch reviews for a professional
  const { data: reviews, isLoading } = useQuery({
    queryKey: ["reviews", revieweeId],
    queryFn: async () => {
      if (!revieweeId) return [];

      const { data, error } = await supabase
        .from("reviews")
        .select(`
          *,
          reviewer:profiles!reviewer_id(id, full_name, avatar_url)
        `)
        .eq("reviewee_id", revieweeId)
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as ReviewWithDetails[];
    },
    enabled: !!revieweeId,
  });

  // Calculate average ratings by category
  const averageRatings = reviews?.reduce(
    (acc, review) => ({
      timeliness: acc.timeliness + review.timeliness_rating / reviews.length,
      communication: acc.communication + review.communication_rating / reviews.length,
      value: acc.value + review.value_rating / reviews.length,
      quality: acc.quality + review.quality_rating / reviews.length,
      professionalism: acc.professionalism + review.professionalism_rating / reviews.length,
    }),
    { timeliness: 0, communication: 0, value: 0, quality: 0, professionalism: 0 }
  );

  const overallRating = reviews?.reduce((sum, r) => sum + r.overall_rating, 0) / (reviews?.length || 1);

  // Submit review mutation
  const submitReview = useMutation({
    mutationFn: async ({
      contractId,
      jobId,
      revieweeId,
      ratings,
      title,
      comment,
      photos,
    }: {
      contractId: string;
      jobId?: string;
      revieweeId: string;
      ratings: CategoryRatings;
      title?: string;
      comment?: string;
      photos?: string[];
    }) => {
      if (!user?.id) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("reviews")
        .insert({
          contract_id: contractId,
          job_id: jobId,
          reviewer_id: user.id,
          reviewee_id: revieweeId,
          timeliness_rating: ratings.timeliness,
          communication_rating: ratings.communication,
          value_rating: ratings.value,
          quality_rating: ratings.quality,
          professionalism_rating: ratings.professionalism,
          title,
          comment,
          photos,
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
        title: "Success",
        description: "Your review has been submitted",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit review",
        variant: "destructive",
      });
    },
  });

  // Add response to review
  const respondToReview = useMutation({
    mutationFn: async ({
      reviewId,
      responseText,
    }: {
      reviewId: string;
      responseText: string;
    }) => {
      const { error } = await supabase
        .from("reviews")
        .update({
          response_text: responseText,
          response_at: new Date().toISOString(),
        })
        .eq("id", reviewId)
        .eq("reviewee_id", user?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      toast({
        title: "Success",
        description: "Response added successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add response",
        variant: "destructive",
      });
    },
  });

  // Vote on review
  const voteReview = useMutation({
    mutationFn: async ({
      reviewId,
      voteType,
    }: {
      reviewId: string;
      voteType: "helpful" | "not_helpful";
    }) => {
      if (!user?.id) throw new Error("Not authenticated");

      const { error } = await supabase.from("review_votes").upsert({
        review_id: reviewId,
        voter_id: user.id,
        vote_type: voteType,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
    },
  });

  return {
    reviews,
    isLoading,
    averageRatings,
    overallRating,
    totalReviews: reviews?.length || 0,
    submitReview,
    respondToReview,
    voteReview,
  };
};
