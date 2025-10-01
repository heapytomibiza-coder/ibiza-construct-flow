import React, { createContext, useContext, ReactNode, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/hooks/useLanguage';
import { AIQuestion } from '@/hooks/useAIQuestions';

// Types
export interface ServiceNode {
  id: string;
  category: string;
  subcategory: string;
  micro: string;
  slug?: string; // Stable micro-service slug for deterministic lookups
}

export interface ServiceWithMetadata extends ServiceNode {
  title: string;
  description: string;
  priceRange: string;
  popular: boolean;
  slug: string;
  icon: string;
}

export interface QuestionSet {
  microId: string;
  locale: string;
  questions: AIQuestion[];
  source: 'snapshot' | 'ai_generated' | 'fallback';
  version: number;
}

interface ServicesRegistryContextType {
  services: ServiceNode[];
  loading: boolean;
  error: string | null;
  version: number;
  
  // Data access
  getCategories: () => string[];
  getSubcategories: (category: string) => string[];
  getMicroServices: (category: string, subcategory: string) => ServiceNode[];
  getServicesByCategory: (category: string) => ServiceNode[];
  getServiceCards: () => ServiceWithMetadata[];
  
  // Questions
  getQuestions: (microId: string) => Promise<QuestionSet>;
  
  // Pricing
  getPricing: (microId: string) => { min: number; max: number; currency: string };
  
  // Cache management
  invalidateCache: () => void;
}

const ServicesRegistryContext = createContext<ServicesRegistryContextType | undefined>(undefined);

// Metadata helpers (consolidated from multiple files)
const getMicroServiceDescription = (micro: string): string => {
  const descriptions: Record<string, string> = {
    'Help Moving': 'Professional moving assistance and heavy lifting',
    'Truck Assisted Moving': 'Full-service moving with truck and crew',
    'Heavy Lifting & Loading': 'Safe handling of heavy furniture and appliances',
    'Packing Services': 'Professional packing with quality materials',
    'Unpacking Services': 'Complete unpacking and organising service',
    'House Cleaning': 'Regular or one-time house cleaning service',
    'Deep Cleaning': 'Thorough deep cleaning for every room',
    'Post-Party Cleanup': 'Quick cleanup after events and parties',
    'Carpet Cleaning': 'Professional carpet and upholstery cleaning',
    'Window Cleaning': 'Interior and exterior window cleaning',
    'Grocery Shopping': 'Personal grocery shopping and delivery',
    'Personal Shopping': 'Shopping assistance for any items',
    'Same Day Delivery': 'Fast same-day delivery service',
    'Furniture Delivery': 'Safe furniture delivery and placement',
    'Package Pickup': 'Convenient package pickup and delivery',
    'Home Organization': 'Professional organising and decluttering',
    'Office Organization': 'Workspace organisation and filing',
    'Personal Assistant Tasks': 'Various personal assistance tasks',
    'Wait in Line Service': 'Professional waiting and queuing service',
    'Dog Walking': 'Regular dog walking and exercise',
    'Pet Sitting': 'In-home pet care and sitting',
    'IKEA Furniture Assembly': 'Expert IKEA furniture assembly',
    'General Furniture Assembly': 'Assembly of any furniture pieces',
    'TV Mounting': 'Professional TV wall mounting service',
    'Picture & Artwork Hanging': 'Precise picture and artwork hanging',
    'Smart Home Installation': 'Smart device setup and installation',
    'Christmas Lights Installation': 'Holiday lighting installation and removal',
    'Holiday Decorating': 'Complete holiday decoration service',
    'Pressure Washing': 'High-pressure cleaning for exteriors',
    'Gutter Cleaning': 'Professional gutter cleaning and maintenance'
  };
  return descriptions[micro] || `Professional ${micro.toLowerCase()} service`;
};

const getMicroServicePriceRange = (micro: string): { min: number; max: number; currency: string } => {
  const ranges: Record<string, { min: number; max: number }> = {
    'Help Moving': { min: 80, max: 200 },
    'Truck Assisted Moving': { min: 200, max: 600 },
    'Heavy Lifting & Loading': { min: 60, max: 150 },
    'Packing Services': { min: 100, max: 300 },
    'Unpacking Services': { min: 80, max: 250 },
    'House Cleaning': { min: 60, max: 150 },
    'Deep Cleaning': { min: 120, max: 300 },
    'Post-Party Cleanup': { min: 80, max: 200 },
    'Carpet Cleaning': { min: 100, max: 250 },
    'Window Cleaning': { min: 60, max: 120 },
    'Grocery Shopping': { min: 25, max: 50 },
    'Personal Shopping': { min: 30, max: 60 },
    'Same Day Delivery': { min: 20, max: 80 },
    'Furniture Delivery': { min: 50, max: 150 },
    'Package Pickup': { min: 15, max: 40 },
    'Home Organization': { min: 80, max: 200 },
    'Office Organization': { min: 100, max: 250 },
    'Personal Assistant Tasks': { min: 40, max: 100 },
    'Wait in Line Service': { min: 25, max: 60 },
    'Dog Walking': { min: 20, max: 40 },
    'Pet Sitting': { min: 30, max: 80 },
    'IKEA Furniture Assembly': { min: 50, max: 120 },
    'General Furniture Assembly': { min: 60, max: 150 },
    'TV Mounting': { min: 80, max: 150 },
    'Picture & Artwork Hanging': { min: 40, max: 80 },
    'Smart Home Installation': { min: 100, max: 300 },
    'Christmas Lights Installation': { min: 150, max: 400 },
    'Holiday Decorating': { min: 100, max: 300 },
    'Pressure Washing': { min: 120, max: 300 },
    'Gutter Cleaning': { min: 100, max: 200 }
  };
  return { ...ranges[micro] || { min: 50, max: 150 }, currency: 'EUR' };
};

const getMicroServiceIconName = (micro: string): string => {
  const icons: Record<string, string> = {
    'Help Moving': 'package',
    'House Cleaning': 'sparkles',
    'Grocery Shopping': 'shopping-cart',
    'Dog Walking': 'dog',
    'IKEA Furniture Assembly': 'wrench'
  };
  return icons[micro] || 'briefcase';
};

const isPopularMicroService = (micro: string): boolean => {
  const popular = ['House Cleaning', 'Help Moving', 'Dog Walking', 'IKEA Furniture Assembly'];
  return popular.includes(micro);
};

const getServiceSlug = (category: string): string => {
  return category.toLowerCase().replace(/\s+/g, '-');
};

export const ServicesRegistryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { currentLanguage, changeLanguage } = useLanguage();
  
  // Helper to generate stable slug
  const toSlug = (s: string) =>
    s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  // Fetch services from unified view (single source of truth)
  const { data: rawServices = [], isLoading: loading, error, refetch } = useQuery<ServiceNode[]>({
    queryKey: ['services-registry', 'v1'],
    queryFn: async (): Promise<ServiceNode[]> => {
      const { data, error } = await supabase
        .from('services_unified_v1')
        .select('id, category, subcategory, micro')
        .order('category, subcategory, micro');
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });

  // Enhance services with stable slugs
  const services = rawServices.map(svc => ({
    ...svc,
    slug: toSlug(`${svc.category}-${svc.subcategory}-${svc.micro}`)
  }));

  // Data access methods
  const getCategories = useCallback((): string[] => {
    return [...new Set(services.map(s => s.category))];
  }, [services]);

  const getSubcategories = useCallback((category: string): string[] => {
    return [...new Set(
      services
        .filter(s => s.category === category)
        .map(s => s.subcategory)
    )];
  }, [services]);

  const getMicroServices = useCallback((category: string, subcategory: string): ServiceNode[] => {
    return services.filter(s => 
      s.category === category && s.subcategory === subcategory
    );
  }, [services]);

  const getServicesByCategory = useCallback((category: string): ServiceNode[] => {
    return services.filter(s => s.category === category);
  }, [services]);

  const getServiceCards = useCallback((): ServiceWithMetadata[] => {
    return services.map(service => ({
      ...service,
      title: service.micro,
      description: getMicroServiceDescription(service.micro),
      priceRange: `€${getMicroServicePriceRange(service.micro).min} - €${getMicroServicePriceRange(service.micro).max}`,
      popular: isPopularMicroService(service.micro),
      slug: getServiceSlug(service.category),
      icon: getMicroServiceIconName(service.micro)
    }));
  }, [services]);

  // Question resolution with strict hierarchy
  const getQuestions = useCallback(async (microId: string): Promise<QuestionSet> => {
    try {
      // 1. Try approved snapshot first
      const { data: snapshot } = await supabase
        .from('micro_questions_snapshot')
        .select('questions_json, version')
        .eq('micro_category_id', microId)
        .single();

      if (snapshot?.questions_json) {
        const questions = Array.isArray(snapshot.questions_json) 
          ? snapshot.questions_json as unknown as AIQuestion[]
          : [];
        return {
          microId,
          locale: currentLanguage,
          questions,
          source: 'snapshot',
          version: snapshot.version || 1
        };
      }

      // 2. Check AI-generated with approved status
      const { data: aiRuns } = await supabase
        .from('micro_questions_ai_runs')
        .select('raw_response, created_at')
        .eq('micro_category_id', microId)
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .limit(1);

      if (aiRuns && aiRuns.length > 0 && aiRuns[0].raw_response) {
        const response = aiRuns[0].raw_response as any;
        if (response.questions && Array.isArray(response.questions)) {
          return {
            microId,
            locale: currentLanguage,
            questions: response.questions,
            source: 'ai_generated',
            version: 1
          };
        }
      }

      // 3. Generic fallback from generalQuestions.ts
      const { generalQuestions } = await import('@/features/wizard/generalQuestions');
      return {
        microId,
        locale: currentLanguage,
        questions: generalQuestions.map((q, idx) => ({
          id: `fallback-${idx}`,
          type: q.type as any,
          label: q.label || 'Question',
          required: q.required || false,
          options: q.options || []
        })),
        source: 'fallback',
        version: 0
      };
    } catch (error) {
      console.error('Error resolving questions:', error);
      // Return minimal fallback
      return {
        microId,
        locale: currentLanguage,
        questions: [],
        source: 'fallback',
        version: 0
      };
    }
  }, [currentLanguage]);

  const getPricing = useCallback((microId: string): { min: number; max: number; currency: string } => {
    const service = services.find(s => s.id === microId);
    if (!service) return { min: 50, max: 150, currency: 'EUR' };
    return getMicroServicePriceRange(service.micro);
  }, [services]);

  const invalidateCache = useCallback(() => {
    refetch();
  }, [refetch]);

  const value: ServicesRegistryContextType = {
    services,
    loading,
    error: error?.message || null,
    version: 1, // Can be incremented when admin publishes changes
    getCategories,
    getSubcategories,
    getMicroServices,
    getServicesByCategory,
    getServiceCards,
    getQuestions,
    getPricing,
    invalidateCache
  };

  return (
    <ServicesRegistryContext.Provider value={value}>
      {children}
    </ServicesRegistryContext.Provider>
  );
};

export const useServicesRegistry = () => {
  const context = useContext(ServicesRegistryContext);
  if (context === undefined) {
    throw new Error('useServicesRegistry must be used within a ServicesRegistryProvider');
  }
  return context;
};
