# Phase 26: Advanced Search & Filtering System

## Overview
Comprehensive search and filtering system with full-text search, relevance scoring, advanced filters, faceted search, saved searches, search history, and suggestions.

## Features Implemented

### 1. Search Engine
- **Full-Text Search**: Index and search across multiple fields
- **Tokenization**: Smart text processing with stop words
- **Relevance Scoring**: Score results by field boost weights
- **Fuzzy Matching**: Find similar terms (optional)
- **Multi-Field Search**: Search title, description, content, tags
- **Field Boosting**: Weight fields differently (title > tags > description > content)
- **Pagination**: Offset and limit support
- **Type Filtering**: Filter by item type
- **Performance Tracking**: Track search execution time

### 2. Filter Manager
- **Advanced Filters**: 12 filter operators (eq, ne, gt, gte, lt, lte, in, nin, contains, startsWith, endsWith, between)
- **Filter Groups**: Group filters with AND/OR logic
- **Faceted Search**: Generate facets for field values
- **Dynamic Filtering**: Apply filters to search results
- **Nested Fields**: Support dot notation for nested objects

### 3. Saved Search Manager
- **Save Searches**: Store search queries for later
- **Search History**: Track all searches with timestamps
- **Recent Searches**: Quick access to recent queries
- **Popular Searches**: Aggregate most common searches
- **Execution Tracking**: Count how many times saved searches are used
- **Per-User Storage**: Individual saved searches per user

### 4. React Integration
- **Hooks**:
  - `useSearch`: Main search hook with debouncing
  - `useFilters`: Filter management
  - `useSavedSearches`: Saved search operations
- **Auto-Search**: Automatic search on query change
- **Debouncing**: Prevent excessive search calls

### 5. Search Features
- **Case-Insensitive**: Optional case sensitivity
- **Stop Words**: Filter common words
- **Min Length**: Minimum search term length
- **Max Results**: Configurable result limits
- **Sorting**: Sort by any field or relevance
- **Metadata**: Store custom data with items

## Architecture

### Search Flow
```
Query → Tokenize → Index Lookup → Score → Filter → Sort → Paginate → Results
```

### Components
- **SearchEngine**: Core search and indexing
- **FilterManager**: Filter and facet management
- **SavedSearchManager**: Search persistence
- **React Hooks**: React integration layer

## Usage Examples

### Basic Search

```tsx
import { useSearch } from '@/hooks/search';

function SearchComponent() {
  const { query, results, loading, updateQuery } = useSearch();

  return (
    <div>
      <input
        value={query.query}
        onChange={(e) => updateQuery({ query: e.target.value })}
        placeholder="Search..."
      />
      
      {loading && <p>Searching...</p>}
      
      <div>
        Found {results.total} results in {results.took}ms
      </div>
      
      {results.items.map(item => (
        <div key={item.id}>
          <h3>{item.title}</h3>
          <p>{item.description}</p>
        </div>
      ))}
    </div>
  );
}
```

### Add Items to Index

```tsx
import { searchEngine } from '@/lib/search';

// Add single item
searchEngine.addItem({
  id: '1',
  type: 'job',
  title: 'Software Engineer',
  description: 'Build amazing applications',
  content: 'Full description here...',
  tags: ['javascript', 'react', 'typescript'],
  createdAt: new Date(),
});

// Add multiple items
const jobs = getJobs();
searchEngine.addItems(jobs.map(job => ({
  id: job.id,
  type: 'job',
  title: job.title,
  description: job.description,
  tags: job.skills,
  metadata: { salary: job.salary, location: job.location },
  createdAt: job.createdAt,
})));
```

### Advanced Filtering

```tsx
import { useSearch, useFilters } from '@/hooks/search';

function FilteredSearch() {
  const { query, results, updateQuery } = useSearch();
  const { activeFilters, addFilter, removeFilter } = useFilters();

  const handleAddFilter = () => {
    addFilter({
      field: 'metadata.salary',
      operator: 'gte',
      value: 50000,
    });
    updateQuery({ filters: [...activeFilters, newFilter] });
  };

  return (
    <div>
      {/* Search input */}
      
      {/* Active filters */}
      {activeFilters.map((filter, index) => (
        <div key={index}>
          {filter.field} {filter.operator} {filter.value}
          <button onClick={() => removeFilter(index)}>Remove</button>
        </div>
      ))}
      
      {/* Results */}
    </div>
  );
}
```

### Saved Searches

```tsx
import { useSavedSearches } from '@/hooks/search';

function SavedSearchesPanel() {
  const { 
    savedSearches, 
    saveSearch, 
    executeSavedSearch, 
    deleteSavedSearch 
  } = useSavedSearches();

  const handleSave = () => {
    saveSearch('My Search', {
      query: 'engineer',
      filters: [{ field: 'type', operator: 'eq', value: 'job' }],
    });
  };

  const handleExecute = (id: string) => {
    const query = executeSavedSearch(id);
    if (query) {
      // Use query to perform search
    }
  };

  return (
    <div>
      <button onClick={handleSave}>Save Current Search</button>
      
      <h3>Saved Searches</h3>
      {savedSearches.map(search => (
        <div key={search.id}>
          <span>{search.name}</span>
          <button onClick={() => handleExecute(search.id)}>Execute</button>
          <button onClick={() => deleteSavedSearch(search.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}
```

### Search with Type Filter

```tsx
import { useSearch } from '@/hooks/search';

function JobSearch() {
  const { query, results, updateQuery } = useSearch({
    query: '',
    type: 'job', // Only search jobs
  });

  return (
    <div>
      <input
        value={query.query}
        onChange={(e) => updateQuery({ query: e.target.value })}
      />
      
      {results.items.map(job => (
        <JobCard key={job.id} job={job} />
      ))}
    </div>
  );
}
```

### Faceted Search

```tsx
import { filterManager } from '@/lib/search';
import { searchEngine } from '@/lib/search';

function FacetedSearch() {
  const items = searchEngine.getAllItems();
  
  // Generate facets
  const facets = filterManager.generateFacets(items, [
    'type',
    'tags',
    'metadata.location',
  ]);

  return (
    <div>
      <h3>Filter by Type</h3>
      {facets.type?.map(facet => (
        <div key={facet.value}>
          {facet.value} ({facet.count})
        </div>
      ))}
      
      <h3>Filter by Tags</h3>
      {facets.tags?.map(facet => (
        <div key={facet.value}>
          {facet.value} ({facet.count})
        </div>
      ))}
    </div>
  );
}
```

### Search History

```tsx
import { useSavedSearches } from '@/hooks/search';

function SearchHistory() {
  const { history, recentSearches, clearHistory } = useSavedSearches();

  return (
    <div>
      <h3>Recent Searches</h3>
      {recentSearches.map((query, index) => (
        <div key={index} onClick={() => performSearch(query)}>
          {query}
        </div>
      ))}
      
      <h3>Search History</h3>
      {history.map(entry => (
        <div key={entry.id}>
          {entry.query} - {entry.resultsCount} results
          <span>{new Date(entry.timestamp).toLocaleString()}</span>
        </div>
      ))}
      
      <button onClick={clearHistory}>Clear History</button>
    </div>
  );
}
```

### Custom Sort

```tsx
import { useSearch } from '@/hooks/search';

function SortableSearch() {
  const { query, results, updateQuery } = useSearch();

  const handleSort = (field: string, direction: 'asc' | 'desc') => {
    updateQuery({
      sort: { field, direction },
    });
  };

  return (
    <div>
      <button onClick={() => handleSort('createdAt', 'desc')}>
        Newest First
      </button>
      <button onClick={() => handleSort('title', 'asc')}>
        Alphabetical
      </button>
      
      {/* Results */}
    </div>
  );
}
```

### Range Filter

```tsx
import { useFilters } from '@/hooks/search';

function SalaryFilter() {
  const { addFilter } = useFilters();

  const handleRangeFilter = (min: number, max: number) => {
    addFilter({
      field: 'metadata.salary',
      operator: 'between',
      value: [min, max],
    });
  };

  return (
    <div>
      <input
        type="number"
        placeholder="Min Salary"
        onChange={(e) => setMin(parseInt(e.target.value))}
      />
      <input
        type="number"
        placeholder="Max Salary"
        onChange={(e) => setMax(parseInt(e.target.value))}
      />
      <button onClick={() => handleRangeFilter(min, max)}>
        Apply
      </button>
    </div>
  );
}
```

### Configure Search Engine

```tsx
import { SearchEngine } from '@/lib/search';

const customSearchEngine = new SearchEngine({
  caseSensitive: false,
  fuzzyMatch: true,
  fuzzyThreshold: 0.8,
  stemming: false,
  stopWords: ['the', 'a', 'an'],
  boostFields: {
    title: 5,      // Most important
    tags: 3,
    description: 2,
    content: 1,    // Least important
  },
  minSearchLength: 3,
  maxResults: 50,
});
```

## Filter Operators

- **eq**: Equals
- **ne**: Not equals
- **gt**: Greater than
- **gte**: Greater than or equal
- **lt**: Less than
- **lte**: Less than or equal
- **in**: In array
- **nin**: Not in array
- **contains**: Contains substring
- **startsWith**: Starts with substring
- **endsWith**: Ends with substring
- **between**: Between two values

## Best Practices

1. **Index Early**: Add items to search as soon as they're created
2. **Update Index**: Update search index when items change
3. **Remove Deleted**: Remove items from index when deleted
4. **Use Debounce**: Debounce search input for better performance
5. **Limit Results**: Use pagination for large result sets
6. **Cache Results**: Cache search results when appropriate
7. **Boost Important Fields**: Weight title/name fields higher
8. **Filter First**: Apply filters before expensive operations
9. **Track History**: Add searches to history for analytics
10. **Clear Old Data**: Periodically clean up old history

## Performance Considerations

- Index size grows with content
- Fuzzy matching is expensive
- Large result sets need pagination
- Debounce user input
- Cache frequent searches
- Use field boosting strategically

## Integration Examples

### With Jobs

```tsx
import { searchEngine } from '@/lib/search';

// Index all jobs
jobs.forEach(job => {
  searchEngine.addItem({
    id: job.id,
    type: 'job',
    title: job.title,
    description: job.description,
    tags: job.skills,
    metadata: {
      salary: job.salary,
      location: job.location,
      company: job.company,
    },
    createdAt: job.createdAt,
  });
});

// Search jobs
const results = searchEngine.search({
  query: 'software engineer',
  type: 'job',
  filters: [
    { field: 'metadata.location', operator: 'eq', value: 'Remote' },
    { field: 'metadata.salary', operator: 'gte', value: 100000 },
  ],
  sort: { field: 'createdAt', direction: 'desc' },
  limit: 20,
});
```

### With Analytics (Phase 22)

```tsx
import { analyticsManager } from '@/lib/analytics';
import { useSavedSearches } from '@/hooks/search';

function SearchWithAnalytics() {
  const { addToHistory } = useSavedSearches();

  const handleSearch = async (query: string) => {
    const results = searchEngine.search({ query });
    
    // Track search
    analyticsManager.track('search_performed', {
      query,
      resultsCount: results.total,
      took: results.took,
    });
    
    // Add to history
    addToHistory(query, results.total);
    
    return results;
  };
}
```

## Future Enhancements

- [ ] Search suggestions/autocomplete
- [ ] Spell correction
- [ ] Synonyms support
- [ ] Search result highlighting
- [ ] Advanced query syntax (AND, OR, NOT)
- [ ] Geo-location search
- [ ] Image search
- [ ] Voice search
- [ ] ML-based ranking
- [ ] A/B testing for search

## Dependencies

- uuid: ID generation
- date-fns: Date utilities (if needed)
- React: UI hooks

## Testing

```tsx
import { describe, it, expect } from 'vitest';
import { searchEngine } from '@/lib/search';

describe('Search Engine', () => {
  it('finds items by title', () => {
    searchEngine.addItem({
      id: '1',
      type: 'job',
      title: 'Software Engineer',
      createdAt: new Date(),
    });
    
    const results = searchEngine.search({ query: 'engineer' });
    expect(results.total).toBe(1);
    expect(results.items[0].title).toBe('Software Engineer');
  });
  
  it('filters by type', () => {
    const results = searchEngine.search({
      query: 'test',
      type: 'job',
    });
    
    expect(results.items.every(item => item.type === 'job')).toBe(true);
  });
});
```
