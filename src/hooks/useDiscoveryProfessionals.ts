import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface DiscoveryFilters {
  verified?: boolean;
  location?: string;
  minRating?: number;
  availability?: string[];
  priceRange?: [number, number];
  skills?: string[];
}

export function useDiscoveryProfessionals(searchTerm: string, filters: DiscoveryFilters) {
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfessionals();
  }, [searchTerm, filters]);

  const loadProfessionals = async () => {
    try {
      setLoading(true);

      let query = supabase
        .from('professional_profiles')
        .select(`
          user_id,
          primary_trade,
          bio,
          experience_years,
          hourly_rate,
          zones,
          skills,
          portfolio_images,
          response_time_hours,
          is_active,
          subscription_tier,
          profiles!inner(
            full_name,
            avatar_url
          )
        `)
        .eq('is_active', true);

      // Apply search filter
      if (searchTerm) {
        query = query.or(`primary_trade.ilike.%${searchTerm}%,bio.ilike.%${searchTerm}%`);
      }

      // Apply location filter
      if (filters.location) {
        query = query.contains('zones', [filters.location]);
      }

      const { data: proData, error: proError } = await query;

      if (proError) throw proError;

      // Fetch stats separately
      const professionalIds = proData?.map(p => p.user_id) || [];
      let statsMap = new Map();
      let verifications: any[] = [];
      
      if (professionalIds.length > 0) {
        // Fetch stats
        const { data: statsData } = await supabase
          .from('professional_stats')
          .select('*')
          .in('professional_id', professionalIds);

        statsData?.forEach(stat => {
          statsMap.set(stat.professional_id, stat);
        });

        // Fetch verification status
        const { data: verData } = await supabase
          .from('professional_verifications')
          .select('professional_id, status, expires_at')
          .in('professional_id', professionalIds)
          .eq('status', 'approved')
          .order('submitted_at', { ascending: false });

        verifications = verData || [];
      }

      // Map verification status to professionals
      const professionalsWithVerification = proData?.map(prof => {
        const stats = statsMap.get(prof.user_id);
        const verification = verifications.find(v => v.professional_id === prof.user_id);
        const isVerified = verification && 
          verification.status === 'approved' && 
          (!verification.expires_at || new Date(verification.expires_at) > new Date());

        return {
          ...prof,
          id: prof.user_id,
          full_name: prof.profiles?.full_name || 'Professional',
          profile_image_url: prof.profiles?.avatar_url,
          specializations: Array.isArray(prof.skills) ? prof.skills : [],
          rating: stats?.average_rating || 0,
          total_jobs_completed: stats?.completed_bookings || 0,
          total_reviews: stats?.total_reviews || 0,
          verification_status: isVerified ? 'verified' : 'unverified',
          availability_status: 'available',
          base_price_band: prof.hourly_rate > 50 ? 'premium' : prof.hourly_rate < 25 ? 'budget' : 'standard',
          coverage_area: Array.isArray(prof.zones) ? prof.zones : []
        };
      }) || [];

      // Apply verification filter
      let filtered = professionalsWithVerification;
      if (filters.verified) {
        filtered = filtered.filter(p => p.verification_status === 'verified');
      }

      // Apply rating filter
      if (filters.minRating) {
        filtered = filtered.filter(p => p.rating >= filters.minRating!);
      }

      // Apply price range filter
      if (filters.priceRange) {
        filtered = filtered.filter(p => {
          const rate = p.hourly_rate || 0;
          return rate >= filters.priceRange![0] && rate <= filters.priceRange![1];
        });
      }

      // Apply skills filter
      if (filters.skills && filters.skills.length > 0) {
        filtered = filtered.filter(p => {
          return filters.skills!.some(skill => 
            p.specializations.some((s: string) => s.toLowerCase().includes(skill.toLowerCase()))
          );
        });
      }

      // Sort by rating and verification status
      filtered.sort((a, b) => {
        if (a.verification_status === 'verified' && b.verification_status !== 'verified') return -1;
        if (a.verification_status !== 'verified' && b.verification_status === 'verified') return 1;
        return (b.rating || 0) - (a.rating || 0);
      });

      setProfessionals(filtered);
    } catch (error) {
      console.error('Error loading professionals:', error);
      setProfessionals([]);
    } finally {
      setLoading(false);
    }
  };

  return { professionals, loading, refresh: loadProfessionals };
}
