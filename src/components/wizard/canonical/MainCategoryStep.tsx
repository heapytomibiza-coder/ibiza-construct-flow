/**
 * Step 1: Main Category Selection
 * Dynamically loads categories from database
 */
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Home, Wrench, Paintbrush, Zap, Droplet, Hammer,
  TreePine, Car, Lightbulb, Package, Truck, Sun,
  HardHat, ShieldCheck, Building, Sparkles, Camera, Microscope
} from 'lucide-react';

interface MainCategoryStepProps {
  selectedCategory: string;
  onSelect: (category: string) => void;
  onNext: () => void;
}

const ICON_MAP: Record<string, any> = {
  Home, Wrench, Paintbrush, Zap, Droplet, Hammer,
  TreePine, Car, Lightbulb, Package, Truck, Sun,
  HardHat, ShieldCheck, Building, Sparkles, Camera, Microscope
};

export const MainCategoryStep: React.FC<MainCategoryStepProps> = ({
  selectedCategory,
  onSelect,
  onNext
}) => {
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('services_unified_v1')
        .select('category')
        .order('category', { ascending: true });

      if (error) throw error;
      
      // Get unique categories
      const unique = Array.from(new Set(data.map(d => d.category)));
      setCategories(unique);
    } catch (error) {
      console.error('Error loading categories:', error);
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  // Map category names to icons
  const getCategoryIcon = (category: string): keyof typeof ICON_MAP => {
    const iconMap: Record<string, keyof typeof ICON_MAP> = {
      'Handyman': 'Wrench',
      'Home Services': 'Home',
      'Moving & Delivery': 'Truck',
      'Construction': 'HardHat',
      'Electrical': 'Zap',
      'Plumbing': 'Droplet',
      'Painting': 'Paintbrush',
      'Carpentry': 'Hammer',
    };
    return iconMap[category] || 'Wrench';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <Skeleton className="h-8 w-64 mx-auto" />
          <Skeleton className="h-4 w-96 mx-auto" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground">
          What type of work do you need?
        </h1>
        <p className="text-lg text-muted-foreground">
          Choose the main category that best fits your project
        </p>
      </div>

      {/* Available Services */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {categories.map((category) => {
            const iconName = getCategoryIcon(category);
            const IconComponent = ICON_MAP[iconName];
            const isSelected = selectedCategory === category;

            return (
              <Card
                key={category}
                className={cn(
                  "cursor-pointer transition-all hover:scale-105 hover:shadow-lg",
                  "border-2 p-6",
                  isSelected
                    ? "border-primary bg-primary/5 shadow-md"
                    : "border-border hover:border-primary/50"
                )}
                onClick={() => onSelect(category)}
              >
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className={cn(
                    "p-3 rounded-full",
                    isSelected ? "bg-primary/20" : "bg-muted"
                  )}>
                    <IconComponent className={cn(
                      "h-8 w-8",
                      isSelected ? "text-primary" : "text-muted-foreground"
                    )} />
                  </div>
                  <span className="font-medium text-sm leading-tight">
                    {category}
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Next Button */}
      {selectedCategory && (
        <div className="flex justify-end pt-6">
          <Button
            size="lg"
            onClick={onNext}
            className="min-w-32"
          >
            Continue
          </Button>
        </div>
      )}
    </div>
  );
};
