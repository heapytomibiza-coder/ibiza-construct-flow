import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/layout/AdminLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, ArrowLeft, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PackGenerationDrawer } from '@/components/admin/questionPacks/PackGenerationDrawer';

interface MicroService {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  subcategory_id: string;
  hasPack: boolean;
  packStatus: string;
}

interface SubcategoryGroup {
  subcategoryName: string;
  micros: MicroService[];
}

export default function CategoryPackManager() {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedMicro, setSelectedMicro] = useState<MicroService | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { data: categoryData, isLoading } = useQuery({
    queryKey: ['category-packs', categorySlug],
    queryFn: async () => {
      // 1. Get category ID and name from slug
      const { data: category, error: categoryError } = await supabase
        .from('service_categories')
        .select('id, name, slug')
        .eq('slug', categorySlug)
        .single();

      if (categoryError || !category) {
        throw new Error('Category not found');
      }

      // 2. Get all subcategories in this category
      const { data: subcategories, error: subError } = await supabase
        .from('service_subcategories')
        .select('id, name')
        .eq('category_id', category.id)
        .order('name');

      if (subError || !subcategories) {
        throw new Error('Failed to load subcategories');
      }

      const subcategoryIds = subcategories.map(s => s.id);

      // 3. Get all micro-services with pack status
      const { data: micros, error: microsError } = await supabase
        .from('service_micro_categories')
        .select(`
          id, name, slug, description, subcategory_id,
          question_packs (pack_id, status, is_active)
        `)
        .in('subcategory_id', subcategoryIds)
        .order('name');

      if (microsError) {
        throw new Error('Failed to load micro-services');
      }

      // 4. Group by subcategory and add pack status
      const grouped: SubcategoryGroup[] = subcategories.map(sub => ({
        subcategoryName: sub.name,
        micros: (micros || [])
          .filter((m: any) => m.subcategory_id === sub.id)
          .map((m: any) => {
            const packs = m.question_packs || [];
            const activePack = packs.find((p: any) => p.status === 'approved' && p.is_active);
            const draftPack = packs.find((p: any) => p.status === 'draft');
            
            return {
              id: m.id,
              name: m.name,
              slug: m.slug,
              description: m.description,
              subcategory_id: m.subcategory_id,
              hasPack: !!activePack,
              packStatus: activePack ? 'active' : draftPack ? 'draft' : 'missing'
            };
          })
      })).filter(group => group.micros.length > 0);

      const totalMicros = grouped.reduce((sum, g) => sum + g.micros.length, 0);
      const missingCount = grouped.reduce((sum, g) => 
        sum + g.micros.filter(m => !m.hasPack).length, 0
      );

      return {
        categoryName: category.name,
        categorySlug: category.slug,
        grouped,
        totalMicros,
        missingCount,
        coverage: totalMicros > 0 ? Math.round(((totalMicros - missingCount) / totalMicros) * 100) : 0
      };
    },
    enabled: !!categorySlug,
  });

  const handleGenerate = (micro: MicroService) => {
    setSelectedMicro(micro);
    setDrawerOpen(true);
  };

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['category-packs', categorySlug] });
    setDrawerOpen(false);
    toast({ 
      title: 'Success',
      description: 'Question pack generated and saved'
    });
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/admin/questions')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Admin
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              Question Packs: {categoryData?.categoryName}
            </h1>
            <p className="text-muted-foreground mt-1">
              Generate AI-powered question packs for missing micro-services
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-2xl font-bold">{categoryData?.coverage}%</div>
              <div className="text-xs text-muted-foreground">Coverage</div>
            </div>
            <Badge variant={categoryData?.missingCount === 0 ? "default" : "destructive"} className="text-sm">
              {categoryData?.missingCount} missing
            </Badge>
          </div>
        </div>

        <div className="space-y-8">
          {categoryData?.grouped.map((group) => (
            <div key={group.subcategoryName}>
              <h2 className="text-xl font-semibold mb-4 text-foreground">
                {group.subcategoryName}
              </h2>
              <div className="grid gap-3">
                {group.micros.map((micro) => (
                  <Card key={micro.slug} className="p-4 hover:bg-accent/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-foreground">{micro.name}</h3>
                          {micro.hasPack ? (
                            <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700">
                              Active Pack
                            </Badge>
                          ) : micro.packStatus === 'draft' ? (
                            <Badge variant="outline" className="border-amber-300 text-amber-700 dark:border-amber-700 dark:text-amber-400">
                              Draft
                            </Badge>
                          ) : (
                            <Badge variant="destructive">No Pack</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{micro.slug}</p>
                      </div>
                      {!micro.hasPack && (
                        <Button
                          onClick={() => handleGenerate(micro)}
                          variant="outline"
                          size="sm"
                        >
                          <Sparkles className="h-4 w-4 mr-2" />
                          Generate with AI
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>

        {selectedMicro && (
          <PackGenerationDrawer
            open={drawerOpen}
            onOpenChange={setDrawerOpen}
            micro={selectedMicro}
            categorySlug={categorySlug!}
            onSuccess={handleSuccess}
          />
        )}
      </div>
    </AdminLayout>
  );
}
