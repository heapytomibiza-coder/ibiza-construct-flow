import React from 'react';
import { Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface TimeSlot {
  value: string;
  label: string;
  emoji: string;
  timeRange: string;
}

// Standardized time slots across the entire app
export const TIME_SLOTS: TimeSlot[] = [
  { value: 'morning', label: 'Morning', emoji: '🌅', timeRange: '8AM - 12PM' },
  { value: 'afternoon', label: 'Afternoon', emoji: '☀️', timeRange: '12PM - 6PM' },
  { value: 'evening', label: 'Evening', emoji: '🌙', timeRange: '6PM - 10PM' },
];

interface TimeSlotSelectorProps {
  value: string;
  onChange: (value: string) => void;
  includeFlexible?: boolean;
  layout?: 'grid' | 'stack';
  className?: string;
}

export const TimeSlotSelector = ({ 
  value, 
  onChange, 
  includeFlexible = false,
  layout = 'grid',
  className = ''
}: TimeSlotSelectorProps) => {
  const slots = includeFlexible 
    ? [...TIME_SLOTS, { value: 'flexible', label: 'Any Time', emoji: '⏰', timeRange: 'Professional decides' }]
    : TIME_SLOTS;

  if (layout === 'stack') {
    return (
      <div className={cn("space-y-2", className)}>
        {slots.map((slot) => (
          <button
            key={slot.value}
            onClick={() => onChange(slot.value)}
            className={cn(
              "w-full p-3 rounded-lg border text-left transition-colors",
              value === slot.value
                ? "bg-gradient-hero text-white border-primary"
                : "bg-card hover:bg-muted border-border"
            )}
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-base mr-2">{slot.emoji}</span>
                <span className="font-medium">{slot.label}</span>
              </div>
              <span className="text-sm opacity-80">{slot.timeRange}</span>
            </div>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("grid gap-2", 
      slots.length === 3 ? "grid-cols-3" : "grid-cols-2 md:grid-cols-4",
      className
    )}>
      {slots.map((slot) => (
        <Button
          key={slot.value}
          variant={value === slot.value ? "default" : "outline"}
          onClick={() => onChange(slot.value)}
          className={cn(
            "h-auto p-3 flex flex-col items-center",
            value === slot.value && "bg-gradient-hero text-white"
          )}
        >
          <span className="text-base">{slot.emoji} {slot.label}</span>
          <span className="text-xs opacity-80 mt-1">{slot.timeRange}</span>
        </Button>
      ))}
    </div>
  );
};

export const TimeSlotSelectorCard = ({ 
  value, 
  onChange, 
  includeFlexible = false 
}: TimeSlotSelectorProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Preferred Time
        </CardTitle>
      </CardHeader>
      <CardContent>
        <TimeSlotSelector 
          value={value} 
          onChange={onChange} 
          includeFlexible={includeFlexible}
        />
      </CardContent>
    </Card>
  );
};
