/**
 * Hook for question builder wizard state management
 */

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { MicroserviceDef, QuestionDef, PackStatus } from '@/types/packs';
import { createQuestionPack } from '@/lib/questionPacks/createPack';
import { v4 as uuidv4 } from 'uuid';

export interface BuilderQuestion extends Omit<QuestionDef, 'key'> {
  key: string;
  tempId: string;
  text?: string; // For display in UI
}

export function useQuestionBuilder() {
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(0);
  const [microSlug, setMicroSlug] = useState('');
  const [microName, setMicroName] = useState('');
  const [category, setCategory] = useState('construction');
  const [questions, setQuestions] = useState<BuilderQuestion[]>([]);
  
  // Add question
  const addQuestion = () => {
    const newQuestion: BuilderQuestion = {
      tempId: uuidv4(),
      key: `q${questions.length + 1}`,
      type: 'text',
      i18nKey: `${microSlug}.q${questions.length + 1}.title`,
      required: false,
    };
    setQuestions([...questions, newQuestion]);
  };
  
  // Update question
  const updateQuestion = (tempId: string, updates: Partial<BuilderQuestion>) => {
    setQuestions(questions.map(q => 
      q.tempId === tempId ? { ...q, ...updates } : q
    ));
  };
  
  // Remove question
  const removeQuestion = (tempId: string) => {
    const filtered = questions.filter(q => q.tempId !== tempId);
    // Renumber keys
    const renumbered = filtered.map((q, idx) => ({
      ...q,
      key: `q${idx + 1}`,
    }));
    setQuestions(renumbered);
  };
  
  // Reorder questions
  const reorderQuestions = (startIndex: number, endIndex: number) => {
    const result = Array.from(questions);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    
    // Renumber keys
    const renumbered = result.map((q, idx) => ({
      ...q,
      key: `q${idx + 1}`,
    }));
    setQuestions(renumbered);
  };
  
  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (status: PackStatus) => {
      const content: MicroserviceDef = {
        id: uuidv4(),
        category,
        name: microName,
        slug: microSlug,
        i18nPrefix: microSlug.replace(/-/g, '.'),
        questions: questions.map(({ tempId, ...q }) => q),
      };
      
      return createQuestionPack(microSlug, content, status, 'manual');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['question-packs'] });
      resetBuilder();
    },
  });
  
  // Reset builder
  const resetBuilder = () => {
    setCurrentStep(0);
    setMicroSlug('');
    setMicroName('');
    setCategory('construction');
    setQuestions([]);
  };
  
  // Navigation
  const nextStep = () => setCurrentStep(prev => prev + 1);
  const prevStep = () => setCurrentStep(prev => prev - 1);
  const goToStep = (step: number) => setCurrentStep(step);
  
  return {
    // State
    currentStep,
    microSlug,
    microName,
    category,
    questions,
    
    // Setters
    setMicroSlug,
    setMicroName,
    setCategory,
    
    // Question operations
    addQuestion,
    updateQuestion,
    removeQuestion,
    reorderQuestions,
    
    // Save
    savePack: saveMutation.mutateAsync,
    isSaving: saveMutation.isPending,
    
    // Navigation
    nextStep,
    prevStep,
    goToStep,
    resetBuilder,
  };
}
