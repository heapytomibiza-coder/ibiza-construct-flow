import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Sparkles, Wand2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface AISmartFillProps {
  selections: {
    materials?: string[];
    finish?: string;
    quantity?: number;
    unit?: string;
    location?: string;
    timeline?: string;
    budget?: string;
  };
  serviceType: string;
  locale?: string;
  onGenerated: (data: { title: string; description: string }) => void;
  className?: string;
}

export const AISmartFill = ({
  selections,
  serviceType,
  locale = 'en',
  onGenerated,
  className
}: AISmartFillProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-job-description', {
        body: {
          selections,
          serviceType,
          locale
        }
      });

      if (error) throw error;

      if (data.title && data.description) {
        onGenerated({
          title: data.title,
          description: data.description
        });

        toast({
          title: 'Job card generated',
          description: 'Review and edit as needed',
        });
      }
    } catch (error) {
      console.error('AI generation error:', error);
      toast({
        title: 'Generation failed',
        description: 'Please write the description manually',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Check if we have enough info to generate
  const hasEnoughInfo = selections.materials || selections.finish || selections.quantity;

  if (!hasEnoughInfo) {
    return null;
  }

  return (
    <Card className={cn("p-6", className)}>
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold mb-1">AI Smart-Fill</h3>
            <p className="text-sm text-muted-foreground">
              Generate a professional job description from your selections
            </p>
          </div>
        </div>

        {/* Preview what will be included */}
        <div className="p-3 rounded-lg bg-secondary/50 space-y-2 text-sm">
          <p className="font-medium text-xs uppercase text-muted-foreground">
            Based on your selections:
          </p>
          <ul className="space-y-1 text-xs">
            {selections.materials && (
              <li>• Materials: {selections.materials.join(', ')}</li>
            )}
            {selections.finish && (
              <li>• Finish: {selections.finish}</li>
            )}
            {selections.quantity && (
              <li>• Quantity: {selections.quantity} {selections.unit}</li>
            )}
            {selections.timeline && (
              <li>• Timeline: {selections.timeline}</li>
            )}
            {selections.budget && (
              <li>• Budget: {selections.budget}</li>
            )}
          </ul>
        </div>

        <Button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full"
          size="lg"
        >
          {isGenerating ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Generating...
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4 mr-2" />
              Generate Job Card
            </>
          )}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          You can edit the generated text before submitting
        </p>
      </div>
    </Card>
  );
};
