import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAIQuestions, AIQuestion } from '@/hooks/useAIQuestions';
import { toast } from 'sonner';

export interface WizardState {
  step: number;
  category: string;
  subcategory: string;
  serviceId: string;
  microService: string;
  generalAnswers: Record<string, any>;
  microAnswers: Record<string, any>;
  title: string;
  description: string;
  budgetRange: string;
}

interface Service {
  id: string;
  category: string;
  subcategory: string;
  micro: string;
}

export const useWizard = () => {
  const [state, setState] = useState<WizardState>({
    step: 1,
    category: '',
    subcategory: '',
    serviceId: '',
    microService: '',
    generalAnswers: {},
    microAnswers: {},
    title: '',
    description: '',
    budgetRange: '',
  });

  const [services, setServices] = useState<Service[]>([]);
  const [microQuestions, setMicroQuestions] = useState<any[]>([]);
  const [logisticsQuestions, setLogisticsQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // AI-powered question generation
  const aiQuestions = useAIQuestions();

  // Load all services from services_micro table
  const loadServices = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('services_micro')
        .select('*')
        .order('category, subcategory, micro');
      
      if (error) throw error;
      const formattedServices = (data || []).map(item => ({
        id: item.id,
        category: item.category,
        subcategory: item.subcategory,
        micro: item.micro
      }));
      setServices(formattedServices || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load questions for a service from services_micro table
  const loadQuestions = useCallback(async (serviceId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('services_micro')
        .select('*')
        .eq('id', serviceId)
        .maybeSingle();
      
      if (error) throw error;
      const micro = (data?.questions_micro as any[]) || [];
      const logistics = (data?.questions_logistics as any[]) || [];
      setMicroQuestions(micro);
      setLogisticsQuestions(logistics);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load AI-generated questions for a service with robust fallback
  const loadAIQuestions = useCallback(async (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    if (!service) {
      console.error('Service not found:', serviceId);
      await loadQuestions(serviceId);
      return;
    }

    console.log('Attempting to load AI questions for service:', service);
    
    // Try AI questions but always fallback to database
    try {
      await aiQuestions.generateQuestions(
        service.micro, 
        service.category, 
        service.subcategory,
        state.generalAnswers
      );
      
      // Check if AI questions were actually loaded
      if (!aiQuestions.questions || aiQuestions.questions.length === 0) {
        console.log('No AI questions received, using database questions');
        await loadQuestions(serviceId);
      }
    } catch (error) {
      console.log('AI questions failed, using database questions');
      await loadQuestions(serviceId);
    }
  }, [services, aiQuestions.generateQuestions, aiQuestions.questions, loadQuestions, state.generalAnswers]);

  // AI-powered price estimation
  const generatePriceEstimate = useCallback(async () => {
    const service = services.find(s => s.id === state.serviceId);
    if (!service || !state.microAnswers) return;

    try {
      await aiQuestions.estimatePrice(
        service.micro,
        service.category,
        service.subcategory,
        { ...state.generalAnswers, ...state.microAnswers },
        state.generalAnswers?.location
      );
    } catch (error) {
      console.error('Failed to generate price estimate:', error);
    }
  }, [services, state.serviceId, state.generalAnswers, state.microAnswers, aiQuestions]);

  const updateState = useCallback((updates: Partial<WizardState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const nextStep = useCallback(() => {
    setState(prev => ({ ...prev, step: prev.step + 1 }));
  }, []);

  const prevStep = useCallback(() => {
    setState(prev => ({ ...prev, step: Math.max(1, prev.step - 1) }));
  }, []);

  // Submit the booking
  const submitBooking = useCallback(async () => {
    try {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('bookings')
        .insert({
          client_id: user.id,
          service_id: state.serviceId,
          title: state.title,
          description: state.description,
          budget_range: state.budgetRange,
          general_answers: state.generalAnswers,
          micro_q_answers: state.microAnswers,
          status: 'draft'
        });

      if (error) throw error;
      
      // Reset wizard state
      setState({
        step: 1,
        category: '',
        subcategory: '',
        serviceId: '',
        microService: '',
        generalAnswers: {},
        microAnswers: {},
        title: '',
        description: '',
        budgetRange: '',
      });

      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [state]);

  const getCategories = useCallback(() => {
    const categories = [...new Set(services.map(s => s.category))];
    return categories;
  }, [services]);

  const getSubcategories = useCallback((category: string) => {
    const subcategories = [...new Set(
      services
        .filter(s => s.category === category)
        .map(s => s.subcategory)
    )];
    return subcategories;
  }, [services]);

  const getMicroServices = useCallback((category: string, subcategory: string) => {
    return services.filter(s => 
      s.category === category && s.subcategory === subcategory
    );
  }, [services]);

  return {
    state,
    services,
    microQuestions: aiQuestions.questions.length > 0 ? aiQuestions.questions : microQuestions,
    logisticsQuestions,
    loading: loading || aiQuestions.loading,
    error: error || aiQuestions.error,
    priceEstimate: aiQuestions.priceEstimate,
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
    clearAIData: () => {
      aiQuestions.clearQuestions();
      aiQuestions.clearPriceEstimate();
      aiQuestions.clearError();
    }
  };
};