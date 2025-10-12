/**
 * Search Engine
 * Phase 26: Advanced Search & Filtering System
 * 
 * Full-text search with indexing and relevance scoring
 */

import { 
  SearchableItem, 
  SearchQuery, 
  SearchResult, 
  SearchIndex,
  SearchConfig 
} from './types';

const DEFAULT_STOP_WORDS = [
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
  'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
  'to', 'was', 'will', 'with'
];

export class SearchEngine {
  private items: Map<string, SearchableItem> = new Map();
  private index: SearchIndex = {};
  private config: SearchConfig;

  constructor(config?: SearchConfig) {
    this.config = {
      caseSensitive: false,
      fuzzyMatch: false,
      fuzzyThreshold: 0.8,
      stemming: false,
      stopWords: DEFAULT_STOP_WORDS,
      boostFields: {
        title: 3,
        tags: 2,
        description: 1.5,
        content: 1,
      },
      minSearchLength: 2,
      maxResults: 100,
      ...config,
    };
  }

  /**
   * Add item to search index
   */
  addItem(item: SearchableItem): void {
    this.items.set(item.id, item);
    this.indexItem(item);
  }

  /**
   * Add multiple items
   */
  addItems(items: SearchableItem[]): void {
    items.forEach(item => this.addItem(item));
  }

  /**
   * Remove item from index
   */
  removeItem(itemId: string): void {
    this.items.delete(itemId);
    // Remove from index
    Object.keys(this.index).forEach(term => {
      this.index[term]?.delete(itemId);
    });
  }

  /**
   * Update item in index
   */
  updateItem(item: SearchableItem): void {
    this.removeItem(item.id);
    this.addItem(item);
  }

  /**
   * Search items
   */
  search(query: SearchQuery): SearchResult {
    const startTime = performance.now();

    if (!query.query || query.query.length < (this.config.minSearchLength || 2)) {
      return {
        items: [],
        total: 0,
        took: performance.now() - startTime,
      };
    }

    // Tokenize query
    const tokens = this.tokenize(query.query);
    
    // Find matching items
    const matchingIds = this.findMatches(tokens);
    
    // Get items with scores
    let results = Array.from(matchingIds).map(id => {
      const item = this.items.get(id);
      if (!item) return null;
      
      const score = this.calculateRelevance(item, tokens);
      return { item, score };
    }).filter(Boolean) as Array<{ item: SearchableItem; score: number }>;

    // Filter by type
    if (query.type) {
      const types = Array.isArray(query.type) ? query.type : [query.type];
      results = results.filter(r => types.includes(r.item.type));
    }

    // Apply filters
    if (query.filters && query.filters.length > 0) {
      results = results.filter(r => this.matchesFilters(r.item, query.filters!));
    }

    // Sort results
    if (query.sort) {
      results.sort((a, b) => {
        const aVal = this.getFieldValue(a.item, query.sort!.field);
        const bVal = this.getFieldValue(b.item, query.sort!.field);
        const direction = query.sort!.direction === 'asc' ? 1 : -1;
        return aVal > bVal ? direction : -direction;
      });
    } else {
      // Sort by relevance score
      results.sort((a, b) => b.score - a.score);
    }

    // Apply pagination
    const total = results.length;
    const offset = query.offset || 0;
    const limit = Math.min(query.limit || this.config.maxResults || 100, this.config.maxResults || 100);
    results = results.slice(offset, offset + limit);

    return {
      items: results.map(r => r.item),
      total,
      took: performance.now() - startTime,
    };
  }

  /**
   * Get all items
   */
  getAllItems(): SearchableItem[] {
    return Array.from(this.items.values());
  }

  /**
   * Get item by ID
   */
  getItem(id: string): SearchableItem | undefined {
    return this.items.get(id);
  }

  /**
   * Clear all items and index
   */
  clear(): void {
    this.items.clear();
    this.index = {};
  }

  /**
   * Index an item
   */
  private indexItem(item: SearchableItem): void {
    // Index title
    this.indexField(item.id, item.title);
    
    // Index description
    if (item.description) {
      this.indexField(item.id, item.description);
    }
    
    // Index content
    if (item.content) {
      this.indexField(item.id, item.content);
    }
    
    // Index tags
    if (item.tags) {
      item.tags.forEach(tag => this.indexField(item.id, tag));
    }
  }

  /**
   * Index a field value
   */
  private indexField(itemId: string, text: string): void {
    const tokens = this.tokenize(text);
    tokens.forEach(token => {
      if (!this.index[token]) {
        this.index[token] = new Set();
      }
      this.index[token].add(itemId);
    });
  }

  /**
   * Tokenize text
   */
  private tokenize(text: string): string[] {
    let processed = text;
    
    if (!this.config.caseSensitive) {
      processed = processed.toLowerCase();
    }

    // Split on whitespace and punctuation
    const tokens = processed.split(/[\s,\.;:!?\(\)\[\]\{\}]+/)
      .filter(token => token.length >= (this.config.minSearchLength || 2));

    // Remove stop words
    const filtered = tokens.filter(token => 
      !this.config.stopWords?.includes(token)
    );

    return filtered;
  }

  /**
   * Find matching item IDs
   */
  private findMatches(tokens: string[]): Set<string> {
    const matches = new Set<string>();

    tokens.forEach(token => {
      const exactMatches = this.index[token];
      if (exactMatches) {
        exactMatches.forEach(id => matches.add(id));
      }

      // Fuzzy matching
      if (this.config.fuzzyMatch) {
        Object.keys(this.index).forEach(indexedToken => {
          if (this.isFuzzyMatch(token, indexedToken)) {
            this.index[indexedToken]?.forEach(id => matches.add(id));
          }
        });
      }
    });

    return matches;
  }

  /**
   * Calculate relevance score
   */
  private calculateRelevance(item: SearchableItem, tokens: string[]): number {
    let score = 0;
    const boost = this.config.boostFields || {};

    // Score title matches
    const titleTokens = this.tokenize(item.title);
    score += this.countMatches(titleTokens, tokens) * (boost.title || 1);

    // Score description matches
    if (item.description) {
      const descTokens = this.tokenize(item.description);
      score += this.countMatches(descTokens, tokens) * (boost.description || 1);
    }

    // Score content matches
    if (item.content) {
      const contentTokens = this.tokenize(item.content);
      score += this.countMatches(contentTokens, tokens) * (boost.content || 1);
    }

    // Score tag matches
    if (item.tags) {
      item.tags.forEach(tag => {
        const tagTokens = this.tokenize(tag);
        score += this.countMatches(tagTokens, tokens) * (boost.tags || 1);
      });
    }

    return score;
  }

  /**
   * Count matching tokens
   */
  private countMatches(itemTokens: string[], queryTokens: string[]): number {
    return queryTokens.filter(qt => itemTokens.includes(qt)).length;
  }

  /**
   * Fuzzy match two strings
   */
  private isFuzzyMatch(str1: string, str2: string): boolean {
    const threshold = this.config.fuzzyThreshold || 0.8;
    const distance = this.levenshteinDistance(str1, str2);
    const maxLen = Math.max(str1.length, str2.length);
    const similarity = 1 - (distance / maxLen);
    return similarity >= threshold;
  }

  /**
   * Calculate Levenshtein distance
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  /**
   * Check if item matches filters
   */
  private matchesFilters(item: SearchableItem, filters: any[]): boolean {
    return filters.every(filter => {
      const value = this.getFieldValue(item, filter.field);
      return this.compareValues(value, filter.operator, filter.value);
    });
  }

  /**
   * Get field value from item
   */
  private getFieldValue(item: SearchableItem, field: string): any {
    if (field.includes('.')) {
      const parts = field.split('.');
      let value: any = item;
      for (const part of parts) {
        value = value?.[part];
      }
      return value;
    }
    return (item as any)[field];
  }

  /**
   * Compare values with operator
   */
  private compareValues(itemValue: any, operator: string, filterValue: any): boolean {
    switch (operator) {
      case 'eq': return itemValue === filterValue;
      case 'ne': return itemValue !== filterValue;
      case 'gt': return itemValue > filterValue;
      case 'gte': return itemValue >= filterValue;
      case 'lt': return itemValue < filterValue;
      case 'lte': return itemValue <= filterValue;
      case 'in': return Array.isArray(filterValue) && filterValue.includes(itemValue);
      case 'nin': return Array.isArray(filterValue) && !filterValue.includes(itemValue);
      case 'contains': 
        return typeof itemValue === 'string' && 
               itemValue.toLowerCase().includes(String(filterValue).toLowerCase());
      case 'startsWith':
        return typeof itemValue === 'string' && 
               itemValue.toLowerCase().startsWith(String(filterValue).toLowerCase());
      case 'endsWith':
        return typeof itemValue === 'string' && 
               itemValue.toLowerCase().endsWith(String(filterValue).toLowerCase());
      case 'between':
        return Array.isArray(filterValue) && 
               itemValue >= filterValue[0] && 
               itemValue <= filterValue[1];
      default: return false;
    }
  }
}

// Global search engine instance
export const searchEngine = new SearchEngine();
