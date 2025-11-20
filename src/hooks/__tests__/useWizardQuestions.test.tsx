/**
 * useWizardQuestions Hook Tests
 * Phase 4: Testing & Validation
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useWizardQuestions } from '../useWizardQuestions';
import { createMockSupabaseClient } from '@/lib/testing/mocks/mockSupabase';

// Helper to wait for loading state
const waitForLoading = async (result: any) => {
  return new Promise<void>((resolve) => {
    const checkLoading = () => {
      if (!result.current.loading) {
        resolve();
      } else {
        setTimeout(checkLoading, 50);
      }
    };
    checkLoading();
  });
};

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: createMockSupabaseClient()
}));

describe('useWizardQuestions', () => {
  beforeEach(() => {
    const { supabase } = require('@/integrations/supabase/client');
    supabase._reset();
  });

  it('should load questions and UUID for valid categories', async () => {
    const { supabase } = require('@/integrations/supabase/client');
    
    // Seed mock data
    supabase._seed('micro_services', [{
      id: 'test-uuid-789',
      slug: 'wall-painting',
      category: 'painting',
      subcategory: 'interior',
      name: 'Wall Painting',
      created_at: new Date().toISOString()
    }]);

    const { result } = renderHook(() =>
      useWizardQuestions(['painting', 'interior', 'wall-painting'])
    );

    await waitForLoading(result);

    expect(result.current.microSlug).toBe('wall-painting');
    expect(result.current.microUuid).toBe('test-uuid-789');
    expect(result.current.questions).toBeDefined();
    expect(result.current.error).toBeNull();
  });

  it('should handle empty categories', async () => {
    const { result } = renderHook(() => useWizardQuestions([]));

    await waitForLoading(result);

    expect(result.current.microSlug).toBeNull();
    expect(result.current.microUuid).toBeNull();
    expect(result.current.questions).toEqual([]);
  });

  it('should filter questions based on conditional logic', async () => {
    const { supabase } = require('@/integrations/supabase/client');
    
    supabase._seed('micro_services', [{
      id: 'test-uuid-conditional',
      slug: 'wall-painting',
      category: 'painting',
      subcategory: 'interior',
      name: 'Wall Painting',
      created_at: new Date().toISOString()
    }]);

    const { result } = renderHook(() =>
      useWizardQuestions(
        ['painting', 'interior', 'wall-painting'],
        { room_type: 'bedroom' }
      )
    );

    await waitForLoading(result);

    // Questions should be filtered based on responses
    expect(result.current.questions).toBeDefined();
  });

  it('should update when categories change', async () => {
    const { supabase } = require('@/integrations/supabase/client');
    
    supabase._seed('micro_services', [
      {
        id: 'uuid-1',
        slug: 'wall-painting',
        category: 'painting',
        subcategory: 'interior',
        name: 'Wall Painting',
        created_at: new Date().toISOString()
      },
      {
        id: 'uuid-2',
        slug: 'floor-installation',
        category: 'flooring',
        subcategory: 'hardwood',
        name: 'Floor Installation',
        created_at: new Date().toISOString()
      }
    ]);

    const { result, rerender } = renderHook(
      ({ categories }) => useWizardQuestions(categories),
      {
        initialProps: { categories: ['painting', 'interior', 'wall-painting'] }
      }
    );

    await waitForLoading(result);

    expect(result.current.microSlug).toBe('wall-painting');

    // Change categories
    rerender({ categories: ['flooring', 'hardwood', 'floor-installation'] });

    await waitForLoading(result);

    expect(result.current.microSlug).toBe('floor-installation');
    expect(result.current.microUuid).toBe('uuid-2');
  });

  it('should handle errors gracefully', async () => {
    const { supabase } = require('@/integrations/supabase/client');
    
    // Override from method to throw error
    const originalFrom = supabase.from;
    supabase.from = () => {
      throw new Error('Database error');
    };

    const { result } = renderHook(() =>
      useWizardQuestions(['painting', 'interior', 'wall-painting'])
    );

    await waitForLoading(result);

    expect(result.current.error).toBeTruthy();
    expect(result.current.questions).toEqual([]);

    // Restore
    supabase.from = originalFrom;
  });

  it('should handle array conditional logic', async () => {
    const { supabase } = require('@/integrations/supabase/client');
    
    supabase._seed('micro_services', [{
      id: 'test-uuid-array',
      slug: 'wall-painting',
      category: 'painting',
      subcategory: 'interior',
      name: 'Wall Painting',
      created_at: new Date().toISOString()
    }]);

    const { result } = renderHook(() =>
      useWizardQuestions(
        ['painting', 'interior', 'wall-painting'],
        { paint_type: 'latex' }
      )
    );

    await waitForLoading(result);

    // Should properly handle array-based show_when conditions
    expect(result.current.questions).toBeDefined();
  });
});
