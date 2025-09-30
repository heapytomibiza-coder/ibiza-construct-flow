import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ArrowLeft, MapPin, Camera, Target, Sparkles, CalendarIcon,
  Home, Building, Users, Wrench, Truck, Car
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { StickyMobileCTA } from '@/components/mobile/StickyMobileCTA';
import { AIQuestionRenderer } from '@/components/ai/AIQuestionRenderer';
import { LocationSelector } from './shared/LocationSelector';
import { TimeSlotSelector } from './shared/TimeSlotSelector';
import { DateSelector } from './shared/DateSelector';

interface MobileJobWizardProps {
  onComplete: (jobData: any) => void;
  onCancel: () => void;
  services: any[];
  microQuestions?: any[];
  logisticsQuestions?: any[];
  onLoadQuestions?: (serviceId: string) => void;
}

const MobileJobWizard = ({ 
  onComplete, 
  onCancel, 
  services,
  microQuestions = [],
  logisticsQuestions = [],
  onLoadQuestions
}: MobileJobWizardProps) => {
  const [step, setStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('');
  const [selectedService, setSelectedService] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    urgency: 'flexible',
    preferredTime: '',
    budget: '',
    requirements: ''
  });
  
  const [microAnswers, setMicroAnswers] = useState<Record<string, any>>({});
  const [logisticsAnswers, setLogisticsAnswers] = useState<Record<string, any>>({});
  const [selectedDate, setSelectedDate] = useState<Date>();

  const steps = [
    { id: 1, title: 'Category' },
    { id: 2, title: 'Subcategory' },
    { id: 3, title: 'Service' },
    { id: 4, title: 'Micro Q' },
    { id: 5, title: 'Logistics' },
    { id: 6, title: 'Details' },
    { id: 7, title: 'Review' }
  ];

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, React.ComponentType<{ className?: string }>> = {
      'Home Services': Home,
      'Construction': Building,
      'Professional Services': Users,
      'Maintenance & Repair': Wrench,
      'Transport & Delivery': Truck,
      'Automotive': Car
    };
    return icons[category] || Wrench;
  };

  const getCategories = () => {
    return [...new Set(services.map(s => s.category))];
  };

  const getSubcategories = (category: string) => {
    return [...new Set(
      services
        .filter(s => s.category === category)
        .map(s => s.subcategory)
    )];
  };

  const getMicroServices = (category: string, subcategory: string) => {
    return services.filter(s => 
      s.category === category && s.subcategory === subcategory
    );
  };

  const nextStep = () => {
    if (step === 1 && !selectedCategory) {
      toast.error('Please select a category');
      return;
    }
    if (step === 2 && !selectedSubcategory) {
      toast.error('Please select a subcategory');
      return;
    }
    if (step === 3 && !selectedService) {
      toast.error('Please select a service');
      return;
    }
    
    // Load questions when moving from step 3 to 4
    if (step === 3 && selectedService && onLoadQuestions) {
      onLoadQuestions(selectedService.id);
    }
    
    setStep(prev => Math.min(7, prev + 1));
  };

  const prevStep = () => setStep(prev => Math.max(1, prev - 1));

  const handleSubmit = () => {
    const jobData = {
      ...formData,
      serviceId: selectedService?.id,
      category: selectedCategory,
      subcategory: selectedSubcategory,
      micro: selectedService?.micro,
      microAnswers,
      logisticsAnswers
    };
    onComplete(jobData);
  };

  const renderStepContent = () => {
    switch (step) {
      // Step 1: Category Selection
      case 1:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-display font-bold text-charcoal mb-2">
                What do you need help with?
              </h2>
              <p className="text-muted-foreground">
                Choose your project category
              </p>
            </div>

            <div className="space-y-3">
              {getCategories().map((category) => {
                const IconComponent = getCategoryIcon(category);
                const count = services.filter(s => s.category === category).length;
                
                return (
                  <Card
                    key={category}
                    className={cn(
                      "cursor-pointer transition-all duration-200",
                      selectedCategory === category 
                        ? "ring-2 ring-copper border-copper bg-copper/5" 
                        : "hover:border-copper/30"
                    )}
                    onClick={() => setSelectedCategory(category)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-hero flex items-center justify-center">
                            <IconComponent className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="font-medium text-charcoal">{category}</h3>
                            <p className="text-sm text-muted-foreground">{count} services</p>
                          </div>
                        </div>
                        <div className="w-5 h-5 rounded-full border-2 border-muted flex items-center justify-center">
                          {selectedCategory === category && (
                            <div className="w-2.5 h-2.5 rounded-full bg-copper"></div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        );

      // Step 2: Subcategory Selection
      case 2:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-display font-bold text-charcoal mb-2">
                Select Subcategory
              </h2>
              <p className="text-muted-foreground">
                Choose the specific type of {selectedCategory}
              </p>
            </div>
            
            <div className="space-y-3">
              {getSubcategories(selectedCategory).map((subcategory) => (
                <Card
                  key={subcategory}
                  className={cn(
                    "cursor-pointer transition-all duration-200",
                    selectedSubcategory === subcategory 
                      ? "ring-2 ring-copper border-copper bg-copper/5" 
                      : "hover:border-copper/30"
                  )}
                  onClick={() => setSelectedSubcategory(subcategory)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-charcoal">{subcategory}</h3>
                      <div className="w-5 h-5 rounded-full border-2 border-muted flex items-center justify-center">
                        {selectedSubcategory === subcategory && (
                          <div className="w-2.5 h-2.5 rounded-full bg-copper"></div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      // Step 3: Micro-service Selection
      case 3:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-display font-bold text-charcoal mb-2">
                Which service exactly?
              </h2>
              <p className="text-muted-foreground">
                Select from <span className="text-copper font-medium">{selectedSubcategory}</span>
              </p>
            </div>

            <div className="space-y-2">
              {getMicroServices(selectedCategory, selectedSubcategory).map((service) => (
                <Card
                  key={service.id}
                  className={cn(
                    "cursor-pointer transition-all duration-200",
                    selectedService?.id === service.id 
                      ? "ring-2 ring-copper border-copper bg-copper/5" 
                      : "hover:border-copper/30"
                  )}
                  onClick={() => setSelectedService(service)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-charcoal">{service.micro}</h4>
                      <div className="w-5 h-5 rounded-full border-2 border-muted flex items-center justify-center">
                        {selectedService?.id === service.id && (
                          <div className="w-2.5 h-2.5 rounded-full bg-copper"></div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      // Step 4: Service-Specific Questions
      case 4:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-display font-bold text-charcoal mb-2">
                Service Details
              </h2>
              <p className="text-muted-foreground">
                Tell us about your {selectedService?.micro}
              </p>
            </div>
            
            {microQuestions.length > 0 ? (
              <AIQuestionRenderer
                questions={microQuestions}
                answers={microAnswers}
                onAnswerChange={(questionId, value) => {
                  setMicroAnswers(prev => ({ ...prev, [questionId]: value }));
                }}
              />
            ) : (
              <div className="text-center py-12">
                <div className="animate-pulse text-muted-foreground">
                  Loading questions...
                </div>
              </div>
            )}
          </div>
        );

      // Step 5: Logistics Questions
      case 5:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-display font-bold text-charcoal mb-2">
                Project Logistics
              </h2>
              <p className="text-muted-foreground">
                When and where?
              </p>
            </div>
            
            {logisticsQuestions.length > 0 ? (
              <AIQuestionRenderer
                questions={logisticsQuestions}
                answers={logisticsAnswers}
                onAnswerChange={(questionId, value) => {
                  setLogisticsAnswers(prev => ({ ...prev, [questionId]: value }));
                }}
              />
            ) : (
              <div className="space-y-4">
                <LocationSelector
                  value={formData.location}
                  onChange={(value) => setFormData(prev => ({ ...prev, location: value }))}
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-charcoal mb-3">
                    Timeline
                  </label>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {[
                      { value: 'urgent', label: 'Urgent' },
                      { value: 'this_week', label: 'This week' },
                      { value: 'this_month', label: 'This month' },
                      { value: 'flexible', label: 'Flexible' }
                    ].map((option) => (
                      <Button
                        key={option.value}
                        variant={formData.urgency === option.value ? "default" : "outline"}
                        onClick={() => setFormData(prev => ({ ...prev, urgency: option.value }))}
                        className={cn(
                          "h-auto p-3",
                          formData.urgency === option.value && "bg-gradient-hero text-white"
                        )}
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-charcoal">
                      Select your preferred date
                    </label>
                    <DateSelector
                      value={selectedDate}
                      onChange={setSelectedDate}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-charcoal mb-3">
                    Preferred Time
                  </label>
                  <TimeSlotSelector
                    value={formData.preferredTime}
                    onChange={(value) => setFormData(prev => ({ ...prev, preferredTime: value }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">
                    Budget (Optional)
                  </label>
                  <Input
                    value={formData.budget}
                    onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
                    placeholder="e.g., €500 - €1000"
                    className="mobile-optimized-input"
                  />
                </div>
              </div>
            )}
          </div>
        );

      // Step 6: Additional Details
      case 6:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-display font-bold text-charcoal mb-2">
                Additional Details
              </h2>
              <p className="text-muted-foreground">
                Any special requirements or notes?
              </p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">
                  Project Title (Optional)
                </label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Kitchen renovation"
                  className="mobile-optimized-input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">
                  Additional Notes (Optional)
                </label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Any special requirements, access instructions, etc..."
                  rows={4}
                  className="mobile-optimized-input"
                />
              </div>
            </div>
          </div>
        );

      // Step 7: Final Review
      case 7:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-display font-bold text-charcoal mb-2">
                Review & Post
              </h2>
              <p className="text-muted-foreground">
                AI will create a professional job post
              </p>
            </div>

            <Card className="card-luxury">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-copper" />
                  Project Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-charcoal mb-1">Service</h4>
                  <p className="text-muted-foreground">{selectedService?.micro}</p>
                  <div className="flex gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {selectedCategory}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {selectedSubcategory}
                    </Badge>
                  </div>
                </div>

                {Object.keys(microAnswers).length > 0 && (
                  <div>
                    <h4 className="font-medium text-charcoal mb-2">Service Details</h4>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      {Object.entries(microAnswers).slice(0, 3).map(([key, value]) => (
                        <p key={key}>{key}: {String(value)}</p>
                      ))}
                      {Object.keys(microAnswers).length > 3 && (
                        <p className="text-xs">+ {Object.keys(microAnswers).length - 3} more...</p>
                      )}
                    </div>
                  </div>
                )}

                {Object.keys(logisticsAnswers).length > 0 && (
                  <div>
                    <h4 className="font-medium text-charcoal mb-2">Logistics</h4>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      {Object.entries(logisticsAnswers).slice(0, 3).map(([key, value]) => (
                        <p key={key}>{key}: {String(value)}</p>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-muted-foreground">Timeline</span>
                  <Badge variant="outline">
                    {formData.urgency.replace('_', ' ')}
                  </Badge>
                </div>

                {formData.location && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Location</span>
                    <span className="text-charcoal text-sm">{formData.location}</span>
                  </div>
                )}

                {formData.budget && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Budget</span>
                    <span className="text-charcoal text-sm">{formData.budget}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="bg-gradient-hero/10 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-copper" />
                <span className="font-medium text-charcoal">What happens next?</span>
              </div>
              <p className="text-sm text-muted-foreground">
                AI will create a professional job post from your answers. Qualified professionals will review and send personalized quotes within 24-48 hours.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle pb-20">
      {/* Mobile Header */}
      <div className="sticky-header bg-white/95 backdrop-blur-sm border-b border-sand/20">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={step === 1 ? onCancel : prevStep}
              className="text-muted-foreground hover:text-charcoal"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-charcoal">
                {step} of {steps.length}
              </span>
              <div className="flex gap-1">
                {steps.map((s, index) => (
                  <div
                    key={s.id}
                    className={cn(
                      "w-2 h-2 rounded-full",
                      step >= s.id ? "bg-copper" : "bg-muted"
                    )}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6">
        {renderStepContent()}
      </div>

      {/* Mobile CTA */}
      <StickyMobileCTA
        primaryAction={{
          label: step === 7 ? 'Post Project' : 'Continue',
          onClick: step === 7 ? handleSubmit : nextStep
        }}
        secondaryAction={step > 1 ? {
          label: 'Back',
          onClick: prevStep
        } : undefined}
      />
    </div>
  );
};

export default MobileJobWizard;
