import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface AIQuestion {
  id: string;
  type: 'radio' | 'select' | 'checkbox' | 'multiple-choice';
  label: string;
  required: boolean;
  options: string[];
  maxSelections?: number; // For multiple-choice type
}

export interface PriceEstimate {
  estimatedPrice: {
    min: number;
    max: number;
    currency: string;
  };
  priceFactors: string[];
  confidenceLevel: 'high' | 'medium' | 'low';
  explanation: string;
  timeline: string;
}

export const useAIQuestions = () => {
  const [questions, setQuestions] = useState<AIQuestion[]>([]);
  const [priceEstimate, setPriceEstimate] = useState<PriceEstimate | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateQuestions = useCallback(async (
    serviceType: string,
    category: string,
    subcategory: string,
    existingAnswers?: Record<string, any>
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Generating AI questions for service:', { serviceType, category, subcategory });
      
      const { data, error: functionError } = await supabase.functions.invoke('generate-questions', {
        body: {
          serviceType,
          category,
          subcategory,
          existingAnswers
        }
      });

      if (functionError) {
        console.error('Function error:', functionError);
        throw new Error(functionError.message || 'Failed to generate questions');
      }

      if (!data?.questions) {
        throw new Error('No questions received from AI');
      }

      console.log('Generated questions:', data.questions);
      setQuestions(data.questions);
      toast.success('AI-generated questions loaded');
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate questions';
      console.error('Error generating questions:', err);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const estimatePrice = useCallback(async (
    serviceType: string,
    category: string,
    subcategory: string,
    answers: Record<string, any>,
    location?: string
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Estimating price with AI:', { serviceType, category, subcategory, answers });
      
      const { data, error: functionError } = await supabase.functions.invoke('estimate-price', {
        body: {
          serviceType,
          category,
          subcategory,
          answers,
          location
        }
      });

      if (functionError) {
        console.error('Function error:', functionError);
        throw new Error(functionError.message || 'Failed to estimate price');
      }

      if (!data?.estimatedPrice) {
        throw new Error('No price estimate received from AI');
      }

      console.log('Generated price estimate:', data);
      setPriceEstimate(data as PriceEstimate);
      toast.success('AI price estimate generated');
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to estimate price';
      console.error('Error estimating price:', err);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const generateFollowUpQuestions = useCallback(async (
    serviceType: string,
    category: string,
    subcategory: string,
    previousAnswers: Record<string, any>
  ) => {
    // Generate contextual follow-up questions based on previous answers
    return generateQuestions(serviceType, category, subcategory, previousAnswers);
  }, [generateQuestions]);

  return {
    questions,
    priceEstimate,
    loading,
    error,
    generateQuestions,
    estimatePrice,
    generateFollowUpQuestions,
    clearQuestions: () => setQuestions([]),
    clearPriceEstimate: () => setPriceEstimate(null),
    clearError: () => setError(null)
  };
};