import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CollapsibleSection } from './CollapsibleSection';
import { ServiceTypeSelector } from './ServiceTypeSelector';
import { DetailsPanel } from './DetailsPanel';
import { MediaUploadPanel } from './MediaUploadPanel';
import { LiveServicePreview } from './LiveServicePreview';
import { CheckCircle2, Circle, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useDebounce } from '@/hooks/shared/useDebounce';

interface ServiceBuilderState {
  serviceType: { completed: boolean; data: any };
  details: { completed: boolean; data: any };
  media: { completed: boolean; data: any };
}

export const DynamicServiceBuilder: React.FC = () => {
  const { toast } = useToast();
  const [state, setState] = useState<ServiceBuilderState>({
    serviceType: { completed: false, data: {} },
    details: { completed: false, data: {} },
    media: { completed: false, data: {} },
  });
  const [activeSection, setActiveSection] = useState<string>('type');
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  
  const debouncedState = useDebounce(state, 1000);

  const progress = Object.values(state).filter(s => s.completed).length / Object.keys(state).length * 100;

  useEffect(() => {
    if (debouncedState !== state) {
      handleAutoSave();
    }
  }, [debouncedState]);

  const handleAutoSave = async () => {
    setAutoSaveStatus('saving');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('form_sessions')
        .upsert({
          user_id: user.id,
          form_type: 'service_creation_dynamic',
          payload: state as any,
          updated_at: new Date().toISOString(),
        });

      setAutoSaveStatus('saved');
      setTimeout(() => setAutoSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  };

  const updateSection = (section: keyof ServiceBuilderState, data: any, completed?: boolean) => {
    setState(prev => ({
      ...prev,
      [section]: {
        data: { ...prev[section].data, ...data },
        completed: completed ?? prev[section].completed
      }
    }));
  };

  const handleServiceTypeSelect = (type: any) => {
    updateSection('serviceType', type, true);
    setActiveSection('details');
  };

  const handleDetailsUpdate = (data: any) => {
    updateSection('details', data);
    const isComplete = data.serviceName && data.description && data.pricing;
    if (isComplete && !state.details.completed) {
      updateSection('details', data, true);
    }
  };

  const handleMediaUpdate = (data: any) => {
    updateSection('media', data);
  };

  const handleSubmit = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: "Authentication required", variant: "destructive" });
        return;
      }

      const serviceData = {
        professional_id: user.id,
        micro_service_id: state.serviceType.data.id,
        pricing_structure: {
          type: state.details.data.pricing,
          basePrice: state.details.data.basePrice || null,
          description: state.details.data.description,
          duration: state.details.data.duration,
        } as any,
        portfolio_urls: state.media.data.primaryImageUrl 
          ? [state.media.data.primaryImageUrl, ...(state.media.data.galleryImages || [])]
          : null,
        is_active: true,
      };

      const { error } = await supabase.from('professional_services').insert([serviceData]);

      if (error) throw error;

      toast({ title: "Service created successfully!" });
      
      // Clear auto-save
      await supabase
        .from('form_sessions')
        .delete()
        .eq('user_id', user.id)
        .eq('form_type', 'service_creation_dynamic');

    } catch (error: any) {
      toast({ title: "Failed to create service", description: error.message, variant: "destructive" });
    }
  };

  return (
    <div className="container mx-auto py-6 px-4">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold">Create New Service</h1>
          {autoSaveStatus === 'saved' && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground animate-in fade-in">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              Saved
            </div>
          )}
          {autoSaveStatus === 'saving' && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Save className="h-4 w-4 animate-pulse" />
              Saving...
            </div>
          )}
        </div>
        <Progress value={progress} className="h-2 bg-sage-muted/30 [&>div]:bg-sage" />
        <p className="text-sm text-muted-foreground mt-2">{Math.round(progress)}% Complete</p>
      </div>

      <div className="grid lg:grid-cols-[1fr,400px] gap-6">
        {/* Main Content */}
        <div className="space-y-3">
          {/* Service Type Section */}
          <CollapsibleSection
            id="type"
            title="1. Service Type"
            isComplete={state.serviceType.completed}
            isActive={activeSection === 'type'}
            onToggle={() => setActiveSection(activeSection === 'type' ? '' : 'type')}
            summary={state.serviceType.completed ? state.serviceType.data.label : undefined}
          >
            <ServiceTypeSelector
              selected={state.serviceType.data}
              onSelect={handleServiceTypeSelect}
            />
          </CollapsibleSection>

          {/* Details Section */}
          <CollapsibleSection
            id="details"
            title="2. Details & Pricing"
            isComplete={state.details.completed}
            isActive={activeSection === 'details'}
            onToggle={() => setActiveSection(activeSection === 'details' ? '' : 'details')}
            disabled={!state.serviceType.completed}
            summary={state.details.completed ? state.details.data.serviceName : undefined}
          >
            <DetailsPanel
              data={state.details.data}
              serviceType={state.serviceType.data}
              onUpdate={handleDetailsUpdate}
            />
          </CollapsibleSection>

          {/* Media Section */}
          <CollapsibleSection
            id="media"
            title="3. Photos & Video"
            subtitle="Optional"
            isComplete={state.media.completed}
            isActive={activeSection === 'media'}
            onToggle={() => setActiveSection(activeSection === 'media' ? '' : 'media')}
            disabled={!state.details.completed}
          >
            <MediaUploadPanel
              data={state.media.data}
              onUpdate={handleMediaUpdate}
            />
          </CollapsibleSection>
        </div>

        {/* Live Preview - Desktop Only */}
        <div className="hidden lg:block">
          <div className="sticky top-6">
            <LiveServicePreview
              serviceType={state.serviceType.data}
              details={state.details.data}
              media={state.media.data}
            />
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="mt-6 flex justify-end">
        <Button
          size="lg"
          onClick={handleSubmit}
          disabled={!state.serviceType.completed || !state.details.completed}
        >
          Create Service
        </Button>
      </div>
    </div>
  );
};
