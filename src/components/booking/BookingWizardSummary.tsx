import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Trash2, Plus, Minus, Tag } from 'lucide-react';
import { useState } from 'react';

interface BookingWizardSummaryProps {
  wizard: any; // Will be typed properly with useBookingWizard return type
}

export const BookingWizardSummary = ({ wizard }: BookingWizardSummaryProps) => {
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');

  const handleApplyCoupon = () => {
    // Mock coupon validation
    if (couponInput.toUpperCase() === 'FIRST10') {
      wizard.applyCoupon(couponInput, wizard.calculateSubtotal() * 0.1);
      setCouponError('');
    } else if (couponInput) {
      setCouponError('Invalid coupon code');
    }
  };

  const formatPrice = (price: number) => `€${price.toFixed(0)}`;

  return (
    <Card className="p-6 sticky top-6">
      <h3 className="text-lg font-semibold mb-4">Booking Summary</h3>

      {/* What's Included */}
      {wizard.selectedItems.length > 0 && (
        <div className="space-y-4 mb-6">
          <h4 className="text-sm font-medium text-muted-foreground">What's Included</h4>
          {wizard.selectedItems.map((item: any) => (
            <div key={item.id} className="flex items-start gap-3">
              {item.imageUrl && (
                <img 
                  src={item.imageUrl} 
                  alt={item.serviceName}
                  className="w-12 h-12 rounded object-cover"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.serviceName}</p>
                <p className="text-xs text-muted-foreground">{item.professionalName}</p>
                {item.pricingType !== 'quote_required' && (
                  <p className="text-sm font-semibold text-primary mt-1">
                    {formatPrice(item.pricePerUnit)}
                    {item.pricingType === 'per_hour' && '/hr'}
                    {item.pricingType === 'per_unit' && `/${item.unitType || 'unit'}`}
                  </p>
                )}
                {item.pricingType === 'quote_required' && (
                  <Badge variant="secondary" className="mt-1">Quote Required</Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => wizard.updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => wizard.updateQuantity(item.id, item.quantity + 1)}
                >
                  <Plus className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-destructive"
                  onClick={() => wizard.removeItem(item.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {wizard.selectedItems.length === 0 && (
        <div className="py-8 text-center text-muted-foreground">
          <p className="text-sm">No services selected yet</p>
          <p className="text-xs mt-1">Add services to continue</p>
        </div>
      )}

      <Separator className="my-4" />

      {/* Price Breakdown */}
      {wizard.selectedItems.length > 0 && !wizard.hasQuoteItems && (
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatPrice(wizard.calculateSubtotal())}</span>
          </div>

          {/* Coupon Code */}
          <div className="space-y-2">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Coupon code"
                  value={couponInput}
                  onChange={(e) => {
                    setCouponInput(e.target.value);
                    setCouponError('');
                  }}
                  className="pl-9"
                />
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleApplyCoupon}
                disabled={!couponInput}
              >
                Apply
              </Button>
            </div>
            {couponError && (
              <p className="text-xs text-destructive">{couponError}</p>
            )}
          </div>

          {wizard.discount > 0 && (
            <div className="flex justify-between text-sm text-primary">
              <span>Discount ({wizard.couponCode})</span>
              <span>-{formatPrice(wizard.discount)}</span>
            </div>
          )}

          <Separator />

          <div className="flex justify-between text-base font-semibold">
            <span>Total</span>
            <span className="text-primary">{formatPrice(wizard.calculateTotal())}</span>
          </div>
        </div>
      )}

      {wizard.hasQuoteItems && (
        <div className="bg-secondary/50 rounded-lg p-4 text-center">
          <Badge variant="secondary" className="mb-2">Quote Required</Badge>
          <p className="text-xs text-muted-foreground">
            Some items require custom pricing. You'll receive quotes from the professional.
          </p>
        </div>
      )}
    </Card>
  );
};
