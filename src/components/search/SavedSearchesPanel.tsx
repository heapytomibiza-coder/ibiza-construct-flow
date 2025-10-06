import { useState } from 'react';
import { Bookmark, Trash2, Play, Bell, BellOff, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useSavedSearches } from '@/hooks/useSavedSearches';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';

interface SavedSearchesPanelProps {
  onRunSearch: (searchTerm: string, filters: any) => void;
}

export const SavedSearchesPanel = ({ onRunSearch }: SavedSearchesPanelProps) => {
  const { savedSearches, loading, toggleNotifications, deleteSearch, refreshSearches } = useSavedSearches();

  const handleToggleNotifications = async (searchId: string, enabled: boolean) => {
    await toggleNotifications(searchId, enabled);
  };

  const handleRunSearch = async (search: any) => {
    // Update last run time
    try {
      await (supabase as any)
        .from('saved_searches')
        .update({ last_checked_at: new Date().toISOString() })
        .eq('id', search.id);
    } catch (error) {
      console.error('Error updating last run:', error);
    }
    onRunSearch(search.search_query, search.filters);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-muted rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (savedSearches.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Bookmark className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            No saved searches yet. Save a search to quickly access it later.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bookmark className="h-5 w-5" />
            Saved Searches
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {savedSearches.map((search) => (
            <Card key={search.id} className="border-2">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold truncate">{search.name}</h4>
                      <Badge variant="outline">{search.search_type}</Badge>
                    </div>

                    {search.search_query && (
                      <p className="text-sm text-muted-foreground mb-2">
                        "{search.search_query}"
                      </p>
                    )}

                    {Object.keys(search.filters).length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {Object.entries(search.filters).map(([key, value]) => (
                          <Badge key={key} variant="secondary" className="text-xs">
                            {key}: {String(value)}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {search.last_checked_at && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        Last run {formatDistanceToNow(new Date(search.last_checked_at))} ago
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleRunSearch(search)}
                      className="gap-2"
                    >
                      <Play className="h-3 w-3" />
                      Run
                    </Button>

                    <div className="flex items-center gap-2">
                      <Switch
                        checked={search.notification_enabled}
                        onCheckedChange={(checked) =>
                          handleToggleNotifications(search.id, checked)
                        }
                      />
                      {search.notification_enabled ? (
                        <Bell className="h-4 w-4 text-primary" />
                      ) : (
                        <BellOff className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteSearch(search.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
