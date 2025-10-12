/**
 * Search History Manager
 * Phase 17: Advanced Search & Filtering System
 * 
 * Manages search history with localStorage persistence
 */

const STORAGE_KEY = 'search_history';
const MAX_HISTORY_ITEMS = 10;

export interface SearchHistoryItem {
  id: string;
  query: string;
  timestamp: Date;
}

class SearchHistoryManager {
  private history: SearchHistoryItem[] = [];

  constructor() {
    this.loadHistory();
  }

  addSearch(query: string): void {
    if (!query.trim()) return;

    // Remove duplicate if exists
    this.history = this.history.filter(item => item.query !== query);

    // Add new search to the beginning
    this.history.unshift({
      id: `search_${Date.now()}`,
      query,
      timestamp: new Date(),
    });

    // Limit history size
    if (this.history.length > MAX_HISTORY_ITEMS) {
      this.history = this.history.slice(0, MAX_HISTORY_ITEMS);
    }

    this.saveHistory();
  }

  getHistory(): SearchHistoryItem[] {
    return [...this.history];
  }

  removeSearch(id: string): void {
    this.history = this.history.filter(item => item.id !== id);
    this.saveHistory();
  }

  clearHistory(): void {
    this.history = [];
    this.saveHistory();
  }

  private loadHistory(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.history = parsed.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp),
        }));
      }
    } catch (error) {
      console.error('Failed to load search history:', error);
      this.history = [];
    }
  }

  private saveHistory(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.history));
    } catch (error) {
      console.error('Failed to save search history:', error);
    }
  }
}

export const searchHistory = new SearchHistoryManager();
