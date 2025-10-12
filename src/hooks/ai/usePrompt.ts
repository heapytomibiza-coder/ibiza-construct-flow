/**
 * Prompt Hook
 * Phase 30: Advanced AI & ML Integration System
 * 
 * Hook for managing prompt templates
 */

import { useState, useCallback } from 'react';
import { PromptTemplate } from '@/lib/ai/types';
import { promptManager } from '@/lib/ai';

export function usePrompt() {
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);

  // Load templates
  const loadTemplates = useCallback(() => {
    const allTemplates = promptManager.getAll();
    setTemplates(allTemplates);
  }, []);

  // Create template
  const createTemplate = useCallback((
    template: Omit<PromptTemplate, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    const newTemplate = promptManager.create(template);
    loadTemplates();
    return newTemplate;
  }, [loadTemplates]);

  // Update template
  const updateTemplate = useCallback((
    templateId: string,
    updates: Partial<PromptTemplate>
  ) => {
    const updated = promptManager.update(templateId, updates);
    if (updated) {
      loadTemplates();
    }
    return updated;
  }, [loadTemplates]);

  // Delete template
  const deleteTemplate = useCallback((templateId: string) => {
    const deleted = promptManager.delete(templateId);
    if (deleted) {
      loadTemplates();
    }
    return deleted;
  }, [loadTemplates]);

  // Render template
  const render = useCallback((
    templateId: string,
    variables: Record<string, any>
  ) => {
    return promptManager.render(templateId, variables);
  }, []);

  // Validate template
  const validate = useCallback((
    templateString: string,
    variables: any[]
  ) => {
    return promptManager.validate(templateString, variables);
  }, []);

  // Search templates
  const search = useCallback((query: string) => {
    return promptManager.search(query);
  }, []);

  // Get templates by category
  const getByCategory = useCallback((category: string) => {
    return promptManager.getByCategory(category);
  }, []);

  return {
    templates,
    loadTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    render,
    validate,
    search,
    getByCategory,
  };
}
