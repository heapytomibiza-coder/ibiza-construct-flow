/**
 * Construction Question Blocks Tests
 * Phase 4: Testing & Validation
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { buildConstructionWizardQuestions } from '../constructionQuestionBlocks';
import { createMockSupabaseClient } from '@/lib/testing/mocks/mockSupabase';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: createMockSupabaseClient()
}));

describe('buildConstructionWizardQuestions', () => {
  beforeEach(() => {
    const { supabase } = require('@/integrations/supabase/client');
    supabase._reset();
  });

  it('should return questions and UUID for valid micro service', async () => {
    const { supabase } = require('@/integrations/supabase/client');
    
    // Seed mock data
    supabase._seed('micro_services', [{
      id: 'test-uuid-123',
      slug: 'wall-painting',
      category: 'painting',
      subcategory: 'interior',
      name: 'Wall Painting',
      created_at: new Date().toISOString()
    }]);

    const result = await buildConstructionWizardQuestions([
      'painting',
      'interior',
      'wall-painting'
    ]);

    expect(result.microId).toBe('wall-painting');
    expect(result.microUuid).toBe('test-uuid-123');
    expect(result.questions).toBeDefined();
    expect(Array.isArray(result.questions)).toBe(true);
  });

  it('should handle non-existent micro service gracefully', async () => {
    const result = await buildConstructionWizardQuestions([
      'unknown',
      'category',
      'service'
    ]);

    expect(result.microId).toBe('service');
    expect(result.microUuid).toBeNull();
    expect(result.questions).toEqual([]);
  });

  it('should return questions for existing static construction data', async () => {
    const result = await buildConstructionWizardQuestions([
      'painting',
      'interior',
      'wall-painting'
    ]);

    // Wall painting should have questions in the static data
    expect(result.questions.length).toBeGreaterThan(0);
    expect(result.microId).toBe('wall-painting');
  });

  it('should handle empty categories array', async () => {
    const result = await buildConstructionWizardQuestions([]);

    expect(result.microId).toBeNull();
    expect(result.microUuid).toBeNull();
    expect(result.questions).toEqual([]);
  });

  it('should properly map question types', async () => {
    const { supabase } = require('@/integrations/supabase/client');
    
    supabase._seed('micro_services', [{
      id: 'test-uuid-456',
      slug: 'wall-painting',
      category: 'painting',
      subcategory: 'interior',
      name: 'Wall Painting',
      created_at: new Date().toISOString()
    }]);

    const result = await buildConstructionWizardQuestions([
      'painting',
      'interior',
      'wall-painting'
    ]);

    // Verify question structure
    result.questions.forEach(question => {
      expect(question).toHaveProperty('id');
      expect(question).toHaveProperty('question');
      expect(question).toHaveProperty('type');
      expect(question).toHaveProperty('required');
    });
  });

  it('should use last category as micro slug', async () => {
    const result = await buildConstructionWizardQuestions([
      'painting',
      'interior',
      'wall-painting',
      'extra-category'
    ]);

    expect(result.microId).toBe('extra-category');
  });
});
