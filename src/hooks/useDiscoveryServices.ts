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

        // Fetch services
        let serviceQuery = supabase
          .from('professional_service_items')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(50);

        if (category) {
          serviceQuery = serviceQuery.eq('category', category);
        }

        const { data: servicesData, error: servicesError } = await serviceQuery;
        if (servicesError) throw servicesError;

        // Get unique professional IDs
        const professionalIds = [...new Set(servicesData?.map((s: any) => s.professional_id).filter(Boolean))];
        
        // Fetch professional profiles
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .in('id', professionalIds);

        // Create a map of profiles
        const profilesMap = (profilesData || []).reduce((acc: any, profile: any) => {
          acc[profile.id] = profile;
          return acc;
        }, {});

        // Transform data
        const transformedData = (servicesData || []).map((item: any) => ({
          ...item,
          images: item.images || [],
          professional: profilesMap[item.professional_id] ? {
            ...profilesMap[item.professional_id],
            rating: 4.5 + Math.random() * 0.5,
            distance: Math.random() * 15 + 1,
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
