import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';
import { validateRequestBody } from '../_shared/inputValidation.ts';
import { createErrorResponse, logError } from '../_shared/errorMapping.ts';
import { 
  checkRateLimitDb, 
  createRateLimitResponse, 
  getClientIdentifier,
  corsHeaders,
  handleCors,
  createServiceClient
} from '../_shared/securityMiddleware.ts';

const matchRequestSchema = z.object({
  job_id: z.string().uuid(),
  max_matches: z.number().int().min(1).max(50).optional().default(10),
  filters: z.object({
    max_distance: z.number().positive().optional(),
    min_rating: z.number().min(0).max(5).optional(),
    availability_required: z.boolean().optional(),
  }).optional().default({}),
});

interface Professional {
  id: string;
  user_id: string;
  skills: string[];
  location: any;
  rating: number;
  availability: any;
  pricing: any;
  experience_years: number;
}

interface Job {
  id: string;
  title: string;
  description: string;
  location: any;
  budget_value: number;
  required_skills: string[];
  urgency: string;
  complexity: string;
}

serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  const supabaseClient = createServiceClient();

  try {
    // Rate limiting - AI matching is resource intensive
    const authHeader = req.headers.get('Authorization');
    let userId: string | undefined;
    
    if (authHeader) {
      const { data } = await supabaseClient.auth.getUser(authHeader.replace('Bearer ', ''));
      userId = data.user?.id;
    }
    
    const clientId = getClientIdentifier(req, userId);
    const rateLimitResult = await checkRateLimitDb(supabaseClient, clientId, 'ai-smart-matcher', 'AI_STANDARD');
    
    if (!rateLimitResult.allowed) {
      return createRateLimitResponse(rateLimitResult.retryAfter);
    }

    const { job_id, max_matches, filters } = await validateRequestBody(req, matchRequestSchema);

    // Fetch job details
    const { data: job, error: jobError } = await supabaseClient
      .from('jobs')
      .select('*')
      .eq('id', job_id)
      .single();

    if (jobError) {
      throw new Error(`Failed to fetch job: ${jobError.message}`);
    }

    // Fetch available professionals
    const { data: professionals, error: proError } = await supabaseClient
      .from('professional_profiles')
      .select('*')
      .eq('verification_status', 'verified')
      .eq('status', 'active');

    if (proError) {
      throw new Error(`Failed to fetch professionals: ${proError.message}`);
    }

    // Calculate matching scores
    const matches = professionals.map((professional: Professional) => {
      const match_score = calculateMatchScore(job, professional, filters);
      const match_reasons = generateMatchReasons(job, professional);
      
      return {
        job_id,
        professional_id: professional.id,
        match_score,
        match_reasons,
        skill_score: calculateSkillScore(job.required_skills || [], professional.skills || []),
        location_score: calculateLocationScore(job.location, professional.location),
        price_score: calculatePriceScore(job.budget_value, professional.pricing),
        reputation_score: professional.rating || 0,
        availability_score: calculateAvailabilityScore(professional.availability)
      };
    })
    .filter(match => match.match_score > 0.3) // Minimum threshold
    .sort((a, b) => b.match_score - a.match_score)
    .slice(0, max_matches);

    // Store matches in database
    if (matches.length > 0) {
      const { error: insertError } = await supabaseClient
        .from('smart_matches')
        .upsert(matches, { 
          onConflict: 'job_id,professional_id',
          ignoreDuplicates: false 
        });

      if (insertError) {
        console.error('Error storing matches:', insertError);
      }
    }

    // Generate AI-powered recommendations
    const recommendations = await generateRecommendations(job, matches);

    return new Response(JSON.stringify({ 
      matches,
      recommendations,
      total_professionals_analyzed: professionals.length,
      matches_found: matches.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    logError('ai-smart-matcher', error);
    return createErrorResponse(error);
  }
});

function calculateMatchScore(job: Job, professional: Professional, filters: any): number {
  const skillScore = calculateSkillScore(job.required_skills || [], professional.skills || []);
  const locationScore = calculateLocationScore(job.location, professional.location);
  const priceScore = calculatePriceScore(job.budget_value, professional.pricing);
  const reputationScore = (professional.rating || 0) / 5;
  const availabilityScore = calculateAvailabilityScore(professional.availability);
  const experienceScore = Math.min(professional.experience_years / 10, 1);

  // Weighted scoring algorithm
  const weights = {
    skill: 0.3,
    location: 0.2,
    price: 0.15,
    reputation: 0.15,
    availability: 0.1,
    experience: 0.1
  };

  const totalScore = 
    skillScore * weights.skill +
    locationScore * weights.location +
    priceScore * weights.price +
    reputationScore * weights.reputation +
    availabilityScore * weights.availability +
    experienceScore * weights.experience;

  return Math.round(totalScore * 100) / 100;
}

function calculateSkillScore(requiredSkills: string[], professionalSkills: string[]): number {
  if (!requiredSkills || requiredSkills.length === 0) return 0.8;
  if (!professionalSkills || professionalSkills.length === 0) return 0;

  const matchedSkills = requiredSkills.filter(skill => 
    professionalSkills.some(pSkill => 
      pSkill.toLowerCase().includes(skill.toLowerCase()) ||
      skill.toLowerCase().includes(pSkill.toLowerCase())
    )
  );

  return matchedSkills.length / requiredSkills.length;
}

function calculateLocationScore(jobLocation: any, proLocation: any): number {
  if (!jobLocation || !proLocation) return 0.5;
  
  // Simplified distance calculation (would use proper geo calculations in production)
  try {
    const jobLat = jobLocation.coordinates?.[1] || jobLocation.lat;
    const jobLng = jobLocation.coordinates?.[0] || jobLocation.lng;
    const proLat = proLocation.coordinates?.[1] || proLocation.lat;
    const proLng = proLocation.coordinates?.[0] || proLocation.lng;

    if (!jobLat || !jobLng || !proLat || !proLng) return 0.5;

    const distance = calculateDistance(jobLat, jobLng, proLat, proLng);
    
    // Score based on distance (closer = better)
    if (distance <= 10) return 1.0;
    if (distance <= 25) return 0.8;
    if (distance <= 50) return 0.6;
    if (distance <= 100) return 0.4;
    return 0.2;
  } catch {
    return 0.5;
  }
}

function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function calculatePriceScore(jobBudget: number, professionalPricing: any): number {
  if (!jobBudget || !professionalPricing) return 0.7;
  
  try {
    const proRate = professionalPricing.hourly_rate || professionalPricing.base_rate || 50;
    const ratio = proRate / jobBudget;
    
    // Optimal range: professional rate is 70-120% of budget
    if (ratio >= 0.7 && ratio <= 1.2) return 1.0;
    if (ratio >= 0.5 && ratio <= 1.5) return 0.8;
    if (ratio >= 0.3 && ratio <= 2.0) return 0.6;
    return 0.3;
  } catch {
    return 0.7;
  }
}

function calculateAvailabilityScore(availability: any): number {
  if (!availability) return 0.5;
  
  // Check if professional has availability in next 7 days
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  
  // Simplified availability check
  if (availability.immediate) return 1.0;
  if (availability.within_week) return 0.9;
  if (availability.within_month) return 0.7;
  return 0.5;
}

function generateMatchReasons(job: Job, professional: Professional): string[] {
  const reasons: string[] = [];
  
  const skillScore = calculateSkillScore(job.required_skills || [], professional.skills || []);
  if (skillScore > 0.8) reasons.push("Excellent skill match");
  else if (skillScore > 0.6) reasons.push("Good skill compatibility");
  
  if (professional.rating > 4.5) reasons.push("Highly rated professional");
  if (professional.experience_years > 5) reasons.push("Experienced professional");
  
  const locationScore = calculateLocationScore(job.location, professional.location);
  if (locationScore > 0.8) reasons.push("Close proximity");
  
  return reasons;
}

async function generateRecommendations(job: Job, matches: any[]): Promise<any[]> {
  const recommendations: any[] = [];
  
  if (matches.length === 0) {
    recommendations.push({
      type: 'no_matches',
      title: 'No suitable professionals found',
      description: 'Consider adjusting job requirements or budget',
      priority: 'high',
      actions: ['increase_budget', 'expand_location', 'adjust_requirements']
    });
  } else if (matches.length < 3) {
    recommendations.push({
      type: 'limited_matches',
      title: 'Limited professional options',
      description: 'Consider broadening search criteria for more choices',
      priority: 'medium',
      actions: ['expand_search', 'adjust_requirements']
    });
  }
  
  if (matches.length > 0) {
    const topMatch = matches[0];
    if (topMatch.match_score > 0.9) {
      recommendations.push({
        type: 'excellent_match',
        title: 'Excellent professional match found',
        description: `Professional ${topMatch.professional_id} is an outstanding fit`,
        priority: 'high',
        actions: ['contact_immediately', 'priority_booking']
      });
    }
  }
  
  return recommendations;
}