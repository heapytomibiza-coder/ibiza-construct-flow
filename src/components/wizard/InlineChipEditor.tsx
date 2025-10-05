import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Check, X } from 'lucide-react';

interface InlineChipEditorProps {
  type: 'text' | 'select' | 'number';
  value: string;
  options?: string[];
  onSave: (newValue: string) => void;
  onCancel: () => void;
}

export const InlineChipEditor = ({
  type,
  value,
  options,
  onSave,
  onCancel
}: InlineChipEditorProps) => {
  const [editValue, setEditValue] = useState(value);

  const handleSave = () => {
    if (editValue.trim()) {
      onSave(editValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1">
        {type === 'select' && options ? (
          <Select value={editValue} onValueChange={setEditValue}>
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Input
            type={type === 'number' ? 'number' : 'text'}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            className="h-9"
          />
        )}
      </div>

      <div className="flex gap-1 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleSave}
          className="h-9 w-9 text-green-600 hover:text-green-700 hover:bg-green-50"
        >
          <Check className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onCancel}
          className="h-9 w-9 text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
