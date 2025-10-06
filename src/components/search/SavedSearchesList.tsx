import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Trash2, Bell, BellOff, Search } from 'lucide-react';
import { useSavedSearches } from '@/hooks/useSavedSearches';
import { Skeleton } from '@/components/ui/skeleton';

interface SavedSearchesListProps {
  onSearchClick: (query: string, filters: Record<string, any>) => void;
}

export const SavedSearchesList = ({ onSearchClick }: SavedSearchesListProps) => {
  const { savedSearches, isLoading, updateSavedSearch, deleteSavedSearch } = useSavedSearches();

  const handleNotificationToggle = (searchId: string, enabled: boolean) => {
    updateSavedSearch(searchId, { notification_enabled: enabled });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="p-4">
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-full" />
          </Card>
        ))}
      </div>
    );
  }

  if (savedSearches.length === 0) {
    return (
      <Card className="p-8 text-center">
        <div className="text-muted-foreground">
          <p className="text-lg font-medium mb-2">No saved searches yet</p>
          <p>Save your searches to quickly access them later</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {savedSearches.map((search) => (
        <Card key={search.id} className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="font-semibold">{search.name}</h4>
                {search.notification_enabled && (
                  <Badge variant="secondary" className="gap-1">
                    <Bell className="h-3 w-3" />
                    {search.notification_frequency || 'instant'}
                  </Badge>
                )}
              </div>

              <p className="text-sm text-muted-foreground mb-2">
                "{search.query}"
              </p>

              {Object.keys(search.filters).length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {Object.entries(search.filters).map(([key, value]) => (
                    <Badge key={key} variant="outline" className="text-xs">
                      {key}: {String(value)}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>{search.result_count} results</span>
                <span>
                  Created {new Date(search.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Button
                size="sm"
                onClick={() => onSearchClick(search.query, search.filters as any)}
              >
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>

              <div className="flex items-center gap-2">
                <Switch
                  checked={search.notification_enabled}
                  onCheckedChange={(checked) =>
                    handleNotificationToggle(search.id, checked)
                  }
                />
                {search.notification_enabled ? (
                  <Bell className="h-4 w-4" />
                ) : (
                  <BellOff className="h-4 w-4" />
                )}
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteSavedSearch(search.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
