import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Invoice {
  id: string;
  user_id: string;
  invoice_number: string;
  job_id?: string;
  contract_id?: string;
  invoice_type: string;
  client_name?: string;
  client_email?: string;
  client_address?: any;
  professional_name?: string;
  professional_email?: string;
  professional_address?: any;
  subtotal: number;
  vat_amount: number;
  vat_rate: number;
  discount_amount: number;
  discount_percentage: number;
  total_amount: number;
  currency: string;
  status: string;
  due_date?: string;
  paid_date?: string;
  sent_at?: string;
  viewed_at?: string;
  terms?: string;
  footer_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface InvoiceItem {
  id?: string;
  invoice_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
  tax_rate: number;
  tax_amount: number;
  item_order: number;
}

export const useInvoices = (userId?: string) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInvoices = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvoices(data || []);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      toast.error('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchInvoices();

    if (!userId) return;

    const channel = supabase
      .channel('invoices-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'invoices',
          filter: `user_id=eq.${userId}`
        },
        () => {
          fetchInvoices();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, fetchInvoices]);

  const createInvoice = async (invoiceData: Partial<Invoice>, items: Partial<InvoiceItem>[]) => {
    try {
      // Generate invoice number
      const invoiceNumber = `INV-${Date.now()}`;

      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert([{
          user_id: userId,
          invoice_number: invoiceNumber,
          invoice_type: invoiceData.invoice_type || 'standard',
          client_name: invoiceData.client_name,
          client_email: invoiceData.client_email,
          client_address: invoiceData.client_address,
          professional_name: invoiceData.professional_name,
          professional_email: invoiceData.professional_email,
          professional_address: invoiceData.professional_address,
          subtotal: 0,
          vat_rate: invoiceData.vat_rate || 0,
          vat_amount: 0,
          discount_amount: invoiceData.discount_amount || 0,
          discount_percentage: invoiceData.discount_percentage || 0,
          total_amount: 0,
          currency: invoiceData.currency || 'USD',
          status: 'draft',
          due_date: invoiceData.due_date,
          terms: invoiceData.terms,
          footer_notes: invoiceData.footer_notes,
          job_id: invoiceData.job_id,
          contract_id: invoiceData.contract_id,
        }])
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      // Add line items
      if (items.length > 0) {
        const itemsToInsert = items.map((item, index) => ({
          invoice_id: invoice.id,
          description: item.description || '',
          quantity: item.quantity || 1,
          unit_price: item.unit_price || 0,
          amount: (item.quantity || 1) * (item.unit_price || 0),
          tax_rate: item.tax_rate || 0,
          tax_amount: ((item.quantity || 1) * (item.unit_price || 0)) * ((item.tax_rate || 0) / 100),
          item_order: index,
        }));

        const { error: itemsError } = await supabase
          .from('invoice_items')
          .insert(itemsToInsert);

        if (itemsError) throw itemsError;
      }

      toast.success('Invoice created successfully');
      return invoice;
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast.error('Failed to create invoice');
      throw error;
    }
  };

  const updateInvoice = async (invoiceId: string, updates: Partial<Invoice>) => {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .update(updates)
        .eq('id', invoiceId)
        .select()
        .single();

      if (error) throw error;
      toast.success('Invoice updated');
      return data;
    } catch (error) {
      console.error('Error updating invoice:', error);
      toast.error('Failed to update invoice');
      throw error;
    }
  };

  const sendInvoice = async (invoiceId: string) => {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString(),
        })
        .eq('id', invoiceId)
        .select()
        .single();

      if (error) throw error;
      toast.success('Invoice sent');
      return data;
    } catch (error) {
      console.error('Error sending invoice:', error);
      toast.error('Failed to send invoice');
      throw error;
    }
  };

  const markAsPaid = async (invoiceId: string, paymentDetails?: any) => {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .update({
          status: 'paid',
          paid_date: new Date().toISOString(),
        })
        .eq('id', invoiceId)
        .select()
        .single();

      if (error) throw error;

      if (paymentDetails) {
        await supabase.from('invoice_payments').insert({
          invoice_id: invoiceId,
          amount: paymentDetails.amount,
          payment_method: paymentDetails.payment_method,
          notes: paymentDetails.notes,
        });
      }

      toast.success('Invoice marked as paid');
      return data;
    } catch (error) {
      console.error('Error marking invoice as paid:', error);
      toast.error('Failed to update invoice');
      throw error;
    }
  };

  const deleteInvoice = async (invoiceId: string) => {
    try {
      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', invoiceId);

      if (error) throw error;
      toast.success('Invoice deleted');
    } catch (error) {
      console.error('Error deleting invoice:', error);
      toast.error('Failed to delete invoice');
      throw error;
    }
  };

  return {
    invoices,
    loading,
    createInvoice,
    updateInvoice,
    sendInvoice,
    markAsPaid,
    deleteInvoice,
    refetch: fetchInvoices,
    stats: {
      total: invoices.reduce((sum, inv) => sum + (inv.status === 'paid' ? inv.total_amount : 0), 0),
      pending: invoices.filter(inv => inv.status === 'sent').length,
      overdue: invoices.filter(inv => inv.status === 'overdue').length,
      draft: invoices.filter(inv => inv.status === 'draft').length,
    }
  };
};
