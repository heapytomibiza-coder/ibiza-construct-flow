/**
 * Search Engine
 * Phase 17: Advanced Search & Filtering System
 * 
 * Core search functionality with filtering and sorting
 */

import { SearchOptions, SearchResult, SearchFilter } from './types';

export class SearchEngine<T extends Record<string, any>> {
  private items: T[];

  constructor(items: T[]) {
    this.items = items;
  }

  search(options: SearchOptions): SearchResult<T> {
    const { query, filters = [], sort, page = 1, limit = 10 } = options;

    let results = [...this.items];

    // Apply text search
    if (query.trim()) {
      results = this.applyTextSearch(results, query);
    }

    // Apply filters
    if (filters.length > 0) {
      results = this.applyFilters(results, filters);
    }

    // Apply sorting
    if (sort) {
      results = this.applySort(results, sort);
    }

    // Calculate pagination
    const total = results.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedResults = results.slice(startIndex, endIndex);

    return {
      items: paginatedResults,
      total,
      page,
      limit,
      hasMore: endIndex < total,
    };
  }

  private applyTextSearch(items: T[], query: string): T[] {
    const lowerQuery = query.toLowerCase();
    
    return items.filter(item => {
      // Search across all string fields
      return Object.values(item).some(value => {
        if (typeof value === 'string') {
          return value.toLowerCase().includes(lowerQuery);
        }
        return false;
      });
    });
  }

  private applyFilters(items: T[], filters: SearchFilter[]): T[] {
    return items.filter(item => {
      return filters.every(filter => this.matchesFilter(item, filter));
    });
  }

  private matchesFilter(item: T, filter: SearchFilter): boolean {
    const { field, operator, value } = filter;
    const itemValue = item[field];

    switch (operator) {
      case 'equals':
        return itemValue === value;
      case 'notEquals':
        return itemValue !== value;
      case 'contains':
        return String(itemValue).toLowerCase().includes(String(value).toLowerCase());
      case 'startsWith':
        return String(itemValue).toLowerCase().startsWith(String(value).toLowerCase());
      case 'endsWith':
        return String(itemValue).toLowerCase().endsWith(String(value).toLowerCase());
      case 'greaterThan':
        return itemValue > value;
      case 'lessThan':
        return itemValue < value;
      case 'greaterThanOrEqual':
        return itemValue >= value;
      case 'lessThanOrEqual':
        return itemValue <= value;
      case 'in':
        return Array.isArray(value) && value.includes(itemValue);
      case 'notIn':
        return Array.isArray(value) && !value.includes(itemValue);
      case 'between':
        return Array.isArray(value) && itemValue >= value[0] && itemValue <= value[1];
      case 'isEmpty':
        return itemValue === null || itemValue === undefined || itemValue === '';
      case 'isNotEmpty':
        return itemValue !== null && itemValue !== undefined && itemValue !== '';
      default:
        return true;
    }
  }

  private applySort(items: T[], sort: { field: string; direction: 'asc' | 'desc' }): T[] {
    return [...items].sort((a, b) => {
      const aValue = a[sort.field];
      const bValue = b[sort.field];

      if (aValue === bValue) return 0;

      const comparison = aValue > bValue ? 1 : -1;
      return sort.direction === 'asc' ? comparison : -comparison;
    });
  }

  updateItems(items: T[]) {
    this.items = items;
  }
}
