import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useInvoices } from '@/hooks/useInvoices';
import { FileText, Plus, Send, Eye, Download, MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CreateInvoiceDialog } from './CreateInvoiceDialog';
import { InvoiceDetailsDialog } from './InvoiceDetailsDialog';

interface InvoicesListProps {
  userId: string;
}

export const InvoicesList = ({ userId }: InvoicesListProps) => {
  const { invoices, loading, sendInvoice, markAsPaid, deleteInvoice, stats } = useInvoices(userId);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'default';
      case 'sent':
        return 'secondary';
      case 'overdue':
        return 'destructive';
      case 'draft':
        return 'outline';
      default:
        return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Invoices</h2>
          <p className="text-muted-foreground">
            Manage and track your invoices
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)} className="bg-gradient-hero">
          <Plus className="w-4 h-4 mr-2" />
          Create Invoice
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Total Revenue</div>
          <div className="text-2xl font-bold">${stats.total.toFixed(2)}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Pending</div>
          <div className="text-2xl font-bold">{stats.pending}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Overdue</div>
          <div className="text-2xl font-bold text-destructive">{stats.overdue}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Drafts</div>
          <div className="text-2xl font-bold">{stats.draft}</div>
        </Card>
      </div>

      {/* Invoices List */}
      {invoices.length === 0 ? (
        <Card className="p-8 text-center">
          <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No invoices yet</h3>
          <p className="text-muted-foreground mb-4">
            Create your first invoice to get started
          </p>
          <Button onClick={() => setCreateDialogOpen(true)} className="bg-gradient-hero">
            <Plus className="w-4 h-4 mr-2" />
            Create Invoice
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {invoices.map((invoice) => (
            <Card key={invoice.id} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <FileText className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <h4 className="font-semibold">{invoice.invoice_number}</h4>
                      <p className="text-sm text-muted-foreground">
                        {invoice.client_name || 'No client name'}
                      </p>
                    </div>
                    <Badge variant={getStatusColor(invoice.status)}>
                      {invoice.status}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-6 text-sm mt-2">
                    <div>
                      <span className="text-muted-foreground">Amount: </span>
                      <span className="font-medium">
                        ${invoice.total_amount.toFixed(2)} {invoice.currency}
                      </span>
                    </div>
                    {invoice.due_date && (
                      <div>
                        <span className="text-muted-foreground">Due: </span>
                        <span>{new Date(invoice.due_date).toLocaleDateString()}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-muted-foreground">Created: </span>
                      <span>{new Date(invoice.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedInvoiceId(invoice.id);
                      setDetailsDialogOpen(true);
                    }}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View
                  </Button>

                  {invoice.status === 'draft' && (
                    <Button
                      size="sm"
                      onClick={() => sendInvoice(invoice.id)}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Send
                    </Button>
                  )}

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" variant="ghost">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => markAsPaid(invoice.id)}>
                        Mark as Paid
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Download className="w-4 h-4 mr-2" />
                        Download PDF
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => deleteInvoice(invoice.id)}
                        className="text-destructive"
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <CreateInvoiceDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        userId={userId}
      />

      {selectedInvoiceId && (
        <InvoiceDetailsDialog
          open={detailsDialogOpen}
          onOpenChange={setDetailsDialogOpen}
          invoiceId={selectedInvoiceId}
        />
      )}
    </div>
  );
};
