import { supabase } from '@/integrations/supabase/client';

export type ErrorSeverity = 'warning' | 'error' | 'critical';

export interface EdgeFunctionError {
  id?: string;
  functionName: string;
  errorMessage: string;
  errorStack?: string;
  requestData?: Record<string, any>;
  userId?: string;
  severity: ErrorSeverity;
  createdAt?: string;
}

export class ErrorTracker {
  /**
   * Log an edge function error
   */
  static async logEdgeFunctionError(
    functionName: string,
    error: Error,
    options?: {
      requestData?: Record<string, any>;
      userId?: string;
      severity?: ErrorSeverity;
    }
  ): Promise<string | null> {
    try {
      const { data, error: rpcError } = await (supabase.rpc as any)('log_edge_function_error', {
        p_function_name: functionName,
        p_error_message: error.message,
        p_error_stack: error.stack,
        p_request_data: options?.requestData || {},
        p_user_id: options?.userId,
        p_severity: options?.severity || 'error',
      });

      if (rpcError) {
        console.error('Failed to log edge function error:', rpcError);
        return null;
      }

      return data as string;
    } catch (err) {
      console.error('Error tracking failed:', err);
      return null;
    }
  }

  /**
   * Get unresolved errors summary
   */
  static async getUnresolvedErrorsSummary(): Promise<{
    totalUnresolved: number;
    criticalCount: number;
    errorCount: number;
    warningCount: number;
    recentErrors: EdgeFunctionError[];
  }> {
    const { data, error } = await (supabase.rpc as any)('get_unresolved_errors_summary');

    if (error) {
      console.error('Error fetching unresolved errors:', error);
      return {
        totalUnresolved: 0,
        criticalCount: 0,
        errorCount: 0,
        warningCount: 0,
        recentErrors: [],
      };
    }

    const summary = data as any;
    return {
      totalUnresolved: summary?.total_unresolved || 0,
      criticalCount: summary?.critical_count || 0,
      errorCount: summary?.error_count || 0,
      warningCount: summary?.warning_count || 0,
      recentErrors: summary?.recent_errors || [],
    };
  }

  /**
   * Resolve an error
   */
  static async resolveError(errorId: string): Promise<boolean> {
    try {
      const { data: user } = await supabase.auth.getUser();
      
      const { error } = await (supabase as any)
        .from('edge_function_errors')
        .update({
          resolved_at: new Date().toISOString(),
          resolved_by: user.user?.id,
        })
        .eq('id', errorId);

      if (error) {
        console.error('Failed to resolve error:', error);
        return false;
      }

      return true;
    } catch (err) {
      console.error('Error resolution failed:', err);
      return false;
    }
  }

  /**
   * Get recent errors for a specific function
   */
  static async getFunctionErrors(
    functionName: string,
    limit: number = 50
  ): Promise<EdgeFunctionError[]> {
    const { data, error } = await (supabase as any)
      .from('edge_function_errors')
      .select('*')
      .eq('function_name', functionName)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching function errors:', error);
      return [];
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      functionName: row.function_name,
      errorMessage: row.error_message,
      errorStack: row.error_stack,
      requestData: row.request_data as Record<string, any>,
      userId: row.user_id,
      severity: row.severity as ErrorSeverity,
      createdAt: row.created_at,
    }));
  }

  /**
   * Wrapper for edge function calls with automatic error tracking
   */
  static async withErrorTracking<T>(
    functionName: string,
    fn: () => Promise<T>,
    options?: {
      requestData?: Record<string, any>;
      userId?: string;
      severity?: ErrorSeverity;
    }
  ): Promise<T> {
    try {
      return await fn();
    } catch (error: any) {
      await this.logEdgeFunctionError(functionName, error, options);
      throw error;
    }
  }
}
