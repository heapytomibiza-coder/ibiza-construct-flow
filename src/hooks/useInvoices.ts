import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface InvoiceItem {
  description: string;
  quantity: number;
  unit_price: number;
  tax_rate: number;
  item_order: number;
}

export function useInvoices(userId: string) {
  const queryClient = useQueryClient();

  const { data: invoices = [], isLoading: loading } = useQuery({
    queryKey: ['invoices', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('client_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  const stats = {
    total: invoices.reduce((sum, inv) => sum + Number(inv.total_amount || 0), 0),
    pending: invoices.filter(inv => inv.status === 'sent').length,
    overdue: invoices.filter(inv => inv.status === 'overdue').length,
    draft: invoices.filter(inv => inv.status === 'draft').length,
  };

  const createInvoice = async (invoiceData: any, items: Partial<InvoiceItem>[]) => {
    const { error } = await supabase.from('invoices').insert({
      ...invoiceData,
      client_id: userId,
      line_items: items,
    });
    if (error) throw error;
    queryClient.invalidateQueries({ queryKey: ['invoices'] });
    toast.success('Invoice created');
  };

  const sendInvoice = async (id: string) => {
    const { error } = await supabase
      .from('invoices')
      .update({ status: 'sent', sent_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;
    queryClient.invalidateQueries({ queryKey: ['invoices'] });
    toast.success('Invoice sent');
  };

  const markAsPaid = async (id: string) => {
    const { error } = await supabase
      .from('invoices')
      .update({ status: 'paid', paid_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;
    queryClient.invalidateQueries({ queryKey: ['invoices'] });
    toast.success('Invoice marked as paid');
  };

  const deleteInvoice = async (id: string) => {
    const { error } = await supabase.from('invoices').delete().eq('id', id);
    if (error) throw error;
    queryClient.invalidateQueries({ queryKey: ['invoices'] });
    toast.success('Invoice deleted');
  };

  return {
    invoices,
    loading,
    createInvoice,
    sendInvoice,
    markAsPaid,
    deleteInvoice,
    stats,
  };
}
