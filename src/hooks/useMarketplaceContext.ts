import { useState, useCallback, useEffect } from 'react';

interface MarketplaceContext {
  // User preferences
  urgency?: 'now' | 'soon' | 'planning';
  clarity?: 'clear' | 'mostly' | 'unclear';
  budget?: 'fixed' | 'flexible' | 'compare';
  
  // Search context
  searchTerm?: string;
  category?: string;
  subcategory?: string;
  location?: {
    lat: number;
    lng: number;
    address: string;
  };
  
  // Journey context
  currentPath?: 'browse' | 'post';
  previousPath?: 'browse' | 'post';
  crossoverCount?: number;
  
  // Results context
  lastSearchResults?: number;
  lastJobOffers?: number;
  timeWaiting?: number;
}

interface UseMarketplaceContextReturn {
  context: MarketplaceContext;
  updateContext: (updates: Partial<MarketplaceContext>) => void;
  clearContext: () => void;
  saveToStorage: () => void;
  loadFromStorage: () => MarketplaceContext | null;
  generateContextUrl: (basePath: string) => string;
  parseContextFromUrl: (url: string) => Partial<MarketplaceContext>;
  shouldShowCrossover: (type: 'discovery-to-post' | 'post-to-discovery') => boolean;
}

const STORAGE_KEY = 'marketplace-context';
const MAX_CROSSOVER_COUNT = 2;

export const useMarketplaceContext = (): UseMarketplaceContextReturn => {
  const [context, setContext] = useState<MarketplaceContext>({});

  // Load context from storage on mount
  useEffect(() => {
    const stored = loadFromStorage();
    if (stored) {
      setContext(stored);
    }
  }, []);

  const updateContext = useCallback((updates: Partial<MarketplaceContext>) => {
    setContext(prev => {
      const updated = { ...prev, ...updates };
      
      // Auto-save to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      
      return updated;
    });
  }, []);

  const clearContext = useCallback(() => {
    setContext({});
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const saveToStorage = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(context));
  }, [context]);

  const loadFromStorage = useCallback((): MarketplaceContext | null => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }, []);

  const generateContextUrl = useCallback((basePath: string): string => {
    const url = new URL(basePath, window.location.origin);
    
    // Add context as URL params
    if (context.searchTerm) url.searchParams.set('q', context.searchTerm);
    if (context.category) url.searchParams.set('category', context.category);
    if (context.location?.address) url.searchParams.set('location', context.location.address);
    if (context.urgency) url.searchParams.set('urgency', context.urgency);
    if (context.clarity) url.searchParams.set('clarity', context.clarity);
    if (context.budget) url.searchParams.set('budget', context.budget);
    
    return url.toString();
  }, [context]);

  const parseContextFromUrl = useCallback((url: string): Partial<MarketplaceContext> => {
    try {
      const urlObj = new URL(url);
      const params = urlObj.searchParams;
      
      const parsed: Partial<MarketplaceContext> = {};
      
      if (params.get('q')) parsed.searchTerm = params.get('q')!;
      if (params.get('category')) parsed.category = params.get('category')!;
      if (params.get('location')) {
        parsed.location = {
          lat: 0, lng: 0, // Will be geocoded later
          address: params.get('location')!
        };
      }
      if (params.get('urgency')) parsed.urgency = params.get('urgency') as any;
      if (params.get('clarity')) parsed.clarity = params.get('clarity') as any;
      if (params.get('budget')) parsed.budget = params.get('budget') as any;
      
      return parsed;
    } catch {
      return {};
    }
  }, []);

  const shouldShowCrossover = useCallback((type: 'discovery-to-post' | 'post-to-discovery'): boolean => {
    const crossoverCount = context.crossoverCount || 0;
    
    // Don't show if user has already crossed over too many times
    if (crossoverCount >= MAX_CROSSOVER_COUNT) return false;
    
    if (type === 'discovery-to-post') {
      // Show if search results are poor or user has been browsing for a while
      return (context.lastSearchResults || 0) < 3;
    } else {
      // Show if job has been waiting for offers for a while
      return (context.timeWaiting || 0) > 2; // hours
    }
  }, [context]);

  return {
    context,
    updateContext,
    clearContext,
    saveToStorage,
    loadFromStorage,
    generateContextUrl,
    parseContextFromUrl,
    shouldShowCrossover
  };
};