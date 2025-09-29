import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, ArrowRight, Plus, MapPin, Calendar,
  Camera, Clock, Euro, Sparkles, Target, Home,
  Building, Wrench, Truck, Scissors, Car, Users
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { useIsMobile } from '@/hooks/use-mobile';

interface LuxuryJobWizardProps {
  onComplete: (jobData: any) => void;
  onCancel: () => void;
}

interface ServiceCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  count: number;
}

interface Service {
  id: string;
  category: string;
  subcategory: string;
  micro: string;
}

const LuxuryJobWizard = ({ onComplete, onCancel }: LuxuryJobWizardProps) => {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const [step, setStep] = useState(1);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    urgency: 'flexible',
    budget: '',
    requirements: '',
    photos: []
  });

  const steps = [
    { id: 1, title: 'Category', desc: 'What type of work?' },
    { id: 2, title: 'Service', desc: 'Specific service needed' },
    { id: 3, title: 'Details', desc: 'Project information' },
    { id: 4, title: 'Review', desc: 'Confirm & post' }
  ];

  // Service category icons and styling
  const getCategoryConfig = (category: string): ServiceCategory => {
    const configs: Record<string, Partial<ServiceCategory>> = {
      'Home Services': {
        icon: Home,
        gradient: 'from-blue-500 to-blue-600',
        description: 'Home repairs, maintenance, and improvements'
      },
      'Construction': {
        icon: Building,
        gradient: 'from-orange-500 to-orange-600',
        description: 'Building, renovation, and construction work'
      },
      'Professional Services': {
        icon: Users,
        gradient: 'from-purple-500 to-purple-600',
        description: 'Business and professional expertise'
      },
      'Maintenance & Repair': {
        icon: Wrench,
        gradient: 'from-green-500 to-green-600',
        description: 'Fix, maintain, and service equipment'
      },
      'Transport & Delivery': {
        icon: Truck,
        gradient: 'from-red-500 to-red-600',
        description: 'Moving, delivery, and transportation'
      },
      'Personal Services': {
        icon: Scissors,
        gradient: 'from-pink-500 to-pink-600',
        description: 'Personal care and lifestyle services'
      },
      'Automotive': {
        icon: Car,
        gradient: 'from-indigo-500 to-indigo-600',
        description: 'Vehicle services and repairs'
      }
    };

    const config = configs[category] || {};
    return {
      id: category,
      name: category,
      icon: config.icon || Wrench,
      gradient: config.gradient || 'from-copper to-copper-light',
      description: config.description || 'Professional services',
      count: services.filter(s => s.category === category).length,
      ...config
    };
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('services_unified_v1')
        .select('id, category, subcategory, micro')
        .order('category, subcategory, micro');
      
      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      toast.error('Failed to load services');
    } finally {
      setLoading(false);
    }
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
      toast.error('Please select a service category');
      return;
    }
    if (step === 2 && !selectedService) {
      toast.error('Please select a specific service');
      return;
    }
    if (step === 3 && (!formData.title || !formData.description)) {
      toast.error('Please fill in the project title and description');
      return;
    }
    setStep(prev => Math.min(4, prev + 1));
  };

  const prevStep = () => setStep(prev => Math.max(1, prev - 1));

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const jobData = {
        ...formData,
        serviceId: selectedService?.id,
        category: selectedCategory,
        subcategory: selectedSubcategory,
        micro: selectedService?.micro
      };
      
      onComplete(jobData);
    } catch (error) {
      toast.error('Failed to post job');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-display font-bold text-charcoal mb-4">
                What type of work do you need?
              </h2>
              <p className="text-muted-foreground text-lg">
                Choose the category that best fits your project
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getCategories().map((category) => {
                const config = getCategoryConfig(category);
                const IconComponent = config.icon;
                
                return (
                  <Card 
                    key={category}
                    className={cn(
                      "card-luxury cursor-pointer transition-all duration-300 hover:scale-105",
                      selectedCategory === category && "ring-2 ring-copper border-copper"
                    )}
                    onClick={() => setSelectedCategory(category)}
                  >
                    <CardContent className="p-6">
                      <div className="text-center space-y-4">
                        <div className={cn(
                          "w-16 h-16 mx-auto rounded-full flex items-center justify-center",
                          `bg-gradient-to-r ${config.gradient}`
                        )}>
                          <IconComponent className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <h3 className="font-display font-semibold text-charcoal mb-2">
                            {config.name}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-3">
                            {config.description}
                          </p>
                          <Badge variant="outline" className="text-xs">
                            {config.count} services
                          </Badge>
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
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-display font-bold text-charcoal mb-4">
                What specific service do you need?
              </h2>
              <p className="text-muted-foreground text-lg">
                Select the exact type of work from <span className="text-copper font-medium">{selectedCategory}</span>
              </p>
            </div>

            <div className="space-y-6">
              {getSubcategories(selectedCategory).map((subcategory) => (
                <div key={subcategory}>
                  <h3 className="text-xl font-display font-semibold text-charcoal mb-4">
                    {subcategory}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {getMicroServices(selectedCategory, subcategory).map((service) => (
                      <Card
                        key={service.id}
                        className={cn(
                          "card-luxury cursor-pointer transition-all duration-300 hover:scale-102",
                          selectedService?.id === service.id && "ring-2 ring-copper border-copper"
                        )}
                        onClick={() => {
                          setSelectedService(service);
                          setSelectedSubcategory(subcategory);
                        }}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-charcoal mb-1">
                                {service.micro}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {selectedCategory} • {subcategory}
                              </p>
                            </div>
                            <div className="w-6 h-6 rounded-full border-2 border-muted flex items-center justify-center">
                              {selectedService?.id === service.id && (
                                <div className="w-3 h-3 rounded-full bg-copper"></div>
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
            <div className="text-center">
              <h2 className="text-3xl font-display font-bold text-charcoal mb-4">
                Tell us about your project
              </h2>
              <p className="text-muted-foreground text-lg">
                Provide details to help professionals understand your needs
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <Card className="card-luxury">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-copper" />
                      Project Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-charcoal mb-2">
                        Project Title *
                      </label>
                      <Input
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="e.g., Kitchen renovation with new tiles"
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
                        placeholder="Describe your project in detail. Include materials, size, and any specific requirements..."
                        rows={4}
                        className="mobile-optimized-input"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-charcoal mb-2">
                        Special Requirements
                      </label>
                      <Textarea
                        value={formData.requirements}
                        onChange={(e) => setFormData(prev => ({ ...prev, requirements: e.target.value }))}
                        placeholder="Access instructions, parking info, material preferences..."
                        rows={3}
                        className="mobile-optimized-input"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="card-luxury">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-copper" />
                      Location & Timeline
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
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
                          { value: 'urgent', label: 'Urgent', icon: '🔥' },
                          { value: 'this_week', label: 'This week', icon: '📅' },
                          { value: 'this_month', label: 'This month', icon: '🗓️' },
                          { value: 'flexible', label: 'Flexible', icon: '⏰' }
                        ].map((option) => (
                          <Button
                            key={option.value}
                            variant={formData.urgency === option.value ? "default" : "outline"}
                            onClick={() => setFormData(prev => ({ ...prev, urgency: option.value }))}
                            className={cn(
                              "h-auto p-3 text-left justify-start",
                              formData.urgency === option.value && "bg-gradient-hero text-white"
                            )}
                          >
                            <span className="mr-2">{option.icon}</span>
                            {option.label}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-charcoal mb-2">
                        Budget Range (Optional)
                      </label>
                      <Input
                        value={formData.budget}
                        onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
                        placeholder="e.g., €500 - €1000"
                        className="mobile-optimized-input"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="card-luxury border-copper/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Camera className="w-5 h-5 text-copper" />
                      Photos (Optional)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="border-2 border-dashed border-copper/30 rounded-lg p-6 text-center hover:border-copper/50 transition-colors">
                      <Camera className="w-8 h-8 text-copper mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground mb-3">
                        Upload photos to help professionals understand your project better
                      </p>
                      <Button variant="outline" size="sm" className="text-copper border-copper hover:bg-copper/5">
                        Choose Files
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-display font-bold text-charcoal mb-4">
                Review your project
              </h2>
              <p className="text-muted-foreground text-lg">
                Double-check everything before posting
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="card-luxury">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-copper" />
                    Project Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium text-charcoal mb-1">Service</h4>
                    <p className="text-muted-foreground">
                      {selectedService?.micro}
                    </p>
                    <Badge variant="outline" className="mt-1 text-xs">
                      {selectedCategory} • {selectedSubcategory}
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

                  {formData.requirements && (
                    <div>
                      <h4 className="font-medium text-charcoal mb-1">Requirements</h4>
                      <p className="text-muted-foreground text-sm">{formData.requirements}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="card-luxury border-copper/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-copper" />
                    Project Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Location</span>
                    <span className="text-charcoal">{formData.location || 'Not specified'}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Timeline</span>
                    <Badge variant="outline">
                      {formData.urgency.replace('_', ' ')}
                    </Badge>
                  </div>

                  {formData.budget && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Budget</span>
                      <span className="text-charcoal">{formData.budget}</span>
                    </div>
                  )}

                  <div className="pt-4 border-t">
                    <div className="bg-gradient-hero/10 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-4 h-4 text-copper" />
                        <span className="font-medium text-charcoal">Next Steps</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        After posting, qualified professionals will review your project and send you personalized quotes within 24-48 hours.
                      </p>
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

  const progressPercentage = (step / steps.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <div className="sticky-header bg-white/95 backdrop-blur-sm border-b border-sand/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onCancel}
                className="text-muted-foreground hover:text-charcoal"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div className="hidden md:flex items-center gap-2">
                <h1 className="text-xl font-display font-bold text-charcoal">
                  Post a Project
                </h1>
                <Badge variant="outline" className="text-xs">
                  Step {step} of {steps.length}
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>~5 minutes</span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <Progress value={progressPercentage} className="h-2" />
            <div className="flex justify-between mt-2">
              {steps.map((s, index) => (
                <div
                  key={s.id}
                  className={cn(
                    "flex flex-col items-center text-xs",
                    step >= s.id ? "text-charcoal" : "text-muted-foreground"
                  )}
                >
                  <div className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium mb-1",
                    step >= s.id 
                      ? "bg-gradient-hero text-white" 
                      : "bg-muted text-muted-foreground"
                  )}>
                    {s.id}
                  </div>
                  <span className="hidden sm:block">{s.title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-copper border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        ) : (
          renderStepContent()
        )}
      </div>

      {/* Footer */}
      <div className="sticky-footer bg-white/95 backdrop-blur-sm border-t border-sand/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={step === 1}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </Button>

            <div className="flex items-center gap-3">
              {step < steps.length ? (
                <Button
                  onClick={nextStep}
                  className="btn-hero flex items-center gap-2"
                  disabled={loading}
                >
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  className="btn-hero flex items-center gap-2"
                  disabled={loading}
                >
                  {loading ? 'Posting...' : 'Post Project'}
                  <Sparkles className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LuxuryJobWizard;