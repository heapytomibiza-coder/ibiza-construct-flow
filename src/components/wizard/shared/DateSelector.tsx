import React from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface DateSelectorProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  disabled?: (date: Date) => boolean;
  className?: string;
}

export const DateSelector = ({ 
  value, 
  onChange, 
  disabled = (date) => date < new Date(),
  className = ''
}: DateSelectorProps) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? format(value, 'PPP') : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={onChange}
          disabled={disabled}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
};

export const DateSelectorCard = ({ 
  value, 
  onChange, 
  disabled 
}: DateSelectorProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <CalendarIcon className="w-4 h-4" />
          Preferred Date
        </CardTitle>
      </CardHeader>
      <CardContent>
        <DateSelector 
          value={value} 
          onChange={onChange} 
          disabled={disabled}
        />
        {value && (
          <div className="mt-3 p-3 bg-gradient-card rounded-lg">
            <p className="text-sm font-medium text-charcoal">
              Selected: {format(value, 'EEEE, MMMM d, yyyy')}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
