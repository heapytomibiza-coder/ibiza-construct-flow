import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { FileText, Calendar, User } from 'lucide-react';

interface InvoiceDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoiceId: string;
}

export const InvoiceDetailsDialog = ({
  open,
  onOpenChange,
  invoiceId,
}: InvoiceDetailsDialogProps) => {
  const [invoice, setInvoice] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open && invoiceId) {
      fetchInvoiceDetails();
    }
  }, [open, invoiceId]);

  const fetchInvoiceDetails = async () => {
    try {
      const { data: invoiceData, error: invoiceError } = await supabase
        .from('invoices')
        .select('*')
        .eq('id', invoiceId)
        .single();

      if (invoiceError) throw invoiceError;
      setInvoice(invoiceData);

      const { data: itemsData, error: itemsError } = await supabase
        .from('invoice_items')
        .select('*')
        .eq('invoice_id', invoiceId)
        .order('item_order');

      if (itemsError) throw itemsError;
      setItems(itemsData || []);
    } catch (error) {
      console.error('Error fetching invoice details:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'default';
      case 'sent':
        return 'secondary';
      case 'overdue':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  if (loading || !invoice) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              {invoice.invoice_number}
            </DialogTitle>
            <Badge variant={getStatusColor(invoice.status)}>
              {invoice.status}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Info */}
          <div className="grid grid-cols-2 gap-6">
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <User className="w-4 h-4 text-muted-foreground" />
                <h3 className="font-semibold">Bill To</h3>
              </div>
              <div className="space-y-1">
                <p className="font-medium">{invoice.client_name}</p>
                {invoice.client_email && (
                  <p className="text-sm text-muted-foreground">{invoice.client_email}</p>
                )}
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <h3 className="font-semibold">Invoice Details</h3>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Issue Date:</span>
                  <span>{new Date(invoice.created_at).toLocaleDateString()}</span>
                </div>
                {invoice.due_date && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Due Date:</span>
                    <span>{new Date(invoice.due_date).toLocaleDateString()}</span>
                  </div>
                )}
                {invoice.paid_date && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Paid Date:</span>
                    <span>{new Date(invoice.paid_date).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Line Items */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Items</h3>
            <div className="space-y-3">
              {items.length > 0 ? items.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-2">
                  <div className="flex-1">
                    <p className="font-medium">{item.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.quantity} × ${item.unit_price.toFixed(2)}
                      {item.tax_rate > 0 && ` (Tax: ${item.tax_rate}%)`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${item.amount.toFixed(2)}</p>
                  </div>
                </div>
              )) : (
                <p className="text-sm text-muted-foreground">No items found</p>
              )}
            </div>

            <Separator className="my-4" />

            {/* Totals */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal:</span>
                <span>${invoice.subtotal.toFixed(2)}</span>
              </div>
              {invoice.discount_percentage > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Discount ({invoice.discount_percentage}%):
                  </span>
                  <span className="text-destructive">
                    -${((invoice.subtotal * invoice.discount_percentage) / 100).toFixed(2)}
                  </span>
                </div>
              )}
              {invoice.vat_amount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    VAT ({invoice.vat_rate}%):
                  </span>
                  <span>${invoice.vat_amount.toFixed(2)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span>${invoice.total_amount.toFixed(2)} {invoice.currency}</span>
              </div>
            </div>
          </Card>

          {/* Terms */}
          {invoice.terms && (
            <Card className="p-4">
              <h3 className="font-semibold mb-2">Terms & Conditions</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {invoice.terms}
              </p>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
