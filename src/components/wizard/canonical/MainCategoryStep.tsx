/**
 * Step 1: Main Category Selection
 * Fetches categories from database for unified taxonomy
 */
import React, { useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { useCategories } from '@/hooks/useCategories';
import { getCategoryIcon } from '@/lib/categoryIcons';

interface MainCategoryStepProps {
  selectedCategory: string;
  onSelect: (category: string) => void;
  onNext: () => void;
}


export const MainCategoryStep: React.FC<MainCategoryStepProps> = ({
  selectedCategory,
  onSelect,
  onNext
}) => {
  const { data: categories, isLoading, error } = useCategories();

  // Auto-advance after selection
  useEffect(() => {
    if (selectedCategory) {
      const timer = setTimeout(() => {
        onNext();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [selectedCategory, onNext]);

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto text-center py-12">
        <p className="text-destructive">Failed to load categories. Please try again.</p>
      </div>
    );
  }

  const renderCategoryCard = (category: typeof categories[0]) => {
    const IconComponent = getCategoryIcon(category.icon_name || 'Wrench');
    const isSelected = selectedCategory === category.name;

    return (
      <Card
        key={category.name}
        className={cn(
          "cursor-pointer transition-all hover:scale-[1.01] hover:shadow-lg",
          "border-2 p-5",
          isSelected
            ? "border-primary bg-primary/5 shadow-md"
            : "border-border hover:border-primary/50"
        )}
        onClick={() => onSelect(category.name)}
      >
        <div className="flex items-start gap-4">
          <div className={cn(
            "p-3.5 rounded-xl shrink-0",
            isSelected ? "bg-primary/20" : "bg-muted"
          )}>
            <IconComponent className={cn(
              "h-9 w-9",
              isSelected ? "text-primary" : "text-muted-foreground"
            )} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg mb-2 text-foreground">
              {category.name}
            </h3>
            {category.examples && category.examples.length > 0 && (
              <ul className="space-y-0.5">
                {category.examples.map((example, idx) => (
                  <li key={idx} className="text-xs text-muted-foreground/80 flex items-start">
                    <span className="mr-1.5 mt-0.5">•</span>
                    <span>{example}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="text-center space-y-3">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground">
          What type of work do you need?
        </h1>
        <p className="text-lg text-muted-foreground">
          Choose the category that best fits your project
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {categories?.map(renderCategoryCard)}
      </div>

      {/* Next Button */}
      {selectedCategory && (
        <div className="flex justify-end pt-4">
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
