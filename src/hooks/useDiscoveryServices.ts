import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface DiscoveryServiceItem {
  id: string;
  professional_id: string;
  service_id: string;
  name: string;
  description: string | null;
  base_price: number;
  pricing_type: 'flat_rate' | 'per_hour' | 'per_unit' | 'quote_required';
  unit_type: string;
  category: string;
  estimated_duration_minutes: number | null;
  difficulty_level: string;
  is_active: boolean;
  images?: string[];
  professional?: {
    full_name: string;
    avatar_url?: string;
    rating?: number;
    distance?: number;
  };
}

export const useDiscoveryServices = (category?: string, searchTerm?: string) => {
  const [services, setServices] = useState<DiscoveryServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        setError(null);

        let query = supabase
          .from('professional_service_items')
          .select(`
            *,
            professional:profiles!professional_service_items_professional_id_fkey (
              full_name,
              avatar_url
            )
          `)
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(50);

        if (category) {
          query = query.eq('category', category);
        }

        const { data, error: fetchError } = await query;

        if (fetchError) throw fetchError;

        // Transform data and add mock ratings/distance
        const transformedData = (data || []).map((item: any) => ({
          ...item,
          images: item.images || [],
          professional: item.professional ? {
            ...item.professional,
            rating: 4.5 + Math.random() * 0.5, // Mock rating
            distance: Math.random() * 15 + 1, // Mock distance
          } : undefined,
        }));

        // Filter by search term if provided
        if (searchTerm && searchTerm.trim()) {
          const lowerSearch = searchTerm.toLowerCase();
          const filtered = transformedData.filter((item: any) =>
            item.name.toLowerCase().includes(lowerSearch) ||
            item.description?.toLowerCase().includes(lowerSearch) ||
            item.category.toLowerCase().includes(lowerSearch) ||
            item.professional?.full_name.toLowerCase().includes(lowerSearch)
          );
          setServices(filtered);
        } else {
          setServices(transformedData);
        }
      } catch (err: any) {
        setError(err.message);
        console.error('Error fetching discovery services:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [category, searchTerm]);

  return {
    services,
    loading,
    error,
  };
};
