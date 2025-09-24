import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ProfessionalEarning {
  id: string;
  amount: number;
  fee_amount: number;
  net_amount: number;
  status: string;
  earned_at: string;
  booking_id?: string;
  contract_id?: string;
}

export interface EarningsMetrics {
  totalEarnings: number;
  thisMonthEarnings: number;
  lastMonthEarnings: number;
  pendingEarnings: number;
  averageJobValue: number;
  monthlyGrowth: number;
}

export const useProfessionalEarnings = (professionalId?: string) => {
  const [earnings, setEarnings] = useState<ProfessionalEarning[]>([]);
  const [metrics, setMetrics] = useState<EarningsMetrics>({
    totalEarnings: 0,
    thisMonthEarnings: 0,
    lastMonthEarnings: 0,
    pendingEarnings: 0,
    averageJobValue: 0,
    monthlyGrowth: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEarnings = async () => {
      if (!professionalId) {
        // Try to get current user's ID
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }
        professionalId = user.id;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch earnings data
        const { data: earningsData, error: earningsError } = await supabase
          .from('professional_earnings')
          .select('*')
          .eq('professional_id', professionalId)
          .order('earned_at', { ascending: false });

        if (earningsError) throw earningsError;

        setEarnings(earningsData || []);

        // Calculate metrics
        const now = new Date();
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

        const paidEarnings = (earningsData || []).filter(e => e.status === 'paid');
        const thisMonthEarnings = paidEarnings
          .filter(e => new Date(e.earned_at) >= thisMonthStart)
          .reduce((sum, e) => sum + e.net_amount, 0);
        
        const lastMonthEarnings = paidEarnings
          .filter(e => {
            const date = new Date(e.earned_at);
            return date >= lastMonthStart && date <= lastMonthEnd;
          })
          .reduce((sum, e) => sum + e.net_amount, 0);

        const totalEarnings = paidEarnings.reduce((sum, e) => sum + e.net_amount, 0);
        const pendingEarnings = (earningsData || [])
          .filter(e => e.status === 'pending')
          .reduce((sum, e) => sum + e.net_amount, 0);

        const averageJobValue = paidEarnings.length > 0 
          ? totalEarnings / paidEarnings.length 
          : 0;

        const monthlyGrowth = lastMonthEarnings > 0 
          ? ((thisMonthEarnings - lastMonthEarnings) / lastMonthEarnings) * 100 
          : 0;

        setMetrics({
          totalEarnings,
          thisMonthEarnings,
          lastMonthEarnings,
          pendingEarnings,
          averageJobValue,
          monthlyGrowth
        });

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch earnings');
        console.error('Error fetching professional earnings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEarnings();
  }, [professionalId]);

  return { earnings, metrics, loading, error };
};