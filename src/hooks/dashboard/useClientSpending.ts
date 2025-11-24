/**
 * Client Spending Hook
 * Phase 11: Data Integration & Testing
 * 
 * Fetches real spending data from Supabase
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SpendingData {
  category: string;
  amount: number;
  projects: number;
  color: string;
}

const categoryColors: Record<string, string> = {
  'Carpentry': 'bg-copper',
  'Electrical': 'bg-amber-500',
  'Plumbing': 'bg-blue-500',
  'Painting': 'bg-emerald-500',
  'Construction': 'bg-purple-500',
  'Landscaping': 'bg-green-500',
  'Other': 'bg-gray-500'
};

export function useClientSpending(clientId?: string) {
  const [spendingData, setSpendingData] = useState<SpendingData[]>([]);
  const [totalSpent, setTotalSpent] = useState(0);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!clientId) {
      setLoading(false);
      return;
    }

    fetchSpending();
  }, [clientId]);

  const fetchSpending = async () => {
    try {
      setLoading(true);

      // Fetch bookings with services for the client
      const { data: bookings, error } = await supabase
        .from('bookings')
        .select(`
          id,
          services:service_id (
            category
          )
        `)
        .eq('client_id', clientId)
        .in('status', ['in_progress', 'completed']);

      if (error) throw error;

      // Fetch contracts to get actual spending
      const { data: contracts, error: contractsError } = await supabase
        .from('contracts')
        .select('agreed_amount, job_id')
        .eq('client_id', clientId)
        .in('escrow_status', ['held', 'released']);

      if (contractsError) throw contractsError;

      // Group spending by category
      const categoryMap = new Map<string, { amount: number; projects: Set<string> }>();
      let total = 0;

      (bookings || []).forEach(booking => {
        const category = (booking.services as any)?.category || 'Other';
        const contract = (contracts || []).find(c => c.job_id === booking.id);
        
        if (contract) {
          const amount = contract.agreed_amount / 100; // Convert from cents
          total += amount;

          if (!categoryMap.has(category)) {
            categoryMap.set(category, { amount: 0, projects: new Set() });
          }
          
          const catData = categoryMap.get(category)!;
          catData.amount += amount;
          catData.projects.add(booking.id);
        }
      });

      // Convert to array format
      const spendingArray: SpendingData[] = Array.from(categoryMap.entries()).map(
        ([category, data]) => ({
          category,
          amount: Math.round(data.amount),
          projects: data.projects.size,
          color: categoryColors[category] || categoryColors['Other']
        })
      );

      // Sort by amount descending
      spendingArray.sort((a, b) => b.amount - a.amount);

      setSpendingData(spendingArray);
      setTotalSpent(Math.round(total));

    } catch (error: any) {
      console.error('Error fetching spending:', error);
      toast({
        title: 'Error',
        description: 'Failed to load spending data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    spendingData,
    totalSpent,
    loading,
    refresh: fetchSpending
  };
}
