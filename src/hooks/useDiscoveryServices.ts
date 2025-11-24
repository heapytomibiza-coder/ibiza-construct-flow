import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Filters {
  selectedTaxonomy: {
    category: string;
    subcategory: string;
    micro: string;
  } | null;
  specialists: string[];
  priceRange: [number, number];
  availability: string[];
  location: string;
}

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

export const useDiscoveryServices = (searchTerm?: string, filters?: Filters) => {
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

        // Apply price filter
        if (filters?.priceRange) {
          const [min, max] = filters.priceRange;
          if (min > 0) {
            serviceQuery = serviceQuery.gte('base_price', min);
          }
          if (max < 10000) {
            serviceQuery = serviceQuery.lte('base_price', max);
          }
        }

        // Apply taxonomy category filter
        if (filters?.selectedTaxonomy?.category) {
          serviceQuery = serviceQuery.eq('category', filters.selectedTaxonomy.category);
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
        let transformedData = (servicesData || []).map((item: any) => ({
          ...item,
          images: item.images || [],
          professional: profilesMap[item.professional_id] ? {
            ...profilesMap[item.professional_id],
            rating: 4.5 + Math.random() * 0.5,
            distance: Math.random() * 15 + 1,
          } : undefined,
        }));

        // Apply client-side filters
        
        // Filter by category first (matches exactly what's in the database)
        if (filters?.selectedTaxonomy?.category) {
          transformedData = transformedData.filter((item: any) => {
            const itemCategory = item.category?.toLowerCase() || '';
            const filterCategory = filters.selectedTaxonomy?.category.toLowerCase() || '';
            
            // Match by exact category or if item category contains filter category
            return itemCategory === filterCategory || 
                   itemCategory.includes(filterCategory) ||
                   filterCategory.includes(itemCategory);
          });
        }

        // Filter by subcategory
        if (filters?.selectedTaxonomy?.subcategory) {
          transformedData = transformedData.filter((item: any) => {
            const itemSubcategory = item.subcategory?.toLowerCase() || '';
            const itemCategory = item.category?.toLowerCase() || '';
            const filterSubcategory = filters.selectedTaxonomy?.subcategory.toLowerCase() || '';
            
            // Match subcategory in either subcategory field or category field
            return itemSubcategory === filterSubcategory ||
                   itemSubcategory.includes(filterSubcategory) ||
                   itemCategory.includes(filterSubcategory);
          });
        }

        // Filter by micro
        if (filters?.selectedTaxonomy?.micro) {
          transformedData = transformedData.filter((item: any) => 
            item.micro === filters.selectedTaxonomy?.micro ||
            item.name === filters.selectedTaxonomy?.micro
          );
        }

        // Filter by search term if provided
        if (searchTerm && searchTerm.trim()) {
          const lowerSearch = searchTerm.toLowerCase();
          transformedData = transformedData.filter((item: any) =>
            item.name.toLowerCase().includes(lowerSearch) ||
            item.description?.toLowerCase().includes(lowerSearch) ||
            item.category.toLowerCase().includes(lowerSearch) ||
            item.professional?.full_name.toLowerCase().includes(lowerSearch)
          );
        }

        // Filter by specialists (match against category/subcategory)
        if (filters?.specialists && filters.specialists.length > 0) {
          transformedData = transformedData.filter((item: any) =>
            filters.specialists.some(specialist =>
              item.category?.toLowerCase().includes(specialist.toLowerCase()) ||
              item.subcategory?.toLowerCase().includes(specialist.toLowerCase())
            )
          );
        }

        // Sort by price (lowest first) for comparison transparency
        transformedData = transformedData.sort((a: any, b: any) => {
          const priceA = a.base_price || 0;
          const priceB = b.base_price || 0;
          return priceA - priceB;
        });

        setServices(transformedData);
      } catch (err: any) {
        setError(err.message);
        console.error('Error fetching discovery services:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [searchTerm, filters]);

  return {
    services,
    loading,
    error,
  };
};
