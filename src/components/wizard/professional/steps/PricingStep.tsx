import React from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { DollarSign, Percent } from 'lucide-react';

interface Props {
  state: any;
  onUpdate: (updates: any) => void;
  onNext: () => void;
  onBack: () => void;
}

export const PricingStep: React.FC<Props> = ({ state, onUpdate, onNext, onBack }) => {
  const [enableBulkDiscount, setEnableBulkDiscount] = React.useState(
    state.bulkDiscountThreshold > 0
  );

  const canProceed = state.basePrice > 0;

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-lg bg-primary/10">
            <DollarSign className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Pricing</h2>
            <p className="text-sm text-muted-foreground">
              Set your service pricing structure
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Pricing Type */}
          <div>
            <Label htmlFor="pricingType">Pricing Type</Label>
            <Select
              value={state.pricingType}
              onValueChange={(value) => onUpdate({ pricingType: value })}
            >
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fixed">Fixed Price</SelectItem>
                <SelectItem value="hourly">Hourly Rate</SelectItem>
                <SelectItem value="quote_required">Quote Required</SelectItem>
                <SelectItem value="starting_from">Starting From</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Base Price */}
          {state.pricingType !== 'quote_required' && (
            <div>
              <Label htmlFor="basePrice">
                {state.pricingType === 'hourly' ? 'Hourly Rate' : 'Base Price'} *
              </Label>
              <div className="relative mt-2">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  €
                </span>
                <Input
                  id="basePrice"
                  type="number"
                  min="0"
                  step="5"
                  value={state.basePrice}
                  onChange={(e) => onUpdate({ basePrice: parseFloat(e.target.value) || 0 })}
                  className="pl-8"
                />
              </div>
            </div>
          )}

          {/* Bulk Discount */}
          {state.pricingType !== 'quote_required' && (
            <div className="space-y-4 p-4 border rounded-lg">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="enableBulkDiscount"
                  checked={enableBulkDiscount}
                  onCheckedChange={(checked) => {
                    setEnableBulkDiscount(checked as boolean);
                    if (!checked) {
                      onUpdate({ bulkDiscountThreshold: 0, bulkDiscountPrice: 0 });
                    }
                  }}
                />
                <Label htmlFor="enableBulkDiscount" className="flex items-center gap-2 cursor-pointer">
                  <Percent className="h-4 w-4" />
                  Offer Bulk Discount
                </Label>
              </div>

              {enableBulkDiscount && (
                <div className="grid grid-cols-2 gap-4 ml-6">
                  <div>
                    <Label htmlFor="bulkThreshold" className="text-sm">
                      Minimum Quantity
                    </Label>
                    <Input
                      id="bulkThreshold"
                      type="number"
                      min="2"
                      value={state.bulkDiscountThreshold}
                      onChange={(e) => onUpdate({ bulkDiscountThreshold: parseInt(e.target.value) || 0 })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="bulkPrice" className="text-sm">
                      Discounted Price
                    </Label>
                    <div className="relative mt-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                        €
                      </span>
                      <Input
                        id="bulkPrice"
                        type="number"
                        min="0"
                        step="5"
                        value={state.bulkDiscountPrice}
                        onChange={(e) => onUpdate({ bulkDiscountPrice: parseFloat(e.target.value) || 0 })}
                        className="pl-8"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Pricing Summary */}
          {state.pricingType !== 'quote_required' && state.basePrice > 0 && (
            <div className="bg-muted/50 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Pricing Summary</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Base Price:</span>
                  <span className="font-medium">€{state.basePrice.toFixed(2)}</span>
                </div>
                {enableBulkDiscount && state.bulkDiscountThreshold > 0 && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Bulk (≥ {state.bulkDiscountThreshold}):</span>
                      <span className="font-medium text-green-600">
                        €{state.bulkDiscountPrice.toFixed(2)}
                      </span>
                    </div>
                    {state.bulkDiscountPrice > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Savings:</span>
                        <span className="font-medium">
                          €{(state.basePrice - state.bulkDiscountPrice).toFixed(2)}
                          ({Math.round((1 - state.bulkDiscountPrice / state.basePrice) * 100)}%)
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onNext} disabled={!canProceed}>
          Continue to Media
        </Button>
      </div>
    </div>
  );
};
