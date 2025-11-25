import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ReviewData {
  overall_rating: number;
  comment: string;
  timeliness_rating: number;
  communication_rating: number;
  value_rating: number;
  quality_rating: number;
  professionalism_rating: number;
  title?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { professionalId, microServiceId } = await req.json();

    if (!professionalId) {
      throw new Error('Professional ID is required');
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch reviews for this professional and category
    let query = supabaseClient
      .from('reviews')
      .select(`
        overall_rating,
        comment,
        title,
        timeliness_rating,
        communication_rating,
        value_rating,
        quality_rating,
        professionalism_rating,
        job:jobs!inner(micro_uuid)
      `)
      .eq('reviewee_id', professionalId)
      .eq('status', 'active')
      .not('comment', 'is', null);

    if (microServiceId) {
      query = query.eq('job.micro_uuid', microServiceId);
    }

    const { data: reviews, error: reviewsError } = await query;

    if (reviewsError) throw reviewsError;

    if (!reviews || reviews.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Not enough reviews to generate summary' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Calculate average ratings
    const avgRating = reviews.reduce((sum, r) => sum + r.overall_rating, 0) / reviews.length;
    const avgTimeliness = reviews.reduce((sum, r) => sum + r.timeliness_rating, 0) / reviews.length;
    const avgCommunication = reviews.reduce((sum, r) => sum + r.communication_rating, 0) / reviews.length;
    const avgValue = reviews.reduce((sum, r) => sum + r.value_rating, 0) / reviews.length;
    const avgQuality = reviews.reduce((sum, r) => sum + r.quality_rating, 0) / reviews.length;
    const avgProfessionalism = reviews.reduce((sum, r) => sum + r.professionalism_rating, 0) / reviews.length;

    // Prepare reviews text for AI
    const reviewsText = reviews
      .map((r: ReviewData, i: number) => 
        `Review ${i + 1} (${r.overall_rating}/5 stars):\n${r.title ? `Title: ${r.title}\n` : ''}${r.comment}`
      )
      .join('\n\n');

    // Call Lovable AI to generate summary
    const aiResponse = await fetch('https://api.lovable.app/v1/ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('LOVABLE_API_KEY') ?? ''}`,
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are an expert at analyzing customer reviews and creating professional summaries. 
Generate a concise, positive professional overview based on the reviews provided. 
Focus on key strengths, common praise, and specific areas mentioned.
Be specific and professional. Keep it under 150 words.
Also identify 3-5 key strengths as short phrases (max 4 words each).
And identify 3-5 areas commonly praised as short phrases.`
          },
          {
            role: 'user',
            content: `Analyze these ${reviews.length} reviews for a professional:

Average ratings:
- Overall: ${avgRating.toFixed(1)}/5
- Timeliness: ${avgTimeliness.toFixed(1)}/5
- Communication: ${avgCommunication.toFixed(1)}/5
- Value: ${avgValue.toFixed(1)}/5
- Quality: ${avgQuality.toFixed(1)}/5
- Professionalism: ${avgProfessionalism.toFixed(1)}/5

Reviews:
${reviewsText}

Generate a professional summary that highlights what makes this professional stand out. 
Then provide key_strengths as an array of 3-5 short phrases.
Then provide common_praise as an array of 3-5 short phrases about specific aspects clients appreciate.

Return ONLY valid JSON in this exact format:
{
  "summary": "Your professional overview text here",
  "key_strengths": ["strength 1", "strength 2", "strength 3"],
  "common_praise": ["praise 1", "praise 2", "praise 3"]
}`
          }
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!aiResponse.ok) {
      throw new Error('Failed to generate AI summary');
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices[0].message.content;
    
    // Parse AI response
    let parsedContent;
    try {
      parsedContent = JSON.parse(aiContent);
    } catch (e) {
      console.error('Failed to parse AI response:', aiContent);
      throw new Error('Invalid AI response format');
    }

    // Calculate confidence score based on number of reviews
    const confidenceScore = Math.min(
      0.95,
      0.5 + (reviews.length * 0.05) // 50% base + 5% per review, max 95%
    );

    // Get next version number
    const { data: existingSummaries } = await supabaseClient
      .from('review_summaries')
      .select('version')
      .eq('professional_id', professionalId)
      .eq('micro_service_id', microServiceId || null)
      .order('version', { ascending: false })
      .limit(1);

    const nextVersion = (existingSummaries?.[0]?.version || 0) + 1;

    // Deactivate old summaries
    await supabaseClient
      .from('review_summaries')
      .update({ is_active: false })
      .eq('professional_id', professionalId)
      .eq('micro_service_id', microServiceId || null);

    // Insert new summary
    const { data: summary, error: summaryError } = await supabaseClient
      .from('review_summaries')
      .insert({
        professional_id: professionalId,
        micro_service_id: microServiceId || null,
        summary_text: parsedContent.summary,
        key_strengths: parsedContent.key_strengths || [],
        common_praise: parsedContent.common_praise || [],
        areas_mentioned: [
          avgTimeliness >= 4.5 ? 'Excellent timeliness' : null,
          avgCommunication >= 4.5 ? 'Great communication' : null,
          avgValue >= 4.5 ? 'Outstanding value' : null,
          avgQuality >= 4.5 ? 'Top quality work' : null,
          avgProfessionalism >= 4.5 ? 'Highly professional' : null,
        ].filter(Boolean),
        reviews_analyzed: reviews.length,
        confidence_score: confidenceScore,
        version: nextVersion,
        is_active: true,
      })
      .select()
      .single();

    if (summaryError) throw summaryError;

    return new Response(
      JSON.stringify({ success: true, summary }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
