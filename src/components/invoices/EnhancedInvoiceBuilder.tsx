import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import { useCurrencyConverter } from '@/hooks/useCurrencyConverter';

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
}

interface InvoiceBuilderProps {
  jobId: string;
  clientId: string;
  onSuccess?: (invoiceId: string) => void;
}

export function InvoiceBuilder({ jobId, clientId, onSuccess }: InvoiceBuilderProps) {
  const { toast } = useToast();
  const { formatCurrency } = useCurrencyConverter();
  const [isCreating, setIsCreating] = useState(false);
  const [applyTax, setApplyTax] = useState(true);
  const [currency, setCurrency] = useState('EUR');
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: '1', description: '', quantity: 1, unit_price: 0, amount: 0 },
  ]);
  const [notes, setNotes] = useState('');

  const addItem = () => {
    setItems([
      ...items,
      {
        id: Date.now().toString(),
        description: '',
        quantity: 1,
        unit_price: 0,
        amount: 0,
      },
    ]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          if (field === 'quantity' || field === 'unit_price') {
            updated.amount = updated.quantity * updated.unit_price;
          }
          return updated;
        }
        return item;
      })
    );
  };

  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);

  const handleCreateInvoice = async () => {
    if (items.some((item) => !item.description || item.amount === 0)) {
      toast({
        title: "Validation Error",
        description: "Please fill in all invoice items",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get professional profile
      const { data: profile } = await supabase
        .from('professional_profiles')
        .select('user_id, tax_rate, tax_exempt, invoice_prefix, next_invoice_number')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!profile) throw new Error('Professional profile not found');

      // Prepare items
      const invoiceItems = items.map((item) => ({
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        amount: item.amount,
      }));

      // Calculate tax
      const taxRate = applyTax && !(profile as any).tax_exempt ? ((profile as any).tax_rate || 0) : 0;
      const taxAmount = Math.round(subtotal * (taxRate / 100) * 100) / 100;
      const total = subtotal + taxAmount;

      // Generate invoice number
      const invoiceNumber = `${(profile as any).invoice_prefix || 'INV'}-${String((profile as any).next_invoice_number || 1).padStart(6, '0')}`;

      // Create invoice
      const { data: invoice, error } = await supabase
        .from('invoices')
        .insert({
          client_id: clientId,
          subtotal: subtotal,
          vat_amount: taxAmount,
          total_amount: total,
          status: 'draft',
          due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          issued_at: new Date().toISOString(),
          notes: notes || null,
        } as any)
        .select()
        .single();

      if (error) throw error;

      // Update next invoice number
      await supabase
        .from('professional_profiles')
        .update({ next_invoice_number: ((profile as any).next_invoice_number || 1) + 1 } as any)
        .eq('user_id', user.id);

      toast({
        title: "Success",
        description: "Invoice created successfully",
      });

      onSuccess?.(invoice.id);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create invoice",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Invoice</CardTitle>
        <CardDescription>Add line items and configure your invoice</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Currency</Label>
          <Select value={currency} onValueChange={setCurrency}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="EUR">EUR (€)</SelectItem>
              <SelectItem value="USD">USD ($)</SelectItem>
              <SelectItem value="GBP">GBP (£)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Line Items</Label>
            <Button onClick={addItem} size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>

          {items.map((item, index) => (
            <div key={item.id} className="grid grid-cols-12 gap-2 items-end">
              <div className="col-span-5 space-y-2">
                {index === 0 && <Label className="text-xs">Description</Label>}
                <Input
                  placeholder="Item description"
                  value={item.description}
                  onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                />
              </div>
              <div className="col-span-2 space-y-2">
                {index === 0 && <Label className="text-xs">Qty</Label>}
                <Input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) =>
                    updateItem(item.id, 'quantity', parseInt(e.target.value) || 1)
                  }
                />
              </div>
              <div className="col-span-2 space-y-2">
                {index === 0 && <Label className="text-xs">Unit Price</Label>}
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={item.unit_price}
                  onChange={(e) =>
                    updateItem(item.id, 'unit_price', parseFloat(e.target.value) || 0)
                  }
                />
              </div>
              <div className="col-span-2 space-y-2">
                {index === 0 && <Label className="text-xs">Amount</Label>}
                <div className="text-sm font-medium px-3 py-2 bg-muted rounded-md">
                  {formatCurrency(item.amount, currency)}
                </div>
              </div>
              <div className="col-span-1">
                {items.length > 1 && (
                  <Button
                    onClick={() => removeItem(item.id)}
                    size="icon"
                    variant="ghost"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes (Optional)</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Additional notes or payment terms..."
            rows={3}
          />
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="space-y-1">
            <Label htmlFor="apply_tax">Apply Tax</Label>
            <p className="text-sm text-muted-foreground">
              Use your default tax rate
            </p>
          </div>
          <Switch
            id="apply_tax"
            checked={applyTax}
            onCheckedChange={setApplyTax}
          />
        </div>

        <div className="space-y-2 pt-4 border-t">
          <div className="flex justify-between text-lg">
            <span className="font-medium">Subtotal</span>
            <span className="font-bold">{formatCurrency(subtotal, currency)}</span>
          </div>
          {applyTax && (
            <p className="text-sm text-muted-foreground">
              Taxes will be calculated automatically based on your settings
            </p>
          )}
        </div>

        <Button
          onClick={handleCreateInvoice}
          disabled={isCreating}
          className="w-full"
          size="lg"
        >
          {isCreating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating Invoice...
            </>
          ) : (
            'Create Invoice'
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
