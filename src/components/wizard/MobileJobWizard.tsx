import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, MapPin, Camera, Target, Sparkles,
  Home, Building, Users, Wrench, Truck, Car
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { StickyMobileCTA } from '@/components/mobile/StickyMobileCTA';

interface MobileJobWizardProps {
  onComplete: (jobData: any) => void;
  onCancel: () => void;
  services: any[];
}

const MobileJobWizard = ({ onComplete, onCancel, services }: MobileJobWizardProps) => {
  const [step, setStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedService, setSelectedService] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    urgency: 'flexible',
    budget: '',
    requirements: ''
  });

  const steps = [
    { id: 1, title: 'Category' },
    { id: 2, title: 'Service' },
    { id: 3, title: 'Details' },
    { id: 4, title: 'Review' }
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
    if (step === 2 && !selectedService) {
      toast.error('Please select a service');
      return;
    }
    if (step === 3 && (!formData.title || !formData.description)) {
      toast.error('Please fill in title and description');
      return;
    }
    setStep(prev => Math.min(4, prev + 1));
  };

  const prevStep = () => setStep(prev => Math.max(1, prev - 1));

  const handleSubmit = () => {
    const jobData = {
      ...formData,
      serviceId: selectedService?.id,
      category: selectedCategory,
      micro: selectedService?.micro
    };
    onComplete(jobData);
  };

  const renderStepContent = () => {
    switch (step) {
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

      case 2:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-display font-bold text-charcoal mb-2">
                Which service exactly?
              </h2>
              <p className="text-muted-foreground">
                From <span className="text-copper font-medium">{selectedCategory}</span>
              </p>
            </div>

            <div className="space-y-4">
              {getSubcategories(selectedCategory).map((subcategory) => (
                <div key={subcategory}>
                  <h3 className="font-medium text-charcoal mb-3 px-1">
                    {subcategory}
                  </h3>
                  <div className="space-y-2">
                    {getMicroServices(selectedCategory, subcategory).map((service) => (
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
                            <div>
                              <h4 className="font-medium text-charcoal">{service.micro}</h4>
                            </div>
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
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-display font-bold text-charcoal mb-2">
                Project Details
              </h2>
              <p className="text-muted-foreground">
                Help professionals understand your needs
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">
                  Project Title *
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
                  Description *
                </label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your project in detail..."
                  rows={4}
                  className="mobile-optimized-input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">
                  Location
                </label>
                <div className="relative">
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Enter address or area"
                    className="mobile-optimized-input pr-10"
                  />
                  <MapPin className="absolute right-3 top-2.5 w-4 h-4 text-muted-foreground" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal mb-3">
                  Timeline
                </label>
                <div className="grid grid-cols-2 gap-2">
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
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-display font-bold text-charcoal mb-2">
                Review & Post
              </h2>
              <p className="text-muted-foreground">
                Check everything looks good
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
                  <Badge variant="outline" className="mt-1 text-xs">
                    {selectedCategory}
                  </Badge>
                </div>
                
                <div>
                  <h4 className="font-medium text-charcoal mb-1">Title</h4>
                  <p className="text-muted-foreground">{formData.title}</p>
                </div>

                <div>
                  <h4 className="font-medium text-charcoal mb-1">Description</h4>
                  <p className="text-muted-foreground text-sm">{formData.description}</p>
                </div>

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
                Qualified professionals will review your project and send personalized quotes within 24-48 hours.
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
          label: step === 4 ? 'Post Project' : 'Continue',
          onClick: step === 4 ? handleSubmit : nextStep
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