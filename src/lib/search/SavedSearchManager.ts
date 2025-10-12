/**
 * Saved Search Manager
 * Phase 26: Advanced Search & Filtering System
 * 
 * Save and manage search queries
 */

import { SavedSearch, SearchQuery, SearchHistory } from './types';
import { v4 as uuidv4 } from 'uuid';

export class SavedSearchManager {
  private savedSearches: Map<string, SavedSearch> = new Map();
  private searchHistory: SearchHistory[] = [];
  private maxHistorySize: number = 100;

  /**
   * Save a search
   */
  saveSearch(userId: string, name: string, query: SearchQuery): SavedSearch {
    const savedSearch: SavedSearch = {
      id: uuidv4(),
      userId,
      name,
      query,
      createdAt: new Date(),
      executeCount: 0,
    };

    this.savedSearches.set(savedSearch.id, savedSearch);
    return savedSearch;
  }

  /**
   * Get saved search
   */
  getSavedSearch(id: string): SavedSearch | undefined {
    return this.savedSearches.get(id);
  }

  /**
   * Get all saved searches for user
   */
  getUserSavedSearches(userId: string): SavedSearch[] {
    return Array.from(this.savedSearches.values())
      .filter(search => search.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Update saved search
   */
  updateSavedSearch(id: string, updates: Partial<SavedSearch>): void {
    const savedSearch = this.savedSearches.get(id);
    if (savedSearch) {
      Object.assign(savedSearch, {
        ...updates,
        updatedAt: new Date(),
      });
    }
  }

  /**
   * Delete saved search
   */
  deleteSavedSearch(id: string): void {
    this.savedSearches.delete(id);
  }

  /**
   * Execute saved search
   */
  executeSavedSearch(id: string): SearchQuery | null {
    const savedSearch = this.savedSearches.get(id);
    if (!savedSearch) return null;

    // Update execution stats
    savedSearch.executeCount = (savedSearch.executeCount || 0) + 1;
    savedSearch.lastExecutedAt = new Date();

    return savedSearch.query;
  }

  /**
   * Add to search history
   */
  addToHistory(userId: string, query: string, resultsCount: number): void {
    const historyEntry: SearchHistory = {
      id: uuidv4(),
      userId,
      query,
      timestamp: new Date(),
      resultsCount,
    };

    this.searchHistory.unshift(historyEntry);

    // Limit history size
    if (this.searchHistory.length > this.maxHistorySize) {
      this.searchHistory = this.searchHistory.slice(0, this.maxHistorySize);
    }
  }

  /**
   * Get search history for user
   */
  getHistory(userId: string, limit: number = 20): SearchHistory[] {
    return this.searchHistory
      .filter(entry => entry.userId === userId)
      .slice(0, limit);
  }

  /**
   * Clear history for user
   */
  clearHistory(userId: string): void {
    this.searchHistory = this.searchHistory.filter(
      entry => entry.userId !== userId
    );
  }

  /**
   * Get popular searches
   */
  getPopularSearches(limit: number = 10): Array<{ query: string; count: number }> {
    const queryCounts = new Map<string, number>();

    this.searchHistory.forEach(entry => {
      queryCounts.set(entry.query, (queryCounts.get(entry.query) || 0) + 1);
    });

    return Array.from(queryCounts.entries())
      .map(([query, count]) => ({ query, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  /**
   * Get recent searches for user
   */
  getRecentSearches(userId: string, limit: number = 5): string[] {
    const recent = this.searchHistory
      .filter(entry => entry.userId === userId)
      .slice(0, limit)
      .map(entry => entry.query);

    // Remove duplicates while preserving order
    return Array.from(new Set(recent));
  }

  /**
   * Clear all saved searches
   */
  clearSavedSearches(): void {
    this.savedSearches.clear();
  }

  /**
   * Clear all history
   */
  clearAllHistory(): void {
    this.searchHistory = [];
  }
}

// Global saved search manager instance
export const savedSearchManager = new SavedSearchManager();
