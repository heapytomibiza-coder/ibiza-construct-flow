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
  onSubmit: () => void;
  isSubmitting?: boolean;
}

export const EditableReviewChips = ({
  chips,
  onChipEdit,
  onSubmit,
  isSubmitting
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
    <div className="space-y-6">
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Review & Submit</h3>
        <p className="text-sm text-muted-foreground">
          Tap any detail to edit before submitting
        </p>
      </div>

      <div className="space-y-4">
        {chips.map((chip) => (
          <div
            key={chip.id}
            className={cn(
              "flex items-center justify-between p-4 rounded-xl border-2 transition-all",
              editingChipId === chip.id
                ? "border-primary bg-primary/5"
                : "border-border bg-card hover:border-primary/50"
            )}
          >
            <div className="flex-1 space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {chip.label}
              </p>
              
              {editingChipId === chip.id ? (
                <InlineChipEditor
                  type={chip.type}
                  value={chip.value}
                  options={chip.options}
                  onSave={(newValue) => handleSave(chip.id, newValue)}
                  onCancel={handleCancel}
                />
              ) : (
                <p className="text-base font-medium">{chip.value}</p>
              )}
            </div>

            {chip.editable && editingChipId !== chip.id && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleEditClick(chip.id)}
                className="shrink-0 ml-3"
              >
                <Pencil className="w-4 h-4" />
              </Button>
            )}
          </div>
        ))}
      </div>

      <div className="pt-4">
        <Button
          onClick={onSubmit}
          disabled={isSubmitting || editingChipId !== null}
          className="w-full h-12 text-base font-semibold"
        >
          {isSubmitting ? (
            'Submitting...'
          ) : (
            <>
              <Check className="w-5 h-5 mr-2" />
              Submit Job Request
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
