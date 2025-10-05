import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Command,
  Image,
  Calendar,
  DollarSign,
  FileText,
  X,
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CommandPaletteProps {
  onCommand: (command: string, args?: any) => void;
  onClose: () => void;
}

const COMMANDS = [
  {
    id: 'quote',
    icon: FileText,
    label: 'Send Quote',
    description: 'Send a price quote for this job',
    usage: '/quote [amount]',
  },
  {
    id: 'availability',
    icon: Calendar,
    label: 'Share Availability',
    description: 'Share your available times',
    usage: '/availability',
  },
  {
    id: 'photos',
    icon: Image,
    label: 'Request Photos',
    description: 'Ask for photos or documentation',
    usage: '/share-photos',
  },
  {
    id: 'escrow',
    icon: DollarSign,
    label: 'Request Escrow',
    description: 'Request escrow payment setup',
    usage: '/request-escrow [amount]',
  },
];

export const CommandPalette = ({ onCommand, onClose }: CommandPaletteProps) => {
  const [input, setInput] = useState('');
  const [filteredCommands, setFilteredCommands] = useState(COMMANDS);

  const handleInputChange = (value: string) => {
    setInput(value);
    
    if (value.startsWith('/')) {
      const searchTerm = value.slice(1).toLowerCase();
      setFilteredCommands(
        COMMANDS.filter(cmd =>
          cmd.id.includes(searchTerm) ||
          cmd.label.toLowerCase().includes(searchTerm)
        )
      );
    } else {
      setFilteredCommands(COMMANDS);
    }
  };

  const handleCommandSelect = (command: typeof COMMANDS[0]) => {
    if (command.id === 'quote' || command.id === 'escrow') {
      // These commands need an amount parameter
      const amount = prompt(`Enter ${command.id === 'quote' ? 'quote' : 'escrow'} amount:`);
      if (amount) {
        onCommand(command.id, { amount: parseFloat(amount) });
      }
    } else {
      onCommand(command.id);
    }
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'Enter' && input.startsWith('/')) {
      // Execute first matching command
      const commandName = input.slice(1).split(' ')[0];
      const matchingCommand = COMMANDS.find(cmd => cmd.id === commandName);
      if (matchingCommand) {
        handleCommandSelect(matchingCommand);
      }
    }
  };

  return (
    <Card className="absolute bottom-full left-0 right-0 mb-2 p-4 shadow-lg border-2 border-primary z-50">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Command className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Quick Commands</h3>
            <Badge variant="secondary" className="text-xs">
              Power user mode
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Input */}
        <Input
          value={input}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type / for commands..."
          autoFocus
          className="h-10"
        />

        {/* Commands list */}
        <ScrollArea className="h-[240px]">
          <div className="space-y-2">
            {filteredCommands.map((command) => {
              const Icon = command.icon;
              return (
                <button
                  key={command.id}
                  onClick={() => handleCommandSelect(command)}
                  className="w-full flex items-start gap-3 p-3 rounded-lg hover:bg-secondary transition-colors text-left"
                >
                  <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{command.label}</p>
                    <p className="text-sm text-muted-foreground">
                      {command.description}
                    </p>
                    <code className="text-xs text-muted-foreground mt-1 block">
                      {command.usage}
                    </code>
                  </div>
                </button>
              );
            })}
          </div>
        </ScrollArea>

        {/* Footer hint */}
        <div className="text-xs text-muted-foreground pt-2 border-t">
          <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono">Esc</kbd> to close
          <span className="mx-2">•</span>
          <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono">Enter</kbd> to execute
        </div>
      </div>
    </Card>
  );
};
