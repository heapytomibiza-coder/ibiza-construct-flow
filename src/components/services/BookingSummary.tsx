import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Clock, Shield, Award, Tag } from 'lucide-react';
import { ServiceSelection, AddonSelection } from './ServiceConfigurator';

interface BookingSummaryProps {
  service: any;
  selections: ServiceSelection[];
  addonSelections: AddonSelection[];
  totalPrice: number;
  options: any[];
  addons: any[];
}

export const BookingSummary = ({
  service,
  selections,
  addonSelections,
  totalPrice,
  options,
  addons
}: BookingSummaryProps) => {
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);

  const formatPrice = (price: number) => `€${price.toFixed(0)}`;
  const finalPrice = totalPrice - discount;

  const handleBookNow = () => {
    // Navigate to job posting with pre-filled service details
    const bookingData = {
      serviceId: service.id,
      serviceName: service.title,
      selections,
      addonSelections: addonSelections.filter(a => a.selected),
      totalPrice: finalPrice
    };
    
    navigate('/post-job', { state: { bookingData } });
  };

  const applyCoupon = () => {
    // Mock coupon logic
    if (couponCode.toUpperCase() === 'SAVE10') {
      setDiscount(totalPrice * 0.1);
    } else if (couponCode.toUpperCase() === 'FIRST20') {
      setDiscount(Math.min(totalPrice * 0.2, 20));
    }
  };

  return (
    <div className="space-y-4">
      {/* Price Summary Card */}
      <Card className="p-6 sticky top-4">
        <h3 className="font-semibold text-lg mb-4">Booking Summary</h3>
        
        {/* Service Base */}
        <div className="space-y-3">
          <div className="flex justify-between items-start">
            <span className="text-sm text-muted-foreground">Service</span>
            <span className="font-medium">{service.title}</span>
          </div>
          
          {/* Selected Options */}
          {selections.map(selection => {
            const option = options.find(o => o.id === selection.optionId);
            if (!option) return null;
            
            return (
              <div key={selection.optionId} className="flex justify-between items-start text-sm">
                <div>
                  <span className="text-muted-foreground">{option.name}</span>
                  {selection.quantity > 1 && (
                    <span className="text-xs text-muted-foreground ml-1">
                      × {selection.quantity}
                    </span>
                  )}
                </div>
                <span>{formatPrice(selection.price * selection.quantity)}</span>
              </div>
            );
          })}
          
          {/* Selected Add-ons */}
          {addonSelections.filter(a => a.selected).map(selection => {
            const addon = addons.find(a => a.id === selection.addonId);
            if (!addon) return null;
            
            return (
              <div key={selection.addonId} className="flex justify-between items-start text-sm">
                <span className="text-muted-foreground">{addon.name}</span>
                <span>+{formatPrice(selection.price)}</span>
              </div>
            );
          })}
        </div>
        
        {/* Coupon Section */}
        <div className="mt-4 space-y-2">
          <div className="flex gap-2">
            <Input
              placeholder="Coupon code"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              className="text-sm"
            />
            <Button 
              variant="outline" 
              size="sm"
              onClick={applyCoupon}
              disabled={!couponCode}
            >
              Apply
            </Button>
          </div>
          
          {discount > 0 && (
            <div className="flex justify-between items-center text-sm text-green-600">
              <span>Discount ({couponCode})</span>
              <span>-{formatPrice(discount)}</span>
            </div>
          )}
        </div>
        
        <Separator className="my-4" />
        
        {/* Total */}
        <div className="flex justify-between items-center font-semibold text-lg">
          <span>Total</span>
          <span>{formatPrice(finalPrice)}</span>
        </div>
        
        {/* Book Now Button */}
        <Button 
          className="w-full mt-4" 
          size="lg"
          onClick={handleBookNow}
          disabled={selections.length === 0}
        >
          Book Now
        </Button>
        
        {/* Trust Signals */}
        <div className="mt-4 space-y-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Shield className="h-3 w-3" />
            <span>Background checked professionals</span>
          </div>
          <div className="flex items-center gap-2">
            <Award className="h-3 w-3" />
            <span>Satisfaction guarantee</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-3 w-3" />
            <span>Same day availability</span>
          </div>
        </div>
      </Card>

      {/* Popular Packages */}
      <Card className="p-6">
        <h4 className="font-medium mb-4">Popular Packages</h4>
        <div className="space-y-3">
          <div className="p-3 rounded-lg border border-border">
            <div className="flex justify-between items-start mb-2">
              <div>
                <span className="font-medium text-sm">Basic Package</span>
                <Badge variant="outline" className="ml-2 text-xs">Most Popular</Badge>
              </div>
              <span className="font-semibold">€89</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Standard assembly + cleanup
            </p>
          </div>
          
          <div className="p-3 rounded-lg border border-border">
            <div className="flex justify-between items-start mb-2">
              <span className="font-medium text-sm">Premium Package</span>
              <span className="font-semibold">€149</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Assembly + mounting + same day
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};