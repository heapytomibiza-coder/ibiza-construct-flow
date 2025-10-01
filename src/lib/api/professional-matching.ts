/**
 * Professional Matching API Adapter
 * Adapts Supabase Edge Functions to contract-first API
 */

import { supabase } from '@/integrations/supabase/client';

export interface MatchProfessionalsRequest {
  jobRequirements: {
    title: string;
    description: string;
    skills?: string[];
  };
  location?: string;
  budget?: number;
  urgency?: 'low' | 'normal' | 'high' | 'urgent';
}

export interface ProfessionalMatch {
  professionalId: string;
  name: string;
  matchScore: number;
  explanation: string;
  strengths: string[];
  concerns: string[];
  rank: number;
}

export interface MatchProfessionalsResponse {
  analysis: string;
  matches: ProfessionalMatch[];
  totalCandidates: number;
  averageMatchScore: number;
  timestamp: string;
}

export interface RankMatchesRequest {
  jobId: string;
  professionalIds: string[];
  criteria?: {
    skillsWeight?: number;
    ratingWeight?: number;
    availabilityWeight?: number;
    costWeight?: number;
  };
}

export interface CheckAvailabilityRequest {
  professionalId: string;
  startDate: string;
  endDate?: string;
  estimatedHours?: number;
}

export interface SubmitMatchFeedbackRequest {
  jobId: string;
  professionalId: string;
  matchQuality: 'poor' | 'fair' | 'good' | 'excellent';
  feedback?: string;
  wasHired: boolean;
}

/**
 * Find matching professionals for a job using AI
 */
export async function matchProfessionals(request: MatchProfessionalsRequest): Promise<MatchProfessionalsResponse> {
  const { data, error } = await supabase.functions.invoke('ai-professional-matcher', {
    body: request,
  });

  if (error) throw new Error(error.message);
  return data;
}

/**
 * Rank and score professional matches
 */
export async function rankMatches(request: RankMatchesRequest) {
  // This would call a dedicated ranking edge function
  // For now, we'll throw to indicate it needs implementation
  throw new Error('Not implemented - requires dedicated ranking endpoint');
}

/**
 * Check professional availability for a job
 */
export async function checkAvailability(request: CheckAvailabilityRequest) {
  // This would call a dedicated availability checking edge function
  throw new Error('Not implemented - requires dedicated availability endpoint');
}

/**
 * Submit feedback on match quality
 */
export async function submitMatchFeedback(request: SubmitMatchFeedbackRequest) {
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  // Store feedback in database for ML model improvement
  const { data, error } = await supabase
    .from('ai_recommendations')
    .insert([{
      user_id: user.id,
      entity_type: 'job',
      entity_id: request.jobId,
      recommendation_type: 'professional_match',
      title: `Match feedback for job ${request.jobId}`,
      description: request.feedback || `Match quality: ${request.matchQuality}`,
      status: request.wasHired ? 'accepted' : 'rejected',
      data: {
        professionalId: request.professionalId,
        matchQuality: request.matchQuality,
        feedback: request.feedback,
      },
      actioned_at: new Date().toISOString(),
    }]);

  if (error) throw new Error(error.message);
  
  return {
    success: true,
    message: 'Feedback recorded successfully',
  };
}

export const professionalMatching = {
  matchProfessionals,
  rankMatches,
  checkAvailability,
  submitMatchFeedback,
};
