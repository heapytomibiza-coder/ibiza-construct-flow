/**
 * Subcategory Selector Component
 * Phase 2: DB-Powered Service Subcategory Selection
 */
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { getCategoryIcon } from '@/lib/categoryIcons';

interface Subcategory {
  id: string;
  name: string;
  display_order: number;
  icon_name: string | null;
  icon_emoji: string | null;
  description: string | null;
}

interface SubcategorySelectorProps {
  categoryId: string;
  categoryName: string;
  selectedSubcategoryId: string;
  onSelect: (subcategoryName: string, subcategoryId: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export const SubcategorySelector: React.FC<SubcategorySelectorProps> = ({
  categoryId,
  categoryName,
  selectedSubcategoryId,
  onSelect,
  onNext,
  onBack,
}) => {
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadSubcategories = async () => {
      if (!categoryId) {
        if (mounted) {
          setSubcategories([]);
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('service_subcategories')
          .select('id, name, display_order, icon_name, icon_emoji, description')
          .eq('category_id', categoryId)
          .eq('is_active', true)
          .order('display_order', { ascending: true });

        if (error) {
          console.error('Error loading subcategories:', error);
          throw error;
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
  }, [categoryId]);

  const handleSelect = (subcategory: Subcategory) => {
    onSelect(subcategory.name, subcategory.id);
    onNext();
  };

  if (!categoryId) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <p className="text-muted-foreground mb-4">Please select a category first</p>
        <Button onClick={onBack}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="space-y-4">
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div>
          <Badge variant="outline" className="mb-4">
            {categoryName}
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
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">Loading services...</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-32 bg-muted/30 animate-pulse rounded-xl" />
            ))}
          </div>
        </div>
      ) : subcategories.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No services found for "{categoryName}"</p>
          <Button onClick={onBack} className="mt-4">Go Back</Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {subcategories.map((sub) => {
            const isSelected = selectedSubcategoryId === sub.id;
            const IconComponent = sub.icon_name ? getCategoryIcon(sub.icon_name) : null;
            
            return (
              <Card
                key={sub.id}
                className={cn(
                  "p-6 cursor-pointer transition-all hover:shadow-lg",
                  isSelected && "ring-2 ring-copper shadow-lg"
                )}
                onClick={() => handleSelect(sub)}
              >
                <div className="flex flex-col items-center justify-center gap-3 h-full">
                  {/* Icon */}
                  {IconComponent && (
                    <div className="p-3 rounded-lg bg-primary/10">
                      <IconComponent className="w-6 h-6 text-primary" />
                    </div>
                  )}
                  {!IconComponent && sub.icon_emoji && (
                    <span className="text-3xl">{sub.icon_emoji}</span>
                  )}
                  
                  {/* Name */}
                  <span className="font-medium text-center text-charcoal">
                    {sub.name}
                  </span>
                  
                  {/* Description hint */}
                  {sub.description && (
                    <span className="text-xs text-muted-foreground text-center line-clamp-2">
                      {sub.description}
                    </span>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
