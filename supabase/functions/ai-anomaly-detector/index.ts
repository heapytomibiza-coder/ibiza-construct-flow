import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { analysisType, timeframe, entityType, thresholds } = await req.json();

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const startTime = Date.now();
    const anomalies = [];

    // Analyze different types of anomalies based on analysisType
    switch (analysisType) {
      case 'pricing':
        await detectPricingAnomalies(supabase, anomalies, thresholds);
        break;
      case 'job_flow':
        await detectJobFlowAnomalies(supabase, anomalies, timeframe);
        break;
      case 'professional_behavior':
        await detectProfessionalBehaviorAnomalies(supabase, anomalies, timeframe);
        break;
      case 'system_performance':
        await detectSystemPerformanceAnomalies(supabase, anomalies, timeframe);
        break;
      default:
        // Run all anomaly detections
        await detectPricingAnomalies(supabase, anomalies, thresholds);
        await detectJobFlowAnomalies(supabase, anomalies, timeframe);
        await detectProfessionalBehaviorAnomalies(supabase, anomalies, timeframe);
        await detectSystemPerformanceAnomalies(supabase, anomalies, timeframe);
    }

    // Log AI run
    const { data: aiRun } = await supabase
      .from('ai_runs')
      .insert([{
        operation_type: 'anomaly_detection',
        input_data: { analysisType, timeframe, entityType, thresholds },
        output_data: { anomaliesFound: anomalies.length, anomalies },
        status: 'completed',
        execution_time_ms: Date.now() - startTime,
        confidence_score: 0.9
      }])
      .select()
      .single();

    // Create alerts for high-severity anomalies
    for (const anomaly of anomalies.filter(a => a.severity === 'high' || a.severity === 'critical')) {
      await supabase
        .from('ai_alerts')
        .insert([{
          alert_type: 'anomaly_detected',
          severity: anomaly.severity,
          title: anomaly.title,
          description: anomaly.description,
          entity_type: anomaly.entityType,
          entity_id: anomaly.entityId,
          metadata: anomaly.metadata
        }]);
    }

    const result = {
      anomalies,
      summary: {
        total: anomalies.length,
        critical: anomalies.filter(a => a.severity === 'critical').length,
        high: anomalies.filter(a => a.severity === 'high').length,
        medium: anomalies.filter(a => a.severity === 'medium').length,
        low: anomalies.filter(a => a.severity === 'low').length
      },
      analysisType: analysisType || 'comprehensive',
      timestamp: new Date().toISOString()
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in AI anomaly detector:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function detectPricingAnomalies(supabase: any, anomalies: any[], thresholds: any) {
  try {
    // Get recent booking requests with pricing data
    const { data: bookings } = await supabase
      .from('booking_requests')
      .select('*')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .not('professional_quote', 'is', null);

    if (!bookings?.length) return;

    // Calculate pricing statistics
    const quotes = bookings.map(b => parseFloat(b.professional_quote || 0)).filter(q => q > 0);
    const avgQuote = quotes.reduce((sum, q) => sum + q, 0) / quotes.length;
    const maxQuote = Math.max(...quotes);
    const minQuote = Math.min(...quotes);

    // Detect outliers (prices more than 3 standard deviations from mean)
    const standardDeviation = Math.sqrt(quotes.reduce((sum, q) => sum + Math.pow(q - avgQuote, 2), 0) / quotes.length);
    const outlierThreshold = standardDeviation * 3;

    for (const booking of bookings) {
      const quote = parseFloat(booking.professional_quote || 0);
      if (quote > avgQuote + outlierThreshold) {
        anomalies.push({
          type: 'pricing_outlier_high',
          severity: quote > avgQuote + outlierThreshold * 2 ? 'high' : 'medium',
          title: 'Unusually High Quote Detected',
          description: `Quote of ${quote} is significantly above average (${avgQuote.toFixed(2)})`,
          entityType: 'booking_request',
          entityId: booking.id,
          metadata: { quote, average: avgQuote, deviation: quote - avgQuote }
        });
      } else if (quote < avgQuote - outlierThreshold && quote > 0) {
        anomalies.push({
          type: 'pricing_outlier_low',
          severity: 'medium',
          title: 'Unusually Low Quote Detected',
          description: `Quote of ${quote} is significantly below average (${avgQuote.toFixed(2)})`,
          entityType: 'booking_request',
          entityId: booking.id,
          metadata: { quote, average: avgQuote, deviation: avgQuote - quote }
        });
      }
    }
  } catch (error) {
    console.error('Error detecting pricing anomalies:', error);
  }
}

async function detectJobFlowAnomalies(supabase: any, anomalies: any[], timeframe: string) {
  try {
    const hoursBack = timeframe === '24h' ? 24 : timeframe === '7d' ? 168 : 72;
    const cutoffTime = new Date(Date.now() - hoursBack * 60 * 60 * 1000).toISOString();

    // Get job lifecycle events
    const { data: events } = await supabase
      .from('job_lifecycle_events')
      .select('*')
      .gte('created_at', cutoffTime);

    if (!events?.length) return;

    // Analyze cancellation rate
    const cancellations = events.filter(e => e.to_status === 'cancelled').length;
    const totalJobs = new Set(events.map(e => e.job_id)).size;
    const cancellationRate = totalJobs > 0 ? cancellations / totalJobs : 0;

    if (cancellationRate > 0.3) {
      anomalies.push({
        type: 'high_cancellation_rate',
        severity: cancellationRate > 0.5 ? 'critical' : 'high',
        title: 'High Job Cancellation Rate',
        description: `${(cancellationRate * 100).toFixed(1)}% of jobs were cancelled in the last ${timeframe}`,
        entityType: 'system',
        entityId: null,
        metadata: { rate: cancellationRate, totalJobs, cancellations }
      });
    }

    // Analyze conversion from open to assigned
    const openJobs = events.filter(e => e.to_status === 'open').length;
    const assignedJobs = events.filter(e => e.to_status === 'assigned').length;
    const conversionRate = openJobs > 0 ? assignedJobs / openJobs : 0;

    if (conversionRate < 0.1 && openJobs > 5) {
      anomalies.push({
        type: 'low_conversion_rate',
        severity: conversionRate < 0.05 ? 'high' : 'medium',
        title: 'Low Job Assignment Rate',
        description: `Only ${(conversionRate * 100).toFixed(1)}% of open jobs are being assigned`,
        entityType: 'system',
        entityId: null,
        metadata: { rate: conversionRate, openJobs, assignedJobs }
      });
    }
  } catch (error) {
    console.error('Error detecting job flow anomalies:', error);
  }
}

async function detectProfessionalBehaviorAnomalies(supabase: any, anomalies: any[], timeframe: string) {
  try {
    const hoursBack = timeframe === '24h' ? 24 : timeframe === '7d' ? 168 : 72;
    const cutoffTime = new Date(Date.now() - hoursBack * 60 * 60 * 1000).toISOString();

    // Get recent applications
    const { data: applications } = await supabase
      .from('professional_applications')
      .select('*')
      .gte('created_at', cutoffTime);

    if (!applications?.length) return;

    // Analyze application patterns
    const professionalApplications = new Map();
    for (const app of applications) {
      const count = professionalApplications.get(app.professional_id) || 0;
      professionalApplications.set(app.professional_id, count + 1);
    }

    // Detect professionals with unusually high application volumes
    for (const [professionalId, count] of professionalApplications.entries()) {
      if (count > 20) { // More than 20 applications in timeframe
        anomalies.push({
          type: 'excessive_applications',
          severity: count > 50 ? 'high' : 'medium',
          title: 'Unusual Application Volume',
          description: `Professional submitted ${count} applications in ${timeframe}`,
          entityType: 'professional',
          entityId: professionalId,
          metadata: { applicationCount: count, timeframe }
        });
      }
    }
  } catch (error) {
    console.error('Error detecting professional behavior anomalies:', error);
  }
}

async function detectSystemPerformanceAnomalies(supabase: any, anomalies: any[], timeframe: string) {
  try {
    const hoursBack = timeframe === '24h' ? 24 : timeframe === '7d' ? 168 : 72;
    const cutoffTime = new Date(Date.now() - hoursBack * 60 * 60 * 1000).toISOString();

    // Get AI runs performance data
    const { data: aiRuns } = await supabase
      .from('ai_runs')
      .select('*')
      .gte('created_at', cutoffTime);

    if (!aiRuns?.length) return;

    // Analyze AI performance
    const failedRuns = aiRuns.filter(run => run.status === 'failed').length;
    const totalRuns = aiRuns.length;
    const failureRate = totalRuns > 0 ? failedRuns / totalRuns : 0;

    if (failureRate > 0.2) {
      anomalies.push({
        type: 'high_ai_failure_rate',
        severity: failureRate > 0.5 ? 'critical' : 'high',
        title: 'High AI Operation Failure Rate',
        description: `${(failureRate * 100).toFixed(1)}% of AI operations failed in the last ${timeframe}`,
        entityType: 'system',
        entityId: null,
        metadata: { rate: failureRate, totalRuns, failedRuns }
      });
    }

    // Analyze execution times
    const executionTimes = aiRuns
      .filter(run => run.execution_time_ms)
      .map(run => run.execution_time_ms);

    if (executionTimes.length > 0) {
      const avgTime = executionTimes.reduce((sum, time) => sum + time, 0) / executionTimes.length;
      const slowRuns = executionTimes.filter(time => time > 30000).length; // > 30 seconds

      if (slowRuns / executionTimes.length > 0.3) {
        anomalies.push({
          type: 'slow_ai_performance',
          severity: 'medium',
          title: 'Slow AI Operation Performance',
          description: `${(slowRuns / executionTimes.length * 100).toFixed(1)}% of AI operations took >30 seconds`,
          entityType: 'system',
          entityId: null,
          metadata: { averageTime: avgTime, slowRuns, totalRuns: executionTimes.length }
        });
      }
    }
  } catch (error) {
    console.error('Error detecting system performance anomalies:', error);
  }
}