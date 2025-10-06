import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';

interface Workspace {
  id: string;
  name: string;
  description: string;
  category?: string;
}

interface WorkspaceSearchProps {
  workspaces: Workspace[];
  onSelect: (workspaceId: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WorkspaceSearch({ workspaces, onSelect, open, onOpenChange }: WorkspaceSearchProps) {
  const [search, setSearch] = useState('');

  const filteredWorkspaces = useMemo(() => {
    if (!search) return workspaces;
    
    const searchLower = search.toLowerCase();
    return workspaces.filter(
      w => 
        w.name.toLowerCase().includes(searchLower) ||
        w.description.toLowerCase().includes(searchLower) ||
        w.category?.toLowerCase().includes(searchLower)
    );
  }, [workspaces, search]);

  if (!open) return null;

  return (
    <Command className="rounded-lg border shadow-md">
      <CommandInput
        placeholder="Search workspaces..."
        value={search}
        onValueChange={setSearch}
      />
      <CommandList>
        <CommandEmpty>No workspaces found.</CommandEmpty>
        <CommandGroup heading="Workspaces">
          {filteredWorkspaces.map((workspace) => (
            <CommandItem
              key={workspace.id}
              onSelect={() => {
                onSelect(workspace.id);
                onOpenChange(false);
                setSearch('');
              }}
            >
              <div className="flex flex-col">
                <span className="font-medium">{workspace.name}</span>
                <span className="text-xs text-muted-foreground">
                  {workspace.description}
                </span>
              </div>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );
}
