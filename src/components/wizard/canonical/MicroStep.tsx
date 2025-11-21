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
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div>
          <div className="flex gap-2 mb-4">
            <Badge variant="outline">{mainCategory}</Badge>
            <Badge variant="outline">{subcategory}</Badge>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-charcoal">
            What specific tasks do you need?
          </h1>
          <p className="text-lg text-muted-foreground mt-2">
            Select one or more services (click to select/deselect)
          </p>
          {selectedMicroIds.length > 0 && (
            <p className="text-sm text-copper font-medium">
              {selectedMicroIds.length} service{selectedMicroIds.length > 1 ? 's' : ''} selected
            </p>
          )}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="h-28 bg-muted/30 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
              <Card
                key={micro.id}
                className={cn(
                  "p-4 cursor-pointer transition-all hover:shadow-md min-h-[100px]",
                  "flex items-center justify-center text-center",
                  isSelected && "ring-2 ring-copper shadow-md"
                )}
                onClick={handleClick}
              >
                <div className="space-y-2 w-full">
                  <h3 className="font-semibold text-charcoal text-sm leading-tight">
                    {micro.micro}
                  </h3>
                  {isSelected && (
                    <CheckCircle2 className="w-5 h-5 text-copper mx-auto" />
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {selectedMicroIds.length > 0 && !loading && (
        <div className="flex justify-end pt-6">
          <Button
            size="lg"
            onClick={onNext}
            className="bg-gradient-hero text-white px-8"
          >
            Continue
          </Button>
        </div>
      )}
    </div>
  );
};
