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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, CalendarIcon, MapPin, PlayCircle, CheckCircle, Phone, Video, Home } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface LogisticsStepProps {
  microName: string;
  logistics: {
    location: string;
    customLocation?: string;
    startDate?: Date;
    startDatePreset?: string;
    completionDate?: Date;
    consultationType?: 'site_visit' | 'phone_call' | 'video_call';
    consultationDate?: Date;
    consultationTime?: string;
    accessDetails?: string[];
    budgetRange?: string;
  };
  onLogisticsChange: (logistics: any) => void;
  onNext: () => void;
  onBack: () => void;
}

const START_DATE_PRESETS = ['Start ASAP', 'This Week', 'Next Week', 'Within 2 Weeks', 'Within a Month', 'Flexible'];
const CONSULTATION_TIMES = ['Morning (8-12)', 'Afternoon (12-17)', 'Evening (17-20)', 'Flexible'];
const BUDGET_RANGES = ['€0-500', '€500-1,000', '€1,000-2,500', '€2,500-5,000', '€5,000+', 'Unsure'];
const ACCESS_OPTIONS = [
  'Street level parking',
  'Underground parking',
  'No parking nearby',
  'Elevator available',
  'Stairs only',
  'Gated community',
  'Code/keys needed',
  'Building reception',
  'Easy access',
  'Limited access'
];
const IBIZA_LOCATIONS = [
  'Ibiza Town (Eivissa)',
  'San Antonio (Sant Antoni)',
  'Santa Eulalia (Santa Eulària)',
  'Playa d\'en Bossa',
  'Talamanca',
  'Figueretas',
  'San José (Sant Josep)',
  'San Juan (Sant Joan)',
  'San Miguel (Sant Miquel)',
  'San Rafael (Sant Rafel)',
  'San Lorenzo (Sant Llorenç)',
  'Santa Gertrudis',
  'Jesus (Jesús)',
  'Portinatx',
  'Cala Llonga',
  'Es Canar',
  'Cala de Sant Vicent',
  'San Carlos (Sant Carles)',
  'San Agustin (Sant Agustí)',
  'Other'
];

export const LogisticsStep: React.FC<LogisticsStepProps> = ({
  microName,
  logistics,
  onLogisticsChange,
  onNext,
  onBack
}) => {
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [completionDateOpen, setCompletionDateOpen] = useState(false);
  const [consultationDateOpen, setConsultationDateOpen] = useState(false);

  const handleUpdate = (field: string, value: any) => {
    console.log('LogisticsStep - handleUpdate:', field, value);
    onLogisticsChange({ ...logistics, [field]: value });
  };

  const handleStartDatePreset = (preset: string) => {
    console.log('LogisticsStep - Start date preset clicked:', preset);
    // Combine both updates into a single state change to prevent freezing
    onLogisticsChange({ 
      ...logistics, 
      startDatePreset: preset,
      startDate: undefined 
    });
  };

  const isComplete = logistics.location && 
                     (logistics.startDate || logistics.startDatePreset) && 
                     logistics.consultationType &&
                     logistics.budgetRange;

  return (
    <div className="max-w-3xl mx-auto space-y-8 pointer-events-auto">
      <div className="space-y-4">
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div>
          <Badge variant="outline" className="mb-4">{microName}</Badge>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            Location & Timeline
          </h1>
          <p className="text-lg text-muted-foreground mt-2">
            Let's plan the details of your project
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Location */}
        <Card className="p-6 space-y-3">
          <Label className="text-base font-medium text-foreground flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Location in Ibiza
          </Label>
          <Select value={logistics.location || ''} onValueChange={(value) => handleUpdate('location', value)}>
            <SelectTrigger className="w-full bg-background">
              <SelectValue placeholder="Select your location in Ibiza..." />
            </SelectTrigger>
            <SelectContent className="bg-background border shadow-lg max-h-[300px] z-50">
              {IBIZA_LOCATIONS.map((location) => (
                <SelectItem key={location} value={location} className="cursor-pointer hover:bg-accent">
                  {location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {logistics.location === 'Other' && (
            <Input
              value={logistics.customLocation || ''}
              onChange={(e) => handleUpdate('customLocation', e.target.value)}
              placeholder="Enter specific address..."
              className="mt-2"
            />
          )}
        </Card>

        {/* 1. Job Start Date */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <PlayCircle className="w-5 h-5 text-primary" />
            <Label className="text-base font-medium text-foreground">
              When do you want this work to begin?
            </Label>
          </div>
          
          {/* Quick presets */}
          <div className="flex flex-wrap gap-2">
            {START_DATE_PRESETS.map((preset) => {
              const isSelected = logistics.startDatePreset === preset;
              return (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleStartDatePreset(preset)}
                  className={cn(
                    "inline-flex items-center rounded-full border-2 px-4 py-2 text-xs font-semibold transition-all hover:scale-105 cursor-pointer",
                    isSelected 
                      ? "bg-primary text-white border-primary ring-2 ring-primary/30" 
                      : "bg-background border-border hover:border-primary hover:bg-primary/5"
                  )}
                >
                  {preset}
                </button>
              );
            })}
          </div>

          {/* Or specific date */}
          <div className="pt-2">
            <Label className="text-sm text-muted-foreground mb-2 block">Or choose a specific start date</Label>
            <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
              <PopoverTrigger asChild>
                <Button 
                  type="button"
                  variant="outline" 
                  className="w-full justify-start text-left"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {logistics.startDate ? format(logistics.startDate, 'PPP') : 'Pick a start date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 z-50" align="start">
                <Calendar
                  mode="single"
                  selected={logistics.startDate}
                  onSelect={(date) => {
                    // Combine both updates into single state change
                    onLogisticsChange({
                      ...logistics,
                      startDate: date,
                      startDatePreset: ''
                    });
                    setStartDateOpen(false);
                  }}
                  disabled={(date) => date < new Date()}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
        </Card>

        {/* 2. Ideal Completion Date (Optional) */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-primary" />
            <Label className="text-base font-medium text-foreground">
              When would you like this completed?
            </Label>
            <Badge variant="secondary" className="ml-2">Optional</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            This helps professionals understand your timeline expectations
          </p>

          <Popover open={completionDateOpen} onOpenChange={setCompletionDateOpen}>
            <PopoverTrigger asChild>
              <Button 
                type="button"
                variant="outline" 
                className="w-full justify-start text-left"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {logistics.completionDate ? format(logistics.completionDate, 'PPP') : 'Pick ideal completion date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 z-50" align="start">
              <Calendar
                mode="single"
                selected={logistics.completionDate}
                onSelect={(date) => {
                  handleUpdate('completionDate', date);
                  setCompletionDateOpen(false);
                }}
                disabled={(date) => {
                  const minDate = logistics.startDate || new Date();
                  return date < minDate;
                }}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </Card>

        {/* 3. Consultation Booking */}
        <Card className="p-6 space-y-4">
          <Label className="text-base font-medium text-foreground">
            Book a consultation
          </Label>
          <p className="text-sm text-muted-foreground">
            Schedule a site visit or call to discuss your project
          </p>

          {/* Consultation Type */}
          <div className="grid grid-cols-3 gap-3">
            <Card
              className={cn(
                "p-4 cursor-pointer transition-all hover:shadow-md text-center",
                logistics.consultationType === 'site_visit' && "ring-2 ring-primary bg-primary/5"
              )}
              onClick={() => handleUpdate('consultationType', 'site_visit')}
            >
              <Home className="w-6 h-6 mx-auto mb-2 text-primary" />
              <p className="text-sm font-medium">Site Visit</p>
            </Card>
            <Card
              className={cn(
                "p-4 cursor-pointer transition-all hover:shadow-md text-center",
                logistics.consultationType === 'phone_call' && "ring-2 ring-primary bg-primary/5"
              )}
              onClick={() => handleUpdate('consultationType', 'phone_call')}
            >
              <Phone className="w-6 h-6 mx-auto mb-2 text-primary" />
              <p className="text-sm font-medium">Phone Call</p>
            </Card>
            <Card
              className={cn(
                "p-4 cursor-pointer transition-all hover:shadow-md text-center",
                logistics.consultationType === 'video_call' && "ring-2 ring-primary bg-primary/5"
              )}
              onClick={() => handleUpdate('consultationType', 'video_call')}
            >
              <Video className="w-6 h-6 mx-auto mb-2 text-primary" />
              <p className="text-sm font-medium">Video Call</p>
            </Card>
          </div>

          {/* Consultation Date & Time */}
          {logistics.consultationType && (
            <div className="space-y-3 pt-2 animate-fade-in">
              <Popover open={consultationDateOpen} onOpenChange={setConsultationDateOpen}>
                <PopoverTrigger asChild>
                  <Button 
                    type="button"
                    variant="outline" 
                    className="w-full justify-start text-left"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {logistics.consultationDate ? format(logistics.consultationDate, 'PPP') : 'Pick consultation date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 z-50" align="start">
                  <Calendar
                    mode="single"
                    selected={logistics.consultationDate}
                    onSelect={(date) => {
                      handleUpdate('consultationDate', date);
                      setConsultationDateOpen(false);
                    }}
                    disabled={(date) => date < new Date()}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>

              <div>
                <Label className="text-sm text-muted-foreground mb-2 block">Preferred time</Label>
                <div className="flex flex-wrap gap-2">
                  {CONSULTATION_TIMES.map((time) => {
                    const isSelected = logistics.consultationTime === time;
                    return (
                      <button
                        key={time}
                        type="button"
                        onClick={() => handleUpdate('consultationTime', time)}
                        className={cn(
                          "inline-flex items-center rounded-full border-2 px-4 py-2 text-xs font-semibold transition-all hover:scale-105 cursor-pointer",
                          isSelected 
                            ? "bg-primary text-white border-primary ring-2 ring-primary/30" 
                            : "bg-background border-border hover:border-primary hover:bg-primary/5"
                        )}
                      >
                        {time}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Contact & Access */}
        <Card className="p-6 space-y-4">
          <Label className="text-base font-medium text-foreground">Site Access</Label>
          
          <div>
            <Label className="text-sm text-muted-foreground mb-2 block">Access & Parking</Label>
            <div className="flex flex-wrap gap-2">
              {ACCESS_OPTIONS.map((option) => {
                const isSelected = logistics.accessDetails?.includes(option);
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      const current = logistics.accessDetails || [];
                      const updated = isSelected
                        ? current.filter((item) => item !== option)
                        : [...current, option];
                      handleUpdate('accessDetails', updated);
                    }}
                    className={cn(
                      "inline-flex items-center rounded-full border-2 px-4 py-2 text-xs font-semibold transition-all hover:scale-105 cursor-pointer",
                      isSelected 
                        ? "bg-primary text-white border-primary ring-2 ring-primary/30" 
                        : "bg-background border-border hover:border-primary hover:bg-primary/5"
                    )}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Budget Range */}
        <Card className="p-6 space-y-3">
          <Label className="text-base font-medium text-foreground">Budget Range</Label>
          <p className="text-sm text-muted-foreground">Select a budget range or choose "Unsure" to get quotes first</p>
          <div className="flex flex-wrap gap-2">
            {BUDGET_RANGES.map((range) => {
              const isSelected = logistics.budgetRange === range;
              return (
                <button
                  key={range}
                  type="button"
                  onClick={() => handleUpdate('budgetRange', range)}
                  className={cn(
                    "inline-flex items-center rounded-full border-2 px-4 py-2 text-xs font-semibold transition-all hover:scale-105 cursor-pointer",
                    isSelected 
                      ? "bg-primary text-white border-primary ring-2 ring-primary/30" 
                      : "bg-background border-border hover:border-primary hover:bg-primary/5"
                  )}
                >
                  {range}
                </button>
              );
            })}
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
