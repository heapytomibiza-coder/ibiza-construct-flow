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
    { id: 1, title: 'Service Selection', desc: 'Choose your service' },
    { id: 2, title: 'Micro Questions', desc: 'Service-specific details' },
    { id: 3, title: 'Requirements', desc: 'Project scope & details' },
    { id: 4, title: 'Details', desc: 'Location & logistics' },
    { id: 5, title: 'Review', desc: 'Confirm & post' }
  ];


  const nextStep = () => {
    if (wizard.state.step === 1 && !wizard.state.serviceId) {
      toast.error('Please select a service');
      return;
    }
    if (wizard.state.step === 2 && Object.keys(wizard.state.microAnswers).length === 0) {
      toast.error('Please answer the service-specific questions');
      return;
    }
    if (wizard.state.step === 3 && !requirements.timeline && !requirements.budgetRange) {
      toast.error('Please provide timeline and budget range');
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
                Project Requirements
              </h3>
              <p className="text-muted-foreground">
                Help professionals understand exactly what you need
              </p>
            </div>

            <RequirementsGathering
              requirements={requirements}
              onUpdate={setRequirements}
            />
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
                    <h4 className="font-medium mb-2">Service Questions</h4>
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
                    <h4 className="font-medium mb-2">Requirements</h4>
                    <div className="space-y-2 text-sm">
                      {requirements.scope && (
                        <div>
                          <span className="text-muted-foreground">Scope: </span>
                          <span>{requirements.scope}</span>
                        </div>
                      )}
                      {requirements.timeline && (
                        <div>
                          <Badge variant="outline">{requirements.timeline}</Badge>
                        </div>
                      )}
                      {requirements.budgetRange && (
                        <div>
                          <Badge variant="outline">{requirements.budgetRange}</Badge>
                        </div>
                      )}
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