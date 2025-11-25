import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useRecurringBookings } from '@/hooks/bookings';
import { Calendar, Clock, Repeat } from 'lucide-react';

interface RecurringBookingSetupProps {
  bookingId: string;
}

export const RecurringBookingSetup = ({ bookingId }: RecurringBookingSetupProps) => {
  const { recurringBooking, createRecurring, cancelRecurring } = useRecurringBookings(bookingId);
  const [pattern, setPattern] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [interval, setInterval] = useState(1);
  const [maxOccurrences, setMaxOccurrences] = useState<number | undefined>(10);

  const handleCreate = () => {
    createRecurring({
      booking_id: bookingId,
      recurrence_pattern: pattern,
      recurrence_config: {
        interval,
        maxOccurrences,
      },
      next_occurrence_date: new Date().toISOString(),
    });
  };

  if (recurringBooking) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Repeat className="w-5 h-5" />
            Recurring Booking Active
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="capitalize">{recurringBooking.recurrence_pattern}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span>{recurringBooking.occurrences_created} occurrences created</span>
            </div>
          </div>
          <Button
            variant="destructive"
            onClick={() => cancelRecurring(recurringBooking.id)}
          >
            Cancel Recurring Booking
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Repeat className="w-5 h-5" />
          Set Up Recurring Booking
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Repeat Pattern</Label>
          <Select value={pattern} onValueChange={(v: any) => setPattern(v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Repeat Every</Label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min="1"
              value={interval}
              onChange={(e) => setInterval(parseInt(e.target.value))}
              className="w-20"
            />
            <span className="text-sm text-muted-foreground">
              {pattern === 'daily' && 'day(s)'}
              {pattern === 'weekly' && 'week(s)'}
              {pattern === 'monthly' && 'month(s)'}
            </span>
          </div>
        </div>

        <div>
          <Label>Maximum Occurrences</Label>
          <Input
            type="number"
            min="1"
            value={maxOccurrences || ''}
            onChange={(e) => setMaxOccurrences(parseInt(e.target.value) || undefined)}
            placeholder="Leave empty for unlimited"
          />
        </div>

        <Button onClick={handleCreate} className="w-full">
          Create Recurring Booking
        </Button>
      </CardContent>
    </Card>
  );
};
