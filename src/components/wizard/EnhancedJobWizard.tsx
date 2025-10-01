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
  Sparkles, Calculator, Target, X
} from 'lucide-react';
import { useServicesRegistry } from '@/contexts/ServicesRegistry';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import Cascader from '@/components/common/Cascader';
import { useWizard } from '@/features/wizard/useWizard';
import { AIQuestionRenderer } from '@/components/ai/AIQuestionRenderer';
import { WizardCompletePayload } from '@/lib/contracts';

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
  const wizard = useWizard();
  const { services } = useServicesRegistry();
  const [serviceItems, setServiceItems] = useState<ServiceItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [totalEstimate, setTotalEstimate] = useState(0);
  const [confidence, setConfidence] = useState(85);

  const steps = [
    { id: 1, title: 'Service Selection', desc: 'Choose your service' },
    { id: 2, title: 'Micro Questions', desc: 'Service-specific details' },
    { id: 3, title: 'Menu Board', desc: 'Configure items & pricing' },
    { id: 4, title: 'Details', desc: 'Location & logistics' },
    { id: 5, title: 'Review', desc: 'Confirm & post' }
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
    if (wizard.state.step === 1 && !wizard.state.serviceId) {
      toast.error('Please select a service');
      return;
    }
    if (wizard.state.step === 2 && Object.keys(wizard.state.microAnswers).length === 0) {
      toast.error('Please answer the service-specific questions');
      return;
    }
    if (wizard.state.step === 3 && selectedItems.length === 0) {
      toast.error('Please select at least one service item');
      return;
    }
    if (wizard.state.step === 4 && !wizard.state.title) {
      toast.error('Please provide a project title');
      return;
    }
    wizard.nextStep();
  };

  const prevStep = () => wizard.prevStep();

  const handleServiceSelect = async (selection: any) => {
    if (!selection) return;
    
    const selectedService = services.find(s => 
      s.category === selection.category &&
      s.subcategory === selection.subcategory &&
      s.micro === selection.micro
    );

    if (!selectedService) {
      toast.error('Service not found');
      return;
    }

    wizard.updateState({
      category: selection.category,
      subcategory: selection.subcategory,
      microService: selection.micro,
      serviceId: selectedService.id
    });

    // Load AI questions for this service
    await wizard.loadAIQuestions(selectedService.id);
    
    // Also fetch service items for menu board
    await fetchServiceItems(selectedService.id);
    
    wizard.nextStep();
  };

  const handleSubmit = async () => {
    try {
      // Generate price estimate before submitting
      await wizard.generatePriceEstimate();

      const selectedService = services.find(s => s.id === wizard.state.serviceId);
      if (!selectedService) {
        toast.error('Service not found');
        return;
      }

      // Prepare complete payload matching WizardCompletePayload contract
      const jobData: WizardCompletePayload = {
        title: wizard.state.title,
        description: wizard.state.description,
        location: wizard.state.generalAnswers?.location || '',
        urgency: wizard.state.generalAnswers?.urgency || 'flexible',
        
        // Service identifiers
        serviceId: wizard.state.serviceId,
        microSlug: `${selectedService.category}-${selectedService.subcategory}-${selectedService.micro}`
          .toLowerCase()
          .replace(/\s+/g, '-'),
        
        // Taxonomies for display
        category: selectedService.category,
        subcategory: selectedService.subcategory,
        micro: selectedService.micro,
        
        // Menu board selections
        selectedItems: selectedItems.map(item => ({
          id: item.id,
          name: item.name,
          basePrice: item.basePrice,
          quantity: item.quantity,
          unit: item.unit,
          category: item.category
        })),
        totalEstimate,
        confidence,
        
        // Structured answers
        microAnswers: wizard.state.microAnswers,
        logisticsAnswers: wizard.state.generalAnswers,
        generalAnswers: wizard.state.generalAnswers
      };
      
      onComplete(jobData);
    } catch (error) {
      console.error('Submission error:', error);
      toast.error('Failed to post job');
    }
  };

  const renderStepContent = () => {
    switch (wizard.state.step) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-display font-bold text-foreground mb-2">
                What service do you need?
              </h3>
              <p className="text-muted-foreground">
                Select from our 12 main trades or 6 specialist categories
              </p>
            </div>
            
            <Cascader 
              onChange={handleServiceSelect}
            />
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-display font-bold text-foreground mb-2">
                Service-Specific Questions
              </h3>
              <p className="text-muted-foreground">
                Help us understand your {wizard.state.microService} needs
              </p>
            </div>

            {wizard.loading ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Sparkles className="w-8 h-8 text-copper mx-auto mb-2 animate-pulse" />
                  <p className="text-muted-foreground">Loading AI-powered questions...</p>
                </CardContent>
              </Card>
            ) : wizard.microQuestions.length > 0 ? (
              <AIQuestionRenderer
                questions={wizard.microQuestions}
                answers={wizard.state.microAnswers}
                onAnswerChange={(questionId, answer) => {
                  wizard.updateState({ 
                    microAnswers: { ...wizard.state.microAnswers, [questionId]: answer }
                  });
                }}
              />
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No specific questions for this service</p>
                  <Button onClick={nextStep} className="mt-4">Continue</Button>
                </CardContent>
              </Card>
            )}
          </div>
        );

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
                    value={wizard.state.title}
                    onChange={(e) => wizard.updateState({ title: e.target.value })}
                    placeholder="e.g., Kitchen renovation"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <Textarea
                    value={wizard.state.description}
                    onChange={(e) => wizard.updateState({ description: e.target.value })}
                    placeholder="Describe your project in detail..."
                    rows={4}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Location</label>
                  <div className="relative">
                    <Input
                      value={wizard.state.generalAnswers?.location || ''}
                      onChange={(e) => wizard.updateState({ 
                        generalAnswers: { ...wizard.state.generalAnswers, location: e.target.value }
                      })}
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
                        variant={wizard.state.generalAnswers?.urgency === option.toLowerCase() ? "default" : "outline"}
                        onClick={() => wizard.updateState({ 
                          generalAnswers: { ...wizard.state.generalAnswers, urgency: option.toLowerCase() }
                        })}
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
                    <h4 className="font-medium mb-2">Service</h4>
                    <p className="text-sm text-muted-foreground">
                      {wizard.state.category} → {wizard.state.subcategory} → {wizard.state.microService}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Micro Questions Answered</h4>
                    <div className="space-y-1">
                      {Object.entries(wizard.state.microAnswers).map(([key, value]) => (
                        <div key={key} className="text-sm">
                          <span className="text-muted-foreground">{key}: </span>
                          <span>{String(value)}</span>
                        </div>
                      ))}
                    </div>
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
                    <p className="text-sm text-muted-foreground">{wizard.state.title}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-1">Description</h4>
                    <p className="text-sm text-muted-foreground">{wizard.state.description}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-1">Location</h4>
                    <p className="text-sm text-muted-foreground">{wizard.state.generalAnswers?.location}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-1">Timeline</h4>
                    <Badge variant="outline">{wizard.state.generalAnswers?.urgency || 'Flexible'}</Badge>
                  </div>
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
            <Progress value={(wizard.state.step / 5) * 100} className="w-full" />
            <div className="flex justify-between">
              {steps.map((s) => (
                <div key={s.id} className="flex items-center gap-2">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                    wizard.state.step >= s.id 
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
            disabled={wizard.state.step === 1}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          
          {wizard.state.step < 5 ? (
            <Button onClick={nextStep}>
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button 
              onClick={handleSubmit}
              disabled={wizard.loading}
              className="bg-gradient-hero text-white"
            >
              {wizard.loading ? 'Posting...' : 'Post Job'}
              <CheckCircle className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedJobWizard;