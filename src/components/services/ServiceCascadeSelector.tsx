import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { CategorySuggestionDialog } from './CategorySuggestionDialog';
import { useToast } from '@/hooks/use-toast';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Subcategory extends Category {
  category_id: string;
}

interface MicroCategory extends Category {
  subcategory_id: string;
}

interface ServiceCascadeSelectorProps {
  onServiceSelect: (microCategoryId: string, fullPath: string) => void;
}

export function ServiceCascadeSelector({ onServiceSelect }: ServiceCascadeSelectorProps) {
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [microCategories, setMicroCategories] = useState<MicroCategory[]>([]);
  
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('');
  const [selectedMicroCategory, setSelectedMicroCategory] = useState<string>('');
  
  const [showSuggestionDialog, setShowSuggestionDialog] = useState(false);
  const [suggestionType, setSuggestionType] = useState<'category' | 'subcategory' | 'micro_category'>('category');
  const [suggestionParentId, setSuggestionParentId] = useState<string>('');

  // Load main categories on mount
  useEffect(() => {
    loadCategories();
  }, []);

  // Load subcategories when category is selected
  useEffect(() => {
    if (selectedCategory) {
      loadSubcategories(selectedCategory);
      setSelectedSubcategory('');
      setSelectedMicroCategory('');
    }
  }, [selectedCategory]);

  // Load micro categories when subcategory is selected
  useEffect(() => {
    if (selectedSubcategory) {
      loadMicroCategories(selectedSubcategory);
      setSelectedMicroCategory('');
    }
  }, [selectedSubcategory]);

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('service_categories')
        .select('id, name, slug')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
      toast({
        title: 'Error',
        description: 'Failed to load service categories',
        variant: 'destructive',
      });
    }
  };

  const loadSubcategories = async (categoryId: string) => {
    try {
      const { data, error } = await supabase
        .from('service_subcategories')
        .select('id, name, slug, category_id')
        .eq('category_id', categoryId)
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      setSubcategories(data || []);
    } catch (error) {
      console.error('Error loading subcategories:', error);
      toast({
        title: 'Error',
        description: 'Failed to load subcategories',
        variant: 'destructive',
      });
    }
  };

  const loadMicroCategories = async (subcategoryId: string) => {
    try {
      const { data, error } = await supabase
        .from('service_micro_categories')
        .select('id, name, slug, subcategory_id')
        .eq('subcategory_id', subcategoryId)
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      setMicroCategories(data || []);
    } catch (error) {
      console.error('Error loading micro categories:', error);
      toast({
        title: 'Error',
        description: 'Failed to load micro categories',
        variant: 'destructive',
      });
    }
  };

  const handleAddService = () => {
    if (!selectedMicroCategory) {
      toast({
        title: 'Selection required',
        description: 'Please select a service from all three levels',
        variant: 'destructive',
      });
      return;
    }

    const categoryName = categories.find(c => c.id === selectedCategory)?.name || '';
    const subcategoryName = subcategories.find(s => s.id === selectedSubcategory)?.name || '';
    const microCategoryName = microCategories.find(m => m.id === selectedMicroCategory)?.name || '';
    
    const fullPath = `${categoryName} > ${subcategoryName} > ${microCategoryName}`;
    onServiceSelect(selectedMicroCategory, fullPath);
  };

  const handleSuggestNew = (type: 'category' | 'subcategory' | 'micro_category') => {
    setSuggestionType(type);
    
    if (type === 'subcategory') {
      setSuggestionParentId(selectedCategory);
    } else if (type === 'micro_category') {
      setSuggestionParentId(selectedSubcategory);
    } else {
      setSuggestionParentId('');
    }
    
    setShowSuggestionDialog(true);
  };

  const handleSuggestionSubmitted = () => {
    toast({
      title: 'Suggestion submitted',
      description: 'Your suggestion has been sent for admin approval',
    });
  };

  return (
    <div className="space-y-6">
      {/* Main Category */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Main Category *</Label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => handleSuggestNew('category')}
          >
            <Plus className="h-4 w-4 mr-1" />
            Suggest New
          </Button>
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="bg-background">
            <SelectValue placeholder="Select main category" />
          </SelectTrigger>
          <SelectContent className="bg-popover z-50">
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Subcategory */}
      {selectedCategory && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Subcategory *</Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleSuggestNew('subcategory')}
            >
              <Plus className="h-4 w-4 mr-1" />
              Suggest New
            </Button>
          </div>
          <Select value={selectedSubcategory} onValueChange={setSelectedSubcategory}>
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Select subcategory" />
            </SelectTrigger>
            <SelectContent className="bg-popover z-50">
              {subcategories.map((subcategory) => (
                <SelectItem key={subcategory.id} value={subcategory.id}>
                  {subcategory.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Micro Category */}
      {selectedSubcategory && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Specific Service *</Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleSuggestNew('micro_category')}
            >
              <Plus className="h-4 w-4 mr-1" />
              Suggest New
            </Button>
          </div>
          <Select value={selectedMicroCategory} onValueChange={setSelectedMicroCategory}>
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Select specific service" />
            </SelectTrigger>
            <SelectContent className="bg-popover z-50">
              {microCategories.map((microCategory) => (
                <SelectItem key={microCategory.id} value={microCategory.id}>
                  {microCategory.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Add Service Button */}
      {selectedMicroCategory && (
        <Button
          type="button"
          onClick={handleAddService}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add This Service
        </Button>
      )}

      {/* Suggestion Dialog */}
      <CategorySuggestionDialog
        open={showSuggestionDialog}
        onOpenChange={setShowSuggestionDialog}
        suggestionType={suggestionType}
        parentId={suggestionParentId}
        onSuccess={handleSuggestionSubmitted}
      />
    </div>
  );
}
