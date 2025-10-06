import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow, format } from 'date-fns';
import { FileText, Download, Eye, Plus } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type Invoice = Database['public']['Tables']['invoices']['Row'];

interface InvoiceListProps {
  invoices: Invoice[];
  userId: string;
}

export const InvoiceList = ({ invoices, userId }: InvoiceListProps) => {
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'secondary',
      sent: 'default',
      paid: 'default',
      overdue: 'destructive',
      canceled: 'secondary'
    };
    return colors[status] || 'secondary';
  };

  if (invoices.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">No invoices yet</p>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Invoice
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invoices</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-4">
            {invoices.map((invoice) => (
              <Card key={invoice.id} className="border-2">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium">{invoice.invoice_number}</p>
                          <Badge variant={getStatusColor(invoice.status || 'draft') as any}>
                            {invoice.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Created {formatDistanceToNow(new Date(invoice.created_at), {
                            addSuffix: true
                          })}
                        </p>
                        {invoice.due_date && (
                          <p className="text-sm text-muted-foreground">
                            Due: {format(new Date(invoice.due_date), 'MMM dd, yyyy')}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">
                        ${Number(invoice.total_amount).toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground uppercase">
                        {invoice.currency}
                      </p>
                      <div className="flex gap-1 mt-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
