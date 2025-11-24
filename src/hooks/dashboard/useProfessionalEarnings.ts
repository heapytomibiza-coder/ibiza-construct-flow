/**
 * Professional Earnings Hook
 * Phase 11: Data Integration & Testing
 * 
 * Fetches real earnings data from Supabase
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface EarningsData {
  period: string;
  amount: number;
  jobs: number;
}

export function useProfessionalEarnings(professionalId?: string) {
  const [weeklyData, setWeeklyData] = useState<EarningsData[]>([]);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!professionalId) {
      setLoading(false);
      return;
    }

    fetchEarnings();
  }, [professionalId]);

  const fetchEarnings = async () => {
    try {
      setLoading(true);

      // Fetch completed contracts for the professional
      const { data: contracts, error } = await supabase
        .from('contracts')
        .select('agreed_amount, created_at')
        .eq('tasker_id', professionalId)
        .eq('escrow_status', 'released')
        .gte('created_at', getWeekAgoDate())
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Process data into daily earnings
      const dailyEarnings = processDailyEarnings(contracts || []);
      setWeeklyData(dailyEarnings);

      // Calculate total earnings
      const total = (contracts || []).reduce((sum, c) => sum + c.agreed_amount, 0);
      setTotalEarnings(total / 100); // Convert from cents

    } catch (error: any) {
      console.error('Error fetching earnings:', error);
      toast({
        title: 'Error',
        description: 'Failed to load earnings data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getWeekAgoDate = () => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date.toISOString();
  };

  const processDailyEarnings = (contracts: any[]): EarningsData[] => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const today = new Date().getDay();
    const orderedDays = [...days.slice(today), ...days.slice(0, today)];

    // Initialize earnings for each day
    const earningsByDay = orderedDays.map(day => ({
      period: day,
      amount: 0,
      jobs: 0
    }));

    // Aggregate contract amounts by day
    contracts.forEach(contract => {
      const contractDate = new Date(contract.created_at);
      const dayIndex = (contractDate.getDay() + 6) % 7; // Convert to Mon=0 format
      
      const dayData = earningsByDay.find(d => 
        d.period === days[dayIndex]
      );
      
      if (dayData) {
        dayData.amount += contract.agreed_amount / 100; // Convert from cents
        dayData.jobs += 1;
      }
    });

    return earningsByDay;
  };

  return {
    weeklyData,
    totalEarnings,
    loading,
    refresh: fetchEarnings
  };
}
