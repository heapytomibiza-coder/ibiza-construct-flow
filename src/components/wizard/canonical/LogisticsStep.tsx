/**
 * Step 5: Logistics Block (standardized)
 * Location, timing, access, budget
 */
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ArrowLeft, CalendarIcon, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface LogisticsStepProps {
  microName: string;
  logistics: {
    location: string;
    preferredDate?: Date;
    timeWindow?: string;
    contactName?: string;
    contactPhone?: string;
    accessDetails?: string;
    budgetRange?: string;
  };
  onLogisticsChange: (logistics: any) => void;
  onNext: () => void;
  onBack: () => void;
}

const TIME_WINDOWS = ['Morning (8-12)', 'Afternoon (12-17)', 'Evening (17-20)', 'Flexible'];
const BUDGET_RANGES = ['€0-500', '€500-1,000', '€1,000-2,500', '€2,500-5,000', '€5,000+', 'Unsure'];
const DATE_PRESETS = ['ASAP', 'This Week', 'Within 2 Weeks', 'Within a Month'];

export const LogisticsStep: React.FC<LogisticsStepProps> = ({
  microName,
  logistics,
  onLogisticsChange,
  onNext,
  onBack
}) => {
  const [datePreset, setDatePreset] = useState('');

  const handleUpdate = (field: string, value: any) => {
    onLogisticsChange({ ...logistics, [field]: value });
  };

  const handleDatePreset = (preset: string) => {
    setDatePreset(preset);
    handleUpdate('datePreset', preset);
    handleUpdate('preferredDate', undefined);
  };

  const isComplete = logistics.location && (logistics.preferredDate || datePreset) && logistics.budgetRange;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="space-y-4">
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div>
          <Badge variant="outline" className="mb-4">{microName}</Badge>
          <h1 className="text-3xl md:text-4xl font-bold text-charcoal">
            Location & Timing
          </h1>
          <p className="text-lg text-muted-foreground mt-2">
            Where and when do you need this done?
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Location */}
        <Card className="p-6">
          <Label className="text-base font-medium text-charcoal flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Location
          </Label>
          <Input
            value={logistics.location || ''}
            onChange={(e) => handleUpdate('location', e.target.value)}
            placeholder="Enter address or area..."
            className="mt-3"
          />
        </Card>

        {/* Preferred Date */}
        <Card className="p-6 space-y-4">
          <Label className="text-base font-medium text-charcoal flex items-center gap-2">
            <CalendarIcon className="w-4 h-4" />
            When would you like this done?
          </Label>
          
          {/* Quick presets */}
          <div className="flex flex-wrap gap-2">
            {DATE_PRESETS.map((preset) => (
              <Badge
                key={preset}
                variant={datePreset === preset ? "default" : "outline"}
                className={cn(
                  "cursor-pointer px-4 py-2 transition-all hover:scale-105",
                  datePreset === preset ? "bg-copper text-white" : "hover:border-copper"
                )}
                onClick={() => handleDatePreset(preset)}
              >
                {preset}
              </Badge>
            ))}
          </div>

          {/* Or specific date */}
          <div className="pt-2">
            <Label className="text-sm text-muted-foreground mb-2 block">Or choose a specific date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {logistics.preferredDate ? format(logistics.preferredDate, 'PPP') : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={logistics.preferredDate}
                  onSelect={(date) => {
                    handleUpdate('preferredDate', date);
                    setDatePreset('');
                  }}
                  disabled={(date) => date < new Date()}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Time window */}
          <div>
            <Label className="text-sm text-muted-foreground mb-2 block">Preferred time window</Label>
            <div className="flex flex-wrap gap-2">
              {TIME_WINDOWS.map((window) => (
                <Badge
                  key={window}
                  variant={logistics.timeWindow === window ? "default" : "outline"}
                  className={cn(
                    "cursor-pointer px-4 py-2 transition-all",
                    logistics.timeWindow === window ? "bg-copper text-white" : "hover:border-copper"
                  )}
                  onClick={() => handleUpdate('timeWindow', window)}
                >
                  {window}
                </Badge>
              ))}
            </div>
          </div>
        </Card>

        {/* Contact & Access */}
        <Card className="p-6 space-y-4">
          <Label className="text-base font-medium text-charcoal">On-site Contact & Access</Label>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm">Contact Name</Label>
              <Input
                value={logistics.contactName || ''}
                onChange={(e) => handleUpdate('contactName', e.target.value)}
                placeholder="Your name..."
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm">Phone Number</Label>
              <Input
                value={logistics.contactPhone || ''}
                onChange={(e) => handleUpdate('contactPhone', e.target.value)}
                placeholder="+34..."
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label className="text-sm">Access Details</Label>
            <Textarea
              value={logistics.accessDetails || ''}
              onChange={(e) => handleUpdate('accessDetails', e.target.value)}
              placeholder="Parking, floor, lift access, gate codes, etc..."
              className="mt-1"
              rows={3}
            />
          </div>
        </Card>

        {/* Budget Range */}
        <Card className="p-6 space-y-3">
          <Label className="text-base font-medium text-charcoal">Budget Range</Label>
          <p className="text-sm text-muted-foreground">Select a budget range or choose "Unsure" to get quotes first</p>
          <div className="flex flex-wrap gap-2">
            {BUDGET_RANGES.map((range) => (
              <Badge
                key={range}
                variant={logistics.budgetRange === range ? "default" : "outline"}
                className={cn(
                  "cursor-pointer px-4 py-2 transition-all hover:scale-105",
                  logistics.budgetRange === range ? "bg-copper text-white" : "hover:border-copper"
                )}
                onClick={() => handleUpdate('budgetRange', range)}
              >
                {range}
              </Badge>
            ))}
          </div>
        </Card>
      </div>

      <div className="flex justify-end pt-6">
        <Button
          size="lg"
          onClick={onNext}
          disabled={!isComplete}
          className="bg-gradient-hero text-white px-8"
        >
          Continue
        </Button>
      </div>
    </div>
  );
};
