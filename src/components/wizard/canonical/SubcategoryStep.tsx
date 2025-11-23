/**
 * Step 2: Subcategory Selection
 * Tile-based selection with category context
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SubcategoryStepProps {
  mainCategory: string;
  selectedSubcategory: string;
  onSelect: (subcategory: string) => void;
  onNext: () => void;
  onBack: () => void;
  autoAdvanceOnSelect?: boolean;
}

interface SubcategoryData {
  name: string;
  slug: string;
  description: string | null;
  icon_name: string | null;
  service_count?: number;
  questions_count?: number;
  coverage_percentage?: number;
}

export const SubcategoryStep: React.FC<SubcategoryStepProps> = ({
  mainCategory,
  selectedSubcategory,
  onSelect,
  onNext,
  onBack,
  autoAdvanceOnSelect = false,
}) => {
  const [subcategories, setSubcategories] = useState<SubcategoryData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadSubcategories = async () => {
      if (!mainCategory) {
        if (mounted) {
          setSubcategories([]);
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      try {
        // First, get the category ID from the slug/name
        const { data: categoryData, error: categoryError } = await supabase
          .from('service_categories')
          .select('id')
          .or(`slug.eq.${mainCategory},name.ilike.%${mainCategory}%`)
          .limit(1)
          .single();

        if (categoryError || !categoryData) {
          console.error('Error finding category:', categoryError);
          if (mounted) {
            setSubcategories([]);
            setLoading(false);
          }
          return;
        }

        // Now get subcategories for this category with service counts
        const { data, error } = await supabase
          .from('service_subcategories')
          .select(`
            id, 
            name, 
            slug, 
            description,
            icon_name,
            display_order,
            service_micro_categories(count)
          `)
          .eq('category_id', categoryData.id)
          .eq('is_active', true)
          .order('display_order', { ascending: true });

        if (error) {
          console.error('Error loading subcategories:', error);
          if (mounted) {
            toast.error('Failed to load subcategories. Please try again.');
            setSubcategories([]);
          }
          return;
        }

        if (!mounted) return;
        
        // Get question pack coverage for each subcategory
        const subcategoryIds = (data || []).map((sub: any) => sub.id);
        
        let coverageMap = new Map<string, { total: number; withQuestions: number }>();
        
        if (subcategoryIds.length > 0) {
          // Get all micro-services for these subcategories
          const { data: microData } = await supabase
            .from('service_micro_categories')
            .select('id, subcategory_id, slug')
            .in('subcategory_id', subcategoryIds)
            .eq('is_active', true);
          
          // Get all active question packs
          const { data: questionPacksData } = await supabase
            .from('question_packs')
            .select('micro_slug')
            .eq('is_active', true)
            .eq('status', 'approved');
          
          const questionPackSlugs = new Set(
            questionPacksData?.map(qp => qp.micro_slug) || []
          );
          
          // Build coverage map
          subcategoryIds.forEach(id => {
            const microsForSub = microData?.filter(m => m.subcategory_id === id) || [];
            const total = microsForSub.length;
            const withQuestions = microsForSub.filter(m => 
              questionPackSlugs.has(m.slug)
            ).length;
            coverageMap.set(id, { total, withQuestions });
          });
        }
        
        // Transform data to include service counts and question coverage
        const transformedData = (data || []).map((sub: any) => {
          const serviceCount = sub.service_micro_categories?.[0]?.count || 0;
          const coverage = coverageMap.get(sub.id) || { total: 0, withQuestions: 0 };
          const coveragePercentage = coverage.total > 0 
            ? Math.round((coverage.withQuestions / coverage.total) * 100) 
            : 0;
          
          return {
            name: sub.name,
            slug: sub.slug,
            description: sub.description,
            icon_name: sub.icon_name,
            service_count: serviceCount,
            questions_count: coverage.withQuestions,
            coverage_percentage: coveragePercentage
          };
        });
        
        setSubcategories(transformedData);
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
  }, [mainCategory]);


  if (!mainCategory) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <p className="text-muted-foreground mb-4">Please select a main category first</p>
        <Button onClick={onBack}>Go Back</Button>
      </div>
    );
  }

  const handleTileClick = (name: string) => {
    onSelect(name);
    if (autoAdvanceOnSelect) onNext();
  };

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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div 
                key={i} 
                className="h-48 bg-gradient-to-br from-sage-muted/10 to-copper/5 animate-pulse rounded-xl border border-sage-muted/20"
              />
            ))}
          </div>
        </div>
      ) : subcategories.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No subcategories found for "{mainCategory}"</p>
          <Button onClick={onBack} className="mt-4">Go Back</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {subcategories.map((sub) => {
            const isSelected = selectedSubcategory === sub.name;
            const Icon = sub.icon_name ? getCategoryIcon(sub.icon_name) : null;
            
            // Determine question pack indicator color
            const hasQuestions = (sub.coverage_percentage || 0) > 0;
            const indicatorColor = 
              (sub.coverage_percentage || 0) >= 80 ? 'bg-green-500' :
              (sub.coverage_percentage || 0) >= 40 ? 'bg-yellow-500' :
              hasQuestions ? 'bg-orange-500' : 'bg-gray-300';
            
            const questionsTooltip = sub.service_count && sub.service_count > 0
              ? `${sub.questions_count || 0}/${sub.service_count} services have guided questions`
              : 'No services available';
            
            return (
              <Card
                key={sub.name}
                data-testid="subcategory-tile"
                className={cn(
                  "group p-6 cursor-pointer transition-all duration-300",
                  "flex flex-col gap-3 relative overflow-hidden",
                  "hover:shadow-xl hover:scale-[1.02] hover:-translate-y-1",
                  "before:absolute before:inset-0 before:bg-gradient-to-br before:from-sage/5 before:to-copper/5 before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100",
                  isSelected && "ring-2 ring-copper shadow-xl scale-[1.02] before:opacity-100"
                )}
                onClick={() => handleTileClick(sub.name)}
              >
                {/* Question Pack Indicator */}
                {sub.service_count !== undefined && sub.service_count > 0 && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="absolute top-3 right-3 z-10">
                          <div className={cn(
                            "w-3 h-3 rounded-full transition-transform duration-300 group-hover:scale-125",
                            indicatorColor,
                            (sub.coverage_percentage || 0) >= 80 && "animate-pulse"
                          )} />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="left">
                        <p className="text-xs font-medium">{questionsTooltip}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                
                {Icon && (
                  <div className="flex justify-center transition-transform duration-300 group-hover:scale-110">
                    <div className="relative">
                      <Icon className="w-12 h-12 text-copper relative z-10 transition-colors duration-300 group-hover:text-copper/80" />
                      <div className="absolute inset-0 bg-copper/20 blur-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    </div>
                  </div>
                )}
                
                <div className="flex-1 flex flex-col gap-2 relative z-10">
                  <h3 className="font-semibold text-center text-charcoal transition-colors duration-300 group-hover:text-charcoal/90">
                    {sub.name}
                  </h3>
                  
                  {sub.description && (
                    <p className="text-sm text-muted-foreground text-center line-clamp-2 transition-colors duration-300 group-hover:text-muted-foreground/80">
                      {sub.description}
                    </p>
                  )}
                </div>
                
                {sub.service_count !== undefined && sub.service_count > 0 && (
                  <div className="flex justify-center pt-2 border-t border-sage-muted/20 relative z-10">
                    <Badge 
                      variant="secondary" 
                      className="text-xs transition-all duration-300 group-hover:bg-copper/10 group-hover:text-copper group-hover:border-copper/20"
                    >
                      {sub.service_count} service{sub.service_count !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {selectedSubcategory && !loading && !autoAdvanceOnSelect && (
        <div className="flex justify-end pt-6">
          <Button size="lg" onClick={onNext} className="bg-gradient-hero text-white px-8">
            Continue
          </Button>
        </div>
      )}
    </div>
  );
};
