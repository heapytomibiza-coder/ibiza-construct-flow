/**
 * Facets Hook
 * Phase 17: Advanced Search & Filtering System
 * 
 * React hook for faceted search
 */

import { useMemo } from 'react';
import { FacetBuilder, Facet } from '@/lib/search';

interface FacetConfig {
  field: string;
  label: string;
  type?: 'checkbox' | 'radio' | 'range' | 'select';
  labelFormatter?: (value: string) => string;
  maxOptions?: number;
}

export function useFacets<T extends Record<string, any>>(
  items: T[],
  config: FacetConfig[]
): Facet[] {
  return useMemo(() => {
    const builder = new FacetBuilder<T>();
    return builder.buildFacets(items, config);
  }, [items, config]);
}
