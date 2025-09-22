import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

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
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load all services
  const loadServices = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('category, subcategory, micro');
      
      if (error) throw error;
      setServices(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load questions for a service
  const loadQuestions = useCallback(async (serviceId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('service_questions')
        .select('*')
        .eq('service_id', serviceId)
        .order('version', { ascending: false })
        .maybeSingle();
      
      if (error) throw error;
      setQuestions((data?.questions as any[]) || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

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
    questions,
    loading,
    error,
    updateState,
    nextStep,
    prevStep,
    submitBooking,
    loadServices,
    loadQuestions,
    getCategories,
    getSubcategories,
    getMicroServices,
  };
};