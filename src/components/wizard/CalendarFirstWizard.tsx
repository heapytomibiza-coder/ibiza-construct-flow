import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  ArrowLeft, ArrowRight, Plus, Minus, MapPin, Calendar as CalendarIcon,
  Camera, FileText, Clock, Euro, AlertCircle, CheckCircle,
  Sparkles, Calculator, Target, ChevronDown, Settings, X
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useFeature } from '@/contexts/FeatureFlagsContext';

interface CalendarFirstWizardProps {
  onComplete: (jobData: any) => void;
  onCancel: () => void;
}

interface ServiceItem {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  unit: string;
  category: 'labor' | 'material' | 'equipment';
  estimatedDuration: number;
  image?: string;
}

interface SelectedItem extends ServiceItem {
  quantity: number;
  notes?: string;
}

const CalendarFirstWizard = ({ onComplete, onCancel }: CalendarFirstWizardProps) => {
  const [step, setStep] = useState(1);
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [serviceItems, setServiceItems] = useState<ServiceItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [totalEstimate, setTotalEstimate] = useState(0);
  const [confidence, setConfidence] = useState(85);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [isFlexible, setIsFlexible] = useState(false);
  const [matchingQualityOpen, setMatchingQualityOpen] = useState(false);

  const calendarFirstEnabled = useFeature('wizard_calendar_first');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    urgency: 'flexible',
    budget: '',
    preferredDates: [],
    requirements: [],
    photos: [],
    timePreference: 'flexible',
    exactTime: ''
  });

  const steps = calendarFirstEnabled ? [
    { id: 1, title: 'Schedule', desc: 'When do you need this?' },
    { id: 2, title: 'Service Selection', desc: 'What do you need?' },
    { id: 3, title: 'Configuration', desc: 'Configure your project' },
    { id: 4, title: 'Details', desc: 'Location & requirements' },
    { id: 5, title: 'Review', desc: 'Confirm & post' }
  ] : [
    { id: 1, title: 'Service Selection', desc: 'What do you need?' },
    { id: 2, title: 'Configuration', desc: 'Configure your project' },
    { id: 3, title: 'Details', desc: 'Location & schedule' },
    { id: 4, title: 'Review', desc: 'Confirm & post' }
  ];

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    calculateEstimate();
  }, [selectedItems]);

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

  const fetchServiceItems = async (serviceId: string) => {
    try {
      const { data, error } = await supabase
        .from('service_options')
        .select('*')
        .eq('service_id', serviceId)
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      
      const items: ServiceItem[] = (data || []).map(item => ({
        id: item.id,
        name: item.name,
        description: item.description || '',
        basePrice: item.base_price || 0,
        unit: 'item',
        category: item.category as 'labor' | 'material' | 'equipment',
        estimatedDuration: 60
      }));
      
      setServiceItems(items);
    } catch (error) {
      toast.error('Failed to load service items');
    }
  };

  const calculateEstimate = () => {
    const total = selectedItems.reduce((sum, item) => 
      sum + (item.basePrice * item.quantity), 0
    );
    setTotalEstimate(total);
    
    const completeness = selectedItems.length > 0 ? 85 + (selectedItems.length * 2) : 70;
    setConfidence(Math.min(95, completeness));
  };

  const addItem = (item: ServiceItem) => {
    const existing = selectedItems.find(s => s.id === item.id);
    if (existing) {
      setSelectedItems(prev => prev.map(s => 
        s.id === item.id ? { ...s, quantity: s.quantity + 1 } : s
      ));
    } else {
      setSelectedItems(prev => [...prev, { ...item, quantity: 1 }]);
    }
  };

  const updateItemQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      setSelectedItems(prev => prev.filter(s => s.id !== itemId));
    } else {
      setSelectedItems(prev => prev.map(s => 
        s.id === itemId ? { ...s, quantity } : s
      ));
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
      if (selectedItems.length === 0) {
        toast.error('Please select at least one service item');
        return;
      }
    }
    
    setStep(prev => Math.min(maxSteps, prev + 1));
  };

  const prevStep = () => setStep(prev => Math.max(1, prev - 1));

  const handleServiceSelect = (service: any) => {
    setSelectedService(service);
    fetchServiceItems(service.id);
    nextStep();
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const jobData = {
        ...formData,
        serviceId: selectedService?.id,
        selectedItems,
        totalEstimate,
        confidence,
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
                      <div className="grid grid-cols-1 gap-2">
                        {['Morning (8-12)', 'Afternoon (12-17)', 'Evening (17-20)', 'Flexible'].map((time) => (
                          <Button
                            key={time}
                            variant={formData.timePreference === time ? "default" : "outline"}
                            onClick={() => setFormData(prev => ({ ...prev, timePreference: time }))}
                            className="text-sm justify-start"
                          >
                            {time}
                          </Button>
                        ))}
                      </div>

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
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-display font-bold text-foreground mb-2">
                Configure Your Project
              </h3>
              <p className="text-muted-foreground">
                Select what you need and quantities for accurate pricing
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Service Items */}
              <div className="lg:col-span-2 space-y-4">
                <h4 className="font-semibold text-foreground">Available Services</h4>
                {serviceItems.map((item) => (
                  <Card key={item.id} className="border">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h5 className="font-medium text-foreground">{item.name}</h5>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline">{item.category}</Badge>
                            <span className="text-sm text-muted-foreground">
                              €{item.basePrice} per {item.unit}
                            </span>
                          </div>
                        </div>
                        <Button 
                          onClick={() => addItem(item)}
                          size="sm"
                          className="bg-gradient-hero text-white"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Selected Items & Estimate + Matching Quality */}
              <div className="space-y-4">
                <Card className="sticky top-4">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calculator className="w-5 h-5" />
                      Your Configuration
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedItems.length === 0 ? (
                      <p className="text-muted-foreground text-sm">
                        No items selected yet
                      </p>
                    ) : (
                      selectedItems.map((item) => (
                        <div key={item.id} className="border rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-sm">{item.name}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                              >
                                <Minus className="w-3 h-3" />
                              </Button>
                              <span className="text-sm">{item.quantity}</span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                              >
                                <Plus className="w-3 h-3" />
                              </Button>
                            </div>
                            <span className="font-medium text-sm">
                              €{(item.basePrice * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      ))
                    )}

                    {selectedItems.length > 0 && (
                      <>
                        <div className="border-t pt-4">
                          <div className="flex justify-between items-center">
                            <span className="font-semibold">Total Estimate</span>
                            <span className="font-bold text-lg">€{totalEstimate.toFixed(2)}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <Target className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              {confidence}% confidence
                            </span>
                          </div>
                        </div>
                        <div className="bg-muted/50 rounded-lg p-3">
                          <p className="text-xs text-muted-foreground">
                            This is a guided estimate. Final price may change after onsite assessment.
                          </p>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* Collapsible Matching Quality Section */}
                <Collapsible open={matchingQualityOpen} onOpenChange={setMatchingQualityOpen}>
                  <Card>
                    <CollapsibleTrigger asChild>
                      <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                        <CardTitle className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Settings className="w-5 h-5" />
                            <span className="text-base">Improve Matching</span>
                          </div>
                          <ChevronDown className={cn(
                            "w-4 h-4 transition-transform",
                            matchingQualityOpen && "rotate-180"
                          )} />
                        </CardTitle>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="pt-0">
                        <div className="space-y-3">
                          <p className="text-sm text-muted-foreground">
                            Optional settings to help us find the best professionals for your project.
                          </p>
                          <div className="space-y-2">
                            <label className="flex items-center space-x-2 text-sm">
                              <input type="checkbox" className="rounded" />
                              <span>Prioritize highly-rated professionals</span>
                            </label>
                            <label className="flex items-center space-x-2 text-sm">
                              <input type="checkbox" className="rounded" />
                              <span>Only show available this week</span>
                            </label>
                            <label className="flex items-center space-x-2 text-sm">
                              <input type="checkbox" className="rounded" />
                              <span>Include premium service providers</span>
                            </label>
                          </div>
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-display font-bold text-foreground mb-2">
                Project Details
              </h3>
              <p className="text-muted-foreground">
                Help professionals understand your requirements
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Project Title</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Kitchen renovation"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe your project in detail..."
                    rows={4}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Address</label>
                  <div className="relative">
                    <Input
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="Enter your address"
                    />
                    <MapPin className="absolute right-3 top-2.5 w-4 h-4 text-muted-foreground" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Manual address entry only - no automatic location detection
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Access & Parking Instructions</label>
                  <Textarea
                    placeholder="Parking info, building access codes, special instructions..."
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Special Requirements</label>
                  <Textarea
                    placeholder="Allergies, pet considerations, material preferences..."
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Photos (Optional)</label>
                  <div className="border-2 border-dashed border-muted rounded-lg p-6 text-center">
                    <Camera className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Upload photos to help professionals understand your project
                    </p>
                    <Button variant="outline" size="sm" className="mt-2">
                      Choose Files
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-display font-bold text-foreground mb-2">
                Review & Post
              </h3>
              <p className="text-muted-foreground">
                Double-check everything before posting your job
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Project Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Schedule</h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedDate ? selectedDate.toLocaleDateString() : 'Flexible timing'} 
                      {formData.timePreference !== 'Flexible' && ` - ${formData.timePreference}`}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Service</h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedService?.category} - {selectedService?.subcategory}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Selected Items</h4>
                    <div className="space-y-2">
                      {selectedItems.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span>{item.name} x{item.quantity}</span>
                          <span>€{(item.basePrice * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t pt-2">
                    <div className="flex justify-between font-semibold">
                      <span>Total Estimate</span>
                      <span>€{totalEstimate.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Contact Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Location</h4>
                    <p className="text-sm text-muted-foreground">
                      {formData.location || 'Not specified'}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Project Description</h4>
                    <p className="text-sm text-muted-foreground">
                      {formData.description || 'No description provided'}
                    </p>
                  </div>

                  <div className="bg-muted/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="font-medium">Ready to Post</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Your job will be visible to matched professionals. You'll receive quotes within 24 hours.
                    </p>
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

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Progress Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold">Post a Job</h1>
            <Button variant="ghost" onClick={onCancel}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
          
          <div className="flex items-center space-x-4">
            {steps.map((s, index) => (
              <div key={s.id} className="flex items-center">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                  step >= s.id 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted text-muted-foreground"
                )}>
                  {s.id}
                </div>
                <div className="ml-2 hidden sm:block">
                  <div className="text-sm font-medium">{s.title}</div>
                  <div className="text-xs text-muted-foreground">{s.desc}</div>
                </div>
                {index < steps.length - 1 && (
                  <ArrowRight className="w-4 h-4 text-muted-foreground mx-4" />
                )}
              </div>
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
          
          {step < steps.length ? (
            <Button onClick={nextStep}>
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={loading}>
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