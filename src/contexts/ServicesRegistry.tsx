import React, { createContext, useContext, ReactNode, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/hooks/useLanguage';
import { AIQuestion } from '@/hooks/useAIQuestions';
import { getActiveApprovedPack } from '@/lib/questionPacks';

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
    'House Build': 'Complete new house construction from foundation to finish',
    'Room Addition': 'Adding new rooms or extending existing space',
    'Second Story Addition': 'Adding a complete second floor to existing structure',
    'Full House Renovation': 'Complete renovation of existing property',
    'Leak Repair': 'Fix leaking pipes, taps, or fixtures',
    'Drain Unblocking': 'Clear blocked drains and pipes',
    'Bathroom Installation': 'Complete bathroom plumbing installation',
    'Socket Installation': 'Install new electrical sockets and switches',
    'Light Fitting': 'Install ceiling lights, spotlights, or fixtures',
    'Full House Rewire': 'Complete property rewiring to current standards',
    'Built-in Wardrobes': 'Custom built-in wardrobe installation',
    'Door Installation': 'Hang internal or external doors',
    'Multiple Small Jobs': 'Various minor repairs and maintenance tasks',
    'Furniture Assembly': 'Assemble flat-pack furniture (IKEA, etc.)',
    'TV Wall Mounting': 'Mount TV on wall with cable management',
    'Room Painting': 'Paint walls and ceilings in residential rooms',
    'Exterior Painting': 'Paint external walls and trim',
    'Bathroom Tiling': 'Tile bathroom walls and floor',
    'Kitchen Splashback': 'Install tiled kitchen backsplash',
    'Wall Plastering': 'Skim coat or full plaster walls',
    'Ceiling Plastering': 'Plaster or skim coat ceilings',
    'Roof Leak Repair': 'Find and fix roof leaks',
    'Full Roof Replacement': 'Complete roof replacement',
    'Complete Garden Design': 'Professional garden design and installation',
    'Driveway Installation': 'Install new driveway with paving or tarmac',
    'In-Ground Pool': 'Build new in-ground swimming pool',
    'Pool Renovation': 'Renovate and update existing pool',
    'AC Unit Installation': 'Install split or ducted air conditioning system',
    'Central Heating Installation': 'Install central heating system',
    'Architectural Design': 'Complete architectural design service',
    'Planning Permission': 'Planning application and submission service',
    'Foundation Work': 'Excavation and foundation construction',
    'Steel Beam Installation': 'Install structural steel beams (RSJ)',
    'Window Replacement': 'Replace windows with double/triple glazing',
    'Front Door Installation': 'Install new composite or wooden front door',
    'Full Kitchen Installation': 'Complete kitchen supply and installation',
    'Full Bathroom Renovation': 'Complete bathroom renovation',
    'Shop Fit-Out': 'Complete retail space fit-out',
    'Office Refurbishment': 'Refurbish and modernize office space',
    'Building Survey': 'Full structural survey and report',
    'EPC Certificate': 'Energy Performance Certificate',
  };
  return descriptions[micro] || `Professional ${micro.toLowerCase()} service`;
};

const getMicroServicePriceRange = (micro: string): { min: number; max: number; currency: string } => {
  const ranges: Record<string, { min: number; max: number }> = {
    'House Build': { min: 150000, max: 500000 },
    'Room Addition': { min: 25000, max: 100000 },
    'Second Story Addition': { min: 80000, max: 200000 },
    'Full House Renovation': { min: 50000, max: 250000 },
    'Leak Repair': { min: 80, max: 300 },
    'Drain Unblocking': { min: 100, max: 400 },
    'Bathroom Installation': { min: 2000, max: 8000 },
    'Kitchen Plumbing': { min: 500, max: 2500 },
    'Boiler Installation': { min: 2500, max: 6000 },
    'Socket Installation': { min: 80, max: 250 },
    'Light Fitting': { min: 100, max: 400 },
    'Full House Rewire': { min: 3000, max: 12000 },
    'Consumer Unit Upgrade': { min: 600, max: 1500 },
    'EV Charger Installation': { min: 800, max: 2000 },
    'Built-in Wardrobes': { min: 1500, max: 6000 },
    'Shelving Units': { min: 300, max: 1500 },
    'Door Installation': { min: 150, max: 600 },
    'Wooden Floor Installation': { min: 30, max: 80 },
    'Outdoor Decking': { min: 80, max: 150 },
    'Multiple Small Jobs': { min: 100, max: 400 },
    'Furniture Assembly': { min: 50, max: 200 },
    'TV Wall Mounting': { min: 80, max: 200 },
    'Picture Hanging': { min: 40, max: 150 },
    'Room Painting': { min: 200, max: 800 },
    'Full House Painting': { min: 2000, max: 10000 },
    'Exterior Painting': { min: 1500, max: 8000 },
    'Bathroom Tiling': { min: 800, max: 4000 },
    'Kitchen Splashback': { min: 300, max: 1200 },
    'Floor Tiling': { min: 40, max: 90 },
    'Wall Plastering': { min: 20, max: 45 },
    'Ceiling Plastering': { min: 25, max: 50 },
    'Patch Repair': { min: 100, max: 400 },
    'External Rendering': { min: 40, max: 80 },
    'Roof Leak Repair': { min: 200, max: 1000 },
    'Tile Replacement': { min: 150, max: 600 },
    'Full Roof Replacement': { min: 5000, max: 25000 },
    'Flat Roof Installation': { min: 80, max: 150 },
    'Complete Garden Design': { min: 3000, max: 30000 },
    'Driveway Installation': { min: 50, max: 150 },
    'Patio Installation': { min: 60, max: 120 },
    'Artificial Grass Installation': { min: 40, max: 80 },
    'In-Ground Pool': { min: 30000, max: 100000 },
    'Above-Ground Pool': { min: 5000, max: 20000 },
    'Pool Renovation': { min: 10000, max: 50000 },
    'AC Unit Installation': { min: 2000, max: 15000 },
    'Central Heating Installation': { min: 4000, max: 12000 },
    'Ventilation System': { min: 1500, max: 8000 },
    'Architectural Design': { min: 5000, max: 50000 },
    'Planning Permission': { min: 1500, max: 5000 },
    'Interior Design Service': { min: 2000, max: 20000 },
    'Foundation Work': { min: 5000, max: 30000 },
    'Steel Beam Installation': { min: 1500, max: 5000 },
    'Window Replacement': { min: 400, max: 1500 },
    'Front Door Installation': { min: 800, max: 3000 },
    'Bifold Doors': { min: 2500, max: 8000 },
    'Full Kitchen Installation': { min: 8000, max: 40000 },
    'Full Bathroom Renovation': { min: 5000, max: 20000 },
    'Shop Fit-Out': { min: 20000, max: 200000 },
    'Office Refurbishment': { min: 15000, max: 150000 },
    'Building Survey': { min: 500, max: 2000 },
    'EPC Certificate': { min: 80, max: 150 },
  };
  return { ...ranges[micro] || { min: 100, max: 5000 }, currency: 'EUR' };
};

const getMicroServiceIconName = (micro: string): string => {
  const icons: Record<string, string> = {
    'House Build': 'building',
    'Room Addition': 'plus-square',
    'Leak Repair': 'droplets',
    'Socket Installation': 'plug',
    'Full House Rewire': 'zap',
    'Built-in Wardrobes': 'cabinet',
    'Multiple Small Jobs': 'wrench',
    'Room Painting': 'paintbrush',
    'Bathroom Tiling': 'grid-3x3',
    'Wall Plastering': 'layers',
    'Roof Leak Repair': 'home',
    'Complete Garden Design': 'trees',
    'In-Ground Pool': 'waves',
    'AC Unit Installation': 'wind',
  };
  return icons[micro] || 'hammer';
};

const isPopularMicroService = (micro: string): boolean => {
  const popular = [
    'Multiple Small Jobs',
    'Leak Repair', 
    'Socket Installation',
    'Room Painting',
    'Bathroom Tiling',
    'Room Addition',
    'TV Wall Mounting',
    'Furniture Assembly'
  ];
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

  // Fetch services from new taxonomy tables
  const { data: rawServices = [], isLoading: loading, error, refetch } = useQuery<ServiceNode[]>({
    queryKey: ['services-registry', 'v2'],
    queryFn: async (): Promise<ServiceNode[]> => {
      // Fetch all micro-categories with their relationships
      const { data, error } = await supabase
        .from('service_micro_categories')
        .select(`
          id,
          name,
          slug,
          service_subcategories!inner(
            name,
            service_categories!inner(
              name
            )
          )
        `)
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      
      // Transform to ServiceNode format
      const services: ServiceNode[] = (data || []).map((item: any) => ({
        id: item.id,
        micro: item.name,
        subcategory: item.service_subcategories?.name || '',
        category: item.service_subcategories?.service_categories?.name || '',
        slug: item.slug || '', // Include database slug
      }));
      
      return services;
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

  // Question resolution: NEW priority: approved packs > AI generation > legacy snapshot > fallback
  const getQuestions = useCallback(async (microId: string): Promise<QuestionSet> => {
    const service = services.find(s => s.id === microId);
    if (!service) {
      console.warn('[ServicesRegistry] Service not found:', microId);
      return {
        microId,
        locale: currentLanguage,
        questions: [],
        source: 'fallback',
        version: 0
      };
    }

    const slug = service.slug || toSlug(`${service.category}-${service.subcategory}-${service.micro}`);
    
    try {
      // Priority 1: Check for active approved question pack
      const packQuestions = await getActiveApprovedPack(slug);
      if (packQuestions?.questions && Array.isArray(packQuestions.questions) && packQuestions.questions.length > 0) {
        console.log('[ServicesRegistry] Using active approved pack for', slug);
        return {
          microId,
          locale: currentLanguage,
          questions: packQuestions.questions as unknown as AIQuestion[],
          source: 'snapshot',
          version: 1
        };
      }

      // Priority 2: No approved pack found - Generate with AI and save as draft
      console.log('[ServicesRegistry] No approved pack, generating questions for', slug);
      
      const { data: aiData, error: aiError } = await supabase.functions.invoke('generate-questions', {
        body: { 
          serviceType: service.micro,
          category: service.category,
          subcategory: service.subcategory,
          slug: slug
        }
      });

      if (!aiError && aiData?.questions && Array.isArray(aiData.questions) && aiData.questions.length > 0) {
        console.log('[ServicesRegistry] AI generated questions, saving to question_packs');
        
        // Transform AI questions to QuestionDef format and save to question_packs
        const questionDefs = aiData.questions.map((q: any, idx: number) => ({
          key: q.id || `q${idx + 1}`,
          type: q.type === 'select' ? 'single' : q.type === 'checkbox' ? 'multi' : q.type,
          i18nKey: `${slug}.${q.id || `q${idx + 1}`}.title`,
          required: q.required || false,
          options: (q.options || []).map((opt: string, optIdx: number) => ({
            i18nKey: `${slug}.${q.id || `q${idx + 1}`}.options.${opt.toLowerCase().replace(/\s+/g, '_')}`,
            value: opt.toLowerCase().replace(/\s+/g, '_'),
            order: optIdx
          })),
          aiHint: q.label
        }));

        // Save as draft pack for admin review
        try {
          // Check if a pack already exists for this slug
          const { data: existingPacks } = await supabase
            .from('question_packs')
            .select('version')
            .eq('micro_slug', slug)
            .order('version', { ascending: false })
            .limit(1);

          const nextVersion = existingPacks && existingPacks.length > 0 
            ? (existingPacks[0].version || 0) + 1 
            : 1;

          await supabase.from('question_packs').insert({
            micro_slug: slug,
            status: 'draft',
            source: 'ai',
            version: nextVersion,
            content: {
              id: microId,
              category: service.category,
              name: service.micro,
              slug: slug,
              i18nPrefix: slug,
              questions: questionDefs
            }
          });
          console.log('[ServicesRegistry] Saved AI questions as draft pack v' + nextVersion);
        } catch (saveError) {
          console.error('[ServicesRegistry] Failed to save draft pack:', saveError);
        }

        return {
          microId,
          locale: currentLanguage,
          questions: aiData.questions,
          source: 'ai_generated',
          version: 1
        };
      }

      // Priority 3: Legacy snapshot fallback
      const { data: snapshot } = await supabase
        .from('micro_questions_snapshot')
        .select('questions_json, version')
        .eq('micro_category_id', microId)
        .single();

      if (snapshot?.questions_json && Array.isArray(snapshot.questions_json) && snapshot.questions_json.length > 0) {
        console.log('[ServicesRegistry] Using legacy snapshot');
        return {
          microId,
          locale: currentLanguage,
          questions: snapshot.questions_json as unknown as AIQuestion[],
          source: 'snapshot',
          version: snapshot.version || 1
        };
      }

      // Priority 4: Generic fallback from generalQuestions.ts
      console.log('[ServicesRegistry] Using generic fallback questions');
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
      console.error('[ServicesRegistry] Error resolving questions:', error);
      // Return minimal fallback
      return {
        microId,
        locale: currentLanguage,
        questions: [{
          id: 'scope',
          type: 'text' as any,
          label: 'Please describe what you need',
          required: true,
          options: []
        }],
        source: 'fallback',
        version: 0
      };
    }
  }, [services, currentLanguage, toSlug]);

  const getPricing = useCallback((microId: string): { min: number; max: number; currency: string } => {
    const service = services.find(s => s.id === microId);
    if (!service) return { min: 50, max: 150, currency: 'EUR' };
    return getMicroServicePriceRange(service.micro);
  }, [services]);

  const invalidateCache = useCallback(() => {
    refetch();
  }, [refetch]);

  const value = useMemo<ServicesRegistryContextType>(() => ({
    services,
    loading,
    error: error?.message || null,
    version: 1,
    getCategories,
    getSubcategories,
    getMicroServices,
    getServicesByCategory,
    getServiceCards,
    getQuestions,
    getPricing,
    invalidateCache
  }), [services, loading, error, getCategories, getSubcategories, getMicroServices, getServicesByCategory, getServiceCards, getQuestions, getPricing, invalidateCache]);

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
