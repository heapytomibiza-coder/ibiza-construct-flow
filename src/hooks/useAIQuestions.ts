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

  // Create cache key from service parameters
  const getCacheKey = useCallback((serviceType: string, category: string, subcategory: string) => {
    return `ai-questions-${serviceType}-${category}-${subcategory}`;
  }, []);

  // Load questions from cache
  const loadFromCache = useCallback((cacheKey: string): AIQuestion[] | null => {
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsedCache = JSON.parse(cached);
        // Check if cache is still valid (24 hours)
        const cacheAge = Date.now() - parsedCache.timestamp;
        if (cacheAge < 24 * 60 * 60 * 1000) {
          return parsedCache.questions;
        }
        // Remove expired cache
        localStorage.removeItem(cacheKey);
      }
    } catch (error) {
      console.error('Error loading from cache:', error);
    }
    return null;
  }, []);

  // Save questions to cache
  const saveToCache = useCallback((cacheKey: string, questions: AIQuestion[]) => {
    try {
      const cacheData = {
        questions,
        timestamp: Date.now()
      };
      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Error saving to cache:', error);
    }
  }, []);

  const generateQuestions = useCallback(async (
    serviceType: string,
    category: string,
    subcategory: string,
    existingAnswers?: Record<string, any>
  ) => {
    setLoading(true);
    setError(null);
    
    const cacheKey = getCacheKey(serviceType, category, subcategory);
    
    // Only use cache if no existing answers (first load)
    if (!existingAnswers || Object.keys(existingAnswers).length === 0) {
      const cachedQuestions = loadFromCache(cacheKey);
      if (cachedQuestions) {
        console.log('Loading questions from cache:', { serviceType, category, subcategory });
        setQuestions(cachedQuestions);
        setLoading(false);
        toast.success('Questions loaded from cache');
        return;
      }
    }
    
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

      if (!data?.questions || !Array.isArray(data.questions)) {
        throw new Error('No valid questions received from AI');
      }

      console.log('Generated questions:', data.questions);
      setQuestions(data.questions);
      
      // Cache only if no existing answers (initial questions)
      if (!existingAnswers || Object.keys(existingAnswers).length === 0) {
        saveToCache(cacheKey, data.questions);
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate questions';
      console.error('Error generating questions:', err);
      setError(errorMessage);
      throw err; // Re-throw so useWizard can handle fallback
    } finally {
      setLoading(false);
    }
  }, [getCacheKey, loadFromCache, saveToCache]);

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