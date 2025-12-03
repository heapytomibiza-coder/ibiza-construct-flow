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
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, CalendarIcon, MapPin, PlayCircle, CheckCircle, Phone, Video, Home } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

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

const IBIZA_LOCATIONS = [
  'Ibiza Town (Eivissa)',
  'San Antonio (Sant Antoni)',
  'Santa Eulalia (Santa Eulària)',
  "Playa d'en Bossa",
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
  const { t } = useTranslation('wizard');
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [completionDateOpen, setCompletionDateOpen] = useState(false);
  const [consultationDateOpen, setConsultationDateOpen] = useState(false);

  // Translated presets with their storage values
  const START_DATE_PRESETS = [
    { key: 'startAsap', value: 'Start ASAP' },
    { key: 'thisWeek', value: 'This Week' },
    { key: 'nextWeek', value: 'Next Week' },
    { key: 'within2Weeks', value: 'Within 2 Weeks' },
    { key: 'withinMonth', value: 'Within a Month' },
    { key: 'flexible', value: 'Flexible' }
  ];

  const CONSULTATION_TIMES = [
    { key: 'morning', value: 'Morning (8-12)' },
    { key: 'afternoon', value: 'Afternoon (12-17)' },
    { key: 'evening', value: 'Evening (17-20)' },
    { key: 'flexible', value: 'Flexible' }
  ];

  const BUDGET_RANGES = [
    { key: '0-500', value: '€0-500' },
    { key: '500-1000', value: '€500-1,000' },
    { key: '1000-2500', value: '€1,000-2,500' },
    { key: '2500-5000', value: '€2,500-5,000' },
    { key: '5000+', value: '€5,000+' },
    { key: 'unsure', value: 'Unsure' }
  ];

  const ACCESS_OPTIONS = [
    { key: 'streetParking', value: 'Street level parking' },
    { key: 'undergroundParking', value: 'Underground parking' },
    { key: 'noParking', value: 'No parking nearby' },
    { key: 'elevator', value: 'Elevator available' },
    { key: 'stairsOnly', value: 'Stairs only' },
    { key: 'gatedCommunity', value: 'Gated community' },
    { key: 'codeKeys', value: 'Code/keys needed' },
    { key: 'reception', value: 'Building reception' },
    { key: 'easyAccess', value: 'Easy access' },
    { key: 'limitedAccess', value: 'Limited access' }
  ];

  const handleUpdate = (field: string, value: any) => {
    onLogisticsChange({ ...logistics, [field]: value });
  };

  const handleStartDatePreset = (value: string) => {
    onLogisticsChange({ 
      ...logistics, 
      startDatePreset: value,
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
          {t('common.back')}
        </Button>

        <div>
          <Badge variant="outline" className="mb-4">{microName}</Badge>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            {t('steps.logistics.title')}
          </h1>
          <p className="text-lg text-muted-foreground mt-2">
            {t('steps.logistics.subtitle')}
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Location */}
        <Card className="p-6 space-y-3">
          <Label className="text-base font-medium text-foreground flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            {t('steps.logistics.locationLabel')}
          </Label>
          <Select value={logistics.location || ''} onValueChange={(value) => handleUpdate('location', value)}>
            <SelectTrigger className="w-full bg-background">
              <SelectValue placeholder={t('steps.logistics.locationPlaceholder')} />
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
              placeholder={t('steps.logistics.customLocationPlaceholder')}
              className="mt-2"
            />
          )}
        </Card>

        {/* 1. Job Start Date */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <PlayCircle className="w-5 h-5 text-primary" />
            <Label className="text-base font-medium text-foreground">
              {t('steps.logistics.startDateTitle')}
            </Label>
          </div>
          
          {/* Quick presets */}
          <div className="flex flex-wrap gap-2">
            {START_DATE_PRESETS.map((preset) => {
              const isSelected = logistics.startDatePreset === preset.value;
              return (
                <button
                  key={preset.key}
                  type="button"
                  onClick={() => handleStartDatePreset(preset.value)}
                  className={cn(
                    "inline-flex items-center rounded-full border-2 px-4 py-2 text-xs font-semibold transition-all hover:scale-105 cursor-pointer",
                    isSelected 
                      ? "bg-primary text-white border-primary ring-2 ring-primary/30" 
                      : "bg-background border-border hover:border-primary hover:bg-primary/5"
                  )}
                >
                  {t(`presets.${preset.key}`)}
                </button>
              );
            })}
          </div>

          {/* Or specific date */}
          <div className="pt-2">
            <Label className="text-sm text-muted-foreground mb-2 block">{t('steps.logistics.startDateSpecific')}</Label>
            <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
              <PopoverTrigger asChild>
                <Button 
                  type="button"
                  variant="outline" 
                  className="w-full justify-start text-left"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {logistics.startDate ? format(logistics.startDate, 'PPP') : t('steps.logistics.pickStartDate')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 z-50" align="start">
                <Calendar
                  mode="single"
                  selected={logistics.startDate}
                  onSelect={(date) => {
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
              {t('steps.logistics.completionTitle')}
            </Label>
            <Badge variant="secondary" className="ml-2">{t('common.optional')}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {t('steps.logistics.completionHelp')}
          </p>

          <Popover open={completionDateOpen} onOpenChange={setCompletionDateOpen}>
            <PopoverTrigger asChild>
              <Button 
                type="button"
                variant="outline" 
                className="w-full justify-start text-left"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {logistics.completionDate ? format(logistics.completionDate, 'PPP') : t('steps.logistics.pickCompletionDate')}
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
            {t('steps.logistics.consultationTitle')}
          </Label>
          <p className="text-sm text-muted-foreground">
            {t('steps.logistics.consultationHelp')}
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
              <p className="text-sm font-medium">{t('steps.logistics.siteVisit')}</p>
            </Card>
            <Card
              className={cn(
                "p-4 cursor-pointer transition-all hover:shadow-md text-center",
                logistics.consultationType === 'phone_call' && "ring-2 ring-primary bg-primary/5"
              )}
              onClick={() => handleUpdate('consultationType', 'phone_call')}
            >
              <Phone className="w-6 h-6 mx-auto mb-2 text-primary" />
              <p className="text-sm font-medium">{t('steps.logistics.phoneCall')}</p>
            </Card>
            <Card
              className={cn(
                "p-4 cursor-pointer transition-all hover:shadow-md text-center",
                logistics.consultationType === 'video_call' && "ring-2 ring-primary bg-primary/5"
              )}
              onClick={() => handleUpdate('consultationType', 'video_call')}
            >
              <Video className="w-6 h-6 mx-auto mb-2 text-primary" />
              <p className="text-sm font-medium">{t('steps.logistics.videoCall')}</p>
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
                    {logistics.consultationDate ? format(logistics.consultationDate, 'PPP') : t('steps.logistics.pickConsultationDate')}
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
                <Label className="text-sm text-muted-foreground mb-2 block">{t('steps.logistics.preferredTime')}</Label>
                <div className="flex flex-wrap gap-2">
                  {CONSULTATION_TIMES.map((time) => {
                    const isSelected = logistics.consultationTime === time.value;
                    return (
                      <button
                        key={time.key}
                        type="button"
                        onClick={() => handleUpdate('consultationTime', time.value)}
                        className={cn(
                          "inline-flex items-center rounded-full border-2 px-4 py-2 text-xs font-semibold transition-all hover:scale-105 cursor-pointer",
                          isSelected 
                            ? "bg-primary text-white border-primary ring-2 ring-primary/30" 
                            : "bg-background border-border hover:border-primary hover:bg-primary/5"
                        )}
                      >
                        {t(`times.${time.key}`)}
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
          <Label className="text-base font-medium text-foreground">{t('steps.logistics.siteAccess')}</Label>
          
          <div>
            <Label className="text-sm text-muted-foreground mb-2 block">{t('steps.logistics.accessParking')}</Label>
            <div className="flex flex-wrap gap-2">
              {ACCESS_OPTIONS.map((option) => {
                const isSelected = logistics.accessDetails?.includes(option.value);
                return (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => {
                      const current = logistics.accessDetails || [];
                      const updated = isSelected
                        ? current.filter((item) => item !== option.value)
                        : [...current, option.value];
                      handleUpdate('accessDetails', updated);
                    }}
                    className={cn(
                      "inline-flex items-center rounded-full border-2 px-4 py-2 text-xs font-semibold transition-all hover:scale-105 cursor-pointer",
                      isSelected 
                        ? "bg-primary text-white border-primary ring-2 ring-primary/30" 
                        : "bg-background border-border hover:border-primary hover:bg-primary/5"
                    )}
                  >
                    {t(`accessOptions.${option.key}`)}
                  </button>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Budget Range */}
        <Card className="p-6 space-y-3">
          <Label className="text-base font-medium text-foreground">{t('steps.logistics.budgetTitle')}</Label>
          <p className="text-sm text-muted-foreground">{t('steps.logistics.budgetHelp')}</p>
          <div className="flex flex-wrap gap-2">
            {BUDGET_RANGES.map((range) => {
              const isSelected = logistics.budgetRange === range.value;
              return (
                <button
                  key={range.key}
                  type="button"
                  onClick={() => handleUpdate('budgetRange', range.value)}
                  className={cn(
                    "inline-flex items-center rounded-full border-2 px-4 py-2 text-xs font-semibold transition-all hover:scale-105 cursor-pointer",
                    isSelected 
                      ? "bg-primary text-white border-primary ring-2 ring-primary/30" 
                      : "bg-background border-border hover:border-primary hover:bg-primary/5"
                  )}
                >
                  {t(`budgetRanges.${range.key}`)}
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
          {t('common.continue')}
        </Button>
      </div>
    </div>
  );
};
