/**
 * Search Bar Component
 * Phase 17: Advanced Search & Filtering System
 * 
 * Enhanced search input with autocomplete and history
 */

import { useState, useRef, useEffect } from 'react';
import { Search, X, Clock, TrendingUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch?: (value: string) => void;
  placeholder?: string;
  suggestions?: string[];
  recentSearches?: string[];
  className?: string;
}

export function SearchBar({
  value,
  onChange,
  onSearch,
  placeholder = 'Search...',
  suggestions = [],
  recentSearches = [],
  className,
}: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const hasContent = value.trim().length > 0;
  const hasSuggestions = suggestions.length > 0 || recentSearches.length > 0;

  useEffect(() => {
    setShowSuggestions(isFocused && (hasContent || recentSearches.length > 0));
  }, [isFocused, hasContent, recentSearches.length]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (hasContent) {
      onSearch?.(value);
      setShowSuggestions(false);
    }
  };

  const handleClear = () => {
    onChange('');
    inputRef.current?.focus();
  };

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion);
    onSearch?.(suggestion);
    setShowSuggestions(false);
  };

  return (
    <div className={cn('relative', className)}>
      <form onSubmit={handleSubmit} className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          placeholder={placeholder}
          className="pl-10 pr-10"
        />
        {hasContent && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </form>

      {showSuggestions && hasSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-popover border rounded-md shadow-lg z-50 max-h-80 overflow-y-auto">
          {recentSearches.length > 0 && !hasContent && (
            <div className="p-2">
              <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Recent Searches</span>
              </div>
              {recentSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(search)}
                  className="w-full text-left px-3 py-2 hover:bg-accent rounded-sm transition-colors"
                >
                  {search}
                </button>
              ))}
            </div>
          )}

          {suggestions.length > 0 && hasContent && (
            <div className="p-2">
              <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
                <TrendingUp className="h-4 w-4" />
                <span>Suggestions</span>
              </div>
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full text-left px-3 py-2 hover:bg-accent rounded-sm transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
