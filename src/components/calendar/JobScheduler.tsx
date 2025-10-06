import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin } from 'lucide-react';
import { format } from 'date-fns';

export interface TimeSlot { 
  iso: string; 
  label: string; 
  available: boolean;
}

interface JobSchedulerProps {
  slots: TimeSlot[];
  durationMinutes: number;
  onDurationChange: (min: number) => void;
  onSelectSlot: (iso: string) => void;
  onSchedule: () => Promise<void>;
  timezoneLabel: string;
  loading?: boolean;
  selectedDate?: Date;
  onDateChange?: (date: Date) => void;
  jobTitle?: string;
  location?: string;
}

export default function JobScheduler({ 
  slots, 
  durationMinutes, 
  onDurationChange, 
  onSelectSlot, 
  onSchedule, 
  timezoneLabel,
  loading = false,
  selectedDate,
  onDateChange,
  jobTitle,
  location
}: JobSchedulerProps) {
  const [selected, setSelected] = useState<string>('');
  const [date, setDate] = useState<Date | undefined>(selectedDate || new Date());

  const handleDateChange = (newDate: Date | undefined) => {
    if (newDate) {
      setDate(newDate);
      onDateChange?.(newDate);
      setSelected(''); // Reset selection when date changes
    }
  };

  const handleSlotSelect = (iso: string) => {
    setSelected(iso);
    onSelectSlot(iso);
  };

  const availableSlots = slots.filter(s => s.available);
  const hasSlots = availableSlots.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Schedule Job</span>
          <Badge variant="outline">{timezoneLabel}</Badge>
        </CardTitle>
        {jobTitle && (
          <div className="space-y-1 pt-2">
            <p className="text-sm font-medium">{jobTitle}</p>
            {location && (
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {location}
              </p>
            )}
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Duration selector */}
        <div className="flex items-center gap-3">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Duration</span>
          <Select value={String(durationMinutes)} onValueChange={(v) => onDurationChange(Number(v))}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Duration" />
            </SelectTrigger>
            <SelectContent>
              {[30, 60, 90, 120, 180, 240, 480].map(m => (
                <SelectItem key={m} value={String(m)}>
                  {m >= 60 ? `${m / 60} hour${m > 60 ? 's' : ''}` : `${m} min`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Date picker */}
        <div className="space-y-2">
          <span className="text-sm font-medium">Select Date</span>
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateChange}
            disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
            className="rounded-md border"
          />
        </div>

        {/* Time slots */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Available Times</span>
            {date && (
              <span className="text-xs text-muted-foreground">
                {format(date, 'EEEE, MMMM d')}
              </span>
            )}
          </div>
          
          {!hasSlots && (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">No available time slots for this date.</p>
              <p className="text-xs mt-1">Please select a different date.</p>
            </div>
          )}

          {hasSlots && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 max-h-64 overflow-y-auto">
              {availableSlots.map(s => (
                <Button 
                  key={s.iso} 
                  variant={selected === s.iso ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => handleSlotSelect(s.iso)}
                  className="justify-center"
                >
                  {s.label}
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Confirm button */}
        <Button 
          disabled={!selected || loading} 
          onClick={onSchedule}
          className="w-full"
          size="lg"
        >
          {loading ? 'Scheduling...' : 'Confirm Schedule'}
        </Button>
      </CardContent>
    </Card>
  );
}
