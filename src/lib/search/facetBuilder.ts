/**
 * Facet Builder
 * Phase 17: Advanced Search & Filtering System
 * 
 * Generates faceted search options from data
 */

import { Facet, FacetOption } from './types';

export class FacetBuilder<T extends Record<string, any>> {
  buildFacets(items: T[], config: FacetConfig[]): Facet[] {
    return config.map(facetConfig => this.buildFacet(items, facetConfig));
  }

  private buildFacet(items: T[], config: FacetConfig): Facet {
    const options = this.generateOptions(items, config);

    return {
      field: config.field,
      label: config.label,
      options,
      type: config.type || 'checkbox',
    };
  }

  private generateOptions(items: T[], config: FacetConfig): FacetOption[] {
    const counts = new Map<string, number>();

    items.forEach(item => {
      const value = item[config.field];
      
      if (value === null || value === undefined) return;

      // Handle array values
      if (Array.isArray(value)) {
        value.forEach(v => {
          const key = String(v);
          counts.set(key, (counts.get(key) || 0) + 1);
        });
      } else {
        const key = String(value);
        counts.set(key, (counts.get(key) || 0) + 1);
      }
    });

    // Convert to options array
    const options: FacetOption[] = Array.from(counts.entries()).map(([value, count]) => ({
      value,
      label: config.labelFormatter?.(value) || value,
      count,
    }));

    // Sort by count descending
    options.sort((a, b) => b.count - a.count);

    // Limit options if specified
    if (config.maxOptions) {
      return options.slice(0, config.maxOptions);
    }

    return options;
  }
}

interface FacetConfig {
  field: string;
  label: string;
  type?: 'checkbox' | 'radio' | 'range' | 'select';
  labelFormatter?: (value: string) => string;
  maxOptions?: number;
}
