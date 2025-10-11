import { BookOpen, LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ViewModeToggleProps {
  value: 'wizard' | 'single';
  onChange: (mode: 'wizard' | 'single') => void;
}

export function ViewModeToggle({ value, onChange }: ViewModeToggleProps) {
  return (
    <div className="inline-flex items-center gap-1 p-1 bg-card rounded-lg border">
      <Button
        variant={value === 'wizard' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onChange('wizard')}
        className="gap-2"
      >
        <BookOpen className="h-4 w-4" />
        <span className="hidden sm:inline">Guided Tour</span>
      </Button>
      <Button
        variant={value === 'single' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onChange('single')}
        className="gap-2"
      >
        <LayoutGrid className="h-4 w-4" />
        <span className="hidden sm:inline">Quick View</span>
      </Button>
    </div>
  );
}
