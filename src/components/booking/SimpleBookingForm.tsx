import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useBookingCart } from '@/contexts/BookingCartContext';
import { format } from 'date-fns';
import { CalendarIcon, Trash2, Send } from 'lucide-react';
import { cn } from '@/lib/utils';

export const SimpleBookingForm = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { items, removeItem, clearCart } = useBookingCart();
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    notes: '',
  });
  const [preferredDate, setPreferredDate] = useState<Date>();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone || !formData.email || !formData.address) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setSubmitting(true);
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      // Create booking requests for each service
      for (const item of items) {
        const { error } = await supabase
          .from('booking_requests')
          .insert({
            client_id: user?.id || null,
            professional_id: item.professionalId,
            service_id: item.id,
            title: item.serviceName,
            description: formData.notes,
            location_details: formData.address,
            special_requirements: `Contact: ${formData.name}\nPhone: ${formData.phone}\nEmail: ${formData.email}`,
            preferred_dates: preferredDate ? [format(preferredDate, 'yyyy-MM-dd')] : [],
            status: 'pending',
            total_estimated_price: item.pricePerUnit,
          });

        if (error) throw error;
      }

      toast.success('Booking request sent successfully!');
      clearCart();
      navigate('/dashboard/client');
      
    } catch (error: any) {
      console.error('Error submitting booking:', error);
      toast.error('Failed to submit booking request');
    } finally {
      setSubmitting(false);
    }
  };

  const updateFormField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Selected Services */}
      <Card>
        <CardHeader>
          <CardTitle>Selected Services</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex-1">
                <p className="font-medium">{item.serviceName}</p>
                <p className="text-sm text-muted-foreground">by {item.professionalName}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold">
                  {item.pricingType === 'quote_required' ? 'Quote' : `$${item.pricePerUnit}`}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeItem(item.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle>Your Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => updateFormField('name', e.target.value)}
                placeholder="John Doe"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => updateFormField('phone', e.target.value)}
                placeholder="(555) 123-4567"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => updateFormField('email', e.target.value)}
              placeholder="john@example.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Service Area in Ibiza *</Label>
            <Select
              value={formData.address}
              onValueChange={(value) => updateFormField('address', value)}
              required
            >
              <SelectTrigger id="address" className="bg-background">
                <SelectValue placeholder="Select area in Ibiza" />
              </SelectTrigger>
              <SelectContent className="bg-popover z-50">
                <SelectItem value="Ibiza Town (Eivissa)">Ibiza Town (Eivissa)</SelectItem>
                <SelectItem value="San Antonio (Sant Antoni)">San Antonio (Sant Antoni)</SelectItem>
                <SelectItem value="Santa Eulalia (Santa Eulària)">Santa Eulalia (Santa Eulària)</SelectItem>
                <SelectItem value="Playa d'en Bossa">Playa d'en Bossa</SelectItem>
                <SelectItem value="San Jose (Sant Josep)">San Jose (Sant Josep)</SelectItem>
                <SelectItem value="San Juan (Sant Joan)">San Juan (Sant Joan)</SelectItem>
                <SelectItem value="San Miguel (Sant Miquel)">San Miguel (Sant Miquel)</SelectItem>
                <SelectItem value="Santa Gertrudis">Santa Gertrudis</SelectItem>
                <SelectItem value="Es Canar">Es Canar</SelectItem>
                <SelectItem value="Portinatx">Portinatx</SelectItem>
                <SelectItem value="Cala Llonga">Cala Llonga</SelectItem>
                <SelectItem value="Talamanca">Talamanca</SelectItem>
                <SelectItem value="Jesus (Jesús)">Jesus (Jesús)</SelectItem>
                <SelectItem value="San Rafael (Sant Rafel)">San Rafael (Sant Rafel)</SelectItem>
                <SelectItem value="Cala Vadella">Cala Vadella</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Scheduling & Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Preferred Date (Optional)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !preferredDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {preferredDate ? format(preferredDate, 'PPP') : 'Select a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={preferredDate}
                  onSelect={setPreferredDate}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Special Requests or Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => updateFormField('notes', e.target.value)}
              placeholder="Any additional information the professional should know..."
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate(-1)}
          className="flex-1"
        >
          Back
        </Button>
        <Button
          type="submit"
          disabled={submitting || items.length === 0}
          className="flex-1"
        >
          {submitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
              Sending...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Submit Request
            </>
          )}
        </Button>
      </div>
    </form>
  );
};
