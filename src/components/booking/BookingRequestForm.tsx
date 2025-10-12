import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Clock, MapPin, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface BookingRequestFormProps {
  professionalId: string;
  serviceId?: string;
  professionalName?: string;
}

export function BookingRequestForm({
  professionalId,
  serviceId,
  professionalName,
}: BookingRequestFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location_details: '',
    special_requirements: '',
    preferred_date_1: '',
    preferred_date_2: '',
    preferred_date_3: '',
  });

  const createBookingRequest = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Must be logged in to create booking request');

      const preferred_dates = [
        formData.preferred_date_1,
        formData.preferred_date_2,
        formData.preferred_date_3,
      ].filter(Boolean);

      const { data, error } = await supabase
        .from('booking_requests')
        .insert({
          client_id: user.id,
          professional_id: professionalId,
          service_id: serviceId,
          title: formData.title,
          description: formData.description,
          location_details: formData.location_details,
          special_requirements: formData.special_requirements,
          preferred_dates,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Booking Request Sent',
        description: `Your request has been sent to ${professionalName || 'the professional'}. They will respond soon.`,
      });
      navigate('/bookings');
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to send booking request. Please try again.',
        variant: 'destructive',
      });
      console.error('Booking request error:', error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createBookingRequest.mutate();
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            Please log in to request a booking.
          </p>
          <Button onClick={() => navigate('/login')} className="w-full mt-4">
            Log In
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Request a Booking</CardTitle>
        <CardDescription>
          {professionalName
            ? `Send a booking request to ${professionalName}`
            : 'Fill out the form to request a booking'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Service Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Home Cleaning, Plumbing Repair"
              value={formData.title}
              onChange={(e) => updateField('title', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Describe what you need done..."
              value={formData.description}
              onChange={(e) => updateField('description', e.target.value)}
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Location Details
            </Label>
            <Textarea
              id="location"
              placeholder="Address or location where service is needed"
              value={formData.location_details}
              onChange={(e) => updateField('location_details', e.target.value)}
              rows={2}
            />
          </div>

          <div className="space-y-4">
            <Label className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Preferred Dates
            </Label>
            <p className="text-sm text-muted-foreground">
              Provide up to 3 preferred dates. The professional will confirm availability.
            </p>

            <div className="grid gap-3">
              <div>
                <Label htmlFor="date1" className="text-sm">
                  First Choice *
                </Label>
                <Input
                  id="date1"
                  type="datetime-local"
                  value={formData.preferred_date_1}
                  onChange={(e) => updateField('preferred_date_1', e.target.value)}
                  required
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>

              <div>
                <Label htmlFor="date2" className="text-sm">
                  Second Choice
                </Label>
                <Input
                  id="date2"
                  type="datetime-local"
                  value={formData.preferred_date_2}
                  onChange={(e) => updateField('preferred_date_2', e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>

              <div>
                <Label htmlFor="date3" className="text-sm">
                  Third Choice
                </Label>
                <Input
                  id="date3"
                  type="datetime-local"
                  value={formData.preferred_date_3}
                  onChange={(e) => updateField('preferred_date_3', e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="requirements" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Special Requirements
            </Label>
            <Textarea
              id="requirements"
              placeholder="Any special requirements or notes (tools needed, access instructions, etc.)"
              value={formData.special_requirements}
              onChange={(e) => updateField('special_requirements', e.target.value)}
              rows={3}
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={createBookingRequest.isPending}
          >
            <Send className="mr-2 h-4 w-4" />
            {createBookingRequest.isPending ? 'Sending...' : 'Send Booking Request'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
