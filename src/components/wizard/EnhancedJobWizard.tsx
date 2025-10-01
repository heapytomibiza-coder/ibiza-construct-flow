import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, ArrowRight, MapPin, AlertCircle, CheckCircle, Sparkles, Camera
} from 'lucide-react';
import { useServicesRegistry } from '@/contexts/ServicesRegistry';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import Cascader from '@/components/common/Cascader';
import { useWizard } from '@/features/wizard/useWizard';
import { AIQuestionRenderer } from '@/components/ai/AIQuestionRenderer';
import { WizardCompletePayload } from '@/lib/contracts';
import { RequirementsGathering } from './RequirementsGathering';

interface JobWizardProps {
  onComplete: (jobData: any) => void;
  onCancel: () => void;
}

const EnhancedJobWizard = ({ onComplete, onCancel }: JobWizardProps) => {
  const wizard = useWizard();
  const { services } = useServicesRegistry();
  const [loading, setLoading] = useState(false);
  const [requirements, setRequirements] = useState({
    scope: '',
    timeline: '',
    budgetRange: '',
    constraints: '',
    materials: '',
    specifications: {},
    referenceImages: []
  });

  const steps = [
    { id: 1, title: 'Service', desc: 'What do you need?' },
    { id: 2, title: 'Details', desc: 'Tell us about your project' },
    { id: 3, title: 'Review', desc: 'Confirm & post' }
  ];


  const nextStep = () => {
    if (wizard.state.step === 1 && !wizard.state.serviceId) {
      toast.error('Please select a service');
      return;
    }
    if (wizard.state.step === 2 && !wizard.state.title) {
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
    
    wizard.nextStep();
  };

  const handleSubmit = async () => {
    setLoading(true);
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
        
        // Project requirements (replaces menu board)
        requirements,
        
        // Structured answers
        microAnswers: wizard.state.microAnswers,
        logisticsAnswers: wizard.state.generalAnswers,
        generalAnswers: wizard.state.generalAnswers
      };
      
      onComplete(jobData);
    } catch (error) {
      console.error('Submission error:', error);
      toast.error('Failed to post job');
    } finally {
      setLoading(false);
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
                Select from our service categories to get started
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
                Tell us about your project
              </h3>
              <p className="text-muted-foreground">
                Provide details to help professionals give you accurate quotes
              </p>
            </div>

            <div className="space-y-6">
              {/* Basic Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Project Title *</label>
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
                      placeholder="Describe what you need done..."
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Location</label>
                      <div className="relative">
                        <Input
                          value={wizard.state.generalAnswers?.location || ''}
                          onChange={(e) => wizard.updateState({ 
                            generalAnswers: { ...wizard.state.generalAnswers, location: e.target.value }
                          })}
                          placeholder="City or postal code"
                        />
                        <MapPin className="absolute right-3 top-2.5 w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Timeline</label>
                      <div className="grid grid-cols-2 gap-2">
                        {['Urgent', 'This week', 'This month', 'Flexible'].map((option) => (
                          <Button
                            key={option}
                            size="sm"
                            variant={wizard.state.generalAnswers?.urgency === option.toLowerCase() ? "default" : "outline"}
                            onClick={() => {
                              wizard.updateState({ 
                                generalAnswers: { ...wizard.state.generalAnswers, urgency: option.toLowerCase() }
                              });
                              setRequirements(prev => ({ ...prev, timeline: option }));
                            }}
                          >
                            {option}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Service-Specific Questions */}
              {wizard.microQuestions.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-copper" />
                      Quick Questions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {wizard.loading ? (
                      <div className="text-center py-4">
                        <Sparkles className="w-6 h-6 text-copper mx-auto mb-2 animate-pulse" />
                        <p className="text-sm text-muted-foreground">Loading questions...</p>
                      </div>
                    ) : (
                      <AIQuestionRenderer
                        questions={wizard.microQuestions}
                        answers={wizard.state.microAnswers}
                        onAnswerChange={(questionId, answer) => {
                          wizard.updateState({ 
                            microAnswers: { ...wizard.state.microAnswers, [questionId]: answer }
                          });
                        }}
                      />
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Project Requirements - Simplified */}
              <Card>
                <CardHeader>
                  <CardTitle>Project Requirements</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Budget Range</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {['$0-$500', '$500-$2k', '$2k-$5k', '$5k+'].map((range) => (
                        <Button
                          key={range}
                          size="sm"
                          variant={requirements.budgetRange === range ? "default" : "outline"}
                          onClick={() => setRequirements(prev => ({ ...prev, budgetRange: range }))}
                        >
                          {range}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Additional Details (Optional)</label>
                    <Textarea
                      value={requirements.scope}
                      onChange={(e) => setRequirements(prev => ({ ...prev, scope: e.target.value }))}
                      placeholder="Any specific requirements, materials, or constraints?"
                      rows={2}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-display font-bold text-foreground mb-2">
                Review & Post Your Job
              </h3>
              <p className="text-muted-foreground">
                Everything look good? Your job will be sent to qualified professionals
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Service & Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Service</h4>
                    <p className="text-sm">
                      {wizard.state.category} → {wizard.state.subcategory} → {wizard.state.microService}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Title</h4>
                    <p className="text-sm font-medium">{wizard.state.title}</p>
                  </div>
                  
                  {wizard.state.description && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">Description</h4>
                      <p className="text-sm">{wizard.state.description}</p>
                    </div>
                  )}
                  
                  <div className="flex gap-2 flex-wrap">
                    {wizard.state.generalAnswers?.location && (
                      <Badge variant="outline">
                        <MapPin className="w-3 h-3 mr-1" />
                        {wizard.state.generalAnswers.location}
                      </Badge>
                    )}
                    {wizard.state.generalAnswers?.urgency && (
                      <Badge variant="outline">{wizard.state.generalAnswers.urgency}</Badge>
                    )}
                    {requirements.budgetRange && (
                      <Badge variant="outline">{requirements.budgetRange}</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>What Happens Next</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium text-sm mb-1">Matched with Pros</h4>
                        <p className="text-xs text-muted-foreground">
                          Your job is matched with qualified professionals in your area
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium text-sm mb-1">Receive Quotes</h4>
                        <p className="text-xs text-muted-foreground">
                          Get detailed quotes within 24-48 hours
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium text-sm mb-1">Hire & Complete</h4>
                        <p className="text-xs text-muted-foreground">
                          Compare quotes, chat with pros, and hire the best one
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {Object.keys(wizard.state.microAnswers).length > 0 && (
              <Card className="bg-muted/30">
                <CardHeader>
                  <CardTitle className="text-sm">Additional Details Provided</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(wizard.state.microAnswers).slice(0, 4).map(([key, value]) => (
                      <div key={key} className="text-xs">
                        <span className="text-muted-foreground">{key}: </span>
                        <span className="font-medium">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
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
            <Progress value={(wizard.state.step / 3) * 100} className="w-full" />
            <div className="flex justify-between">
              {steps.map((s) => (
                <div key={s.id} className="flex items-center gap-2">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                    wizard.state.step >= s.id 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-muted text-muted-foreground"
                  )}>
                    {wizard.state.step > s.id ? <CheckCircle className="w-5 h-5" /> : s.id}
                  </div>
                  <div className="hidden md:block">
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
        <div className="flex justify-between items-center">
          <Button 
            variant="outline" 
            onClick={prevStep}
            disabled={wizard.state.step === 1}
            size="lg"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          {wizard.state.step === 3 ? (
            <Button 
              onClick={handleSubmit}
              disabled={wizard.loading}
              size="lg"
              className="bg-gradient-hero hover:bg-copper text-white"
            >
              {wizard.loading ? 'Posting Job...' : 'Post My Job'}
              <CheckCircle className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button 
              onClick={nextStep}
              size="lg"
              className="bg-gradient-hero hover:bg-copper text-white"
            >
              Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedJobWizard;