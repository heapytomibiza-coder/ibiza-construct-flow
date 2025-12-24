import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';
import { validateRequestBody } from '../_shared/inputValidation.ts';
import { createErrorResponse, logError } from '../_shared/errorMapping.ts';
import { checkRateLimitDb, createRateLimitResponse, getClientIdentifier, createServiceClient, corsHeaders, handleCors } from '../_shared/securityMiddleware.ts';

const requestSchema = z.object({
  testSuites: z.array(z.enum(['database', 'edge-functions', 'storage', 'templates'])).default(['database', 'edge-functions', 'storage', 'templates']),
  includeI18n: z.boolean().default(true),
});

interface TestResult {
  test: string;
  status: 'pass' | 'fail' | 'pending';
  message?: string;
  duration?: number;
}

serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const supabase = createServiceClient();

    // Rate limiting - AI_STANDARD (20/hr)
    const clientId = getClientIdentifier(req);
    const rateLimit = await checkRateLimitDb(supabase, clientId, 'ai-test-orchestrator', 'AI_STANDARD');
    if (!rateLimit.allowed) {
      return createRateLimitResponse(rateLimit.retryAfter);
    }

    const validated = await validateRequestBody(req, requestSchema);
    const testSuites = validated.testSuites || ['database', 'edge-functions', 'storage', 'templates'];
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const results: TestResult[] = [];
    const logs: string[] = [];

    logs.push('🚀 Starting Comprehensive Test Suite...\n');

    // Database Tests
    if (testSuites.includes('database')) {
      logs.push('🗄️ Testing Database Infrastructure...');
      
      const { data: services, error: servicesError } = await supabaseClient
        .from('services_unified_v1')
        .select('*')
        .limit(10);
      
      results.push({
        test: 'Services Data Access',
        status: services && services.length > 0 ? 'pass' : 'fail',
        message: services ? `Found ${services.length} services` : 'No services found',
      });

      const { data: bookings, error: bookingsError } = await supabaseClient
        .from('bookings')
        .select('*')
        .limit(5);
      
      results.push({
        test: 'Bookings Table Access',
        status: !bookingsError ? 'pass' : 'fail',
        message: bookings ? `Bookings accessible (${bookings.length} records)` : 'Access denied',
      });

      const { data: snapshot, error: snapshotError } = await supabaseClient
        .from('micro_questions_snapshot')
        .select('*')
        .limit(5);
      
      results.push({
        test: 'Questions Snapshot Cache',
        status: !snapshotError ? 'pass' : 'fail',
        message: snapshot ? `Snapshot accessible (${snapshot.length} cached)` : 'Access denied',
      });
    }

    // Edge Function Tests
    if (testSuites.includes('edge-functions')) {
      logs.push('📡 Testing Edge Functions...');

      const startGenerate = Date.now();
      const { data: questionsData, error: questionsError } = await supabaseClient.functions.invoke('generate-questions', {
        body: {
          serviceType: 'Kitchen Sink Leak Repair',
          category: 'Home Services',
          subcategory: 'Plumbing'
        }
      });
      const generateDuration = Date.now() - startGenerate;

      results.push({
        test: 'Generate Questions Function',
        status: !questionsError ? 'pass' : 'fail',
        message: 'Response received',
        duration: generateDuration,
      });

      const startEstimate = Date.now();
      const { data: priceData, error: priceError } = await supabaseClient.functions.invoke('estimate-price', {
        body: {
          serviceType: 'Kitchen Sink Leak Repair',
          category: 'Home Services',
          subcategory: 'Plumbing',
          answers: { leak_severity: 'moderate', access: 'easy' },
          location: 'Ibiza, Spain'
        }
      });
      const estimateDuration = Date.now() - startEstimate;

      results.push({
        test: 'Price Estimation Function',
        status: !priceError ? 'pass' : 'fail',
        message: 'Response received',
        duration: estimateDuration,
      });
    }

    // Storage Tests
    if (testSuites.includes('storage')) {
      logs.push('📦 Testing Storage Infrastructure...');
      
      const { data: buckets, error: bucketsError } = await supabaseClient.storage.listBuckets();
      const serviceImagesBucket = buckets?.find(b => b.name === 'service-images');
      
      results.push({
        test: 'Service Images Bucket',
        status: serviceImagesBucket ? 'pass' : 'fail',
        message: serviceImagesBucket ? 'Bucket exists and is accessible' : 'Bucket not found',
      });
    }

    // Job Templates Tests
    if (testSuites.includes('templates')) {
      logs.push('📋 Testing Job Templates...');
      
      const { data: templates, error: templatesError } = await supabaseClient
        .from('job_templates')
        .select('*')
        .limit(5);
      
      results.push({
        test: 'Job Templates Table',
        status: !templatesError ? 'pass' : 'fail',
        message: templates ? `Templates accessible (${templates.length} templates)` : 'Access denied',
      });
    }

    // Calculate summary
    const passed = results.filter(r => r.status === 'pass').length;
    const failed = results.filter(r => r.status === 'fail').length;
    const total = results.length;
    const successRate = total > 0 ? (passed / total) * 100 : 0;

    logs.push('\n📊 Test Results Summary:');
    logs.push(`✅ Passed: ${passed}/${total}`);
    logs.push(`❌ Failed: ${failed}/${total}`);
    logs.push(`📈 Success Rate: ${Math.round(successRate)}%`);

    if (failed > 0) {
      logs.push('\n🔍 Failed Tests:');
      results
        .filter(r => r.status === 'fail')
        .forEach(r => logs.push(`   • ${r.test}: ${r.message}`));
    }

    logs.push('\n🎯 Test Plan Execution Complete!');

    return new Response(
      JSON.stringify({
        results,
        summary: { passed, failed, total, successRate },
        logs,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    logError('ai-test-orchestrator', error as Error);
    return createErrorResponse(error as Error);
  }
});
