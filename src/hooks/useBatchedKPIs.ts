import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface BatchedKPIs {
  totalUsers: number;
  totalProfessionals: number;
  activeJobs: number;
  totalBookings: number;
  totalReviews: number;
  pendingDisputes: number;
  totalRevenue: number;
  pendingPayments: number;
  pendingVerifications: number;
  activeAlerts: number;
}

export function useBatchedKPIs() {
  const [kpis, setKpis] = useState<BatchedKPIs | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchBatchedKPIs = async () => {
      try {
        setLoading(true);
        
        // Single batched RPC call instead of multiple queries
        const { data, error } = await supabase.rpc('get_admin_dashboard_stats');
        
        if (error) throw error;

        const stats = data as any;
        setKpis({
          totalUsers: stats.total_users || 0,
          totalProfessionals: stats.total_professionals || 0,
          activeJobs: stats.active_jobs || 0,
          totalBookings: stats.total_bookings || 0,
          totalReviews: stats.total_reviews || 0,
          pendingDisputes: stats.pending_disputes || 0,
          totalRevenue: stats.total_revenue || 0,
          pendingPayments: stats.pending_payments || 0,
          pendingVerifications: stats.pending_verifications || 0,
          activeAlerts: 0, // Will be calculated from security_events
        });
      } catch (error: any) {
        console.error('Error fetching batched KPIs:', error);
        toast({
          title: 'Error',
          description: 'Failed to load dashboard metrics',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBatchedKPIs();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchBatchedKPIs, 30000);
    return () => clearInterval(interval);
  }, [toast]);

  return { kpis, loading, refresh: () => setLoading(true) };
}
