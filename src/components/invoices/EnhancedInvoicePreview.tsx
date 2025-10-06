import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Download, Send, Loader2 } from 'lucide-react';
import { useCurrencyConverter } from '@/hooks/useCurrencyConverter';

interface InvoicePreviewProps {
  invoiceId: string;
  onStatusChange?: () => void;
}

export function InvoicePreview({ invoiceId, onStatusChange }: InvoicePreviewProps) {
  const { toast } = useToast();
  const { formatCurrency } = useCurrencyConverter();
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const { data, error } = await supabase
          .from('invoices')
          .select(`
            *,
            client:profiles!invoices_client_id_fkey(full_name, display_name),
            job:jobs(title)
          `)
          .eq('id', invoiceId)
          .single();

        if (error) throw error;
        setInvoice(data);
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to load invoice",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [invoiceId]);

  const handleSendInvoice = async () => {
    setSending(true);
    try {
      const { error } = await supabase
        .from('invoices')
        .update({ status: 'sent', sent_at: new Date().toISOString() })
        .eq('id', invoiceId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Invoice sent successfully",
      });

      onStatusChange?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send invoice",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <Loader2 className="h-6 w-6 animate-spin mx-auto" />
        </CardContent>
      </Card>
    );
  }

  if (!invoice) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <p className="text-muted-foreground">Invoice not found</p>
        </CardContent>
      </Card>
    );
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      draft: 'secondary',
      sent: 'default',
      paid: 'default',
      overdue: 'destructive',
      cancelled: 'outline',
    };
    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>;
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Invoice Preview</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {invoice.invoice_number || 'Draft Invoice'}
              </p>
            </div>
            {getStatusBadge(invoice.status)}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Invoice Details */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-medium mb-1">Bill To</p>
              <p className="text-sm text-muted-foreground">
                {invoice.client?.display_name || invoice.client?.full_name}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium mb-1">Invoice Date</p>
              <p className="text-sm text-muted-foreground">
                {format(new Date(invoice.issued_at || invoice.created_at), 'PPP')}
              </p>
              {invoice.due_date && (
                <>
                  <p className="text-sm font-medium mb-1 mt-2">Due Date</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(invoice.due_date), 'PPP')}
                  </p>
                </>
              )}
            </div>
          </div>

          {invoice.job && (
            <div>
              <p className="text-sm font-medium mb-1">Related Job</p>
              <p className="text-sm text-muted-foreground">{invoice.job.title}</p>
            </div>
          )}

          <Separator />

          {/* Line Items */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Line Items</p>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left text-xs p-2">Description</th>
                    <th className="text-right text-xs p-2">Qty</th>
                    <th className="text-right text-xs p-2">Unit Price</th>
                    <th className="text-right text-xs p-2">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.line_items?.map((item: any, index: number) => (
                    <tr key={index} className="border-t">
                      <td className="text-sm p-2">{item.description}</td>
                      <td className="text-sm text-right p-2">{item.quantity}</td>
                      <td className="text-sm text-right p-2">
                        {formatCurrency(item.unit_price, invoice.currency || 'EUR')}
                      </td>
                      <td className="text-sm text-right p-2 font-medium">
                        {formatCurrency(item.amount, invoice.currency || 'EUR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <Separator />

          {/* Totals */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span className="font-medium">
                {formatCurrency(invoice.subtotal, invoice.currency || 'EUR')}
              </span>
            </div>
            {invoice.tax_rate > 0 && (
              <div className="flex justify-between text-sm">
                <span>Tax ({invoice.tax_rate}%)</span>
                <span className="font-medium">
                  {formatCurrency(invoice.vat_amount, invoice.currency || 'EUR')}
                </span>
              </div>
            )}
            {invoice.discount_amount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Discount</span>
                <span className="font-medium">
                  -{formatCurrency(invoice.discount_amount, invoice.currency || 'EUR')}
                </span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between text-lg">
              <span className="font-semibold">Total</span>
              <span className="font-bold">
                {formatCurrency(invoice.total_amount, invoice.currency || 'EUR')}
              </span>
            </div>
          </div>

          {invoice.notes && (
            <>
              <Separator />
              <div>
                <p className="text-sm font-medium mb-1">Notes</p>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {invoice.notes}
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-2">
        {invoice.status === 'draft' && (
          <Button onClick={handleSendInvoice} disabled={sending} className="flex-1">
            {sending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send Invoice
              </>
            )}
          </Button>
        )}
        <Button variant="outline" className="flex-1">
          <Download className="mr-2 h-4 w-4" />
          Download PDF
        </Button>
      </div>
    </div>
  );
}
