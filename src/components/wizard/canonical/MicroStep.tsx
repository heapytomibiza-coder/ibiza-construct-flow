/**
 * Step 3: Micro Category Selection (becomes Job Title)
 * Enhanced with icons, metadata, and improved visual design
 */
import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, CheckCircle2, Sparkles, TrendingUp, Clock, Wrench, Hammer, Package, Sofa, Tv, Bed, Armchair, Table, Lamp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// Icon mapping for common micro-services
const getServiceIcon = (serviceName: string) => {
  const name = serviceName.toLowerCase();
  
  if (name.includes('table')) return Table;
  if (name.includes('shelv') || name.includes('storage')) return Package;
  if (name.includes('tv') || name.includes('media')) return Tv;
  if (name.includes('bed') || name.includes('headboard')) return Bed;
  if (name.includes('bench') || name.includes('seating')) return Armchair;
  if (name.includes('sofa') || name.includes('couch')) return Sofa;
  if (name.includes('light') || name.includes('lamp')) return Lamp;
  
  // Default icon
  return Hammer;
};

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
          .select(`
            id, 
            name, 
            slug, 
            display_order,
            description
          `)
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

        // Map to expected format
        const formattedData = (data || []).map(item => ({
          id: item.id,
          slug: item.slug || '',
          micro: item.name,
          description: item.description
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="h-32 bg-muted/30 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {micros.map((micro) => {
            const isSelected = selectedMicroIds.includes(micro.id);
            const ServiceIcon = getServiceIcon(micro.micro);
            
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
                  "group relative flex flex-col gap-3 p-5 rounded-xl border-2 transition-all text-left h-full",
                  "hover:shadow-lg hover:-translate-y-1 active:scale-[0.98] bg-card",
                  isSelected 
                    ? "border-primary shadow-md ring-2 ring-primary/20" 
                    : "border-border hover:border-primary/50"
                )}
                onClick={handleClick}
              >
                {/* Header with Icon and Checkbox */}
                <div className="flex items-start justify-between gap-3">
                  <div className={cn(
                    "flex items-center justify-center w-12 h-12 rounded-lg transition-colors",
                    isSelected 
                      ? "bg-primary/10 text-primary" 
                      : "bg-muted/50 text-muted-foreground group-hover:bg-primary/5 group-hover:text-primary"
                  )}>
                    <ServiceIcon className="w-6 h-6" />
                  </div>
                  
                  <CheckCircle2 className={cn(
                    "w-6 h-6 flex-shrink-0 transition-all",
                    isSelected 
                      ? "text-primary scale-110" 
                      : "text-muted-foreground/20 group-hover:text-muted-foreground/40"
                  )} />
                </div>

                {/* Service Name */}
                <div className="flex-1 min-h-[2.5rem] flex items-start">
                  <h3 className={cn(
                    "font-semibold text-sm leading-tight",
                    isSelected ? "text-primary" : "text-foreground"
                  )}>
                    {micro.micro}
                  </h3>
                </div>


                {/* Description hint */}
                {micro.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {micro.description}
                  </p>
                )}
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
