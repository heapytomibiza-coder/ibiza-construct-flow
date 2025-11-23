import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, RefreshCw, Save, CheckCircle } from 'lucide-react';
import { QuestionPreview } from './QuestionPreview';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PackGenerationDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  micro: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
  };
  categorySlug: string;
  onSuccess: () => void;
}

export function PackGenerationDrawer({
  open,
  onOpenChange,
  micro,
  categorySlug,
  onSuccess
}: PackGenerationDrawerProps) {
  const { toast } = useToast();
  const [generatedPack, setGeneratedPack] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('preview');

  // Generate pack mutation
  const generateMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('generate-question-pack', {
        body: { microSlug: micro.slug }
      });
      
      if (error) {
        console.error('Edge function error:', error);
        throw new Error(error.message || 'Failed to generate pack');
      }
      
      if (!data?.pack) {
        throw new Error('No pack data returned from AI');
      }
      
      return data.pack;
    },
    onSuccess: (pack) => {
      setGeneratedPack(pack);
      toast({ 
        title: 'Pack generated',
        description: `Created ${pack.questions?.length || 0} questions for ${micro.name}`
      });
    },
    onError: (error: any) => {
      console.error('Generation error:', error);
      toast({
        title: 'Generation failed',
        description: error.message || 'Failed to generate question pack',
        variant: 'destructive'
      });
    }
  });

  // Save pack mutation
  const saveMutation = useMutation({
    mutationFn: async ({ status }: { status: 'draft' | 'approved' }) => {
      const { error } = await supabase
        .from('question_packs')
        .insert({
          micro_slug: micro.slug,
          version: 1,
          status,
          source: 'ai',
          content: generatedPack,
          is_active: status === 'approved'
        });
        
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      toast({
        title: variables.status === 'approved' ? 'Pack approved' : 'Draft saved',
        description: variables.status === 'approved' 
          ? 'Pack is now active and available for use'
          : 'Pack saved as draft for review'
      });
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: 'Save failed',
        description: error.message || 'Failed to save question pack',
        variant: 'destructive'
      });
    }
  });

  // Auto-generate on open
  useEffect(() => {
    if (open && !generatedPack && !generateMutation.isPending) {
      generateMutation.mutate();
    }
  }, [open]);

  // Reset on close
  useEffect(() => {
    if (!open) {
      setGeneratedPack(null);
      setActiveTab('preview');
    }
  }, [open]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Generate: {micro.name}</SheetTitle>
          <SheetDescription>
            {categorySlug} • AI-powered question pack generation
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Loading State */}
          {generateMutation.isPending && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <div className="text-center space-y-1">
                <p className="text-sm font-medium">Analyzing patterns...</p>
                <p className="text-xs text-muted-foreground">
                  AI is generating contextual questions for {micro.name}
                </p>
              </div>
            </div>
          )}

          {/* Error State */}
          {generateMutation.isError && !generatedPack && (
            <Alert variant="destructive">
              <AlertDescription>
                {generateMutation.error?.message || 'Failed to generate pack. Please try again.'}
              </AlertDescription>
            </Alert>
          )}

          {/* Generated Pack View */}
          {generatedPack && (
            <>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="w-full">
                  <TabsTrigger value="preview" className="flex-1">Preview</TabsTrigger>
                  <TabsTrigger value="json" className="flex-1">JSON</TabsTrigger>
                </TabsList>

                <TabsContent value="preview" className="space-y-4 mt-4">
                  <QuestionPreview
                    questions={generatedPack.questions || []}
                    title={generatedPack.name}
                  />
                </TabsContent>

                <TabsContent value="json" className="mt-4">
                  <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg text-xs overflow-auto max-h-[500px] dark:bg-slate-950">
                    {JSON.stringify(generatedPack, null, 2)}
                  </pre>
                </TabsContent>
              </Tabs>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setGeneratedPack(null);
                      generateMutation.mutate();
                    }}
                    disabled={generateMutation.isPending || saveMutation.isPending}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Regenerate
                  </Button>

                  <div className="text-xs text-muted-foreground">
                    {generatedPack.questions?.length || 0} questions
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => saveMutation.mutate({ status: 'draft' })}
                    disabled={saveMutation.isPending}
                    className="flex-1"
                  >
                    {saveMutation.isPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Save as Draft
                  </Button>
                  <Button
                    onClick={() => saveMutation.mutate({ status: 'approved' })}
                    disabled={saveMutation.isPending}
                    className="flex-1"
                  >
                    {saveMutation.isPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    )}
                    Approve & Publish
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
