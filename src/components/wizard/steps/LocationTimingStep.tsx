/**
 * Step 3: Location & Timing
 * Where, when, urgency
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar as CalendarIcon, Clock, Zap } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface LocationTimingStepProps {
  location: string;
  urgency: 'flexible' | 'within_week' | 'urgent' | 'asap';
  preferredDate?: string;
  onLocationChange: (location: string, coords?: { lat: number; lng: number }) => void;
  onUrgencyChange: (urgency: 'flexible' | 'within_week' | 'urgent' | 'asap') => void;
  onDateChange: (date?: string) => void;
  onNext: () => void;
  onBack: () => void;
}

const urgencyOptions = [
  {
    value: 'flexible' as const,
    label: 'Flexible',
    description: 'No rush, anytime works',
    icon: Clock,
    color: 'bg-primary/5 text-primary border-primary/10 hover:bg-primary/10'
  },
  {
    value: 'within_week' as const,
    label: 'Within a Week',
    description: 'Next 7 days preferred',
    icon: CalendarIcon,
    color: 'bg-accent/10 text-accent border-accent/20 hover:bg-accent/15'
  },
  {
    value: 'urgent' as const,
    label: 'Urgent',
    description: 'Within 2-3 days',
    icon: Zap,
    color: 'bg-accent/20 text-accent-foreground border-accent/30 hover:bg-accent/25'
  },
  {
    value: 'asap' as const,
    label: 'ASAP',
    description: 'Need it done today',
    icon: Zap,
    color: 'bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/15'
  }
];

const LocationTimingStep: React.FC<LocationTimingStepProps> = ({
  location,
  urgency,
  preferredDate,
  onLocationChange,
  onUrgencyChange,
  onDateChange,
  onNext,
  onBack
}) => {
  const { t } = useTranslation();
  const isComplete = location.trim() !== '';

  const selectedDate = preferredDate ? new Date(preferredDate) : undefined;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Where & When?</h1>
        <p className="text-muted-foreground text-lg">
          Help professionals plan their schedule
        </p>
      </div>

      <div className="space-y-6">
        {/* Location */}
        <Card className="p-6 bg-gradient-to-br from-card to-card/50">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
              <div>
                <Label htmlFor="location" className="text-lg font-semibold">
                  Location <span className="text-destructive">*</span>
                </Label>
                <p className="text-sm text-muted-foreground">
                  Where does the work need to be done?
                </p>
              </div>
            </div>
            <Input
              id="location"
              value={location}
              onChange={(e) => onLocationChange(e.target.value)}
              placeholder="e.g., 123 Main St, City Name, or just 'City Name'"
              className="text-lg h-12"
            />
          </div>
        </Card>

        {/* Urgency */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <div>
                <Label className="text-lg font-semibold">How urgent is this?</Label>
                <p className="text-sm text-muted-foreground">
                  Let professionals know your timeline
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {urgencyOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = urgency === option.value;
                
                return (
                  <Card
                    key={option.value}
                    className={cn(
                      "cursor-pointer transition-all duration-200 p-4",
                      "hover:shadow-lg hover:scale-105",
                      isSelected && "border-primary shadow-lg scale-105",
                      option.color
                    )}
                    onClick={() => onUrgencyChange(option.value)}
                  >
                    <div className="flex items-start gap-3">
                      <Icon className="w-6 h-6 flex-shrink-0 mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold">{option.label}</h4>
                          {isSelected && (
                            <Badge variant="default" className="animate-pulse">
                              Selected
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm opacity-80 mt-1">
                          {option.description}
                        </p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Preferred Date (Optional) */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <CalendarIcon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <Label className="text-lg font-semibold">
                  Preferred Date <span className="text-sm text-muted-foreground font-normal">(Optional)</span>
                </Label>
                <p className="text-sm text-muted-foreground">
                  Select a specific date if you have one in mind
                </p>
              </div>
            </div>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left h-12 text-base",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-3 h-5 w-5" />
                  {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => onDateChange(date?.toISOString())}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
                {selectedDate && (
                  <div className="p-3 border-t">
                    <Button
                      variant="ghost"
                      className="w-full"
                      onClick={() => onDateChange(undefined)}
                    >
                      Clear date
                    </Button>
                  </div>
                )}
              </PopoverContent>
            </Popover>
          </div>
        </Card>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center pt-6">
        <Button variant="outline" onClick={onBack} size="lg">
          ← Back
        </Button>
        <Button 
          onClick={onNext} 
          disabled={!isComplete}
          size="lg"
          className="min-w-[200px]"
        >
          {isComplete ? (
            <>Continue to Review →</>
          ) : (
            <>Enter location to continue</>
          )}
        </Button>
      </div>
    </div>
  );
};

export default LocationTimingStep;
