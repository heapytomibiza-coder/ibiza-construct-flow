import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';
import { validateRequestBody, commonSchemas } from '../_shared/inputValidation.ts';
import { createErrorResponse, logError } from '../_shared/errorMapping.ts';
import { checkRateLimit, STRICT_RATE_LIMIT } from '../_shared/rateLimiter.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const matchRequestSchema = z.object({
  jobId: commonSchemas.uuid.optional(),
  microId: commonSchemas.uuid.optional(),
  location: z.any().optional(),
  budget: commonSchemas.positiveNumber.optional(),
  urgency: z.string().trim().max(50).optional(),
  description: z.string().trim().max(5000).optional(),
  limit: z.number().int().min(1).max(50).optional().default(10),
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Rate limiting - 20 requests per hour for AI matching
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0] || 
                     req.headers.get('cf-connecting-ip') || 'unknown';
    const rateLimitCheck = await checkRateLimit(supabase, clientIp, 'ai-professional-matcher', STRICT_RATE_LIMIT);
    
    if (!rateLimitCheck.allowed) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { jobId, microId, location, budget, urgency, description, limit } = await validateRequestBody(req, matchRequestSchema);

    console.log('Matching request:', { jobId, microId, location, budget, urgency, limit });

    // Build base query for professionals
    let query = supabase
      .from('professional_profiles')
      .select(`
        *,
        user:profiles!professional_profiles_user_id_fkey(
          id,
          full_name,
          display_name,
          avatar_url,
          location
        ),
        services:professional_services(
          micro_service_id,
          is_active,
          micro_service:services_micro(
            id,
            name,
            slug
          )
        ),
        stats:professional_stats(
          average_rating,
          total_reviews,
          completion_rate,
          response_time_hours
        )
      `)
      .eq('is_active', true)
      .eq('verification_status', 'verified');

    const { data: professionals, error } = await query;

    if (error) {
      console.error('Error fetching professionals:', error);
      throw error;
    }

    console.log(`Found ${professionals?.length || 0} professionals`);

    // Score and rank professionals
    const scoredProfessionals = professionals?.map(prof => {
      let score = 0;
      const user = Array.isArray(prof.user) ? prof.user[0] : prof.user;
      const stats = Array.isArray(prof.stats) ? prof.stats[0] : prof.stats;
      const services = prof.services || [];

      // Service match (highest weight)
      if (microId) {
        const hasService = services.some((s: any) => 
          s.is_active && s.micro_service?.id === microId
        );
        if (hasService) score += 50;
      }

      // Rating score
      if (stats && (stats as any).average_rating) {
        score += (stats as any).average_rating * 8;
      }

      // Completion rate
      if (stats && (stats as any).completion_rate) {
        score += (stats as any).completion_rate * 0.2;
      }

      // Response time (faster = better)
      if (stats && (stats as any).response_time_hours) {
        const responseHours = (stats as any).response_time_hours;
        if (responseHours < 2) score += 10;
        else if (responseHours < 6) score += 7;
        else if (responseHours < 24) score += 4;
      }

      // Location proximity (simple city match for now)
      if (location && user?.location) {
        const jobCity = typeof location === 'string' ? location : location.city;
        const profCity = typeof user.location === 'string' ? user.location : user.location.city;
        if (jobCity && profCity && jobCity.toLowerCase() === profCity.toLowerCase()) {
          score += 15;
        }
      }

      // Budget compatibility
      if (budget && prof.hourly_rate) {
        const hourlyRate = prof.hourly_rate;
        if (hourlyRate <= budget * 1.2) { // Within 20% of budget
          score += 10;
        }
      }

      // Instant booking bonus
      if (prof.instant_booking_enabled) {
        score += 5;
      }

      // Review count bonus (shows experience)
      if (stats && (stats as any).total_reviews) {
        const reviews = (stats as any).total_reviews;
        if (reviews > 50) score += 5;
        else if (reviews > 20) score += 3;
        else if (reviews > 5) score += 1;
      }

      return {
        ...prof,
        matchScore: score,
        matchReasons: generateMatchReasons(prof, microId, location, budget, stats, services)
      };
    }) || [];

    // Sort by score and limit
    const topMatches = scoredProfessionals
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, limit);

    console.log(`Returning ${topMatches.length} top matches`);

    // If we have a jobId, log the match event
    if (jobId) {
      await supabase.from('analytics_events').insert({
        event_name: 'professional_match',
        event_category: 'matching',
        event_properties: {
          job_id: jobId,
          match_count: topMatches.length,
          top_score: topMatches[0]?.matchScore || 0
        }
      });
    }

    return new Response(
      JSON.stringify({
        matches: topMatches,
        totalCount: professionals?.length || 0,
        matchedCount: topMatches.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
  } catch (error) {
    logError('ai-professional-matcher', error);
    return createErrorResponse(error);
  }
});

function generateMatchReasons(prof: any, microId: string, location: any, budget: number, stats: any, services: any[]): string[] {
  const reasons: string[] = [];
  
  if (microId && services.some((s: any) => s.is_active && s.micro_service?.id === microId)) {
    reasons.push('Verified specialist for this service');
  }
  
  if (stats && stats.average_rating >= 4.5) {
    reasons.push(`Highly rated (${stats.average_rating.toFixed(1)}★)`);
  }
  
  if (stats && stats.completion_rate >= 95) {
    reasons.push('Excellent completion rate');
  }
  
  if (stats && stats.response_time_hours < 6) {
    reasons.push('Fast response time');
  }
  
  if (prof.instant_booking_enabled) {
    reasons.push('Instant booking available');
  }
  
  return reasons;
}
