import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useInvoices, InvoiceItem } from '@/hooks/useInvoices';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface CreateInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
}

export const CreateInvoiceDialog = ({
  open,
  onOpenChange,
  userId,
}: CreateInvoiceDialogProps) => {
  const { createInvoice } = useInvoices(userId);
  const [processing, setProcessing] = useState(false);
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [vatRate, setVatRate] = useState(0);
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [terms, setTerms] = useState('');
  const [items, setItems] = useState<Partial<InvoiceItem>[]>([
    { description: '', quantity: 1, unit_price: 0, tax_rate: 0, item_order: 0 }
  ]);

  const addItem = () => {
    setItems([...items, {
      description: '',
      quantity: 1,
      unit_price: 0,
      tax_rate: 0,
      item_order: items.length
    }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const calculateTotal = () => {
    const subtotal = items.reduce((sum, item) => {
      return sum + ((item.quantity || 0) * (item.unit_price || 0));
    }, 0);
    const discount = subtotal * (discountPercentage / 100);
    const tax = (subtotal - discount) * (vatRate / 100);
    return subtotal - discount + tax;
  };

  const handleCreate = async () => {
    try {
      setProcessing(true);

      await createInvoice({
        client_name: clientName,
        client_email: clientEmail,
        due_date: dueDate || undefined,
        vat_rate: vatRate,
        discount_percentage: discountPercentage,
        terms,
      }, items);

      onOpenChange(false);
      // Reset form
      setClientName('');
      setClientEmail('');
      setDueDate('');
      setVatRate(0);
      setDiscountPercentage(0);
      setTerms('');
      setItems([{ description: '', quantity: 1, unit_price: 0, tax_rate: 0, item_order: 0 }]);
    } catch (error) {
      console.error('Error creating invoice:', error);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Invoice</DialogTitle>
          <DialogDescription>
            Create a new invoice for your client
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Client Information */}
          <Card className="p-4 space-y-4">
            <h3 className="font-semibold">Client Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clientName">Client Name *</Label>
                <Input
                  id="clientName"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientEmail">Client Email</Label>
                <Input
                  id="clientEmail"
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="john@example.com"
                />
              </div>
            </div>
          </Card>

          {/* Line Items */}
          <Card className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Line Items</h3>
              <Button size="sm" variant="outline" onClick={addItem}>
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </div>

            <div className="space-y-3">
              {items.map((item, index) => (
                <div key={index} className="flex gap-3 items-start">
                  <div className="flex-1 grid grid-cols-4 gap-2">
                    <Input
                      placeholder="Description"
                      value={item.description}
                      onChange={(e) => updateItem(index, 'description', e.target.value)}
                    />
                    <Input
                      type="number"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value))}
                    />
                    <Input
                      type="number"
                      placeholder="Price"
                      value={item.unit_price}
                      onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value))}
                    />
                    <Input
                      type="number"
                      placeholder="Tax %"
                      value={item.tax_rate}
                      onChange={(e) => updateItem(index, 'tax_rate', parseFloat(e.target.value))}
                    />
                  </div>
                  {items.length > 1 && (
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => removeItem(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Invoice Details */}
          <Card className="p-4 space-y-4">
            <h3 className="font-semibold">Invoice Details</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vatRate">VAT Rate (%)</Label>
                <Input
                  id="vatRate"
                  type="number"
                  value={vatRate}
                  onChange={(e) => setVatRate(parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="discount">Discount (%)</Label>
                <Input
                  id="discount"
                  type="number"
                  value={discountPercentage}
                  onChange={(e) => setDiscountPercentage(parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="terms">Terms & Conditions</Label>
              <Textarea
                id="terms"
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
                placeholder="Payment terms and conditions..."
                rows={3}
              />
            </div>
          </Card>

          {/* Total */}
          <div className="flex justify-end">
            <div className="text-right space-y-1">
              <p className="text-sm text-muted-foreground">Estimated Total</p>
              <p className="text-3xl font-bold">${calculateTotal().toFixed(2)}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={processing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={processing || !clientName}
              className="bg-gradient-hero"
            >
              {processing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Invoice'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
