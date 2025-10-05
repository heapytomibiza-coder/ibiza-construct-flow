import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Review {
  id: string;
  contract_id: string | null;
  client_id: string;
  professional_id: string;
  rating: number;
  comment: string | null;
  is_verified: boolean;
  response: string | null;
  responded_at: string | null;
  created_at: string;
  updated_at: string;
  client?: {
    full_name: string;
    avatar_url?: string;
  };
  professional?: {
    full_name: string;
  };
}

interface UseReviewsParams {
  professionalId?: string;
  clientId?: string;
}

export const useReviews = ({ professionalId, clientId }: UseReviewsParams) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  });

  useEffect(() => {
    if (professionalId || clientId) {
      fetchReviews();
    }
  }, [professionalId, clientId]);

  const fetchReviews = async () => {
    try {
      let query = supabase
        .from('professional_reviews')
        .select(`
          *,
          client:profiles!professional_reviews_client_id_fkey(full_name, avatar_url),
          professional:profiles!professional_reviews_professional_id_fkey(full_name)
        `)
        .order('created_at', { ascending: false });

      if (professionalId) {
        query = query.eq('professional_id', professionalId);
      }
      if (clientId) {
        query = query.eq('client_id', clientId);
      }

      const { data, error } = await query;

      if (error) throw error;

      const transformedData = (data || []).map((item: any) => ({
        ...item,
        client: item.client?.[0] || undefined,
        professional: item.professional?.[0] || undefined,
      }));

      setReviews(transformedData as Review[]);
      calculateStats(transformedData as Review[]);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (reviewData: Review[]) => {
    if (reviewData.length === 0) {
      setStats({
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      });
      return;
    }

    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    
    const sums = reviewData.reduce(
      (acc, review) => {
        const rating = Math.round(review.rating) as 1 | 2 | 3 | 4 | 5;
        distribution[rating] = distribution[rating] + 1;
        
        return acc + review.rating;
      },
      0
    );

    const count = reviewData.length;

    setStats({
      averageRating: Number((sums / count).toFixed(1)),
      totalReviews: count,
      ratingDistribution: distribution,
    });
  };

  const submitReview = async (reviewData: {
    contract_id: string;
    professional_id: string;
    rating: number;
    comment?: string;
  }) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('professional_reviews')
      .insert({
        ...reviewData,
        client_id: user.id,
        is_verified: true, // Verified if linked to a contract
      })
      .select()
      .single();

    if (error) throw error;

    toast.success('Review submitted successfully!');
    await fetchReviews();
    return data;
  };

  const respondToReview = async (reviewId: string, resp: string) => {
    const { error } = await supabase
      .from('professional_reviews')
      .update({
        response: resp,
        responded_at: new Date().toISOString(),
      })
      .eq('id', reviewId);

    if (error) throw error;

    toast.success('Response posted successfully!');
    await fetchReviews();
  };

  const updateReview = async (reviewId: string, updates: Partial<Review>) => {
    const { error } = await supabase
      .from('professional_reviews')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', reviewId);

    if (error) throw error;

    toast.success('Review updated successfully!');
    await fetchReviews();
  };

  return {
    reviews,
    loading,
    stats,
    submitReview,
    respondToReview,
    updateReview,
    refetch: fetchReviews,
  };
};
