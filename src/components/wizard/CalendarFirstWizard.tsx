import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { 
  ArrowLeft, ArrowRight, MapPin, Calendar as CalendarIcon,
  Clock, AlertCircle, CheckCircle, Sparkles
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useFeature } from '@/contexts/FeatureFlagsContext';
import { TimeSlotSelector } from './shared/TimeSlotSelector';
import { LocationSelector } from './shared/LocationSelector';
import { RequirementsGathering } from './RequirementsGathering';

interface CalendarFirstWizardProps {
  onComplete: (jobData: any) => void;
  onCancel: () => void;
}

const CalendarFirstWizard = ({ onComplete, onCancel }: CalendarFirstWizardProps) => {
  const [step, setStep] = useState(1);
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [isFlexible, setIsFlexible] = useState(false);

  const calendarFirstEnabled = useFeature('wizard_calendar_first');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    urgency: 'flexible',
    preferredDates: [],
    photos: [],
    timePreference: 'flexible',
    exactTime: ''
  });

  const [requirements, setRequirements] = useState({
    scope: '',
    timeline: '',
    budgetRange: '',
    constraints: '',
    materials: '',
    specifications: {},
    referenceImages: []
  });

  const steps = calendarFirstEnabled ? [
    { id: 1, title: 'Schedule', desc: 'When do you need this?' },
    { id: 2, title: 'Service Selection', desc: 'What do you need?' },
    { id: 3, title: 'Requirements', desc: 'Describe your needs' },
    { id: 4, title: 'Details', desc: 'Location & specifics' },
    { id: 5, title: 'Review', desc: 'Confirm & post' }
  ] : [
    { id: 1, title: 'Service Selection', desc: 'What do you need?' },
    { id: 2, title: 'Requirements', desc: 'Describe your needs' },
    { id: 3, title: 'Details', desc: 'Location & schedule' },
    { id: 4, title: 'Review', desc: 'Confirm & post' }
  ];

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('category', { ascending: true });
      
      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      toast.error('Failed to load services');
    }
  };

  const nextStep = () => {
    const maxSteps = calendarFirstEnabled ? 5 : 4;
    
    if (calendarFirstEnabled && step === 1 && !selectedDate && !isFlexible) {
      toast.error('Please select a date or choose flexible timing');
      return;
    }
    if ((calendarFirstEnabled && step === 2) || (!calendarFirstEnabled && step === 1)) {
      if (!selectedService) {
        toast.error('Please select a service category');
        return;
      }
    }
    if ((calendarFirstEnabled && step === 3) || (!calendarFirstEnabled && step === 2)) {
      if (!requirements.timeline || !requirements.budgetRange) {
        toast.error('Please provide timeline and budget information');
        return;
      }
    }
    
    setStep(prev => Math.min(maxSteps, prev + 1));
  };

  const prevStep = () => setStep(prev => Math.max(1, prev - 1));

  const handleServiceSelect = (service: any) => {
    setSelectedService(service);
    setFormData(prev => ({
      ...prev,
      title: `${service.category} - ${service.subcategory}`,
      description: service.micro
    }));
    nextStep();
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const jobData = {
        ...formData,
        serviceId: selectedService?.id,
        microSlug: selectedService?.slug || `${selectedService?.category}-${selectedService?.subcategory}`.toLowerCase().replace(/\s+/g, '-'),
        category: selectedService?.category,
        subcategory: selectedService?.subcategory,
        micro: selectedService?.micro,
        requirements,
        scheduledDate: selectedDate,
        isFlexible
      };
      
      onComplete(jobData);
      toast.success('Job posted successfully!');
    } catch (error) {
      toast.error('Failed to post job');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        if (calendarFirstEnabled) {
          return (
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-display font-bold text-foreground mb-2">
                  When do you need this done?
                </h3>
                <p className="text-muted-foreground">
                  Choose your ideal start date and time preference
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Date Selection */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CalendarIcon className="w-5 h-5" />
                      Select Date
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="exact-date"
                          name="date-type"
                          checked={!isFlexible}
                          onChange={() => setIsFlexible(false)}
                        />
                        <label htmlFor="exact-date" className="font-medium">
                          Exact Date
                        </label>
                      </div>
                      
                      {!isFlexible && (
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          disabled={(date) => date < new Date()}
                          className="rounded-md border"
                        />
                      )}

                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="flexible-date"
                          name="date-type"
                          checked={isFlexible}
                          onChange={() => setIsFlexible(true)}
                        />
                        <label htmlFor="flexible-date" className="font-medium">
                          Flexible Window
                        </label>
                      </div>

                      {isFlexible && (
                        <div className="space-y-3">
                          <p className="text-sm text-muted-foreground">
                            I'm flexible with timing - professionals can suggest their availability
                          </p>
                          <div className="grid grid-cols-2 gap-2">
                            {['This week', 'Next week', 'This month', 'Next month'].map((option) => (
                              <Button
                                key={option}
                                variant={formData.urgency === option.toLowerCase().replace(' ', '-') ? "default" : "outline"}
                                onClick={() => setFormData(prev => ({ ...prev, urgency: option.toLowerCase().replace(' ', '-') }))}
                                className="text-sm"
                              >
                                {option}
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Time Preference */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      Time Preference
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <TimeSlotSelector
                        value={formData.timePreference}
                        onChange={(value) => setFormData(prev => ({ ...prev, timePreference: value }))}
                        includeFlexible
                        layout="stack"
                      />

                      {formData.timePreference !== 'Flexible' && (
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Specific time (optional)
                          </label>
                          <Input
                            type="time"
                            value={formData.exactTime}
                            onChange={(e) => setFormData(prev => ({ ...prev, exactTime: e.target.value }))}
                          />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          );
        }
        // Fall through to service selection if calendar-first is disabled
        
      case 2:
        if (calendarFirstEnabled || step === 1) {
          return (
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-display font-bold text-foreground mb-2">
                  What service do you need?
                </h3>
                <p className="text-muted-foreground">
                  Choose the category that best matches your project
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services.map((service: any) => (
                  <Card 
                    key={service.id} 
                    className={cn(
                      "cursor-pointer transition-all hover:shadow-lg",
                      selectedService?.id === service.id && "ring-2 ring-primary"
                    )}
                    onClick={() => handleServiceSelect(service)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-hero rounded-lg flex items-center justify-center">
                          <Sparkles className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground">{service.category}</h4>
                          <p className="text-sm text-muted-foreground">{service.subcategory}</p>
                          <Badge variant="outline" className="mt-1">
                            {service.micro}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        }

      case 3:
        return (
          <RequirementsGathering
            requirements={requirements}
            onUpdate={setRequirements}
          />
        );

      case 4:
        // Case 4 is details step in both modes
        // calendar-first: step 4 is details, non-calendar: step 3 is details
        if ((calendarFirstEnabled && step === 4) || (!calendarFirstEnabled && step === 4)) {
          return (
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-display font-bold text-foreground mb-2">
                  Location & Additional Details
                </h3>
                <p className="text-muted-foreground">
                  Help professionals understand your project location and specifics
                </p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Project Location
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <LocationSelector
                    value={formData.location}
                    onChange={(value) => setFormData(prev => ({ ...prev, location: value }))}
                  />
                </CardContent>
              </Card>

              {!calendarFirstEnabled && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CalendarIcon className="w-5 h-5" />
                      Scheduling
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        disabled={(date) => date < new Date()}
                        className="rounded-md border"
                      />
                      
                      <TimeSlotSelector
                        value={formData.timePreference}
                        onChange={(value) => setFormData(prev => ({ ...prev, timePreference: value }))}
                        includeFlexible
                      />
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          );
        }

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-display font-bold text-foreground mb-2">
                Review Your Project
              </h3>
              <p className="text-muted-foreground">
                Make sure everything looks correct before posting
              </p>
            </div>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Service</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Category:</span>
                      <span className="font-medium">{selectedService?.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type:</span>
                      <span className="font-medium">{selectedService?.subcategory}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Service:</span>
                      <span className="font-medium">{selectedService?.micro}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Project Requirements</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {requirements.scope && (
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Scope:</span>
                      <p className="text-foreground">{requirements.scope}</p>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Timeline:</span>
                    <span className="font-medium">{requirements.timeline}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Budget Range:</span>
                    <span className="font-medium">{requirements.budgetRange}</span>
                  </div>
                  {requirements.constraints && (
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Constraints:</span>
                      <p className="text-foreground">{requirements.constraints}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Schedule & Location</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Date:</span>
                      <span className="font-medium">
                        {isFlexible ? 'Flexible' : selectedDate?.toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Time:</span>
                      <span className="font-medium">{formData.timePreference}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Location:</span>
                      <span className="font-medium">{formData.location || 'Not specified'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const maxSteps = calendarFirstEnabled ? 5 : 4;

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" onClick={onCancel} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-6">
            {steps.map((s, idx) => (
              <React.Fragment key={s.id}>
                <div className="flex flex-col items-center">
                  <div 
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all",
                      step >= s.id 
                        ? "bg-gradient-hero text-white" 
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {step > s.id ? <CheckCircle className="w-5 h-5" /> : s.id}
                  </div>
                  <div className="mt-2 text-center">
                    <div className={cn(
                      "text-sm font-medium",
                      step >= s.id ? "text-foreground" : "text-muted-foreground"
                    )}>
                      {s.title}
                    </div>
                    <div className="text-xs text-muted-foreground hidden md:block">
                      {s.desc}
                    </div>
                  </div>
                </div>
                {idx < steps.length - 1 && (
                  <div 
                    className={cn(
                      "flex-1 h-1 mx-2 rounded transition-all",
                      step > s.id ? "bg-gradient-hero" : "bg-muted"
                    )}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="mb-8">
          {renderStepContent()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={step === 1}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          {step < maxSteps ? (
            <Button
              onClick={nextStep}
              className="bg-gradient-hero text-white"
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-gradient-hero text-white"
            >
              {loading ? 'Posting...' : 'Post Job'}
              <CheckCircle className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalendarFirstWizard;
