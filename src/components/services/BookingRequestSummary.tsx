import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { LocationChips, PropertyTypeChips, UrgencyChips } from './QuickSelectionChips';
import { VisualPricingTiers } from './VisualPricingTiers';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { 
  ShoppingCart, 
  Plus, 
  Calendar, 
  MapPin, 
  CheckCircle,
  Shield,
  Clock,
  Star,
  Users,
  MessageSquare,
  Send,
  CalendarDays
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
  const { user } = useAuth();
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [selectedLocation, setSelectedLocation] = useState<string[]>([]);
  const [selectedPropertyType, setSelectedPropertyType] = useState<string[]>([]);
  const [selectedUrgency, setSelectedUrgency] = useState<string[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<string>('');
  const [locationDetails, setLocationDetails] = useState('');
  const [specialRequirements, setSpecialRequirements] = useState('');
  const [preferredDate, setPreferredDate] = useState('');

  const formatPrice = (price: number): string => {
    return price.toFixed(2);
  };

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
      preferredDate,
      location: selectedLocation[0],
      propertyType: selectedPropertyType[0],
      urgency: selectedUrgency[0],
      selectedPackage
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

  // Sample pricing tiers for visual comparison
  const pricingTiers = [
    {
      id: 'basic',
      name: 'Basic Service',
      price: Math.max(150, totalPrice - 50),
      duration: '2-3 hours',
      description: 'Essential service with quality guarantee',
      features: [
        'Professional service',
        'Basic tools included',
        '24h response time',
        'Quality guarantee'
      ]
    },
    {
      id: 'standard',
      name: 'Standard Package',
      price: totalPrice || 350,
      originalPrice: totalPrice ? totalPrice + 50 : 400,
      duration: 'Half day',
      description: 'Most popular comprehensive package',
      popular: true,
      savings: '€50',
      features: [
        'Everything in Basic',
        'Premium tools & materials',
        'Same day service',
        'Photo documentation',
        '30-day warranty',
        'Follow-up check'
      ]
    },
    {
      id: 'premium',
      name: 'Premium Experience',
      price: Math.max(650, totalPrice + 100),
      duration: 'Full day',
      description: 'Complete solution with premium service',
      features: [
        'Everything in Standard',
        'Priority scheduling',
        'Detailed service report',
        '90-day warranty',
        'Emergency support',
        'Satisfaction guarantee'
      ]
    }
  ];

  const selectedItems = selections.map(selection => {
    const item = serviceItems.find(item => item.id === selection.itemId);
    return { ...selection, item };
  }).filter(s => s.item);

  const selectedAddons = addonSelections.filter(addon => addon.selected).map(selection => {
    const addon = addons.find(addon => addon.id === selection.addonId);
    return { ...selection, addon };
  }).filter(s => s.addon);

  return (
    <div className="space-y-8">
      {/* Quick Selection Section */}
      <div className="space-y-6">
        <LocationChips 
          selectedOptions={selectedLocation}
          onSelectionChange={setSelectedLocation}
        />
        
        <PropertyTypeChips 
          selectedOptions={selectedPropertyType}
          onSelectionChange={setSelectedPropertyType}
        />
        
        <UrgencyChips 
          selectedOptions={selectedUrgency}
          onSelectionChange={setSelectedUrgency}
        />
      </div>

      {/* Visual Pricing Comparison */}
      {totalPrice > 0 && (
        <VisualPricingTiers 
          tiers={pricingTiers}
          selectedTier={selectedPackage}
          onTierSelect={setSelectedPackage}
        />
      )}

      {/* Service Summary Card */}
      <Card className="card-luxury">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-hero rounded-xl flex items-center justify-center">
            <ShoppingCart className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-display font-semibold text-charcoal">
            Service Summary
          </h3>
        </div>

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
                      {quantity} {getUnitLabel(item.unit_type)} × €{formatPrice(price)}
                    </div>
                  </div>
                  <span className="font-medium">€{formatPrice(price * quantity)}</span>
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
                  <span className="font-medium">+€{formatPrice(price)}</span>
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
              <span>€{formatPrice(totalPrice)}</span>
            </div>
            
            {discount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Discount</span>
                <span>-€{formatPrice(discount)}</span>
              </div>
            )}
            
            <Separator />
            
            <div className="flex justify-between font-semibold">
              <span>Estimated Total</span>
              <span>€{formatPrice(totalPrice - discount)}</span>
            </div>
            
            <p className="text-xs text-muted-foreground">
              * Final price may vary based on professional's quote
            </p>
          </div>

          {/* Request Booking Button */}
          <Button 
            onClick={handleRequestBooking} 
            className="w-full btn-hero" 
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
    </div>
  );
};