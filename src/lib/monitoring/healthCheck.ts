import { supabase } from '@/integrations/supabase/client';

export interface HealthCheckResult {
  name: string;
  type: 'database' | 'api' | 'edge_function' | 'external_service';
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTimeMs?: number;
  errorMessage?: string;
  metadata?: Record<string, any>;
}

export class HealthChecker {
  /**
   * Run a health check and log the result
   */
  static async runCheck(
    checkFn: () => Promise<Omit<HealthCheckResult, 'type'>>,
    type: HealthCheckResult['type']
  ): Promise<HealthCheckResult> {
    const startTime = performance.now();
    
    try {
      const result = await checkFn();
      const responseTime = Math.round(performance.now() - startTime);
      
      const fullResult: HealthCheckResult = {
        ...result,
        type,
        responseTimeMs: result.responseTimeMs || responseTime,
      };

      // Log to database
      await this.logHealthCheck(fullResult);
      
      return fullResult;
    } catch (error: any) {
      const responseTime = Math.round(performance.now() - startTime);
      const errorResult: HealthCheckResult = {
        name: 'unknown',
        type,
        status: 'unhealthy',
        responseTimeMs: responseTime,
        errorMessage: error.message,
      };

      await this.logHealthCheck(errorResult);
      return errorResult;
    }
  }

  /**
   * Check database connectivity
   */
  static async checkDatabase(): Promise<HealthCheckResult> {
    return this.runCheck(async () => {
      const startTime = performance.now();
      const { error } = await supabase.from('profiles').select('count').limit(1);
      const responseTime = Math.round(performance.now() - startTime);

      if (error) {
        return {
          name: 'database_connection',
          status: 'unhealthy',
          responseTimeMs: responseTime,
          errorMessage: error.message,
        };
      }

      return {
        name: 'database_connection',
        status: responseTime < 100 ? 'healthy' : responseTime < 500 ? 'degraded' : 'unhealthy',
        responseTimeMs: responseTime,
      };
    }, 'database');
  }

  /**
   * Check authentication service
   */
  static async checkAuth(): Promise<HealthCheckResult> {
    return this.runCheck(async () => {
      const startTime = performance.now();
      const { error } = await supabase.auth.getSession();
      const responseTime = Math.round(performance.now() - startTime);

      if (error) {
        return {
          name: 'auth_service',
          status: 'unhealthy',
          responseTimeMs: responseTime,
          errorMessage: error.message,
        };
      }

      return {
        name: 'auth_service',
        status: responseTime < 100 ? 'healthy' : responseTime < 500 ? 'degraded' : 'unhealthy',
        responseTimeMs: responseTime,
      };
    }, 'api');
  }

  /**
   * Check edge function availability
   */
  static async checkEdgeFunction(functionName: string): Promise<HealthCheckResult> {
    return this.runCheck(async () => {
      const startTime = performance.now();
      
      // Simple health check - just verify the function responds
      const { error } = await supabase.functions.invoke(functionName, {
        body: { healthCheck: true },
      });
      
      const responseTime = Math.round(performance.now() - startTime);

      if (error && !error.message.includes('healthCheck')) {
        return {
          name: `edge_function_${functionName}`,
          status: 'unhealthy',
          responseTimeMs: responseTime,
          errorMessage: error.message,
        };
      }

      return {
        name: `edge_function_${functionName}`,
        status: responseTime < 1000 ? 'healthy' : responseTime < 3000 ? 'degraded' : 'unhealthy',
        responseTimeMs: responseTime,
      };
    }, 'edge_function');
  }

  /**
   * Run all system health checks
   */
  static async runAllChecks(): Promise<HealthCheckResult[]> {
    return Promise.all([
      this.checkDatabase(),
      this.checkAuth(),
      // Add more checks as needed
    ]);
  }

  /**
   * Get system health summary
   */
  static async getHealthSummary(): Promise<{
    overallStatus: 'healthy' | 'degraded' | 'unhealthy';
    checks: any[];
  }> {
    const { data, error } = await (supabase.rpc as any)('get_system_health_summary');
    
    if (error) {
      console.error('Error fetching health summary:', error);
      return {
        overallStatus: 'unhealthy',
        checks: [],
      };
    }

    return {
      overallStatus: (data as any)?.overall_status || 'unhealthy',
      checks: (data as any)?.checks || [],
    };
  }

  /**
   * Log health check result to database
   */
  private static async logHealthCheck(result: HealthCheckResult): Promise<void> {
    try {
      await (supabase.rpc as any)('log_health_check', {
        p_check_name: result.name,
        p_check_type: result.type,
        p_status: result.status,
        p_response_time_ms: result.responseTimeMs,
        p_error_message: result.errorMessage,
        p_metadata: result.metadata || {},
      });
    } catch (error) {
      console.error('Failed to log health check:', error);
    }
  }
}
