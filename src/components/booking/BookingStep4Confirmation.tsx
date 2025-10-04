import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, CheckCircle2, Calendar, MapPin, User, Mail, Phone, CreditCard, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface BookingStep4ConfirmationProps {
  wizard: any;
  professionalId: string;
}

export const BookingStep4Confirmation = ({ wizard, professionalId }: BookingStep4ConfirmationProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Create booking request
      const { data: booking, error: bookingError } = await supabase
        .from('booking_requests')
        .insert({
          client_id: user.id,
          professional_id: professionalId,
          service_id: wizard.selectedItems[0]?.id || professionalId,
          title: `Booking: ${wizard.selectedItems.map((i: any) => i.serviceName).join(', ')}`,
          description: wizard.bookingInfo?.specialRequirements || '',
          location_details: wizard.bookingInfo?.address,
          selected_items: wizard.selectedItems,
          preferred_dates: [{
            date: wizard.dateTime?.preferredDate,
            time: wizard.dateTime?.preferredTime,
            alternative_date: wizard.dateTime?.alternativeDate,
            alternative_time: wizard.dateTime?.alternativeTime,
          }],
          total_estimated_price: wizard.hasQuoteItems ? null : wizard.calculateTotal(),
          status: 'pending',
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      // Handle payment flow
      if (!wizard.hasQuoteItems && wizard.calculateTotal() > 0) {
        // Redirect to payment
        const { data: paymentData, error: paymentError } = await supabase.functions.invoke('create-booking-payment', {
          body: {
            bookingId: booking.id,
            amount: wizard.calculateTotal(),
            items: wizard.selectedItems,
          }
        });

        if (paymentError) throw paymentError;

        if (paymentData?.url) {
          window.open(paymentData.url, '_blank');
          toast.success('Redirecting to payment...');
          setTimeout(() => navigate('/'), 2000);
        }
      } else {
        // Quote request submitted
        toast.success('Quote request submitted successfully!');
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Booking error:', error);
      toast.error('Failed to submit booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatPrice = (price: number) => `€${price.toFixed(0)}`;

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Review Your Booking</h2>
        <p className="text-muted-foreground">
          Please review all details before confirming your booking.
        </p>
      </div>

      <div className="space-y-6">
        {/* Services Summary */}
        <div>
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Selected Services
          </h3>
          <div className="space-y-2">
            {wizard.selectedItems.map((item: any) => (
              <div key={item.id} className="flex justify-between items-start p-3 bg-secondary/50 rounded-lg">
                <div>
                  <p className="font-medium">{item.serviceName}</p>
                  <p className="text-sm text-muted-foreground">
                    Quantity: {item.quantity}
                    {item.pricingType !== 'quote_required' && ` × ${formatPrice(item.pricePerUnit)}`}
                  </p>
                </div>
                {item.pricingType === 'quote_required' ? (
                  <Badge variant="secondary">Quote Required</Badge>
                ) : (
                  <span className="font-semibold">{formatPrice(item.pricePerUnit * item.quantity)}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Contact Information */}
        <div>
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Contact Information
          </h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <User className="w-4 h-4 text-muted-foreground" />
              <span>{wizard.bookingInfo?.fullName}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <span>{wizard.bookingInfo?.email}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <span>{wizard.bookingInfo?.phone}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span>{wizard.bookingInfo?.address}</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Date & Time */}
        <div>
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Schedule
          </h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge>Preferred</Badge>
              <span className="text-sm">
                {wizard.dateTime?.preferredDate && format(wizard.dateTime.preferredDate, 'MMMM d, yyyy')}
                {' at '}
                {wizard.dateTime?.preferredTime}
              </span>
            </div>
            {wizard.dateTime?.alternativeDate && (
              <div className="flex items-center gap-2">
                <Badge variant="outline">Alternative</Badge>
                <span className="text-sm">
                  {format(wizard.dateTime.alternativeDate, 'MMMM d, yyyy')}
                  {' at '}
                  {wizard.dateTime.alternativeTime}
                </span>
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Payment Summary */}
        {!wizard.hasQuoteItems && (
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" />
              Payment Summary
            </h3>
            <div className="space-y-2 bg-secondary/50 rounded-lg p-4">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>{formatPrice(wizard.calculateSubtotal())}</span>
              </div>
              {wizard.discount > 0 && (
                <div className="flex justify-between text-sm text-primary">
                  <span>Discount ({wizard.couponCode})</span>
                  <span>-{formatPrice(wizard.discount)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total Due</span>
                <span className="text-primary">{formatPrice(wizard.calculateTotal())}</span>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-between pt-6 border-t">
          <Button 
            variant="outline"
            onClick={wizard.prevStep}
            disabled={isSubmitting}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            size="lg"
            className="gap-2"
          >
            {isSubmitting ? (
              'Processing...'
            ) : wizard.hasQuoteItems ? (
              <>
                <FileText className="w-4 h-4" />
                Request Quotes
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Proceed to Payment
              </>
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
};
