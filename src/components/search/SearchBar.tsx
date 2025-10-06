import { Search, X, Filter, Save } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { useSavedSearches } from '@/hooks/useSavedSearches';
import { useToast } from '@/hooks/use-toast';

interface SearchBarProps {
  query: string;
  onQueryChange: (query: string) => void;
  searchType: 'professional' | 'job' | 'service';
  onSearchTypeChange: (type: 'professional' | 'job' | 'service') => void;
  onClear: () => void;
  onFilterClick: () => void;
  activeFiltersCount?: number;
  filters?: any;
}

export const SearchBar = ({
  query,
  onQueryChange,
  searchType,
  onSearchTypeChange,
  onClear,
  onFilterClick,
  activeFiltersCount = 0,
  filters
}: SearchBarProps) => {
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [searchName, setSearchName] = useState('');
  const { saveSearch } = useSavedSearches();
  const { toast } = useToast();

  const handleSaveSearch = async () => {
    if (!searchName.trim()) {
      toast({
        title: 'Name required',
        description: 'Please enter a name for this search',
        variant: 'destructive'
      });
      return;
    }

    await saveSearch(searchName, query, searchType, filters || {}, false);
    setSaveDialogOpen(false);
    setSearchName('');
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Select value={searchType} onValueChange={onSearchTypeChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="professional">Professionals</SelectItem>
            <SelectItem value="job">Jobs</SelectItem>
            <SelectItem value="service">Services</SelectItem>
          </SelectContent>
        </Select>

        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={`Search ${searchType}s...`}
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            className="pl-10 pr-10"
          />
          {query && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
              onClick={onClear}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={onFilterClick}
          className="relative"
        >
          <Filter className="h-4 w-4" />
          {activeFiltersCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {activeFiltersCount}
            </Badge>
          )}
        </Button>

        {query && (
          <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon">
                <Save className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Save Search</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="search-name">Search Name</Label>
                  <Input
                    id="search-name"
                    placeholder="My saved search"
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                  />
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>Query: {query}</p>
                  <p>Type: {searchType}</p>
                </div>
                <Button onClick={handleSaveSearch} className="w-full">
                  Save Search
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
};
