/**
 * Step 3: Micro Category Selection (becomes Job Title)
 * Chip/list-based selection with icons
 */
import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface MicroStepProps {
  mainCategory: string;
  subcategory: string;
  selectedMicros: string[];
  selectedMicroIds: string[];
  selectedMicroSlugs: string[];
  onSelect: (micros: string[], microIds: string[], microSlugs: string[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export const MicroStep: React.FC<MicroStepProps> = ({
  mainCategory,
  subcategory,
  selectedMicros,
  selectedMicroIds,
  selectedMicroSlugs,
  onSelect,
  onNext,
  onBack
}) => {
  const [micros, setMicros] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadMicros = async () => {
      if (!mainCategory || !subcategory) {
        if (mounted) {
          setMicros([]);
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      try {
        // First, get the category ID
        const { data: categoryData, error: categoryError } = await supabase
          .from('service_categories')
          .select('id')
          .or(`slug.eq.${mainCategory},name.ilike.%${mainCategory}%`)
          .limit(1)
          .single();

        if (categoryError || !categoryData) {
          console.error('Error finding category:', categoryError);
          if (mounted) {
            setMicros([]);
            setLoading(false);
          }
          return;
        }

        // Then get the subcategory ID
        const sanitizedSlug = subcategory
          .toLowerCase()
          .replace(/[,&]/g, '') // Remove commas and ampersands
          .replace(/\s+/g, '-') // Replace spaces with hyphens
          .replace(/-+/g, '-'); // Replace multiple hyphens with single hyphen
        
        const { data: subcategoryData, error: subcategoryError } = await supabase
          .from('service_subcategories')
          .select('id')
          .eq('category_id', categoryData.id)
          .or(`slug.eq.${sanitizedSlug},name.eq.${subcategory}`)
          .limit(1)
          .single();

        if (subcategoryError || !subcategoryData) {
          console.error('Error finding subcategory:', subcategoryError);
          if (mounted) {
            setMicros([]);
            setLoading(false);
          }
          return;
        }

        // Now get micro-categories for this subcategory
        const { data, error } = await supabase
          .from('service_micro_categories')
          .select('id, name, slug, display_order')
          .eq('subcategory_id', subcategoryData.id)
          .eq('is_active', true)
          .order('display_order', { ascending: true });

        if (error) {
          console.error('Error loading micro services:', error);
          if (mounted) {
            toast.error('Failed to load services. Please try again.');
            setMicros([]);
          }
          return;
        }

        if (!mounted) return;

        // Map to expected format (id, slug, and micro fields)
        const formattedData = (data || []).map(item => ({
          id: item.id,
          slug: item.slug || '',
          micro: item.name
        }));
        
        setMicros(formattedData);
      } catch (error) {
        if (mounted) {
          console.error('Failed to load micro services:', error);
          toast.error('Failed to load services. Please try again.');
          setMicros([]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadMicros();
    return () => {
      mounted = false;
    };
  }, [mainCategory, subcategory]);

  if (!mainCategory || !subcategory) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <p className="text-muted-foreground mb-4">Please select a category and subcategory first</p>
        <Button onClick={onBack}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="space-y-4">
        <Button
          variant="ghost"
          onClick={onBack}
          size="sm"
          className="mb-2"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            What tasks do you need completing?
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            Select all that apply
          </p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="h-20 bg-muted/30 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
          {micros.map((micro) => {
            const isSelected = selectedMicroIds.includes(micro.id);
            
            const handleClick = () => {
              if (isSelected) {
                // Remove from selection
                const newMicros = selectedMicros.filter((_, i) => selectedMicroIds[i] !== micro.id);
                const newIds = selectedMicroIds.filter(id => id !== micro.id);
                const newSlugs = selectedMicroSlugs.filter((_, i) => selectedMicroIds[i] !== micro.id);
                onSelect(newMicros, newIds, newSlugs);
              } else {
                // Add to selection
                onSelect(
                  [...selectedMicros, micro.micro], 
                  [...selectedMicroIds, micro.id],
                  [...selectedMicroSlugs, micro.slug]
                );
              }
            };
            
            return (
              <button
                key={micro.id}
                className={cn(
                  "flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left",
                  "hover:shadow-md active:scale-[0.98] bg-card",
                  isSelected 
                    ? "border-primary shadow-sm" 
                    : "border-border hover:border-primary/30"
                )}
                onClick={handleClick}
              >
                <CheckCircle2 className={cn(
                  "w-5 h-5 flex-shrink-0",
                  isSelected ? "text-primary" : "text-muted-foreground/30"
                )} />
                <span className="text-sm font-medium leading-tight">
                  {micro.micro}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {selectedMicroIds.length > 0 && !loading && (
        <div className="flex justify-center pt-6">
          <Button
            size="lg"
            onClick={onNext}
            className="min-w-[200px]"
          >
            Continue ({selectedMicroIds.length})
          </Button>
        </div>
      )}
    </div>
  );
};
