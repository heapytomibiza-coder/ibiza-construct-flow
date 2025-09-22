import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, Check, Wrench, Settings, Star } from 'lucide-react';
import { useWizard } from '@/features/wizard/useWizard';
import TwoSectionQuestionsStep from '@/features/wizard/TwoSectionQuestionsStep';
import { AIQuestionRenderer } from '@/components/ai/AIQuestionRenderer';
import { AIPriceEstimate } from '@/components/ai/AIPriceEstimate';
import { toast } from 'sonner';

const PostJob: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    state,
    loading,
    error,
    priceEstimate,
    updateState,
    nextStep,
    prevStep,
    submitBooking,
    loadServices,
    loadQuestions,
    loadAIQuestions,
    generatePriceEstimate,
    getCategories,
    getSubcategories,
    getMicroServices,
    questions,
    clearAIData
  } = useWizard();

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  // Handle URL parameters for pre-filling wizard
  useEffect(() => {
    const category = searchParams.get('category');
    const preset = searchParams.get('preset');
    const packageParam = searchParams.get('package');
    const express = searchParams.get('express') === 'true';
    
    if (category && state.step === 1) {
      handleCategorySelect(category);
      
      // If it's express mode or has preset, pre-fill some answers
      if (preset) {
        updateState({ 
          title: preset,
          generalAnswers: { 
            ...state.generalAnswers, 
            title: preset,
            express: express 
          }
        });
      }
      
      if (packageParam) {
        updateState({
          generalAnswers: {
            ...state.generalAnswers,
            package: packageParam
          }
        });
      }
    }
  }, [searchParams, state.step]);

  useEffect(() => {
    if (state.serviceId) {
      loadQuestions(state.serviceId);
    }
  }, [state.serviceId, loadQuestions]);

  const handleCategorySelect = (category: string) => {
    updateState({ category, subcategory: '', serviceId: '', microService: '' });
    nextStep();
  };

  const handleSubcategorySelect = (subcategory: string) => {
    updateState({ subcategory, serviceId: '', microService: '' });
    nextStep();
  };

  const handleMicroServiceSelect = async (service: any) => {
    updateState({ 
      serviceId: service.id, 
      microService: service.micro,
      title: service.micro // Pre-fill title
    });
    nextStep();
    
    // Load AI-generated questions for better contextual experience
    // Use setTimeout to avoid blocking the UI transition
    setTimeout(() => {
      loadAIQuestions(service.id);
    }, 100);
  };

  const handleGeneralAnswerChange = (questionId: string, value: any) => {
    updateState({ 
      generalAnswers: { ...state.generalAnswers, [questionId]: value }
    });
    
    // Auto-update title and budget if they're answered
    if (questionId === 'title') {
      updateState({ title: value });
    }
    if (questionId === 'budget') {
      updateState({ budgetRange: value });
    }
  };

  const handleMicroAnswerChange = (questionId: string, value: any) => {
    updateState({ 
      microAnswers: { ...state.microAnswers, [questionId]: value }
    });
  };

  const handleSubmit = async () => {
    const success = await submitBooking();
    if (success) {
      toast.success('Job posted successfully!');
      navigate('/dashboard/client');
    } else {
      toast.error(error || 'Failed to post job');
    }
  };

  const renderStepContent = () => {
    switch (state.step) {
      case 1:
        // Category Selection
        const categories = getCategories();
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-semibold">What type of work do you need?</h2>
              <p className="text-muted-foreground">Choose the category that best fits your project</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categories.map((category) => (
                <Card 
                  key={category}
                  className="p-6 cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-primary/20"
                  onClick={() => handleCategorySelect(category)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Wrench className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">{category}</h3>
                      <p className="text-sm text-muted-foreground">Professional services</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );

      case 2:
        // Subcategory Selection
        const subcategories = getSubcategories(state.category);
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-semibold">What specific service do you need?</h2>
              <p className="text-muted-foreground">
                Category: <Badge variant="secondary">{state.category}</Badge>
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {subcategories.map((subcategory) => (
                <Card 
                  key={subcategory}
                  className="p-6 cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-primary/20"
                  onClick={() => handleSubcategorySelect(subcategory)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Settings className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">{subcategory}</h3>
                      <p className="text-sm text-muted-foreground">Specialized work</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            
            <div className="flex justify-start pt-4">
              <Button variant="outline" onClick={prevStep}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </div>
          </div>
        );

      case 3:
        // Micro Service Selection
        const microServices = getMicroServices(state.category, state.subcategory);
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-semibold">Exactly what needs to be done?</h2>
              <div className="flex justify-center gap-2">
                <Badge variant="secondary">{state.category}</Badge>
                <Badge variant="secondary">{state.subcategory}</Badge>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {microServices.map((service) => (
                <Card 
                  key={service.id}
                  className="p-4 cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-primary/20"
                  onClick={() => handleMicroServiceSelect(service)}
                >
                  <div className="text-center space-y-2">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                      <Star className="w-4 h-4 text-primary" />
                    </div>
                    <h3 className="font-medium text-sm">{service.micro}</h3>
                  </div>
                </Card>
              ))}
            </div>
            
            <div className="flex justify-start pt-4">
              <Button variant="outline" onClick={prevStep}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </div>
          </div>
        );

      case 4:
        // Service-Specific Questions Step with AI
        return (
          <div className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-semibold">Tell us more about your {state.microService}</h2>
                <div className="text-muted-foreground">AI-generated questions tailored to your specific needs</div>
              </div>
            
            {/* AI-Generated Questions */}
            <AIQuestionRenderer
              questions={questions}
              answers={state.microAnswers || {}}
              onAnswerChange={handleMicroAnswerChange}
            />
            
            {/* Basic Job Information */}
            <Card className="p-6">
              <h3 className="font-medium mb-4">Job Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Job Title</label>
                  <input
                    type="text"
                    placeholder="e.g., Replace kitchen tiles"
                    value={state.generalAnswers.title || state.microService}
                    onChange={(e) => handleGeneralAnswerChange('title', e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Budget Range (Optional)</label>
                  <select
                    value={state.generalAnswers.budget || ''}
                    onChange={(e) => handleGeneralAnswerChange('budget', e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="">Select budget range</option>
                    <option value="under-100">Under €100</option>
                    <option value="100-250">€100 - €250</option>
                    <option value="250-500">€250 - €500</option>
                    <option value="500-1000">€500 - €1,000</option>
                    <option value="over-1000">Over €1,000</option>
                    <option value="open">Open to proposals</option>
                  </select>
                </div>
              </div>
            </Card>
            
            <div className="flex justify-between pt-6">
              <Button variant="outline" onClick={prevStep}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button 
                onClick={nextStep}
                disabled={!state.generalAnswers.title}
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        );

      case 5:
        // Questions Step
        return (
          <TwoSectionQuestionsStep
            generalAnswers={state.generalAnswers}
            microAnswers={state.microAnswers}
            microQuestions={questions}
            onGeneralChange={handleGeneralAnswerChange}
            onMicroChange={handleMicroAnswerChange}
            onNext={async () => {
              await generatePriceEstimate();
              nextStep();
            }}
            onBack={prevStep}
          />
        );

      case 6:
        // Review Step with AI Price Estimate
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-semibold">Review your job post</h2>
              <p className="text-muted-foreground">AI-powered insights and final review</p>
            </div>

            {/* AI Price Estimate */}
            {priceEstimate && (
              <AIPriceEstimate estimate={priceEstimate} />
            )}

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Job Summary</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Service</label>
                  <div className="flex gap-2 mt-1">
                    <Badge>{state.category}</Badge>
                    <Badge>{state.subcategory}</Badge>
                    <Badge variant="outline">{state.microService}</Badge>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Title</label>
                  <p className="mt-1">{state.title}</p>
                </div>

                {state.generalAnswers.description && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Description</label>
                    <p className="mt-1 text-sm">{state.generalAnswers.description}</p>
                  </div>
                )}

                {state.generalAnswers.budget && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Budget Range</label>
                    <p className="mt-1">{state.generalAnswers.budget}</p>
                  </div>
                )}

                {/* AI-Generated Question Responses */}
                {state.microAnswers && Object.keys(state.microAnswers).length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">AI Questions & Answers</label>
                    <div className="mt-2 space-y-1">
                      {Object.entries(state.microAnswers).map(([key, value]) => (
                        <div key={key} className="text-sm bg-blue-50 p-2 rounded">
                          <span className="font-medium capitalize">{key.replace(/_/g, ' ')}:</span> {String(value)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {state.generalAnswers.urgency && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Urgency</label>
                    <p className="mt-1 capitalize">{state.generalAnswers.urgency.replace('-', ' ')}</p>
                  </div>
                )}
              </div>
            </Card>

            <div className="flex justify-between pt-6">
              <Button variant="outline" onClick={prevStep}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Edit
              </Button>
              <Button onClick={handleSubmit} disabled={loading} className="min-w-[120px]">
                {loading ? 'Posting...' : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Post Job
                  </>
                )}
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background pt-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-semibold text-destructive mb-4">Error</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={() => navigate('/dashboard/client')}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
          {/* Progress indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-2 mb-4">
              {[1, 2, 3, 4, 5, 6].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  ${state.step >= step 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground'
                  }`}>
                  {state.step > step ? <Check className="w-4 h-4" /> : step}
                </div>
                {step < 6 && (
                  <div className={`w-12 h-0.5 mx-2 ${
                    state.step > step ? 'bg-primary' : 'bg-muted'
                  }`} />
                )}
              </div>
            ))}
          </div>
            <p className="text-center text-sm text-muted-foreground">
              Step {state.step} of 6
            </p>
        </div>

        {/* Step content */}
        {renderStepContent()}
      </div>
    </div>
  );
};

export default PostJob;