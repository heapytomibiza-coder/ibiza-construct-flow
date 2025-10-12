import { useState } from 'react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { useNavigate } from 'react-router-dom';
import { useCommonShortcuts } from '@/hooks/useShortcuts';
import {
  Search,
  Home,
  Plus,
  Settings,
  BarChart3,
  MessageSquare,
  Bell,
  User,
} from 'lucide-react';

export function QuickActions() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useCommonShortcuts({
    onSearch: () => setOpen(true),
    onEscape: () => setOpen(false),
  });

  const handleSelect = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors"
      >
        <Search className="w-4 h-4" />
        <span className="hidden md:inline">Quick actions</span>
        <kbd className="hidden md:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          
          <CommandGroup heading="Navigation">
            <CommandItem onSelect={() => handleSelect('/')}>
              <Home className="mr-2 h-4 w-4" />
              <span>Home</span>
            </CommandItem>
            <CommandItem onSelect={() => handleSelect('/post')}>
              <Plus className="mr-2 h-4 w-4" />
              <span>New Post</span>
            </CommandItem>
            <CommandItem onSelect={() => handleSelect('/settings')}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </CommandItem>
          </CommandGroup>

          <CommandGroup heading="Features">
            <CommandItem onSelect={() => handleSelect('/analytics')}>
              <BarChart3 className="mr-2 h-4 w-4" />
              <span>Analytics</span>
            </CommandItem>
            <CommandItem onSelect={() => handleSelect('/messages')}>
              <MessageSquare className="mr-2 h-4 w-4" />
              <span>Messages</span>
            </CommandItem>
            <CommandItem onSelect={() => handleSelect('/notifications')}>
              <Bell className="mr-2 h-4 w-4" />
              <span>Notifications</span>
            </CommandItem>
            <CommandItem onSelect={() => handleSelect('/profile')}>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
