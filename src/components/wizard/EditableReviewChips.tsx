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
    <div className="space-y-6" role="form" aria-label="Job request review form">
      <div className="space-y-3">
        <h3 className="text-lg font-semibold" id="review-heading">Review & Submit</h3>
        <p className="text-sm text-muted-foreground">
          Tap any detail to edit before submitting
        </p>
      </div>

      <div className="space-y-4" role="list" aria-labelledby="review-heading">
        {chips.map((chip) => (
          <div
            key={chip.id}
            className={cn(
              "flex items-center justify-between p-4 rounded-xl border-2 transition-all min-h-[44px]",
              editingChipId === chip.id
                ? "border-primary bg-primary/5"
                : "border-border bg-card hover:border-primary/50"
            )}
            role="listitem"
          >
            <div className="flex-1 space-y-1">
              <label 
                htmlFor={`chip-${chip.id}`}
                className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
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
                <p className="text-base font-medium" id={`chip-${chip.id}`} role="status">
                  {chip.value}
                </p>
              )}
            </div>

            {chip.editable && editingChipId !== chip.id && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleEditClick(chip.id)}
                className="shrink-0 ml-3 min-h-[44px] min-w-[44px] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                aria-label={`Edit ${chip.label}`}
              >
                <Pencil className="w-4 h-4" aria-hidden="true" />
              </Button>
            )}
          </div>
        ))}
      </div>

      <div className="pt-4">
        <Button
          onClick={onSubmit}
          disabled={isSubmitting || editingChipId !== null}
          className="w-full min-h-[44px] h-12 text-base font-semibold focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-label="Submit job request"
          aria-busy={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className="sr-only">Submitting your request...</span>
              <span aria-hidden="true">Submitting...</span>
            </>
          ) : (
            <>
              <Check className="w-5 h-5 mr-2" aria-hidden="true" />
              Submit Job Request
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
