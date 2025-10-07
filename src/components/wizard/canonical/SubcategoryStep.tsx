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

export const SubcategoryStep: React.FC<SubcategoryStepProps> = ({
  mainCategory,
  selectedSubcategory,
  onSelect,
  onNext,
  onBack
}) => {
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Mount logging
  useEffect(() => {
    console.log('🚨 SUBCATEGORY STEP MOUNTED', { mainCategory, selectedSubcategory });
    return () => console.log('🚨 SUBCATEGORY STEP UNMOUNTED');
  }, []);

  // Stable callback ref to avoid re-renders
  const onNextRef = useRef(onNext);
  useEffect(() => { 
    onNextRef.current = onNext; 
  }, [onNext]);

  useEffect(() => {
    let cancelled = false;
    
    const loadSubcategories = async () => {
      console.log('🔍 loadSubcategories START - mainCategory:', mainCategory);
      
      if (!mainCategory) {
        console.warn('⚠️ No mainCategory provided');
        setSubcategories([]);
        setLoading(false);
        return;
      }
      
      setLoading(true);
      
      try {
        console.log('📡 Executing Supabase query...');
        const queryStart = Date.now();
        
        const { data, error } = await supabase
          .from('services_unified_v1')
          .select('subcategory')
          .eq('category', mainCategory)
          .order('subcategory', { ascending: true })
          .limit(100);
        
        if (cancelled) return;
        
        const queryTime = Date.now() - queryStart;
        console.log(`📊 Query completed in ${queryTime}ms`);
        console.log('📊 Response:', { 
          dataLength: data?.length, 
          error: error ? JSON.stringify(error) : null 
        });

        if (error) {
          console.error('❌ Supabase error:', error);
          setSubcategories([]);
          setLoading(false);
          return;
        }

        if (!data || data.length === 0) {
          console.warn(`⚠️ No subcategories found for: ${mainCategory}`);
          setSubcategories([]);
          setLoading(false);
          return;
        }

        const uniqueSubs = Array.from(
          new Set(data.map(s => s.subcategory).filter(Boolean))
        );
        console.log('✅ Processed subcategories:', uniqueSubs);
        
        setSubcategories(uniqueSubs.map(sub => ({ name: sub })));
        setLoading(false);
        
      } catch (error) {
        if (!cancelled) {
          console.error('💥 Caught exception:', error);
          setSubcategories([]);
          setLoading(false);
        }
      }
    };
    
    loadSubcategories();
    
    return () => { 
      cancelled = true;
    };
  }, [mainCategory]);

  // Auto-advance after selection
  useEffect(() => {
    if (selectedSubcategory && !loading && subcategories.length > 0) {
      const timer = setTimeout(() => {
        console.log('⏭️ Auto-advancing to next step');
        onNextRef.current();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [selectedSubcategory, loading, subcategories]);

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
};
