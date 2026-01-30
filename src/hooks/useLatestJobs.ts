import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface LatestJob {
  id: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
  budget_type: 'fixed' | 'hourly';
  budget_value: number;
  location: {
    address?: string;
    area?: string;
    town?: string;
  } | null;
  category_name: string | null;
  category_slug: string | null;
  client: {
    name: string;
    avatar?: string;
  };
}

/**
 * Format location with fallback chain
 */
export const formatJobLocation = (location: any): string => {
  if (!location) return 'Ibiza';
  return location.address || location.area || location.town || 'Ibiza';
};

/**
 * Fetch latest open jobs for the homepage
 * Uses separate queries to avoid FK relationship issues
 */
export const useLatestJobs = (limit: number = 6) => {
  return useQuery({
    queryKey: ['latest-jobs', limit],
    queryFn: async (): Promise<LatestJob[]> => {
      // Fetch jobs without profile join (no FK exists)
      const { data: jobs, error: jobsError } = await supabase
        .from('jobs')
        .select(`
          id,
          title,
          description,
          status,
          created_at,
          budget_type,
          budget_value,
          location,
          client_id,
          micro_id,
          service_micro_categories (
            name,
            subcategory_id,
            service_subcategories (
              name,
              category_id,
              service_categories (
                name,
                slug
              )
            )
          )
        `)
        .eq('status', 'open')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (jobsError) {
        console.error('Error fetching latest jobs:', jobsError);
        return [];
      }

      if (!jobs || jobs.length === 0) {
        return [];
      }

      // Get unique client IDs
      const clientIds = [...new Set(jobs.map(j => j.client_id).filter(Boolean))] as string[];

      // Fetch profiles separately
      let profileMap: Record<string, { display_name: string | null; avatar_url: string | null }> = {};
      
      if (clientIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, display_name, avatar_url')
          .in('id', clientIds);

        if (!profilesError && profiles) {
          profileMap = Object.fromEntries(
            profiles.map(p => [p.id, { display_name: p.display_name, avatar_url: p.avatar_url }])
          );
        }
      }

      // Merge client-side
      return jobs.map((job: any) => ({
        id: job.id,
        title: job.title,
        description: job.description || '',
        status: job.status,
        created_at: job.created_at,
        budget_type: job.budget_type || 'fixed',
        budget_value: job.budget_value || 0,
        location: job.location,
        category_name: job.service_micro_categories?.service_subcategories?.service_categories?.name || null,
        category_slug: job.service_micro_categories?.service_subcategories?.service_categories?.slug || null,
        client: {
          name: profileMap[job.client_id]?.display_name || 'Client',
          avatar: profileMap[job.client_id]?.avatar_url || undefined,
        },
      }));
    },
    staleTime: 2 * 60 * 1000, // 2 minutes - jobs should be fresher
    gcTime: 5 * 60 * 1000,
  });
};
