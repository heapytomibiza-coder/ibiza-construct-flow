/**
 * Step 2: Subcategory Selection
 * Tile-based selection with category context
 */
import React, { useEffect, useState, useRef, useCallback } from 'react';
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
  const [subcategories, setSubcategories] = useState<{ name: string }[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔒 Make sure we only auto-advance after an explicit click this session
  const [userClicked, setUserClicked] = useState(false);

  // 🚫 Prevent duplicate fetches for same category (StrictMode double-mount)
  const lastCategoryRef = useRef<string | null>(null);

  // Mount logging
  useEffect(() => {
    console.log('🚨 SUBCATEGORY STEP MOUNTED', { mainCategory, selectedSubcategory });
    return () => console.log('🚨 SUBCATEGORY STEP UNMOUNTED');
  }, [mainCategory, selectedSubcategory]);

  // Stable callback ref to avoid re-renders
  const onNextRef = useRef(onNext);
  useEffect(() => { onNextRef.current = onNext; }, [onNext]);

  // Stable click handler so parent/state churn doesn't re-render cards unnecessarily
  const handlePick = useCallback((sub: string) => {
    console.log('🎯 Selected subcategory:', sub);
    setUserClicked(true);
    onSelect(sub);
  }, [onSelect]);

  useEffect(() => {
    // Skip if no category
    if (!mainCategory) {
      console.warn('⚠️ No mainCategory provided');
      setSubcategories([]);
      setLoading(false);
      return;
    }

    // Skip duplicate fetch for same category (handles StrictMode double mount)
    if (lastCategoryRef.current === mainCategory) {
      console.log('⏭️ Skipping duplicate fetch for:', mainCategory);
      return;
    }
    lastCategoryRef.current = mainCategory;

    const ac = new AbortController();
    let cancelled = false;

    // Long-request watchdog: surface "hangs"
    const watchdog = setTimeout(() => {
      if (!cancelled) {
        console.warn('⏱️ services_catalog query slow (10s+). Aborting to avoid hang.');
        ac.abort();
      }
    }, 10_000);

    const loadSubcategories = async () => {
      setLoading(true);
      try {
        console.log('📡 Executing Supabase query...', { mainCategory });

        // NOTE: postgrest-js supports abort via .abortSignal(signal) on recent versions.
        const builder: any = supabase
          .from('services_catalog')
          .select('subcategory')
          .eq('category', mainCategory)
          .order('subcategory', { ascending: true })
          .limit(100);

        // Wire up abort if supported
        if (typeof builder.abortSignal === 'function') {
          builder.abortSignal(ac.signal);
        }

        const queryStart = Date.now();
        const { data, error } = await builder;

        if (cancelled) return;

        const queryTime = Date.now() - queryStart;
        console.log(`📊 Query completed in ${queryTime}ms`, { len: data?.length, error: error?.message });

        if (error) {
          console.error('❌ Supabase error:', {
            message: error.message,
            details: (error as any).details,
            hint: (error as any).hint,
            code: (error as any).code
          });
          setSubcategories([]);
          return;
        }

        const unique = Array.from(new Set((data ?? []).map((s: any) => s?.subcategory).filter(Boolean))) as string[];
        console.log('✅ Processed subcategories:', unique);
        setSubcategories(unique.map((name) => ({ name })));
      } catch (error: any) {
        if (!cancelled) {
          console.error('💥 Caught exception:', {
            name: error?.name,
            message: error?.message,
            stack: error?.stack
          });
          setSubcategories([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
        clearTimeout(watchdog);
      }
    };

    loadSubcategories();

    return () => {
      cancelled = true;
      clearTimeout(watchdog);
      ac.abort(); // now actually cancels if .abortSignal is supported
    };
  }, [mainCategory]);

  // ✅ Only auto-advance after a click this session (prevents phantom advances)
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
                data-testid="subcategory-tile"
                className={cn(
                  "p-6 cursor-pointer transition-all hover:shadow-lg",
                  isSelected && "ring-2 ring-copper shadow-lg"
                )}
                onClick={() => handlePick(sub.name)}
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
          <Button size="lg" onClick={onNext} className="bg-gradient-hero text-white px-8">
            Continue
          </Button>
        </div>
      )}
    </div>
  );
});
