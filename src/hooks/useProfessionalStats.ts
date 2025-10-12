import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ProfessionalStats {
  total_bookings: number;
  completed_bookings: number;
  total_earnings: number;
  average_rating: number;
  total_reviews: number;
  response_rate: number;
  completion_rate: number;
  repeat_client_rate: number;
  last_active_at?: string;
}

export interface ProfessionalPerformance {
  stats: ProfessionalStats;
  recentBookings: Array<{
    id: string;
    title: string;
    status: string;
    created_at: string;
    total_estimated_price: number;
  }>;
  recentReviews: Array<{
    id: string;
    rating: number;
    title?: string;
    comment?: string;
    created_at: string;
    client_name?: string;
  }>;
}

export const useProfessionalStats = (professionalId?: string) => {
  const [performance, setPerformance] = useState<ProfessionalPerformance>({
    stats: {
      total_bookings: 0,
      completed_bookings: 0,
      total_earnings: 0,
      average_rating: 0,
      total_reviews: 0,
      response_rate: 0,
      completion_rate: 0,
      repeat_client_rate: 0
    },
    recentBookings: [],
    recentReviews: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      if (!professionalId) {
        // Try to get current user's ID
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }
        professionalId = user.id;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch or create professional stats
        const { data: statsData, error: statsError } = await supabase
          .from('professional_stats')
          .select('*')
          .eq('professional_id', professionalId)
          .maybeSingle();

        if (statsError && statsError.code !== 'PGRST116') throw statsError;

        // If no stats exist, create default entry
        let stats = statsData;
        if (!stats) {
          const { data: newStats, error: createError } = await supabase
            .from('professional_stats')
            .insert({
              professional_id: professionalId,
              total_bookings: 0,
              completed_bookings: 0,
              total_earnings: 0,
              average_rating: 0,
              total_reviews: 0,
              response_rate: 0,
              completion_rate: 0,
              repeat_client_rate: 0
            })
            .select()
            .single();

          if (createError) throw createError;
          stats = newStats;
        }

        // Fetch recent job quotes (replacing legacy booking_requests)
        const { data: quotesData, error: quotesError } = await supabase
          .from('job_quotes')
          .select(`
            id,
            status,
            created_at,
            quote_amount,
            job:jobs!job_id(id, title)
          `)
          .eq('professional_id', professionalId)
          .order('created_at', { ascending: false })
          .limit(5);

        if (quotesError) throw quotesError;

        // Transform quotes data to match expected format
        const bookingsData = (quotesData || []).map(quote => ({
          id: quote.id,
          title: quote.job?.title || 'Job',
          status: quote.status,
          created_at: quote.created_at,
          total_estimated_price: quote.quote_amount
        }));

        // Fetch recent reviews
        const { data: reviewsData, error: reviewsError } = await supabase
          .from('professional_reviews')
          .select(`
            id, rating, title, comment, created_at,
            profiles!professional_reviews_client_id_fkey(full_name)
          `)
          .eq('professional_id', professionalId)
          .order('created_at', { ascending: false })
          .limit(5);

        if (reviewsError) throw reviewsError;

        const recentReviews = (reviewsData || []).map(review => ({
          id: review.id,
          rating: review.rating,
          title: review.title,
          comment: review.comment,
          created_at: review.created_at,
          client_name: (review.profiles as any)?.full_name || 'Anonymous'
        }));

        setPerformance({
          stats: stats as ProfessionalStats,
          recentBookings: bookingsData || [],
          recentReviews
        });

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch professional stats');
        console.error('Error fetching professional stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [professionalId]);

  return { performance, loading, error };
};