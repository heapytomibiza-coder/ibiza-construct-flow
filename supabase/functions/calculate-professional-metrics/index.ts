import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { professional_id, start_date, end_date } = await req.json();

    if (!professional_id || !start_date || !end_date) {
      throw new Error('Missing required parameters');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`[Metrics] Calculating for professional ${professional_id}`);

    // Fetch completed bookings
    const { data: bookings } = await supabase
      .from('booking_requests')
      .select('*')
      .eq('professional_id', professional_id)
      .gte('created_at', start_date)
      .lte('created_at', end_date);

    const totalJobs = bookings?.length || 0;
    const completedJobs = bookings?.filter((b) => b.status === 'completed').length || 0;
    const completionRate = totalJobs > 0 ? (completedJobs / totalJobs) * 100 : 0;

    // Fetch reviews
    const { data: reviews } = await supabase
      .from('reviews')
      .select('*')
      .eq('professional_id', professional_id)
      .gte('created_at', start_date)
      .lte('created_at', end_date);

    const averageRating = reviews && reviews.length > 0
      ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length
      : 0;

    // Fetch revenue
    const { data: payments } = await supabase
      .from('payment_transactions')
      .select('amount')
      .eq('user_id', professional_id)
      .in('status', ['completed', 'succeeded'])
      .gte('created_at', start_date)
      .lte('created_at', end_date);

    const totalRevenue = payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

    // Fetch messages for response time
    const { data: messages } = await supabase
      .from('messages')
      .select('created_at, read_at')
      .eq('sender_id', professional_id)
      .gte('created_at', start_date)
      .lte('created_at', end_date)
      .not('read_at', 'is', null);

    let avgResponseTime = 0;
    if (messages && messages.length > 0) {
      const responseTimes = messages
        .map((m) => {
          if (!m.read_at) return 0;
          return new Date(m.read_at).getTime() - new Date(m.created_at).getTime();
        })
        .filter((t) => t > 0);

      if (responseTimes.length > 0) {
        avgResponseTime = Math.floor(
          responseTimes.reduce((sum, t) => sum + t, 0) / responseTimes.length / 1000
        );
      }
    }

    // Calculate scores
    const qualityScore = (averageRating / 5) * 100;
    const reliabilityScore = completionRate;
    const communicationScore = avgResponseTime < 3600 ? 100 : avgResponseTime < 7200 ? 85 : 70;
    const overallScore = (qualityScore + reliabilityScore + communicationScore) / 3;

    // Insert metrics
    const metricsData = {
      professional_id,
      period_start: start_date,
      period_end: end_date,
      total_jobs: totalJobs,
      completed_jobs: completedJobs,
      completion_rate: completionRate,
      average_rating: averageRating,
      total_revenue: totalRevenue,
      average_response_time: avgResponseTime,
      client_satisfaction_score: averageRating * 20,
      quality_score: qualityScore,
      reliability_score: reliabilityScore,
      communication_score: communicationScore,
      overall_score: overallScore,
      metadata: {
        reviews_count: reviews?.length || 0,
        payments_count: payments?.length || 0
      }
    };

    const { data: inserted, error: insertError } = await supabase
      .from('professional_performance_metrics')
      .upsert(metricsData)
      .select()
      .single();

    if (insertError) throw insertError;

    console.log('[Metrics] Successfully calculated and stored');

    return new Response(
      JSON.stringify({ success: true, metrics: inserted }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[Metrics] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});