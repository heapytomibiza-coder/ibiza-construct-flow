import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, MapPin, DollarSign, MessageSquare, Send, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface BookingRequest {
  id: string;
  title: string;
  description: string;
  location_details: string;
  preferred_dates: any[];
  total_estimated_price: number;
  status: string;
  client_id: string;
  selected_items: any[];
}

interface BookingResponseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingRequest: BookingRequest;
  onResponseSent?: () => void;
}

export function BookingResponseModal({ 
  open, 
  onOpenChange, 
  bookingRequest,
  onResponseSent 
}: BookingResponseModalProps) {
  const [message, setMessage] = useState('');
  const [quote, setQuote] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSendResponse = async () => {
    if (!message.trim()) {
      toast({
        title: "Message Required",
        description: "Please provide a response message.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Update booking request with professional response
      const { error: updateError } = await supabase
        .from('booking_requests')
        .update({
          status: 'responded',
          professional_notes: message,
          professional_quote: quote ? parseFloat(quote) : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', bookingRequest.id);

      if (updateError) throw updateError;

      // Send message to client
      const { error: messageError } = await supabase
        .from('messages')
        .insert({
          sender_id: (await supabase.auth.getUser()).data.user?.id,
          recipient_id: bookingRequest.client_id,
          content: `Professional Response for "${bookingRequest.title}"\n\n${message}${quote ? `\n\nQuoted Price: €${quote}` : ''}`,
          message_type: 'booking_response'
        });

      if (messageError) throw messageError;

      toast({
        title: "Response Sent",
        description: "Your response has been sent to the client.",
      });

      onResponseSent?.();
      onOpenChange(false);
      setMessage('');
      setQuote('');
    } catch (error) {
      console.error('Error sending response:', error);
      toast({
        title: "Error",
        description: "Failed to send response. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  // Don't render if no booking request is selected
  if (!bookingRequest) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Respond to Booking Request
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Booking Request Details */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{bookingRequest.title}</h3>
                  <Badge variant="secondary" className="mt-1">
                    {bookingRequest.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                    <div>
                      <p className="font-medium">Location</p>
                      <p className="text-muted-foreground">{bookingRequest.location_details}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground mt-1" />
                    <div>
                      <p className="font-medium">Estimated Budget</p>
                      <p className="text-muted-foreground">€{bookingRequest.total_estimated_price}</p>
                    </div>
                  </div>

                  {bookingRequest.preferred_dates?.length > 0 && (
                    <div className="flex items-start gap-2 md:col-span-2">
                      <Calendar className="h-4 w-4 text-muted-foreground mt-1" />
                      <div>
                        <p className="font-medium">Preferred Dates</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {bookingRequest.preferred_dates.map((date, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {formatDate(date)}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <p className="font-medium">Description</p>
                  <p className="text-muted-foreground mt-1">{bookingRequest.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Response Form */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="message">Your Response *</Label>
              <Textarea
                id="message"
                placeholder="Provide details about your availability, approach, timeline, or any questions you have about the project..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="quote">Your Quote (€) - Optional</Label>
              <Input
                id="quote"
                type="number"
                placeholder="Enter your price quote"
                value={quote}
                onChange={(e) => setQuote(e.target.value)}
                min="0"
                step="0.01"
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Leave empty if you prefer to discuss pricing directly with the client
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button 
              onClick={handleSendResponse}
              disabled={loading || !message.trim()}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                  Sending...
                </div>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Response
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}