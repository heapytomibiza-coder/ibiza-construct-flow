import React, { useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, Check, Wrench, Settings, Star } from 'lucide-react';
import { useWizard } from '@/features/wizard/useWizard';
import TwoSectionQuestionsStep from '@/features/wizard/TwoSectionQuestionsStep';
import { AIQuestionRenderer } from '@/components/ai/AIQuestionRenderer';
import { AIPriceEstimate } from '@/components/ai/AIPriceEstimate';
import { LocationStep } from '@/components/wizard/LocationStep';
import { JobTemplateManager } from '@/components/smart/JobTemplateManager';
import { SimpleJobTemplateManager } from '@/components/smart/SimpleJobTemplateManager';
import { ResumeJobModal } from '@/components/smart/ResumeJobModal';
import { SmartPricingHints } from '@/components/smart/SmartPricingHints';
import { MatchingFeedback } from '@/components/smart/MatchingFeedback';
import CalendarFirstWizard from '@/components/wizard/CalendarFirstWizard';
import { JobSummary } from '@/components/services/JobSummary';
import { useEnhancedAutosave } from '@/hooks/useEnhancedAutosave';
import { useFeature } from '@/contexts/FeatureFlagsContext';
import { MobileCalendarWizard } from '@/components/mobile/MobileCalendarWizard';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from 'sonner';

const PostJob: React.FC = () => {
  const { t } = useTranslation('wizard');
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [showResumeModal, setShowResumeModal] = React.useState(false);
  const [savedSession, setSavedSession] = React.useState<any>(null);
  const calendarFirstEnabled = useFeature('wizard_calendar_first');
  const [useCalendarWizard, setUseCalendarWizard] = React.useState(false);
  const isMobile = useIsMobile();
  
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

  // Enhanced autosave with session restoration
  const {
    checkForSavedSession,
    saveWithAnalytics,
    clearSession
  } = useEnhancedAutosave({
    formType: 'job-posting-wizard',
    wizardState: state,
    onSessionRestored: (sessionData) => {
      setSavedSession(sessionData);
      setShowResumeModal(true);
    }
  });

  useEffect(() => {
    loadServices();
    
    // Decide which wizard to use based on feature flag and URL params
    const calendarFirst = searchParams.get('calendar') === 'true' || calendarFirstEnabled;
    setUseCalendarWizard(calendarFirst);
    
    // Check for template data from navigation state
    if (location.state?.templateData) {
      handleLoadTemplate(location.state.templateData);
      // Clear the location state to prevent re-loading on refresh
      window.history.replaceState({}, document.title);
      toast.success(t('messages.templateLoaded'));
    }
    
    // Check for saved session on component mount
    const initializeSavedSession = async () => {
      const session = await checkForSavedSession();
      if (session) {
        setSavedSession(session);
        setShowResumeModal(true);
      }
    };
    
    initializeSavedSession();
  }, [loadServices, checkForSavedSession, location.state, searchParams, calendarFirstEnabled]);

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
      // Clear saved session after successful submission
      await clearSession();
      toast.success(t('messages.jobPostedSuccess'));
      navigate('/dashboard/client');
    } else {
      toast.error(error || t('messages.jobPostFailed'));
    }
  };

  const handleCalendarWizardComplete = async (jobData: any) => {
    // Convert calendar wizard data to standard format
    const standardJobData = {
      category: jobData.serviceId ? 'Selected Service' : state.category,
      subcategory: state.subcategory,
      serviceId: jobData.serviceId,
      microService: state.microService,
      title: jobData.title || state.title,
      generalAnswers: {
        ...state.generalAnswers,
        ...jobData,
        location: jobData.location,
        urgency: jobData.isFlexible ? 'flexible' : 'specific-date'
      },
      microAnswers: state.microAnswers,
      selectedItems: jobData.selectedItems,
      totalEstimate: jobData.totalEstimate,
      scheduledDate: jobData.scheduledDate
    };

    // Submit using existing logic
    updateState(standardJobData);
    const success = await submitBooking();
    if (success) {
      await clearSession();
      toast.success(t('messages.jobPostedSuccess'));
      navigate('/dashboard/client');
    } else {
      toast.error(t('messages.jobPostFailed'));
    }
  };

  const handleLoadTemplate = (templateData: any) => {
    updateState(templateData);
    if (templateData.category) {
      // Find service ID from template data
      const services = getCategories().map(cat => 
        getSubcategories(cat).map(subcat =>
          getMicroServices(cat, subcat)
        )
      ).flat(2);
      
      const service = services.find(s => 
        s.category === templateData.category &&
        s.subcategory === templateData.subcategory &&
        s.micro === templateData.microService
      );
      
      if (service) {
        updateState({ serviceId: service.id });
        // Navigate to appropriate step based on template completeness
        const targetStep = templateData.generalAnswers?.location ? 6 : 5;
        updateState({ step: targetStep });
      }
    }
  };

  const handleResumeSession = (sessionData: any) => {
    updateState(sessionData);
    setShowResumeModal(false);
    toast.success(t('messages.resumedSession'));
  };

  const handleStartFresh = async () => {
    await clearSession();
    setShowResumeModal(false);
    toast.info(t('messages.startingFresh'));
  };

  const handleOptimizationSuggestion = (type: string, value: any) => {
    switch (type) {
      case 'timing':
        handleGeneralAnswerChange('urgency', value);
        break;
      case 'budget':
        handleGeneralAnswerChange('budget', value);
        break;
      default:
        break;
    }
    toast.success(t('messages.optimizationApplied'));
  };

  const renderStepContent = () => {
    switch (state.step) {
      case 1:
        // Category Selection
        const categories = getCategories();
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-semibold">{t('steps.category.title')}</h2>
              <p className="text-muted-foreground">{t('steps.category.subtitle')}</p>
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
                      <p className="text-sm text-muted-foreground">{t('steps.category.professionalServices')}</p>
                    </div>
                  </div>
                </Card>
              ))}
              
              {/* Transport and Deliveries */}
              <Card 
                className="p-6 cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-primary/20"
                onClick={() => handleCategorySelect('Transport & Deliveries')}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Wrench className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">{t('steps.category.transportDeliveries')}</h3>
                    <p className="text-sm text-muted-foreground">{t('steps.category.movingDeliveryServices')}</p>
                  </div>
                </div>
              </Card>
            </div>
            
            {/* Job Templates */}
            <div className="text-center mb-6 pb-6 border-b border-border/50">
              <p className="text-sm text-muted-foreground mb-3">
                {t('steps.category.cantFind')}
              </p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/specialist-categories')}
              >
                {t('steps.category.browseSpecialized')}
              </Button>
            </div>

            <SimpleJobTemplateManager
              onLoadTemplate={handleLoadTemplate}
              currentWizardData={state}
              className="mt-6"
            />
          </div>
        );

      case 2:
        // Subcategory Selection
        const subcategories = getSubcategories(state.category);
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-semibold">{t('steps.subcategory.title')}</h2>
              <p className="text-muted-foreground">
                {t('steps.subcategory.category')} <Badge variant="secondary">{state.category}</Badge>
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
                      <p className="text-sm text-muted-foreground">{t('steps.subcategory.specializedWork')}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            
            <div className="flex justify-start pt-4">
              <Button variant="outline" onClick={prevStep}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('steps.subcategory.back')}
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
              <h2 className="text-2xl font-semibold">{t('steps.microservice.title')}</h2>
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
                {t('steps.microservice.back')}
              </Button>
            </div>
          </div>
        );

      case 4:
        // Service-Specific Questions Step with AI
        return (
          <div className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-semibold">{t('steps.details.title', { service: state.microService })}</h2>
                <div className="text-muted-foreground flex items-center justify-center gap-2">
                  <div className="flex items-center gap-1">
                    <div className="h-2 w-2 bg-primary rounded-full animate-bounce"></div>
                    <div className="h-2 w-2 bg-primary/70 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="h-2 w-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  {t('steps.details.loading')}
                </div>
              </div>
            
            {/* AI-Generated Questions */}
            <AIQuestionRenderer
              questions={questions}
              answers={state.microAnswers || {}}
              onAnswerChange={handleMicroAnswerChange}
            />
            
            {/* Basic Job Information */}
            <Card className="p-6">
              <h3 className="font-medium mb-4">{t('steps.details.jobDetails')}</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">{t('steps.details.jobTitle')}</label>
                  <input
                    type="text"
                    placeholder={t('steps.details.jobTitlePlaceholder')}
                    value={state.generalAnswers.title || state.microService}
                    onChange={(e) => handleGeneralAnswerChange('title', e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
            </Card>
            
            <div className="flex justify-between pt-6">
              <Button variant="outline" onClick={prevStep}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('steps.details.back')}
              </Button>
              <Button 
                onClick={nextStep}
                disabled={!state.generalAnswers.title}
              >
                {t('steps.details.continue')}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        );

      case 5:
        // Location & Timing Step with Visual Chips
        return (
          <div className="space-y-6">
            <LocationStep
              answers={state.generalAnswers}
              onAnswerChange={handleGeneralAnswerChange}
              selectedService={state.microService}
            />

            {/* Smart Pricing Hints */}
            <SmartPricingHints
              category={state.category}
              subcategory={state.subcategory}
              microService={state.microService}
              location={state.generalAnswers?.location}
              currentBudget={state.generalAnswers?.budget}
              onBudgetSuggestion={(budget) => handleGeneralAnswerChange('budget', budget)}
            />

            {/* Matching Feedback */}
            <MatchingFeedback
              wizardState={state}
              onOptimizationSuggestion={handleOptimizationSuggestion}
            />
            
            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={prevStep}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('steps.requirements.back')}
              </Button>
              <Button 
                onClick={async () => {
                  await generatePriceEstimate();
                  nextStep();
                }}
                disabled={!state.generalAnswers.location || !state.generalAnswers.urgency}
              >
                {t('steps.requirements.continueToReview')}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        );

      case 6:
        // Review Step with AI Price Estimate
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-semibold">{t('steps.review.title')}</h2>
              <p className="text-muted-foreground">{t('steps.review.subtitle')}</p>
            </div>

            {/* AI Price Estimate */}
            {priceEstimate && (
              <AIPriceEstimate estimate={priceEstimate} />
            )}

            <Card className="p-6">
              <h3 className="font-semibold mb-4">{t('steps.review.jobSummary')}</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">{t('steps.review.service')}</label>
                  <div className="flex gap-2 mt-1">
                    <Badge>{state.category}</Badge>
                    <Badge>{state.subcategory}</Badge>
                    <Badge variant="outline">{state.microService}</Badge>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">{t('steps.review.title')}</label>
                  <p className="mt-1">{state.title}</p>
                </div>

                {state.generalAnswers.description && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">{t('steps.review.description')}</label>
                    <p className="mt-1 text-sm">{state.generalAnswers.description}</p>
                  </div>
                )}

                {state.generalAnswers.budget && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">{t('steps.review.budgetRange')}</label>
                    <p className="mt-1">{state.generalAnswers.budget}</p>
                  </div>
                )}

                {/* AI-Generated Question Responses */}
                {state.microAnswers && Object.keys(state.microAnswers).length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">{t('steps.review.aiQuestionsAnswers')}</label>
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
                    <label className="text-sm font-medium text-muted-foreground">{t('steps.review.urgency')}</label>
                    <p className="mt-1 capitalize">{state.generalAnswers.urgency.replace('-', ' ')}</p>
                  </div>
                )}
              </div>
            </Card>

            <div className="flex justify-between pt-6">
              <Button variant="outline" onClick={prevStep}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('steps.review.backToEdit')}
              </Button>
              <Button onClick={handleSubmit} disabled={loading} className="min-w-[120px]">
                {loading ? t('steps.review.posting') : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    {t('steps.review.postJob')}
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
          <h1 className="text-2xl font-semibold text-destructive mb-4">{t('errors.title')}</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={() => navigate('/dashboard/client')}>
            {t('errors.goToDashboard')}
          </Button>
        </div>
      </div>
    );
  }

  // Conditionally render wizard based on feature flag and mobile
  // Use mobile calendar wizard if on mobile and calendar-first is enabled
  if ((calendarFirstEnabled || searchParams.get('calendar') === 'true') && isMobile) {
    return (
      <MobileCalendarWizard
        onComplete={handleCalendarWizardComplete}
        onCancel={() => navigate('/')}
      />
    );
  }

  // Conditionally render wizard based on feature flag
  if (useCalendarWizard) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <div className="container mx-auto px-4 py-8">
          <CalendarFirstWizard
            onComplete={handleCalendarWizardComplete}
            onCancel={() => navigate('/dashboard/client')}
          />
        </div>
        
        {/* Resume Modal */}
        {showResumeModal && savedSession && (
          <ResumeJobModal
            isOpen={showResumeModal}
            savedSession={savedSession}
            onResumeSession={handleResumeSession}
            onStartFresh={handleStartFresh}
            onClose={() => setShowResumeModal(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Resume Session Modal */}
        <ResumeJobModal
          isOpen={showResumeModal}
          onClose={() => setShowResumeModal(false)}
          onResumeSession={handleResumeSession}
          onStartFresh={handleStartFresh}
          savedSession={savedSession}
        />
          {/* Progress indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6 max-w-3xl mx-auto">
              {[
                { step: 1, label: t('navigation.progressLabels.category') },
                { step: 2, label: t('navigation.progressLabels.service') },
                { step: 3, label: t('navigation.progressLabels.details') },
                { step: 4, label: t('navigation.progressLabels.aiQuestions') },
                { step: 5, label: t('navigation.progressLabels.requirements') },
                { step: 6, label: t('navigation.progressLabels.review') }
              ].map(({ step, label }, index) => (
                <div key={step} className="flex flex-col items-center flex-1">
                  <div className="flex items-center w-full">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors
                      ${state.step >= step 
                        ? 'bg-primary text-primary-foreground shadow-sm' 
                        : 'bg-muted text-muted-foreground'
                      }`}>
                      {state.step > step ? <Check className="w-5 h-5" /> : step}
                    </div>
                    {index < 5 && (
                      <div className={`flex-1 h-0.5 mx-3 transition-colors ${
                        state.step > step ? 'bg-primary' : 'bg-muted'
                      }`} />
                    )}
                  </div>
                  <p className={`text-xs mt-2 text-center transition-colors ${
                    state.step >= step ? 'text-primary font-medium' : 'text-muted-foreground'
                  }`}>
                    {label}
                  </p>
                </div>
              ))}
            </div>
            <p className="text-center text-sm text-muted-foreground">
              {t('navigation.stepCounter', { 
                current: state.step, 
                total: 6, 
                description: state.step === 1 ? t('navigation.stepDescriptions.chooseCategory') :
                            state.step === 2 ? t('navigation.stepDescriptions.selectService') :
                            state.step === 3 ? t('navigation.stepDescriptions.pickDetails') :
                            state.step === 4 ? t('navigation.stepDescriptions.aiQuestionsBasicInfo') :
                            state.step === 5 ? t('navigation.stepDescriptions.answerRequirements') :
                            t('navigation.stepDescriptions.reviewPost')
              })}
            </p>
        </div>

        {/* Step content */}
        {renderStepContent()}
      </div>
    </div>
  );
};

export default PostJob;