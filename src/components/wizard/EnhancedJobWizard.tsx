import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, ArrowRight, Plus, Minus, MapPin, Calendar,
  Camera, FileText, Clock, Euro, AlertCircle, CheckCircle,
  Sparkles, Calculator, Target
} from 'lucide-react';
import { useServicesRegistry } from '@/contexts/ServicesRegistry';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import Cascader from '@/components/common/Cascader';

interface JobWizardProps {
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

const EnhancedJobWizard = ({ onComplete, onCancel }: JobWizardProps) => {
  const [step, setStep] = useState(1);
  const { services, loading: servicesLoading } = useServicesRegistry();
  const [selectedService, setSelectedService] = useState(null);
  const [serviceItems, setServiceItems] = useState<ServiceItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [totalEstimate, setTotalEstimate] = useState(0);
  const [confidence, setConfidence] = useState(85);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    urgency: 'flexible',
    budget: '',
    preferredDates: [],
    requirements: [],
    photos: []
  });

  const steps = [
    { id: 1, title: 'Service Selection', desc: 'What do you need?' },
    { id: 2, title: 'Menu Board', desc: 'Configure your project' },
    { id: 3, title: 'Details', desc: 'Location & schedule' },
    { id: 4, title: 'Review', desc: 'Confirm & post' }
  ];

  useEffect(() => {
    calculateEstimate();
  }, [selectedItems]);

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
        estimatedDuration: 60 // Default 1 hour
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
    
    // Simulate confidence calculation based on completeness
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
    if (step === 1 && !selectedService) {
      toast.error('Please select a service category');
      return;
    }
    if (step === 2 && selectedItems.length === 0) {
      toast.error('Please select at least one service item');
      return;
    }
    setStep(prev => Math.min(4, prev + 1));
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
        confidence
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
            
            <Cascader 
              onChange={(selection) => {
                if (selection) {
                  const mockService = {
                    id: selection.id,
                    category: selection.category,
                    subcategory: selection.subcategory,
                    micro: selection.micro
                  };
                  setSelectedService(mockService);
                  nextStep();
                }
              }}
            />
          </div>
        );

      case 2:
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

              {/* Selected Items & Estimate */}
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
              </div>
            </div>
          </div>
        );

      case 3:
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
                  <label className="block text-sm font-medium mb-2">Location</label>
                  <div className="relative">
                    <Input
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="Enter address or area"
                    />
                    <MapPin className="absolute right-3 top-2.5 w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Timeline</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Urgent', 'This week', 'This month', 'Flexible'].map((option) => (
                      <Button
                        key={option}
                        variant={formData.urgency === option.toLowerCase() ? "default" : "outline"}
                        onClick={() => setFormData(prev => ({ ...prev, urgency: option.toLowerCase() }))}
                        className="text-sm"
                      >
                        {option}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Additional Requirements</label>
                  <Textarea
                    placeholder="Access instructions, parking info, special considerations..."
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

      case 4:
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

                  <div className="border-t pt-4">
                    <div className="flex justify-between font-semibold">
                      <span>Total Estimate</span>
                      <span>€{totalEstimate.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-muted-foreground">
                        {confidence}% confidence
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Project Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-1">Title</h4>
                    <p className="text-sm text-muted-foreground">{formData.title || 'Not specified'}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-1">Location</h4>
                    <p className="text-sm text-muted-foreground">{formData.location || 'Not specified'}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-1">Timeline</h4>
                    <Badge variant="outline">{formData.urgency}</Badge>
                  </div>

                  {formData.description && (
                    <div>
                      <h4 className="font-medium mb-1">Description</h4>
                      <p className="text-sm text-muted-foreground">{formData.description}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card className="bg-muted/30">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-foreground mb-1">What happens next?</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Your job will be broadcast to qualified professionals in your area</li>
                      <li>• You'll receive quotes within 24-48 hours</li>
                      <li>• Compare, chat, and hire the best professional for your project</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-display font-bold text-foreground">Post a Job</h1>
              <p className="text-muted-foreground">AI-powered job creation wizard</p>
            </div>
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>

          {/* Progress */}
          <div className="space-y-4">
            <Progress value={(step / 4) * 100} className="w-full" />
            <div className="flex justify-between">
              {steps.map((s) => (
                <div key={s.id} className="flex items-center gap-2">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                    step >= s.id 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-muted text-muted-foreground"
                  )}>
                    {s.id}
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-sm font-medium">{s.title}</p>
                    <p className="text-xs text-muted-foreground">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
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
          
          {step < 4 ? (
            <Button onClick={nextStep}>
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

export default EnhancedJobWizard;