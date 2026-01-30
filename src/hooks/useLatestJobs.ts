import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { inferCategoryFromTitle } from '@/lib/jobs/categoryInference';

export interface LatestJob {
  id: string;
  title: string;
  description: string;
  teaser?: string;
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
  has_photos?: boolean;
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
  if (typeof location === 'string') return location;
  return location.area || location.town || 'Ibiza';
};

/**
 * Fetch latest publicly listed jobs for the homepage
 * Uses the secure public_jobs_preview view for unauthenticated access
 * Privacy: Never exposes client identity publicly
 */
export const useLatestJobs = (limit: number = 6) => {
  return useQuery({
    queryKey: ['latest-jobs-preview', limit],
    queryFn: async (): Promise<LatestJob[]> => {
      // Use the secure public_jobs_preview view
      // This view only exposes preview-safe fields (no client_id, no attachments)
      const { data: jobs, error } = await supabase
        .from('public_jobs_preview')
        .select('*')
        .order('published_at', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching jobs preview:', error);
        return [];
      }

      if (!jobs || jobs.length === 0) {
        return [];
      }

      // Map the preview data to LatestJob format
      // Privacy: Client name is always "Client" - no real identity exposed
      return jobs.map((job: any) => {
        const inferred = inferCategoryFromTitle(job.title);
        return {
          id: job.id,
          title: job.title,
          description: job.teaser || '',
          teaser: job.teaser,
          status: job.status,
          created_at: job.created_at,
          budget_type: job.budget_type || 'fixed',
          budget_value: job.budget_value || 0,
          location: {
            area: job.area || job.town || 'Ibiza',
            town: job.town,
          },
          category_name: inferred?.name || null,
          category_slug: inferred?.slug || null,
          has_photos: job.has_photos || false,
          // PRIVACY: Never expose real client identity in public preview
          client: {
            name: 'Client',
            avatar: undefined,
          },
        };
      });
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000,
  });
};
