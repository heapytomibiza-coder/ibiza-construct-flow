import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useProfessionalAvailability, WorkingHours } from '@/hooks/useProfessionalAvailability';
import { Clock, Save } from 'lucide-react';
import { toast } from 'sonner';

interface AvailabilitySettingsProps {
  professionalId: string;
}

const DAYS: Array<keyof WorkingHours> = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

export const AvailabilitySettings: React.FC<AvailabilitySettingsProps> = ({ professionalId }) => {
  const { availability, loading, updateAvailability } = useProfessionalAvailability(professionalId);
  const [workingHours, setWorkingHours] = useState<WorkingHours>({
    monday: { enabled: true, start: '09:00', end: '17:00' },
    tuesday: { enabled: true, start: '09:00', end: '17:00' },
    wednesday: { enabled: true, start: '09:00', end: '17:00' },
    thursday: { enabled: true, start: '09:00', end: '17:00' },
    friday: { enabled: true, start: '09:00', end: '17:00' },
    saturday: { enabled: false, start: '09:00', end: '17:00' },
    sunday: { enabled: false, start: '09:00', end: '17:00' },
  });
  const [bufferTime, setBufferTime] = useState(15);
  const [maxBookings, setMaxBookings] = useState(4);

  useEffect(() => {
    if (availability) {
      setWorkingHours(availability.working_hours);
      setBufferTime(availability.buffer_time_minutes);
      setMaxBookings(availability.max_bookings_per_day);
    }
  }, [availability]);

  const handleDayToggle = (day: keyof WorkingHours) => {
    setWorkingHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        enabled: !prev[day].enabled,
      },
    }));
  };

  const handleTimeChange = (day: keyof WorkingHours, field: 'start' | 'end', value: string) => {
    setWorkingHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }));
  };

  const handleSave = async () => {
    try {
      await updateAvailability({
        working_hours: workingHours,
        buffer_time_minutes: bufferTime,
        max_bookings_per_day: maxBookings,
      });
      toast.success('Availability settings saved');
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Availability Settings
        </CardTitle>
        <CardDescription>
          Configure your working hours and booking preferences
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Working Hours */}
        <div className="space-y-4">
          <h3 className="font-semibold">Working Hours</h3>
          {DAYS.map(day => (
            <div key={day} className="flex items-center gap-4 py-2">
              <div className="w-32">
                <div className="flex items-center space-x-2">
                  <Switch
                    id={`${day}-enabled`}
                    checked={workingHours[day].enabled}
                    onCheckedChange={() => handleDayToggle(day)}
                  />
                  <Label htmlFor={`${day}-enabled`} className="capitalize cursor-pointer">
                    {day}
                  </Label>
                </div>
              </div>

              {workingHours[day].enabled && (
                <div className="flex items-center gap-2 flex-1">
                  <Input
                    type="time"
                    value={workingHours[day].start}
                    onChange={(e) => handleTimeChange(day, 'start', e.target.value)}
                    className="w-32"
                  />
                  <span className="text-muted-foreground">to</span>
                  <Input
                    type="time"
                    value={workingHours[day].end}
                    onChange={(e) => handleTimeChange(day, 'end', e.target.value)}
                    className="w-32"
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Buffer Time */}
        <div className="space-y-2">
          <Label htmlFor="bufferTime">Buffer Time Between Bookings (minutes)</Label>
          <Input
            id="bufferTime"
            type="number"
            min="0"
            max="60"
            value={bufferTime}
            onChange={(e) => setBufferTime(parseInt(e.target.value) || 0)}
            className="w-32"
          />
          <p className="text-sm text-muted-foreground">
            Time needed between appointments for travel, breaks, etc.
          </p>
        </div>

        {/* Max Bookings */}
        <div className="space-y-2">
          <Label htmlFor="maxBookings">Maximum Bookings Per Day</Label>
          <Input
            id="maxBookings"
            type="number"
            min="1"
            max="20"
            value={maxBookings}
            onChange={(e) => setMaxBookings(parseInt(e.target.value) || 1)}
            className="w-32"
          />
          <p className="text-sm text-muted-foreground">
            Limit the number of bookings you accept in a single day
          </p>
        </div>

        <Button onClick={handleSave} className="w-full bg-gradient-hero hover:bg-copper">
          <Save className="w-4 h-4 mr-2" />
          Save Settings
        </Button>
      </CardContent>
    </Card>
  );
};
