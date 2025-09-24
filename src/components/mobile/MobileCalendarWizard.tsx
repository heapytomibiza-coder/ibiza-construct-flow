import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { 
  ArrowLeft, ArrowRight, Calendar as CalendarIcon, Clock, 
  MapPin, Euro, FileText, Settings, ChevronDown, Check, X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { StickyMobileCTA } from '@/components/mobile/StickyMobileCTA';
import { MobileProgressiveDisclosure } from '@/components/mobile/MobileProgressiveDisclosure';
import { MobileOptimizedInput } from '@/components/mobile/MobileOptimizedInput';
import { format } from 'date-fns';

interface MobileCalendarWizardProps {
  onComplete: (jobData: any) => void;
  onCancel: () => void;
}

export const MobileCalendarWizard = ({ onComplete, onCancel }: MobileCalendarWizardProps) => {
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [isFlexible, setIsFlexible] = useState(false);
  const isMobile = useIsMobile();
  
  const [formData, setFormData] = useState({
    // Step 1: Schedule
    timePreference: 'flexible',
    exactTime: '',
    urgencyWindow: 'this-week',
    
    // Step 2: Service & Location
    serviceCategory: '',
    location: '',
    propertyType: '',
    
    // Step 3: Project Details
    title: '',
    description: '',
    budget: '',
    
    // Progressive disclosure - Advanced Options
    accessInstructions: '',
    parkingInfo: '',
    specialRequirements: [],
    photos: [],
    matchingPreferences: {
      priorityFactor: 'price', // price, speed, quality, rating
      communicationPreference: 'messages' // messages, calls, either
    }
  });

  const steps = [
    { id: 1, title: 'Schedule', desc: 'When do you need this?', icon: CalendarIcon },
    { id: 2, title: 'Service & Location', desc: 'What & where?', icon: MapPin },
    { id: 3, title: 'Details', desc: 'Project specifics', icon: FileText },
    { id: 4, title: 'Review', desc: 'Confirm & post', icon: Check }
  ];

  const nextStep = () => {
    if (step === 1 && !selectedDate && !isFlexible) {
      return; // Validation handled by CTA
    }
    if (step === 2 && !formData.serviceCategory) {
      return; // Validation handled by CTA
    }
    if (step === 3 && !formData.title.trim()) {
      return; // Validation handled by CTA
    }
    
    setStep(prev => Math.min(4, prev + 1));
  };

  const prevStep = () => setStep(prev => Math.max(1, prev - 1));

  const handleSubmit = () => {
    const jobData = {
      ...formData,
      scheduledDate: selectedDate,
      isFlexible,
      timePreference: formData.timePreference,
      exactTime: formData.exactTime
    };
    
    onComplete(jobData);
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
        return selectedDate || isFlexible;
      case 2:
        return formData.serviceCategory && formData.location;
      case 3:
        return formData.title.trim();
      case 4:
        return true;
      default:
        return false;
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-display font-bold text-charcoal">
                When do you need this done?
              </h2>
              <p className="text-muted-foreground">
                Choose your ideal start date and time
              </p>
            </div>

            {/* Date Selection Toggle */}
            <div className="flex gap-2">
              <Button 
                variant={!isFlexible ? "default" : "outline"}
                onClick={() => setIsFlexible(false)}
                className="flex-1 min-h-[48px]"
              >
                <CalendarIcon className="w-4 h-4 mr-2" />
                Exact Date
              </Button>
              <Button 
                variant={isFlexible ? "default" : "outline"}
                onClick={() => setIsFlexible(true)}
                className="flex-1 min-h-[48px]"
              >
                <Clock className="w-4 h-4 mr-2" />
                Flexible
              </Button>
            </div>

            {/* Date Picker */}
            {!isFlexible && (
              <Card>
                <CardContent className="p-4">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => date < new Date()}
                    className={cn("w-full pointer-events-auto")}
                  />
                  {selectedDate && (
                    <div className="mt-4 p-3 bg-gradient-card rounded-lg">
                      <p className="text-sm font-medium text-charcoal">
                        Selected: {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Flexible Window Options */}
            {isFlexible && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Flexible Timing</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    When would you like this to be completed?
                  </p>
                  
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'asap', label: 'ASAP' },
                      { id: 'this-week', label: 'This Week' },
                      { id: 'next-week', label: 'Next Week' },
                      { id: 'this-month', label: 'This Month' }
                    ].map((option) => (
                      <Button
                        key={option.id}
                        variant={formData.urgencyWindow === option.id ? "default" : "outline"}
                        onClick={() => setFormData(prev => ({ ...prev, urgencyWindow: option.id }))}
                        className="min-h-[44px] text-sm"
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Time Preference */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Time Preference
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { id: 'morning', label: 'Morning', desc: '8AM - 12PM' },
                    { id: 'afternoon', label: 'Afternoon', desc: '12PM - 5PM' },
                    { id: 'evening', label: 'Evening', desc: '5PM - 8PM' },
                    { id: 'flexible', label: 'Any Time', desc: 'Professional decides' }
                  ].map((time) => (
                    <button
                      key={time.id}
                      onClick={() => setFormData(prev => ({ ...prev, timePreference: time.id }))}
                      className={cn(
                        "p-3 rounded-lg border text-left transition-colors min-h-[56px]",
                        formData.timePreference === time.id
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-card hover:bg-muted border-border"
                      )}
                    >
                      <div className="font-medium">{time.label}</div>
                      <div className="text-sm opacity-70">{time.desc}</div>
                    </button>
                  ))}
                </div>

                {/* Exact Time Input */}
                {formData.timePreference !== 'flexible' && (
                  <MobileOptimizedInput
                    type="time"
                    label="Specific time (optional)"
                    value={formData.exactTime}
                    onChange={(value) => setFormData(prev => ({ ...prev, exactTime: value }))}
                    placeholder="Select time"
                  />
                )}
              </CardContent>
            </Card>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-display font-bold text-charcoal">
                What service do you need?
              </h2>
              <p className="text-muted-foreground">
                Tell us what you need and where
              </p>
            </div>

            {/* Service Category Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Service Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    'Home Repairs & Maintenance',
                    'Plumbing',
                    'Electrical Work',
                    'Painting & Decorating',
                    'Cleaning Services',
                    'Gardening & Landscaping',
                    'Assembly & Installation',
                    'Moving & Transport'
                  ].map((category) => (
                    <button
                      key={category}
                      onClick={() => setFormData(prev => ({ ...prev, serviceCategory: category }))}
                      className={cn(
                        "p-3 rounded-lg border text-left transition-colors min-h-[52px]",
                        formData.serviceCategory === category
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-card hover:bg-muted border-border"
                      )}
                    >
                      <div className="font-medium">{category}</div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Location Input */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Location
                </CardTitle>
              </CardHeader>
              <CardContent>
                <MobileOptimizedInput
                  type="text"
                  label="Address or Area"
                  value={formData.location}
                  onChange={(value) => setFormData(prev => ({ ...prev, location: value }))}
                  placeholder="e.g., Ibiza Town, Santa Eulària..."
                  autoComplete="address-line1"
                />
                
                {/* Property Type */}
                <div className="mt-4">
                  <label className="block text-sm font-medium mb-2">Property Type</label>
                  <div className="flex flex-wrap gap-2">
                    {['House', 'Apartment', 'Villa', 'Office', 'Restaurant', 'Shop'].map((type) => (
                      <button
                        key={type}
                        onClick={() => setFormData(prev => ({ ...prev, propertyType: type }))}
                        className={cn(
                          "px-3 py-2 rounded-full text-sm font-medium transition-colors min-h-[40px]",
                          formData.propertyType === type
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground hover:bg-muted-foreground/10"
                        )}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-display font-bold text-charcoal">
                Project Details
              </h2>
              <p className="text-muted-foreground">
                Help professionals understand your needs
              </p>
            </div>

            {/* Basic Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <MobileOptimizedInput
                  type="text"
                  label="Job Title"
                  value={formData.title}
                  onChange={(value) => setFormData(prev => ({ ...prev, title: value }))}
                  placeholder="e.g., Fix leaky bathroom tap"
                  required
                />

                <MobileOptimizedInput
                  type="textarea"
                  label="Description (optional)"
                  value={formData.description}
                  onChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
                  placeholder="Describe what needs to be done..."
                  rows={3}
                />

                {/* Budget Range */}
                <div>
                  <label className="block text-sm font-medium mb-2">Budget Range</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: 'under-100', label: 'Under €100' },
                      { id: '100-300', label: '€100-300' },
                      { id: '300-500', label: '€300-500' },
                      { id: '500-1000', label: '€500-1K' },
                      { id: '1000-plus', label: '€1K+' },
                      { id: 'open', label: 'Open' }
                    ].map((budget) => (
                      <button
                        key={budget.id}
                        onClick={() => setFormData(prev => ({ ...prev, budget: budget.id }))}
                        className={cn(
                          "px-3 py-2 rounded-full text-sm font-medium transition-colors min-h-[40px]",
                          formData.budget === budget.id
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground hover:bg-muted-foreground/10"
                        )}
                      >
                        {budget.label}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Progressive Disclosure - Advanced Options */}
            <MobileProgressiveDisclosure title="Advanced Options" defaultOpen={false}>
              <div className="space-y-4">
                <MobileOptimizedInput
                  type="textarea"
                  label="Access Instructions"
                  value={formData.accessInstructions}
                  onChange={(value) => setFormData(prev => ({ ...prev, accessInstructions: value }))}
                  placeholder="e.g., Ring doorbell, use side entrance..."
                  rows={2}
                />

                <MobileOptimizedInput
                  type="textarea"
                  label="Parking Information"
                  value={formData.parkingInfo}
                  onChange={(value) => setFormData(prev => ({ ...prev, parkingInfo: value }))}
                  placeholder="e.g., Free street parking available..."
                  rows={2}
                />

                {/* Matching Preferences */}
                <div>
                  <label className="block text-sm font-medium mb-2">What's most important?</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'price', label: 'Best Price' },
                      { id: 'speed', label: 'Quick Response' },
                      { id: 'quality', label: 'High Quality' },
                      { id: 'rating', label: 'Top Rated' }
                    ].map((pref) => (
                      <button
                        key={pref.id}
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          matchingPreferences: { ...prev.matchingPreferences, priorityFactor: pref.id }
                        }))}
                        className={cn(
                          "p-3 rounded-lg border text-center transition-colors min-h-[52px]",
                          formData.matchingPreferences.priorityFactor === pref.id
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-card hover:bg-muted border-border"
                        )}
                      >
                        <div className="text-sm font-medium">{pref.label}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </MobileProgressiveDisclosure>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-display font-bold text-charcoal">
                Review Your Job
              </h2>
              <p className="text-muted-foreground">
                Everything looks good? Let's post it!
              </p>
            </div>

            {/* Job Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{formData.title || 'Your Job'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Schedule */}
                <div className="flex items-start gap-3">
                  <CalendarIcon className="w-4 h-4 text-copper mt-1" />
                  <div className="flex-1">
                    <div className="font-medium text-sm">Schedule</div>
                    {isFlexible ? (
                      <div className="text-sm text-muted-foreground">
                        Flexible - {formData.urgencyWindow.replace('-', ' ')}
                      </div>
                    ) : selectedDate ? (
                      <div className="text-sm text-muted-foreground">
                        {format(selectedDate, 'EEEE, MMMM d')} 
                        {formData.exactTime && ` at ${formData.exactTime}`}
                        {!formData.exactTime && formData.timePreference !== 'flexible' && 
                          ` (${formData.timePreference})`}
                      </div>
                    ) : null}
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-copper mt-1" />
                  <div className="flex-1">
                    <div className="font-medium text-sm">Location</div>
                    <div className="text-sm text-muted-foreground">
                      {formData.location}
                      {formData.propertyType && ` (${formData.propertyType})`}
                    </div>
                  </div>
                </div>

                {/* Service */}
                <div className="flex items-start gap-3">
                  <Settings className="w-4 h-4 text-copper mt-1" />
                  <div className="flex-1">
                    <div className="font-medium text-sm">Service</div>
                    <div className="text-sm text-muted-foreground">{formData.serviceCategory}</div>
                  </div>
                </div>

                {/* Budget */}
                {formData.budget && (
                  <div className="flex items-start gap-3">
                    <Euro className="w-4 h-4 text-copper mt-1" />
                    <div className="flex-1">
                      <div className="font-medium text-sm">Budget</div>
                      <div className="text-sm text-muted-foreground">
                        {formData.budget === 'under-100' && 'Under €100'}
                        {formData.budget === '100-300' && '€100 - €300'}
                        {formData.budget === '300-500' && '€300 - €500'}
                        {formData.budget === '500-1000' && '€500 - €1,000'}
                        {formData.budget === '1000-plus' && '€1,000+'}
                        {formData.budget === 'open' && 'Open to offers'}
                      </div>
                    </div>
                  </div>
                )}

                {/* Description */}
                {formData.description && (
                  <div className="bg-sand-light p-3 rounded-lg">
                    <div className="text-sm font-medium mb-1">Description</div>
                    <div className="text-sm text-muted-foreground">{formData.description}</div>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="bg-gradient-card p-4 rounded-lg">
              <p className="text-sm text-muted-foreground text-center">
                Your job will be visible to verified professionals in your area. 
                You'll receive quotes and can choose the best one.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Mobile Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className="flex items-center justify-between p-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={step === 1 ? onCancel : prevStep}
            className="min-h-[44px]"
          >
            {step === 1 ? <X className="w-4 h-4 mr-2" /> : <ArrowLeft className="w-4 h-4 mr-2" />}
            {step === 1 ? 'Cancel' : 'Back'}
          </Button>
          
          <div className="flex items-center gap-2">
            {steps.map((s, index) => (
              <div
                key={s.id}
                className={cn(
                  "w-2 h-2 rounded-full transition-colors",
                  index + 1 <= step ? "bg-primary" : "bg-muted"
                )}
              />
            ))}
          </div>
          
          <div className="text-sm font-medium text-muted-foreground">
            {step}/{steps.length}
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="p-4">
        {renderStepContent()}
      </div>

      {/* Mobile Sticky CTA */}
      <StickyMobileCTA
        primaryAction={{
          label: step === 4 ? "Post Job" : "Continue",
          onClick: step === 4 ? handleSubmit : nextStep,
          disabled: !isStepValid()
        }}
        secondaryAction={step > 1 ? {
          label: "Back",
          onClick: prevStep
        } : undefined}
      />
    </div>
  );
};