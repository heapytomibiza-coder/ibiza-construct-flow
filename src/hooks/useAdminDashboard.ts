import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface DashboardStats {
  total_users: number;
  total_professionals: number;
  total_jobs: number;
  active_jobs: number;
  total_bookings: number;
  total_reviews: number;
  pending_disputes: number;
  total_revenue: number;
  pending_payments: number;
}

export interface AdminAuditLog {
  id: string;
  admin_id: string;
  action: string;
  entity_type?: string;
  entity_id?: string;
  changes?: Record<string, any>;
  created_at: string;
}

export function useAdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_admin_dashboard_stats');

      if (error) throw error;
      setStats(data as unknown as DashboardStats);
    } catch (error: any) {
      console.error('Error fetching dashboard stats:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard statistics',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAuditLogs = async (limit: number = 50) => {
    try {
      const { data, error } = await supabase
        .from('admin_audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      setAuditLogs((data || []).map(log => ({
        ...log,
        changes: log.changes as Record<string, any> | undefined
      })));
    } catch (error: any) {
      console.error('Error fetching audit logs:', error);
      toast({
        title: 'Error',
        description: 'Failed to load audit logs',
        variant: 'destructive',
      });
    }
  };

  const logAdminAction = async (
    action: string,
    targetType: string,
    targetId: string,
    actionData?: Record<string, any>
  ) => {
    try {
      const { error } = await supabase.rpc('log_admin_action', {
        p_action_type: action,
        p_target_type: targetType,
        p_target_id: targetId,
        p_action_data: actionData,
      });

      if (error) throw error;
    } catch (error: any) {
      console.error('Error logging admin action:', error);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
    fetchAuditLogs();
  }, []);

  return {
    stats,
    auditLogs,
    loading,
    fetchDashboardStats,
    fetchAuditLogs,
    logAdminAction,
  };
}
