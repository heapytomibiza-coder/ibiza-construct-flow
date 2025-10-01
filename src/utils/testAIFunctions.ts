import { supabase } from "@/integrations/supabase/client";

export class AISystemTester {
  private results: Array<{ test: string; status: 'pass' | 'fail' | 'pending'; message?: string; duration?: number }> = [];

  async runComprehensiveTest(): Promise<void> {
    console.log('🚀 Starting PHASE 4 Wizard Comprehensive Test...\n');
    
    // Phase 1: Test Database & Services
    await this.testDatabaseInfrastructure();
    
    // Phase 2: Test Edge Functions (Questions & Price Estimation)
    await this.testWizardEdgeFunctions();
    
    // Phase 3: Test Storage (Photo Upload)
    await this.testStorageInfrastructure();
    
    // Phase 4: Test Job Templates
    await this.testJobTemplates();
    
    // Report Results
    this.reportResults();
  }

  private async testWizardEdgeFunctions(): Promise<void> {
    console.log('\n📡 Testing Wizard Edge Functions...');

    // Test 1: Generate Questions
    await this.testFunction(
      'Generate Questions (Plumbing)',
      'generate-questions',
      {
        serviceType: 'Kitchen Sink Leak Repair',
        category: 'Home Services',
        subcategory: 'Plumbing'
      }
    );

    // Test 2: Price Estimation
    await this.testFunction(
      'Price Estimation',
      'estimate-price',
      {
        serviceType: 'Kitchen Sink Leak Repair',
        category: 'Home Services',
        subcategory: 'Plumbing',
        answers: {
          'leak_severity': 'moderate',
          'access': 'easy',
          'urgency': 'high'
        },
        location: 'Ibiza, Spain'
      }
    );
  }

  private async testStorageInfrastructure(): Promise<void> {
    console.log('\n📦 Testing Storage Infrastructure...');
    
    try {
      // Test Storage Bucket Access
      const { data: buckets, error: bucketsError } = await supabase
        .storage
        .listBuckets();
      
      const serviceImagesBucket = buckets?.find(b => b.name === 'service-images');
      
      this.logResult(
        'Service Images Bucket', 
        serviceImagesBucket ? 'pass' : 'fail',
        serviceImagesBucket ? 'Bucket exists and is accessible' : bucketsError?.message || 'Bucket not found'
      );

    } catch (error) {
      this.logResult('Storage Infrastructure', 'fail', (error as Error).message);
    }
  }

  private async testJobTemplates(): Promise<void> {
    console.log('\n📋 Testing Job Templates System...');
    
    try {
      // Test job_templates table access
      const { data: templates, error: templatesError } = await supabase
        .from('job_templates')
        .select('*')
        .limit(5);
      
      this.logResult(
        'Job Templates Table', 
        !templatesError ? 'pass' : 'fail',
        templates ? `Templates table accessible (${templates.length} templates)` : templatesError?.message
      );

    } catch (error) {
      this.logResult('Job Templates System', 'fail', (error as Error).message);
    }
  }


  private async testDatabaseInfrastructure(): Promise<void> {
    console.log('\n🗄️ Testing Database & Services Infrastructure...');
    
    try {
      // Test Services Unified V1 Data
      const { data: services, error: servicesError } = await supabase
        .from('services_unified_v1')
        .select('*')
        .limit(10);
      
      this.logResult(
        'Services Data (services_unified_v1)', 
        services && services.length > 0 ? 'pass' : 'fail',
        services ? `Found ${services.length} services` : servicesError?.message
      );

      // Test Bookings Table
      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('*')
        .limit(5);
      
      this.logResult(
        'Bookings Table Access', 
        !bookingsError ? 'pass' : 'fail',
        bookings ? `Bookings table accessible (${bookings.length} records)` : bookingsError?.message
      );

      // Test Micro Questions Snapshot
      const { data: snapshot, error: snapshotError } = await supabase
        .from('micro_questions_snapshot')
        .select('*')
        .limit(5);
      
      this.logResult(
        'Questions Snapshot Cache', 
        !snapshotError ? 'pass' : 'fail',
        snapshot ? `Snapshot table accessible (${snapshot.length} cached)` : snapshotError?.message
      );

    } catch (error) {
      this.logResult('Database Connection', 'fail', (error as Error).message);
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