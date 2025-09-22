import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { LocationChips, PropertyTypeChips, UrgencyChips } from './QuickSelectionChips';
import { VisualPricingTiers } from './VisualPricingTiers';
import { 
  ShoppingCart, 
  Plus, 
  Calendar, 
  MapPin, 
  CheckCircle,
  Shield,
  Clock,
  Star,
  Users
} from 'lucide-react';

interface ServiceItemSelection {
  itemId: string;
  quantity: number;
  price: number;
  pricingType: string;
  unitType: string;
}

interface AddonSelection {
  addonId: string;
  selected: boolean;
  price: number;
}

interface BookingRequestSummaryProps {
  service: any;
  selections: ServiceItemSelection[];
  addonSelections: AddonSelection[];
  totalPrice: number;
  serviceItems: any[];
  addons: any[];
}

export const BookingRequestSummary = ({ 
  service, 
  selections, 
  addonSelections, 
  totalPrice, 
  serviceItems, 
  addons 
}: BookingRequestSummaryProps) => {
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [selectedLocation, setSelectedLocation] = useState<string[]>([]);
  const [selectedPropertyType, setSelectedPropertyType] = useState<string[]>([]);
  const [selectedUrgency, setSelectedUrgency] = useState<string[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<string>('');

  const formatPrice = (price: number) => `€${price.toFixed(0)}`;

  const handleRequestBooking = async () => {
    if (!user) {
      toast.error('Please sign in to request a booking');
      navigate('/auth');
      return;
    }

    if (selections.length === 0) {
      toast.error('Please select at least one service item');
      return;
    }

    // Navigate to booking request form with pre-filled data
    const bookingData = {
      serviceId: service.id,
      selections,
      addonSelections: addonSelections.filter(addon => addon.selected),
      totalPrice: totalPrice - discount,
      locationDetails,
      specialRequirements,
      preferredDate
    };

    navigate('/request-booking', { state: { bookingData } });
  };

  const applyCoupon = () => {
    // Simple coupon logic - in production this would be server-side
    const coupons: Record<string, number> = {
      'WELCOME10': 0.1,
      'SAVE20': 0.2,
      'FIRST50': 50
    };

    const couponValue = coupons[couponCode.toUpperCase()];
    if (couponValue) {
      const discountAmount = couponValue < 1 ? totalPrice * couponValue : Math.min(couponValue, totalPrice);
      setDiscount(discountAmount);
      toast.success(`Coupon applied! €${discountAmount.toFixed(0)} discount`);
    } else {
      toast.error('Invalid coupon code');
    }
  };

  const getUnitLabel = (unitType: string) => {
    switch (unitType) {
      case 'hours': return 'hour(s)';
      case 'items': return 'item(s)';
      case 'rooms': return 'room(s)';
      case 'sqm': return 'm²';
      case 'linear_meter': return 'linear meter(s)';
      default: return unitType;
    }
  };

  const selectedItems = selections.map(selection => {
    const item = serviceItems.find(item => item.id === selection.itemId);
    return { ...selection, item };
  }).filter(s => s.item);

  const selectedAddons = addonSelections.filter(addon => addon.selected).map(selection => {
    const addon = addons.find(addon => addon.id === selection.addonId);
    return { ...selection, addon };
  }).filter(s => s.addon);

  return (
    <Card className="sticky top-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Request Booking
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Service Summary */}
        <div>
          <h4 className="font-medium mb-2">{service.micro?.replace('_', ' ').toUpperCase()}</h4>
          <p className="text-sm text-muted-foreground">{service.category} • {service.subcategory}</p>
        </div>

        <Separator />

        {/* Selected Items */}
        {selectedItems.length > 0 && (
          <div className="space-y-2">
            <h5 className="font-medium text-sm">Selected Services</h5>
            {selectedItems.map(({ item, quantity, price }) => (
              <div key={item.id} className="flex justify-between text-sm">
                <div className="flex-1">
                  <span>{item.name}</span>
                  <div className="text-xs text-muted-foreground">
                    {quantity} {getUnitLabel(item.unit_type)} × {formatPrice(price)}
                  </div>
                </div>
                <span className="font-medium">{formatPrice(price * quantity)}</span>
              </div>
            ))}
          </div>
        )}

        {/* Selected Add-ons */}
        {selectedAddons.length > 0 && (
          <div className="space-y-2">
            <h5 className="font-medium text-sm">Add-ons</h5>
            {selectedAddons.map(({ addon, price }) => (
              <div key={addon.id} className="flex justify-between text-sm">
                <span>{addon.name}</span>
                <span className="font-medium">+{formatPrice(price)}</span>
              </div>
            ))}
          </div>
        )}

        <Separator />

        {/* Quick Booking Details */}
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium mb-1 block">Location Details</label>
            <Input 
              placeholder="e.g., Apartment 2B, Main Street 123"
              value={locationDetails}
              onChange={(e) => setLocationDetails(e.target.value)}
              className="text-sm"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium mb-1 block">Preferred Date</label>
            <Input 
              type="date"
              value={preferredDate}
              onChange={(e) => setPreferredDate(e.target.value)}
              className="text-sm"
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
          
          <div>
            <label className="text-sm font-medium mb-1 block">Special Requirements</label>
            <Textarea 
              placeholder="Any specific requirements or notes..."
              value={specialRequirements}
              onChange={(e) => setSpecialRequirements(e.target.value)}
              className="text-sm resize-none"
              rows={2}
            />
          </div>
        </div>

        {/* Coupon Code */}
        <div className="flex gap-2">
          <Input
            placeholder="Coupon code"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            className="text-sm"
          />
          <Button variant="outline" size="sm" onClick={applyCoupon}>
            Apply
          </Button>
        </div>

        {/* Price Breakdown */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span>{formatPrice(totalPrice)}</span>
          </div>
          
          {discount > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Discount</span>
              <span>-{formatPrice(discount)}</span>
            </div>
          )}
          
          <Separator />
          
          <div className="flex justify-between font-semibold">
            <span>Estimated Total</span>
            <span>{formatPrice(totalPrice - discount)}</span>
          </div>
          
          <p className="text-xs text-muted-foreground">
            * Final price may vary based on professional's quote
          </p>
        </div>

        {/* Request Booking Button */}
        <Button 
          onClick={handleRequestBooking} 
          className="w-full" 
          size="lg"
          disabled={selections.length === 0}
        >
          <Send className="w-4 h-4 mr-2" />
          Request Booking
        </Button>

        {/* Trust Signals */}
        <div className="space-y-3 pt-4 border-t">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="w-4 h-4" />
            <span>Professional background checks</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Star className="w-4 h-4" />
            <span>Satisfaction guarantee</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarDays className="w-4 h-4" />
            <span>Flexible scheduling</span>
          </div>
        </div>

        {/* Popular Packages Suggestion */}
        <div className="bg-blue-50 p-3 rounded-lg">
          <h6 className="font-medium text-sm mb-1 text-blue-900">💡 Popular Choice</h6>
          <p className="text-xs text-blue-700">
            Most clients bundle this with cleaning services for better value
          </p>
        </div>
      </CardContent>
    </Card>
  );
};