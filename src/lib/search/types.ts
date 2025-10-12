/**
 * Search Types
 * Phase 26: Advanced Search & Filtering System
 */

export interface SearchableItem {
  id: string;
  type: string;
  title: string;
  description?: string;
  content?: string;
  tags?: string[];
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt?: Date;
}

export interface SearchQuery {
  query: string;
  type?: string | string[];
  filters?: SearchFilter[];
  sort?: SearchSort;
  limit?: number;
  offset?: number;
}

export interface SearchFilter {
  field: string;
  operator: FilterOperator;
  value: any;
}

export type FilterOperator = 
  | 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' 
  | 'in' | 'nin' | 'contains' | 'startsWith' | 'endsWith' | 'between';

export interface SearchSort {
  field: string;
  direction: 'asc' | 'desc';
}

export interface SearchResult<T = SearchableItem> {
  items: T[];
  total: number;
  took: number;
  facets?: SearchFacets;
}

export interface SearchFacets {
  [field: string]: FacetValue[];
}

export interface FacetValue {
  value: any;
  count: number;
}

export interface SavedSearch {
  id: string;
  userId: string;
  name: string;
  query: SearchQuery;
  createdAt: Date;
  updatedAt?: Date;
  executeCount?: number;
  lastExecutedAt?: Date;
}

export interface SearchHistory {
  id: string;
  userId: string;
  query: string;
  timestamp: Date;
  resultsCount: number;
}

export interface SearchIndex {
  [key: string]: Set<string>;
}

export interface SearchConfig {
  caseSensitive?: boolean;
  fuzzyMatch?: boolean;
  fuzzyThreshold?: number;
  stopWords?: string[];
  boostFields?: Record<string, number>;
  minSearchLength?: number;
  maxResults?: number;
  stemming?: boolean;
}

export interface Facet {
  field: string;
  label: string;
  options: FacetOption[];
  type?: 'checkbox' | 'radio' | 'range' | 'select';
}

export interface FacetOption {
  value: string;
  label: string;
  count: number;
}

export interface SortOption {
  field: string;
  direction: 'asc' | 'desc';
}

export interface SearchOptions {
  query: string;
  filters?: SearchFilter[];
  sort?: SortOption;
  page?: number;
  limit?: number;
}

export interface SearchHistoryItem {
  id: string;
  query: string;
  timestamp: Date;
}

export interface FilterGroup {
  id: string;
  name: string;
  filters: SearchFilter[];
  operator: 'AND' | 'OR';
}
