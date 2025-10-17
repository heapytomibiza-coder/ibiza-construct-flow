/**
 * Step 2: Subcategory Selection
 * Tile-based selection with category context
 */
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface SubcategoryStepProps {
  mainCategory: string;
  selectedSubcategory: string;
  onSelect: (subcategory: string) => void;
  onNext: () => void;
  onBack: () => void;
  autoAdvanceOnSelect?: boolean;
}

export const SubcategoryStep: React.FC<SubcategoryStepProps> = ({
  mainCategory,
  selectedSubcategory,
  onSelect,
  onNext,
  onBack,
  autoAdvanceOnSelect = false,
}) => {
  const [subcategories, setSubcategories] = useState<{ name: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadSubcategories = async () => {
      if (!mainCategory) {
        if (mounted) {
          setSubcategories([]);
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      try {
        // First, get the category ID from the slug/name
        const { data: categoryData, error: categoryError } = await supabase
          .from('service_categories')
          .select('id')
          .or(`slug.eq.${mainCategory},name.ilike.%${mainCategory}%`)
          .limit(1)
          .single();

        if (categoryError || !categoryData) {
          console.error('Error finding category:', categoryError);
          if (mounted) {
            setSubcategories([]);
            setLoading(false);
          }
          return;
        }

        // Now get subcategories for this category
        const { data, error } = await supabase
          .from('service_subcategories')
          .select('id, name, slug, display_order')
          .eq('category_id', categoryData.id)
          .eq('is_active', true)
          .order('display_order', { ascending: true });

        if (error) {
          console.error('Error loading subcategories:', error);
          if (mounted) {
            toast.error('Failed to load subcategories. Please try again.');
            setSubcategories([]);
          }
          return;
        }

        if (!mounted) return;
        setSubcategories(data || []);
      } catch (error) {
        if (mounted) {
          console.error('Failed to load subcategories:', error);
          toast.error('Failed to load subcategories. Please try again.');
          setSubcategories([]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadSubcategories();
    return () => {
      mounted = false;
    };
  }, [mainCategory]);


  if (!mainCategory) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <p className="text-muted-foreground mb-4">Please select a main category first</p>
        <Button onClick={onBack}>Go Back</Button>
      </div>
    );
  }

  const handleTileClick = (name: string) => {
    onSelect(name);
    if (autoAdvanceOnSelect) onNext();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="space-y-4">
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div>
          <Badge variant="outline" className="mb-4">
            {mainCategory}
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold text-charcoal">
            What specific service do you need?
          </h1>
          <p className="text-lg text-muted-foreground mt-2">
            Select the type of work within this category
          </p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3" data-testid="loader">
          <p className="text-sm text-muted-foreground">Loading subcategories...</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-32 bg-muted/30 animate-pulse rounded-xl" />
            ))}
          </div>
        </div>
      ) : subcategories.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No subcategories found for "{mainCategory}"</p>
          <Button onClick={onBack} className="mt-4">Go Back</Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {subcategories.map((sub) => {
            const isSelected = selectedSubcategory === sub.name;
            return (
              <Card
                key={sub.name}
                data-testid="subcategory-tile"
                className={cn(
                  "p-6 cursor-pointer transition-all hover:shadow-lg",
                  isSelected && "ring-2 ring-copper shadow-lg"
                )}
                onClick={() => handleTileClick(sub.name)}
              >
                <div className="flex items-center justify-center h-full">
                  <span className="font-medium text-center text-charcoal">
                    {sub.name}
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {selectedSubcategory && !loading && !autoAdvanceOnSelect && (
        <div className="flex justify-end pt-6">
          <Button size="lg" onClick={onNext} className="bg-gradient-hero text-white px-8">
            Continue
          </Button>
        </div>
      )}
    </div>
  );
};
