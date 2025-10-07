/**
 * Step 2: Subcategory Selection
 * Tile-based selection with category context
 */
import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface SubcategoryStepProps {
  mainCategory: string;
  selectedSubcategory: string;
  onSelect: (subcategory: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export const SubcategoryStep: React.FC<SubcategoryStepProps> = ({
  mainCategory,
  selectedSubcategory,
  onSelect,
  onNext,
  onBack
}) => {
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubcategories();
  }, [mainCategory]);

  // Auto-advance after selection
  useEffect(() => {
    if (selectedSubcategory && !loading) {
      const timer = setTimeout(() => {
        onNext();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [selectedSubcategory, loading, onNext]);

  const loadSubcategories = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('services_unified' as any)
        .select('subcategory')
        .eq('category', mainCategory)
        .order('subcategory');

      if (error) throw error;

      // Get unique subcategories
      const uniqueSubs = Array.from(new Set(data?.map((s: any) => s.subcategory) || []));
      setSubcategories(uniqueSubs.map(sub => ({ name: sub })));
    } catch (error) {
      console.error('Error loading subcategories:', error);
    } finally {
      setLoading(false);
    }
  };

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
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 bg-muted/30 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {subcategories.map((sub) => {
            const isSelected = selectedSubcategory === sub.name;
            
            return (
              <Card
                key={sub.name}
                className={cn(
                  "p-6 cursor-pointer transition-all hover:shadow-lg",
                  isSelected && "ring-2 ring-copper shadow-lg"
                )}
                onClick={() => onSelect(sub.name)}
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

      {selectedSubcategory && !loading && (
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
