import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Trash2, Bell, Search, Loader2 } from 'lucide-react';
import { useSavedSearches } from '@/hooks/useSavedSearches';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface SavedSearchesProps {
  onSearchClick?: (search: any) => void;
}

export const SavedSearches = ({ onSearchClick }: SavedSearchesProps) => {
  const { savedSearches, loading, deleteSearch, toggleNotifications } = useSavedSearches();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (savedSearches.length === 0) {
    return (
      <div className="text-center py-8">
        <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No saved searches yet</p>
        <p className="text-sm text-muted-foreground mt-2">
          Save your searches to quickly access them later
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Saved Searches</h3>
        <Badge variant="secondary">{savedSearches.length}</Badge>
      </div>

      <div className="grid gap-3">
        {savedSearches.map((search) => (
          <Card key={search.id} className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div
                className="flex-1 space-y-2 cursor-pointer"
                onClick={() => onSearchClick?.(search)}
              >
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">{search.name}</h4>
                  <Badge variant="outline" className="text-xs">
                    {search.search_type}
                  </Badge>
                </div>
                {search.search_query && (
                  <p className="text-sm text-muted-foreground">
                    "{search.search_query}"
                  </p>
                )}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>
                    Created {new Date(search.created_at).toLocaleDateString()}
                  </span>
                  {search.last_checked_at && (
                    <span>
                      • Last checked {new Date(search.last_checked_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-muted-foreground" />
                  <Switch
                    checked={search.notification_enabled}
                    onCheckedChange={(checked) =>
                      toggleNotifications(search.id, checked)
                    }
                  />
                </div>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete saved search?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete "{search.name}" from your saved
                        searches.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => deleteSearch(search.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
