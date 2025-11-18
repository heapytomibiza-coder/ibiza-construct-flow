import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TestResult {
  test: string;
  status: 'pass' | 'fail' | 'pending';
  message?: string;
  duration?: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { testSuites = ['database', 'edge-functions', 'storage', 'templates'], includeI18n = true } = await req.json();
    
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
        message: services ? `Found ${services.length} services` : servicesError?.message,
      });

      const { data: bookings, error: bookingsError } = await supabaseClient
        .from('bookings')
        .select('*')
        .limit(5);
      
      results.push({
        test: 'Bookings Table Access',
        status: !bookingsError ? 'pass' : 'fail',
        message: bookings ? `Bookings accessible (${bookings.length} records)` : bookingsError?.message,
      });

      const { data: snapshot, error: snapshotError } = await supabaseClient
        .from('micro_questions_snapshot')
        .select('*')
        .limit(5);
      
      results.push({
        test: 'Questions Snapshot Cache',
        status: !snapshotError ? 'pass' : 'fail',
        message: snapshot ? `Snapshot accessible (${snapshot.length} cached)` : snapshotError?.message,
      });
    }

    // Edge Function Tests
    if (testSuites.includes('edge-functions')) {
      logs.push('📡 Testing Edge Functions...');

      // Test generate-questions
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
        message: questionsError?.message || `Response received`,
        duration: generateDuration,
      });

      // Test estimate-price
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
        message: priceError?.message || `Response received`,
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
        message: serviceImagesBucket ? 'Bucket exists and is accessible' : bucketsError?.message || 'Bucket not found',
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
        message: templates ? `Templates accessible (${templates.length} templates)` : templatesError?.message,
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
    console.error('Error in ai-test-orchestrator:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
