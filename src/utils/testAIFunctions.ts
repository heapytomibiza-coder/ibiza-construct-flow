import { supabase } from "@/integrations/supabase/client";

export class AISystemTester {
  private results: Array<{ test: string; status: 'pass' | 'fail' | 'pending'; message?: string; duration?: number }> = [];

  async runComprehensiveTest(): Promise<void> {
    console.log('🚀 Starting AI System Comprehensive Test...\n');
    
    // Phase 1: Test AI Edge Functions
    await this.testAIEdgeFunctions();
    
    // Phase 2: Test Database Infrastructure
    await this.testDatabaseInfrastructure();
    
    // Phase 3: Test Integration Flows
    await this.testIntegrationFlows();
    
    // Report Results
    this.reportResults();
  }

  private async testAIEdgeFunctions(): Promise<void> {
    console.log('📡 Testing AI Edge Functions...');

    // Test 1: Professional Matcher
    await this.testFunction(
      'AI Professional Matcher',
      'ai-professional-matcher',
      {
        jobTitle: 'Kitchen Sink Leak Repair',
        jobDescription: 'Need urgent repair of leaking kitchen sink',
        location: 'London, UK',
        budget: '$200',
        urgency: 'high'
      }
    );

    // Test 2: Communications Drafter  
    await this.testFunction(
      'AI Communications Drafter',
      'ai-communications-drafter',
      {
        type: 'job_broadcast',
        context: {
          jobTitle: 'Kitchen Sink Leak Repair',
          urgency: 'high'
        },
        recipient: 'professionals',
        tone: 'professional',
        keyPoints: ['Urgent repair needed', 'Competitive pay', 'Local area']
      }
    );

    // Test 3: Price Validator
    await this.testFunction(
      'AI Price Validator',
      'ai-price-validator',
      {
        serviceType: 'plumbing',
        location: 'London, UK',
        pricingData: {
          hourlyRate: 45,
          estimatedHours: 2,
          materials: 50
        },
        category: 'Home Services',
        subcategory: 'Plumbing'
      }
    );

    // Test 4: Question Logic Tester
    await this.testFunction(
      'AI Question Tester',
      'ai-question-tester',
      {
        serviceType: 'plumbing',
        category: 'Home Services',
        subcategory: 'Plumbing',
        questions: [
          { id: 1, type: 'choice', label: 'What type of leak?', options: ['Kitchen sink', 'Bathroom', 'Pipe'] },
          { id: 2, type: 'text', label: 'Describe the problem' }
        ]
      }
    );
  }

  private async testDatabaseInfrastructure(): Promise<void> {
    console.log('\n🗄️ Testing Database Infrastructure...');
    
    try {
      // Test AI Prompts
      const { data: prompts, error: promptsError } = await supabase
        .from('ai_prompts')
        .select('*')
        .eq('is_active', true);
      
      this.logResult('AI Prompts Active', prompts && prompts.length === 4 ? 'pass' : 'fail', 
        prompts ? `Found ${prompts.length} active prompts` : promptsError?.message);

      // Test Jobs Data
      const { data: jobs, error: jobsError } = await supabase
        .from('jobs')
        .select('*, services(category, subcategory, micro)')
        .limit(10);
      
      this.logResult('Jobs Data Loading', jobs && jobs.length > 0 ? 'pass' : 'fail',
        jobs ? `Found ${jobs.length} jobs` : jobsError?.message);

      // Test AI Runs Logging
      const { data: aiRuns, error: aiRunsError } = await supabase
        .from('ai_runs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      
      this.logResult('AI Runs Tracking', !aiRunsError ? 'pass' : 'fail',
        aiRuns ? `AI runs table accessible` : aiRunsError?.message);

    } catch (error) {
      this.logResult('Database Connection', 'fail', (error as Error).message);
    }
  }

  private async testIntegrationFlows(): Promise<void> {
    console.log('\n🔄 Testing Integration Flows...');
    
    // Test end-to-end: Job → Professional Matching → Communication
    try {
      // Step 1: Get a job
      const { data: job } = await supabase
        .from('jobs')
        .select('*, services(category, subcategory, micro)')
        .eq('status', 'open')
        .limit(1)
        .single();

      if (job) {
        // Step 2: Find professionals for the job
        const matchResult = await this.callAIFunction('ai-professional-matcher', {
          jobTitle: job.title,
          jobDescription: job.description,
          location: 'London, UK',
          budget: job.budget_value?.toString(),
          urgency: 'medium'
        });

        // Step 3: Draft communication based on matches
        if (matchResult.success) {
          const commResult = await this.callAIFunction('ai-communications-drafter', {
            type: 'professional_invitation',
            context: {
              jobTitle: job.title,
              professionalName: 'Test Professional'
            },
            recipient: 'professional',
            tone: 'friendly_professional',
            keyPoints: ['Great match for skills', 'Competitive rate', 'Local project']
          });

          this.logResult('End-to-End Workflow', commResult.success ? 'pass' : 'fail',
            'Job → Match → Communication flow completed');
        }
      }
    } catch (error) {
      this.logResult('Integration Flow', 'fail', (error as Error).message);
    }
  }

  private async testFunction(name: string, functionName: string, payload: any): Promise<void> {
    const result = await this.callAIFunction(functionName, payload);
    this.logResult(name, result.success ? 'pass' : 'fail', result.message, result.duration);
  }

  private async callAIFunction(functionName: string, payload: any): Promise<{success: boolean, message: string, duration: number}> {
    const startTime = Date.now();
    
    try {
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: payload
      });

      const duration = Date.now() - startTime;

      if (error) {
        return { success: false, message: error.message, duration };
      }

      return { 
        success: true, 
        message: `Response received: ${JSON.stringify(data).substring(0, 100)}...`,
        duration 
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      return { success: false, message: (error as Error).message, duration };
    }
  }

  private logResult(test: string, status: 'pass' | 'fail' | 'pending', message?: string, duration?: number): void {
    this.results.push({ test, status, message, duration });
    
    const statusIcon = status === 'pass' ? '✅' : status === 'fail' ? '❌' : '⏳';
    const durationText = duration ? ` (${duration}ms)` : '';
    
    console.log(`${statusIcon} ${test}${durationText}`);
    if (message) console.log(`   └─ ${message}`);
  }

  private reportResults(): void {
    const passed = this.results.filter(r => r.status === 'pass').length;
    const failed = this.results.filter(r => r.status === 'fail').length;
    const total = this.results.length;

    console.log('\n📊 Test Results Summary:');
    console.log(`✅ Passed: ${passed}/${total}`);
    console.log(`❌ Failed: ${failed}/${total}`);
    console.log(`📈 Success Rate: ${Math.round((passed/total) * 100)}%`);

    if (failed > 0) {
      console.log('\n🔍 Failed Tests:');
      this.results
        .filter(r => r.status === 'fail')
        .forEach(r => console.log(`   • ${r.test}: ${r.message}`));
    }

    console.log('\n🎯 Test Plan Execution Complete!');
  }
}

// Export test runner function
export async function executeComprehensiveTestPlan(): Promise<void> {
  const tester = new AISystemTester();
  await tester.runComprehensiveTest();
}