import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface CategorySuggestionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  suggestionType: 'category' | 'subcategory' | 'micro_category';
  parentId?: string;
  onSuccess: () => void;
}

export function CategorySuggestionDialog({
  open,
  onOpenChange,
  suggestionType,
  parentId,
  onSuccess,
}: CategorySuggestionDialogProps) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const getTitle = () => {
    switch (suggestionType) {
      case 'category':
        return 'Suggest New Main Category';
      case 'subcategory':
        return 'Suggest New Subcategory';
      case 'micro_category':
        return 'Suggest New Specific Service';
    }
  };

  const getDescription = () => {
    switch (suggestionType) {
      case 'category':
        return 'Suggest a new main service category. This will be reviewed by an admin before being added.';
      case 'subcategory':
        return 'Suggest a new subcategory under the selected main category. This will be reviewed by an admin.';
      case 'micro_category':
        return 'Suggest a new specific service under the selected subcategory. This will be reviewed by an admin.';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast({
        title: 'Name required',
        description: 'Please enter a name for your suggestion',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('category_suggestions')
        .insert({
          user_id: user.id,
          suggestion_type: suggestionType,
          parent_id: parentId || null,
          suggested_name: name.trim(),
          description: description.trim() || null,
          status: 'pending',
        });

      if (error) throw error;

      setName('');
      setDescription('');
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      console.error('Error submitting suggestion:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit suggestion',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
          <DialogDescription>{getDescription()}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="suggestion-name">Name *</Label>
            <Input
              id="suggestion-name"
              placeholder="Enter category name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="suggestion-description">
              Description (Optional)
            </Label>
            <Textarea
              id="suggestion-description"
              placeholder="Provide additional details about this category"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              maxLength={500}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Submitting...' : 'Submit Suggestion'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
