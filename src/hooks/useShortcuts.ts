import { useEffect } from 'react';

interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  callback: (e: KeyboardEvent) => void;
  description?: string;
}

export function useKeyboardShortcuts(shortcuts: ShortcutConfig[]) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      shortcuts.forEach(shortcut => {
        const isMatch = 
          e.key.toLowerCase() === shortcut.key.toLowerCase() &&
          (!shortcut.ctrl || e.ctrlKey || e.metaKey) &&
          (!shortcut.shift || e.shiftKey) &&
          (!shortcut.alt || e.altKey);

        if (isMatch) {
          e.preventDefault();
          shortcut.callback(e);
        }
      });
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [shortcuts]);
}

// Common keyboard shortcuts hook
export function useCommonShortcuts(handlers: {
  onSearch?: () => void;
  onSave?: () => void;
  onNew?: () => void;
  onEscape?: () => void;
}) {
  useKeyboardShortcuts([
    {
      key: 'k',
      ctrl: true,
      callback: () => handlers.onSearch?.(),
      description: 'Search'
    },
    {
      key: 's',
      ctrl: true,
      callback: () => handlers.onSave?.(),
      description: 'Save'
    },
    {
      key: 'n',
      ctrl: true,
      callback: () => handlers.onNew?.(),
      description: 'New'
    },
    {
      key: 'Escape',
      callback: () => handlers.onEscape?.(),
      description: 'Close/Cancel'
    }
  ]);
}
