/**
 * Search System Types
 * Phase 17: Advanced Search & Filtering System
 * 
 * Type definitions for search, filtering, and faceted search
 */

export interface SearchOptions {
  query: string;
  filters?: SearchFilter[];
  sort?: SortOption;
  page?: number;
  limit?: number;
}

export interface SearchFilter {
  field: string;
  operator: FilterOperator;
  value: any;
  label?: string;
}

export type FilterOperator = 
  | 'equals'
  | 'notEquals'
  | 'contains'
  | 'startsWith'
  | 'endsWith'
  | 'greaterThan'
  | 'lessThan'
  | 'greaterThanOrEqual'
  | 'lessThanOrEqual'
  | 'in'
  | 'notIn'
  | 'between'
  | 'isEmpty'
  | 'isNotEmpty';

export interface SortOption {
  field: string;
  direction: 'asc' | 'desc';
}

export interface SearchResult<T = any> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface SearchSuggestion {
  id: string;
  text: string;
  type: 'query' | 'result' | 'recent';
  metadata?: Record<string, any>;
}

export interface FacetOption {
  value: string;
  label: string;
  count: number;
}

export interface Facet {
  field: string;
  label: string;
  options: FacetOption[];
  type: 'checkbox' | 'radio' | 'range' | 'select';
}

export interface SavedSearch {
  id: string;
  name: string;
  query: string;
  filters: SearchFilter[];
  createdAt: Date;
}
