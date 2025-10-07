/**
 * Step 2: Subcategory Selection
 * Tile-based selection with category context
 */
import React, { useEffect, useState, useRef } from 'react';
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

export const SubcategoryStep: React.FC<SubcategoryStepProps> = React.memo(({
  mainCategory,
  selectedSubcategory,
  onSelect,
  onNext,
  onBack
}) => {
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userClicked, setUserClicked] = useState(false);
  
  // Prevent duplicate fetches for same category
  const lastCategoryRef = useRef<string | null>(null);
  
  // Stable callback ref to avoid re-renders
  const onNextRef = useRef(onNext);
  useEffect(() => { 
    onNextRef.current = onNext; 
  }, [onNext]);

  useEffect(() => {
    if (!mainCategory) {
      setSubcategories([]);
      setLoading(false);
      return;
    }

    // Skip if we already fetched for this category (prevents double-fire)
    if (lastCategoryRef.current === mainCategory) {
      console.log('⏭️ Skipping duplicate fetch for:', mainCategory);
      return;
    }
    lastCategoryRef.current = mainCategory;

    let cancelled = false;
    const ac = new AbortController();

    const timeout = setTimeout(() => {
      if (!cancelled) {
        console.warn('⏱️ services_catalog query slow or blocked (10s+)');
        ac.abort();
      }
    }, 10000);

    const loadSubcategories = async () => {
      setLoading(true);
      try {
        console.log('📡 Executing Supabase query...', { mainCategory });
        const queryStart = Date.now();
        
        const { data, error } = await supabase
          .from('services_catalog')
          .select('subcategory')
          .eq('category', mainCategory)
          .order('subcategory', { ascending: true })
          .limit(100);

        if (cancelled) return;

        const queryTime = Date.now() - queryStart;
        console.log(`📊 Query completed in ${queryTime}ms`);

        if (error) {
          console.error('❌ services_catalog error:', error);
          setSubcategories([]);
          return;
        }

        const unique = Array.from(new Set((data ?? []).map((r: any) => r?.subcategory).filter(Boolean)));
        setSubcategories(unique.map((name) => ({ name })));
        console.log('✅ Processed subcategories:', unique);
      } catch (e: any) {
        if (!cancelled) {
          console.error('💥 Subcategory load exception:', e?.message ?? e);
          setSubcategories([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
        clearTimeout(timeout);
      }
    };

    loadSubcategories();

    return () => {
      cancelled = true;
      clearTimeout(timeout);
      ac.abort();
    };
  }, [mainCategory]);

  // Only auto-advance after explicit user click
  useEffect(() => {
    if (!userClicked) return;
    if (selectedSubcategory && !loading && subcategories.length > 0) {
      const timer = setTimeout(() => {
        console.log('⏭️ Auto-advancing to next step');
        onNextRef.current();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [userClicked, selectedSubcategory, loading, subcategories]);

  console.log('🎨 SubcategoryStep render - loading:', loading, 'subcategories:', subcategories.length);

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
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">Loading subcategories...</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-32 bg-muted/30 animate-pulse rounded-xl" />
            ))}
          </div>
        </div>
      ) : subcategories.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No subcategories found for {mainCategory}</p>
          <Button onClick={onBack} className="mt-4">Go Back</Button>
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
                onClick={() => {
                  console.log('🎯 Selected subcategory:', sub.name);
                  onSelect(sub.name);
                  setUserClicked(true);
                }}
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
});
