import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowRight, ArrowLeft, Clock } from 'lucide-react';
import { DateTimeSelection } from '@/hooks/useBookingWizard';

interface BookingStep3DateTimeProps {
  wizard: any;
}

const TIME_SLOTS = [
  '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM',
  '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM',
  '04:00 PM', '05:00 PM', '06:00 PM'
];

export const BookingStep3DateTime = ({ wizard }: BookingStep3DateTimeProps) => {
  const [formData, setFormData] = useState<DateTimeSelection>(
    wizard.dateTime || {
      preferredDate: null,
      preferredTime: '',
      alternativeDate: undefined,
      alternativeTime: '',
      isFlexible: false,
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    wizard.setDateTime(formData);
    wizard.nextStep();
  };

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Select Date & Time</h2>
        <p className="text-muted-foreground">
          Choose your preferred date and time. You can also provide an alternative option.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Preferred Date & Time */}
        <div className="space-y-4">
          <Label className="text-base font-semibold">Preferred Date & Time *</Label>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Select Date</Label>
              <Calendar
                mode="single"
                selected={formData.preferredDate || undefined}
                onSelect={(date) => setFormData({ ...formData, preferredDate: date || null })}
                disabled={(date) => date < new Date()}
                className="rounded-md border"
              />
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="preferredTime">Select Time</Label>
                <Select 
                  value={formData.preferredTime}
                  onValueChange={(value) => setFormData({ ...formData, preferredTime: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose time slot" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_SLOTS.map((time) => (
                      <SelectItem key={time} value={time}>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {time}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-secondary/50 rounded-lg p-4">
                <p className="text-sm font-medium mb-2">Time Zone</p>
                <p className="text-sm text-muted-foreground">
                  Local Time (Detected automatically)
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Flexible Scheduling */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="flexible"
            checked={formData.isFlexible}
            onCheckedChange={(checked) => 
              setFormData({ ...formData, isFlexible: checked as boolean })
            }
          />
          <Label 
            htmlFor="flexible"
            className="text-sm font-normal cursor-pointer"
          >
            I'm flexible with the date and time
          </Label>
        </div>

        {/* Alternative Date & Time */}
        {formData.isFlexible && (
          <div className="space-y-4 pt-4 border-t">
            <Label className="text-base font-semibold">Alternative Date & Time (Optional)</Label>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Alternative Date</Label>
                <Calendar
                  mode="single"
                  selected={formData.alternativeDate}
                  onSelect={(date) => setFormData({ ...formData, alternativeDate: date })}
                  disabled={(date) => date < new Date() || date === formData.preferredDate}
                  className="rounded-md border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="alternativeTime">Alternative Time</Label>
                <Select 
                  value={formData.alternativeTime}
                  onValueChange={(value) => setFormData({ ...formData, alternativeTime: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose time slot" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_SLOTS.map((time) => (
                      <SelectItem key={time} value={time}>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {time}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between pt-6 border-t">
          <Button 
            type="button"
            variant="outline"
            onClick={wizard.prevStep}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <Button 
            type="submit"
            size="lg"
            className="gap-2"
            disabled={!wizard.canProceed()}
          >
            Review & Confirm
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </Card>
  );
};
