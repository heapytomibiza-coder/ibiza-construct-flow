/**
 * Job Matching Hook
 * Phase 4.2: Professional Matching Logic
 * 
 * Handles matching professionals to jobs based on the new 14-category taxonomy
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface JobMatchingCriteria {
  jobId?: string;
  categoryId?: string;
  subcategoryId?: string;
  microCategoryId?: string;
  location?: string;
  budgetRange?: [number, number];
}

interface MatchedProfessional {
  id: string;
  user_id: string;
  full_name: string;
  avatar_url: string | null;
  business_name: string | null;
  rating: number;
  reviews_count: number;
  verification_status: string;
  services: Array<{
    category: string;
    subcategory: string;
    micro_category?: string;
  }>;
  match_score: number;
  match_reasons: string[];
}

/**
 * Find professionals that match job requirements
 * Simplified version using basic matching logic
 */
export const useJobMatching = (criteria: JobMatchingCriteria) => {
  return useQuery({
    queryKey: ['job-matching', criteria],
    queryFn: async () => {
      if (!criteria.categoryId) return [];

      // For now, return empty array until professional_services table is properly set up
      // This will be enhanced once the service taxonomy is fully migrated
      console.log('Job matching criteria:', criteria);
      
      return [];
    },
    enabled: !!criteria.categoryId,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
};

/**
 * Get job details for matching
 */
export const useJobDetails = (jobId: string | undefined) => {
  return useQuery({
    queryKey: ['job-details', jobId],
    queryFn: async () => {
      if (!jobId) return null;

      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', jobId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!jobId,
  });
};

/**
 * Notify matched professionals about a new job
 */
export const notifyMatchedProfessionals = async (
  jobId: string,
  matchedProfessionalIds: string[]
) => {
  // Create notifications for matched professionals
  const notifications = matchedProfessionalIds.map(professionalId => ({
    user_id: professionalId,
    event_type: 'job_match',
    entity_type: 'job',
    entity_id: jobId,
    title: 'New Job Match',
    description: 'A new job matching your services has been posted',
    action_url: `/jobs/${jobId}`,
    notification_type: 'job',
    priority: 'high',
  }));

  const { error } = await supabase
    .from('activity_feed')
    .insert(notifications);

  if (error) throw error;
};
