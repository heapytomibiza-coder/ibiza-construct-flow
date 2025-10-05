import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGlobalSearch } from '@/hooks/useGlobalSearch';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Briefcase, User, MessageSquare, DollarSign, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const iconMap = {
  job: Briefcase,
  professional: User,
  conversation: MessageSquare,
  offer: DollarSign,
};

export const GlobalSearch = () => {
  const navigate = useNavigate();
  const { query, setQuery, results, loading, isOpen, setIsOpen } = useGlobalSearch();

  const handleSelect = (url: string) => {
    setIsOpen(false);
    setQuery('');
    navigate(url);
  };

  // Group results by type
  const groupedResults = results.reduce((acc, result) => {
    if (!acc[result.type]) {
      acc[result.type] = [];
    }
    acc[result.type].push(result);
    return acc;
  }, {} as Record<string, typeof results>);

  return (
    <CommandDialog open={isOpen} onOpenChange={setIsOpen} aria-label="Global search">
      <CommandInput
        placeholder="Search jobs, professionals, conversations..."
        value={query}
        onValueChange={setQuery}
        aria-label="Search everything"
      />
      <CommandList aria-label="Search results">
        {loading && (
          <div className="py-6 text-center text-sm text-muted-foreground" role="status" aria-live="polite">
            Searching...
          </div>
        )}

        {!loading && results.length === 0 && query && (
          <CommandEmpty>
            <div className="py-6 text-center">
              <Search className="w-12 h-12 mx-auto mb-3 text-muted-foreground" aria-hidden="true" />
              <p className="font-medium">No results found</p>
              <p className="text-sm text-muted-foreground">
                Try different keywords or check spelling
              </p>
            </div>
          </CommandEmpty>
        )}

        {!query && !loading && (
          <div className="py-6 px-4" role="region" aria-label="Search tips">
            <p className="text-sm text-muted-foreground mb-3">Quick tips:</p>
            <ul className="space-y-1 text-xs text-muted-foreground" role="list">
              <li>• Press <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono" aria-label="Command or Control plus K">Cmd/Ctrl + K</kbd> to search</li>
              <li>• Search for jobs, professionals, messages, or offers</li>
              <li>• Use keywords from job titles or names</li>
            </ul>
          </div>
        )}

        {Object.entries(groupedResults).map(([type, items]) => {
          const Icon = iconMap[type as keyof typeof iconMap];
          const typeLabel = type.charAt(0).toUpperCase() + type.slice(1) + 's';

          return (
            <CommandGroup key={type} heading={typeLabel}>
              {items.map((result) => (
                <CommandItem
                  key={result.id}
                  onSelect={() => handleSelect(result.url)}
                  className="flex items-center gap-3 py-3 min-h-[44px] focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label={`${result.title}${result.subtitle ? `, ${result.subtitle}` : ''}${result.metadata?.status ? `, Status: ${result.metadata.status}` : ''}`}
                >
                  <div className="p-2 rounded-lg bg-secondary" aria-hidden="true">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{result.title}</p>
                    {result.subtitle && (
                      <p className="text-sm text-muted-foreground truncate">
                        {result.subtitle}
                      </p>
                    )}
                  </div>
                  {result.metadata?.status && (
                    <Badge variant="secondary" className="shrink-0" aria-label={`Status: ${result.metadata.status}`}>
                      {result.metadata.status}
                    </Badge>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          );
        })}
      </CommandList>

      <div className="border-t p-2 text-xs text-muted-foreground" role="note" aria-label="Keyboard shortcuts">
        <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono" aria-label="Up and down arrows">↑↓</kbd> to navigate
        <span className="mx-2" aria-hidden="true">•</span>
        <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono" aria-label="Enter key">Enter</kbd> to select
        <span className="mx-2" aria-hidden="true">•</span>
        <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono" aria-label="Escape key">Esc</kbd> to close
      </div>
    </CommandDialog>
  );
};
