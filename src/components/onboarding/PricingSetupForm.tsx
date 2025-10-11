import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { AlertCircle, DollarSign, Clock, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PricingSetupFormProps {
  professionalId: string;
  onComplete: () => void;
}

const RESPONSE_TIME_OPTIONS = [
  { value: '12', label: '12 hours' },
  { value: '24', label: '24 hours' },
  { value: '48', label: '48 hours' },
  { value: '72', label: '72 hours' },
];

export function PricingSetupForm({ professionalId, onComplete }: PricingSetupFormProps) {
  const [hourlyRate, setHourlyRate] = useState('');
  const [responseGuarantee, setResponseGuarantee] = useState('24');
  const [instantBooking, setInstantBooking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!hourlyRate || parseFloat(hourlyRate) <= 0) {
      newErrors.hourlyRate = 'Please enter a valid hourly rate';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('professional_profiles')
        .update({
          hourly_rate: parseFloat(hourlyRate),
          response_guarantee_hours: parseInt(responseGuarantee),
          instant_booking_enabled: instantBooking,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', professionalId);

      if (error) throw error;

      toast.success('Pricing configured successfully');
      onComplete();
    } catch (error: any) {
      console.error('Error saving pricing:', error);
      toast.error('Failed to save pricing');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6 space-y-6">
          {/* Hourly Rate */}
          <div className="space-y-2">
            <Label htmlFor="hourlyRate" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Base Hourly Rate <span className="text-destructive">*</span>
            </Label>
            <p className="text-sm text-muted-foreground">
              Your standard rate for services (you can customize per service later)
            </p>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                €
              </span>
              <Input
                id="hourlyRate"
                type="number"
                min="0"
                step="0.01"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                placeholder="50.00"
                className={`pl-8 ${errors.hourlyRate ? 'border-destructive' : ''}`}
              />
            </div>
            {errors.hourlyRate && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.hourlyRate}
              </p>
            )}
          </div>

          {/* Response Time Guarantee */}
          <div className="space-y-2">
            <Label htmlFor="responseGuarantee" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Response Time Guarantee
            </Label>
            <p className="text-sm text-muted-foreground">
              How quickly will you respond to new booking requests?
            </p>
            <select
              id="responseGuarantee"
              value={responseGuarantee}
              onChange={(e) => setResponseGuarantee(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {RESPONSE_TIME_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Instant Booking */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="instantBooking" className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Enable Instant Booking
                </Label>
                <p className="text-sm text-muted-foreground">
                  Allow clients to book directly without your approval
                </p>
              </div>
              <Switch
                id="instantBooking"
                checked={instantBooking}
                onCheckedChange={setInstantBooking}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSubmit} disabled={isLoading} size="lg" className="w-full">
        {isLoading ? 'Saving...' : 'Continue to Professional Details'}
      </Button>
    </div>
  );
}
