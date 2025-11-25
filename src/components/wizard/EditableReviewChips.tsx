import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pencil, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { InlineChipEditor } from './InlineChipEditor';

interface ReviewChip {
  id: string;
  label: string;
  value: string;
  editable: boolean;
  type: 'text' | 'select' | 'number';
  options?: string[];
}

interface EditableReviewChipsProps {
  chips: ReviewChip[];
  onChipEdit: (chipId: string, newValue: string) => void;
}

export const EditableReviewChips = ({
  chips,
  onChipEdit
}: EditableReviewChipsProps) => {
  const { t } = useTranslation();
  const [editingChipId, setEditingChipId] = useState<string | null>(null);

  const handleEditClick = (chipId: string) => {
    setEditingChipId(chipId);
  };

  const handleSave = (chipId: string, newValue: string) => {
    onChipEdit(chipId, newValue);
    setEditingChipId(null);
  };

  const handleCancel = () => {
    setEditingChipId(null);
  };

  return (
    <div className="space-y-6" role="form" aria-label="Job request review form">
      <div className="space-y-3">
        <h3 className="text-lg font-semibold" id="review-heading">Review & Submit</h3>
        <p className="text-sm text-muted-foreground">
          Tap any detail to edit before submitting
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4" role="list" aria-labelledby="review-heading">
        {chips.map((chip) => (
          <div
            key={chip.id}
            className={cn(
              "flex flex-col p-6 rounded-2xl border-2 transition-all shadow-sm",
              editingChipId === chip.id
                ? "border-primary bg-primary/5 shadow-md"
                : "border-border bg-card hover:border-primary/30 hover:shadow-md"
            )}
            role="listitem"
          >
            <div className="flex-1 space-y-2">
              <label 
                htmlFor={`chip-${chip.id}`}
                className="text-sm font-semibold text-muted-foreground uppercase tracking-wide"
              >
                {chip.label}
              </label>
              
              {editingChipId === chip.id ? (
                <InlineChipEditor
                  type={chip.type}
                  value={chip.value}
                  options={chip.options}
                  onSave={(newValue) => handleSave(chip.id, newValue)}
                  onCancel={handleCancel}
                />
              ) : (
                <p className="text-lg font-semibold" id={`chip-${chip.id}`} role="status">
                  {chip.value}
                </p>
              )}
            </div>

            {chip.editable && editingChipId !== chip.id && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEditClick(chip.id)}
                className="self-start mt-2 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                aria-label={`Edit ${chip.label}`}
              >
                <Pencil className="w-4 h-4 mr-2" aria-hidden="true" />
                Edit
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
