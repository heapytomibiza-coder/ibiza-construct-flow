import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Clock, Save, Calendar } from 'lucide-react';

interface WorkingHours {
  [key: string]: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

const DAYS_OF_WEEK = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' },
];

const DEFAULT_HOURS = {
  enabled: false,
  start: '09:00',
  end: '17:00',
};

export function AvailabilityManager({ professionalId }: { professionalId: string }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: availability, isLoading } = useQuery({
    queryKey: ['professional-availability', professionalId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('professional_availability')
        .select('*')
        .eq('professional_id', professionalId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
  });

  const [workingHours, setWorkingHours] = useState<WorkingHours>(() => {
    const initial: WorkingHours = {};
    DAYS_OF_WEEK.forEach(day => {
      initial[day.key] = { ...DEFAULT_HOURS };
    });
    return initial;
  });

  const [bufferTime, setBufferTime] = useState(15);
  const [maxBookingsPerDay, setMaxBookingsPerDay] = useState(8);
  const [status, setStatus] = useState<'available' | 'busy' | 'away'>('available');

  // Update state when availability data loads
  useState(() => {
    if (availability?.working_hours) {
      setWorkingHours(availability.working_hours as WorkingHours);
    }
    if (availability?.buffer_time_minutes) {
      setBufferTime(availability.buffer_time_minutes);
    }
    if (availability?.max_bookings_per_day) {
      setMaxBookingsPerDay(availability.max_bookings_per_day);
    }
    if (availability?.status) {
      setStatus(availability.status as 'available' | 'busy' | 'away');
    }
  });

  const updateAvailability = useMutation({
    mutationFn: async () => {
      const payload = {
        professional_id: professionalId,
        working_hours: workingHours,
        buffer_time_minutes: bufferTime,
        max_bookings_per_day: maxBookingsPerDay,
        status,
      };

      const { error } = await supabase
        .from('professional_availability')
        .upsert(payload, { onConflict: 'professional_id' });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professional-availability', professionalId] });
      toast({
        title: 'Availability Updated',
        description: 'Your availability settings have been saved.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update availability. Please try again.',
        variant: 'destructive',
      });
      console.error('Availability update error:', error);
    },
  });

  const toggleDay = (day: string) => {
    setWorkingHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        enabled: !prev[day].enabled,
      },
    }));
  };

  const updateDayTime = (day: string, field: 'start' | 'end', value: string) => {
    setWorkingHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }));
  };

  if (isLoading) {
    return <div className="p-4">Loading availability settings...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Availability Status
          </CardTitle>
          <CardDescription>Set your overall availability status</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="status">Current Status</Label>
            <Select value={status} onValueChange={(value) => setStatus(value as 'available' | 'busy' | 'away')}>
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="busy">Busy</SelectItem>
                <SelectItem value="away">Away</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="buffer">Buffer Time (minutes)</Label>
              <Input
                id="buffer"
                type="number"
                value={bufferTime}
                onChange={(e) => setBufferTime(parseInt(e.target.value))}
                min={0}
                max={60}
              />
              <p className="text-sm text-muted-foreground mt-1">
                Time between bookings
              </p>
            </div>

            <div>
              <Label htmlFor="maxBookings">Max Bookings Per Day</Label>
              <Input
                id="maxBookings"
                type="number"
                value={maxBookingsPerDay}
                onChange={(e) => setMaxBookingsPerDay(parseInt(e.target.value))}
                min={1}
                max={20}
              />
              <p className="text-sm text-muted-foreground mt-1">
                Daily booking limit
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Working Hours
          </CardTitle>
          <CardDescription>Set your available hours for each day</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {DAYS_OF_WEEK.map((day) => (
              <div key={day.key} className="flex items-center gap-4 p-4 border rounded-lg">
                <div className="flex items-center gap-3 min-w-[140px]">
                  <Switch
                    checked={workingHours[day.key]?.enabled || false}
                    onCheckedChange={() => toggleDay(day.key)}
                  />
                  <Label className="font-medium">{day.label}</Label>
                </div>

                {workingHours[day.key]?.enabled && (
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`${day.key}-start`} className="sr-only">
                        Start time
                      </Label>
                      <Input
                        id={`${day.key}-start`}
                        type="time"
                        value={workingHours[day.key].start}
                        onChange={(e) => updateDayTime(day.key, 'start', e.target.value)}
                        className="w-32"
                      />
                    </div>
                    <span className="text-muted-foreground">to</span>
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`${day.key}-end`} className="sr-only">
                        End time
                      </Label>
                      <Input
                        id={`${day.key}-end`}
                        type="time"
                        value={workingHours[day.key].end}
                        onChange={(e) => updateDayTime(day.key, 'end', e.target.value)}
                        className="w-32"
                      />
                    </div>
                  </div>
                )}

                {!workingHours[day.key]?.enabled && (
                  <span className="text-muted-foreground italic">Unavailable</span>
                )}
              </div>
            ))}
          </div>

          <Button
            onClick={() => updateAvailability.mutate()}
            disabled={updateAvailability.isPending}
            className="w-full mt-6"
          >
            <Save className="mr-2 h-4 w-4" />
            {updateAvailability.isPending ? 'Saving...' : 'Save Availability'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
