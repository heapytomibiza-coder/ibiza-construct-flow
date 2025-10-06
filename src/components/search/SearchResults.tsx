import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, MapPin, CheckCircle2, Loader2 } from 'lucide-react';
import { SearchResult } from '@/hooks/useSearch';
import { Button } from '@/components/ui/button';

interface SearchResultsProps {
  results: SearchResult[];
  loading: boolean;
  onResultClick?: (result: SearchResult) => void;
}

export const SearchResults = ({
  results,
  loading,
  onResultClick
}: SearchResultsProps) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No results found</p>
        <p className="text-sm text-muted-foreground mt-2">
          Try adjusting your search or filters
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        {results.length} result{results.length !== 1 ? 's' : ''} found
      </div>

      <div className="grid gap-4">
        {results.map((result) => (
          <Card
            key={result.id}
            className="p-4 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onResultClick?.(result)}
          >
            <div className="flex gap-4">
              {result.type === 'professional' && (
                <Avatar className="h-16 w-16">
                  <AvatarImage src={result.avatar} alt={result.title} />
                  <AvatarFallback>{result.title.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
              )}

              <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{result.title}</h3>
                      {result.verified && (
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    {result.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {result.description}
                      </p>
                    )}
                  </div>
                  <Badge variant="secondary">{result.type}</Badge>
                </div>

                <div className="flex items-center gap-4 text-sm">
                  {result.rating !== undefined && (
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{result.rating.toFixed(1)}</span>
                    </div>
                  )}

                  {result.location && (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{result.location}</span>
                    </div>
                  )}

                  {result.price !== undefined && (
                    <div className="font-semibold">
                      ${result.price.toLocaleString()}
                    </div>
                  )}

                  {result.availability && (
                    <Badge
                      variant={result.availability === 'available' ? 'default' : 'secondary'}
                    >
                      {result.availability}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
