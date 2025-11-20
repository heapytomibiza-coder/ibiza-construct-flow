/**
 * PROFESSIONAL SERVICE WIZARD (v1.0)
 * 7-step wizard for professionals to create service offerings
 */
import React, { useState, useCallback, useEffect } from 'react';
import { flushSync } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

import { useIsMobile } from '@/hooks/use-mobile';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';

import { ServiceBasicsStep } from './steps/ServiceBasicsStep';
import { ServiceDetailsStep } from './steps/ServiceDetailsStep';
import { LocationCoverageStep } from './steps/LocationCoverageStep';
import { PricingStep } from './steps/PricingStep';
import { MediaProofStep } from './steps/MediaProofStep';
import { TermsStep } from './steps/TermsStep';
import { ReviewStep } from './steps/ReviewStep';

interface WizardState {
  // Basics
  category: string;
  categoryId: string;
  subcategory: string;
  subcategoryId: string;
  micro: string;
  microId: string;
  serviceName: string;
  description: string;
  
  // Details
  difficultyLevel: string;
  estimatedDurationMinutes: number;
  unitType: string;
  minQuantity: number;
  maxQuantity: number;
  
  // Location & Coverage
  baseLocation: string;
  coverageAreas: string[];
  travelRadiusKm: number;
  serviceType: 'onsite' | 'remote' | 'hybrid';
  
  // Pricing
  pricingType: string;
  basePrice: number;
  bulkDiscountThreshold: number;
  bulkDiscountPrice: number;
  
  // Media
  primaryImageUrl: string;
  galleryImages: string[];
  videoUrl: string;
  imageAltText: string;
  
  // Terms
  cancellationHours: number;
  leadTimeDays: number;
  specialRequirements: string;
  insuranceRequired: boolean;
  permitRequired: boolean;
}

const STEP_LABELS = [
  'Service Basics',
  'Details',
  'Location & Coverage',
  'Pricing',
  'Media & Proof',
  'Terms',
  'Review'
];

const TOTAL_STEPS = STEP_LABELS.length; // 7

export const ProfessionalServiceWizard: React.FC = () => {
  const navigate = useNavigate();
  const { user, isProfessional } = useAuth();
  const isMobile = useIsMobile();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [wizardState, setWizardState] = useState<WizardState>({
    category: '',
    categoryId: '',
    subcategory: '',
    subcategoryId: '',
    micro: '',
    microId: '',
    serviceName: '',
    description: '',
    difficultyLevel: 'medium',
    estimatedDurationMinutes: 60,
    unitType: 'per_job',
    minQuantity: 1,
    maxQuantity: 999,
    baseLocation: '',
    coverageAreas: [],
    travelRadiusKm: 10,
    serviceType: 'onsite',
    pricingType: 'fixed',
    basePrice: 0,
    bulkDiscountThreshold: 0,
    bulkDiscountPrice: 0,
    primaryImageUrl: '',
    galleryImages: [],
    videoUrl: '',
    imageAltText: '',
    cancellationHours: 24,
    leadTimeDays: 1,
    specialRequirements: '',
    insuranceRequired: false,
    permitRequired: false,
  });

  // Redirect if not professional
  useEffect(() => {
    if (!user || !isProfessional) {
      toast.error('You must be logged in as a professional to create services');
      navigate('/auth');
    }
  }, [user, isProfessional, navigate]);

  // Restore draft on mount
  useEffect(() => {
    const restoreDraft = async () => {
      if (!user) return;
      
      try {
        const { data } = await supabase
          .from('form_sessions')
          .select('payload')
          .eq('user_id', user.id)
          .eq('form_type', 'service_creation')
          .maybeSingle();
        
        if (data?.payload) {
          setWizardState(data.payload as unknown as WizardState);
          toast.info('Continuing from your saved draft');
        }
      } catch (err) {
        console.error('Failed to restore server draft:', err);
      }

      // Fallback to sessionStorage
      try {
        const saved = sessionStorage.getItem('serviceWizardState');
        if (saved) {
          const parsed = JSON.parse(saved);
          setWizardState(prev => ({ ...prev, ...parsed }));
        }
      } catch (err) {
        console.error('Failed to restore session draft:', err);
      }
    };
    
    restoreDraft();
  }, [user]);

  // Autosave draft (debounced)
  useEffect(() => {
    if (!user) return;
    
    const timer = setTimeout(async () => {
      try {
        await supabase
          .from('form_sessions')
          .upsert({
            user_id: user.id,
            form_type: 'service_creation',
            payload: wizardState as any
          });
      } catch (err) {
        console.error('Failed to autosave draft:', err);
      }
      
      try {
        sessionStorage.setItem('serviceWizardState', JSON.stringify(wizardState));
      } catch (err) {
        console.error('Failed to save session draft:', err);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [wizardState, user]);

  const progress = (currentStep / TOTAL_STEPS) * 100;

  const handleNext = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentStep(s => Math.min(s + 1, TOTAL_STEPS));
  }, []);
  
  const handleBack = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentStep(s => Math.max(s - 1, 1));
  }, []);

  const handleSubmit = useCallback(async (isDraft: boolean) => {
    if (!user) {
      toast.error('You must be logged in');
      return;
    }

    setLoading(true);

    try {
      // Validate required fields
      if (!isDraft) {
        if (!wizardState.serviceName || !wizardState.category || !wizardState.basePrice) {
          toast.error('Please fill in all required fields');
          setLoading(false);
          return;
        }
      }

      // Generate service_id from category-subcategory-micro
      const serviceId = `${wizardState.categoryId || 'general'}-${wizardState.subcategoryId || 'general'}-${wizardState.microId || 'service'}`;

      // Insert into professional_service_items
      const { data, error } = await supabase
        .from('professional_service_items')
        .insert({
          professional_id: user.id,
          service_id: serviceId,
          name: wizardState.serviceName,
          description: wizardState.description || null,
          category: wizardState.category || 'General',
          subcategory: wizardState.subcategory || null,
          micro: wizardState.micro || null,
          difficulty_level: wizardState.difficultyLevel || 'medium',
          estimated_duration_minutes: wizardState.estimatedDurationMinutes || 60,
          unit_type: wizardState.unitType || 'per_job',
          min_quantity: wizardState.minQuantity || 1,
          max_quantity: wizardState.maxQuantity || 999,
          pricing_type: wizardState.pricingType || 'fixed',
          base_price: wizardState.basePrice || 0,
          bulk_discount_threshold: wizardState.bulkDiscountThreshold || null,
          bulk_discount_price: wizardState.bulkDiscountPrice || null,
          primary_image_url: wizardState.primaryImageUrl || null,
          gallery_images: wizardState.galleryImages.length > 0 ? wizardState.galleryImages : null,
          video_url: wizardState.videoUrl || null,
          image_alt_text: wizardState.imageAltText || null,
          is_active: !isDraft,
        })
        .select('id')
        .single();

      if (error) throw error;

      // Clear draft after successful creation
      await supabase
        .from('form_sessions')
        .delete()
        .eq('user_id', user.id)
        .eq('form_type', 'service_creation');

      sessionStorage.removeItem('serviceWizardState');

      // Show success message
      if (isDraft) {
        toast.success('Service saved as draft');
        navigate('/dashboard/pro');
      } else {
        toast.success('🎉 Your service is now live and visible to clients!');
        navigate('/professional/services');
      }

    } catch (error: any) {
      console.error('Service creation failed:', error);
      toast.error(error.message || 'Failed to create service. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [wizardState, user, navigate]);

  const updateWizardState = useCallback((updates: Partial<WizardState>) => {
    setWizardState(prev => ({ ...prev, ...updates }));
  }, []);

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <ServiceBasicsStep
            state={wizardState}
            onUpdate={updateWizardState}
            onNext={handleNext}
          />
        );
      case 2:
        return (
          <ServiceDetailsStep
            state={wizardState}
            onUpdate={updateWizardState}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 3:
        return (
          <LocationCoverageStep
            state={wizardState}
            onUpdate={updateWizardState}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 4:
        return (
          <PricingStep
            state={wizardState}
            onUpdate={updateWizardState}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 5:
        return (
          <MediaProofStep
            state={wizardState}
            onUpdate={updateWizardState}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 6:
        return (
          <TermsStep
            state={wizardState}
            onUpdate={updateWizardState}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 7:
        return (
          <ReviewStep
            state={wizardState}
            onBack={handleBack}
            onSubmit={handleSubmit}
            loading={loading}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container max-w-4xl mx-auto px-4 py-4">
          <Breadcrumbs
            items={[
              { label: 'Dashboard', href: '/dashboard/pro' },
              { label: 'Create Service', href: '/services/new' },
            ]}
          />
          
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-2xl font-bold">Create New Service</h1>
              <Badge variant="outline">
                Step {currentStep} of {TOTAL_STEPS}
              </Badge>
            </div>
            
            <Progress value={progress} className="h-2" />
            
            <p className="text-sm text-muted-foreground mt-2">
              {STEP_LABELS[currentStep - 1]}
            </p>
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="container max-w-4xl mx-auto px-4 py-8 mb-20">
        {renderStep()}
      </div>
    </div>
  );
};
