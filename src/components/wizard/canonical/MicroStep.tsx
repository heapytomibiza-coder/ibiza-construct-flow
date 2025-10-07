/**
 * Step 3: Micro Category Selection (becomes Job Title)
 * Chip/list-based selection with icons
 */
import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface MicroStepProps {
  mainCategory: string;
  subcategory: string;
  selectedMicro: string;
  selectedMicroId: string;
  onSelect: (micro: string, microId: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export const MicroStep: React.FC<MicroStepProps> = ({
  mainCategory,
  subcategory,
  selectedMicro,
  selectedMicroId,
  onSelect,
  onNext,
  onBack
}) => {
  const [micros, setMicros] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadMicros = async () => {
      if (!mainCategory || !subcategory) {
        if (mounted) {
          setMicros([]);
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      try {
        // Fast path: exact match
        let { data, error } = await supabase
          .from('services_catalog')
          .select('id, micro')
          .eq('category', mainCategory)
          .eq('subcategory', subcategory)
          .not('micro', 'is', null)
          .order('micro');

        if (error) {
          console.error('Error loading micro services (eq):', error);
          data = null;
        }

        // Fallback: contains search if nothing found
        if (!data || data.length === 0) {
          const { data: fallbackData, error: fbErr } = await supabase
            .from('services_catalog')
            .select('id, micro')
            .ilike('category', `%${mainCategory}%`)
            .ilike('subcategory', `%${subcategory}%`)
            .not('micro', 'is', null)
            .order('micro');

          if (fbErr) {
            console.error('Error loading micro services (ilike):', fbErr);
          } else if (fallbackData) {
            data = fallbackData;
          }
        }

        if (!mounted) return;

        if (!data || data.length === 0) {
          setMicros([]);
          return;
        }

        setMicros(data);
      } catch (error) {
        if (mounted) {
          console.error('Failed to load micro services:', error);
          toast.error('Failed to load services. Please try again.');
          setMicros([]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadMicros();
    return () => {
      mounted = false;
    };
  }, [mainCategory, subcategory]);

  if (!mainCategory || !subcategory) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <p className="text-muted-foreground mb-4">Please select a category and subcategory first</p>
        <Button onClick={onBack}>Go Back</Button>
      </div>
    );
  }

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
          <div className="flex gap-2 mb-4">
            <Badge variant="outline">{mainCategory}</Badge>
            <Badge variant="outline">{subcategory}</Badge>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-charcoal">
            What specific task do you need?
          </h1>
          <p className="text-lg text-muted-foreground mt-2">
            This will become your job title
          </p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-20 bg-muted/30 animate-pulse rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {micros.map((micro) => {
            const isSelected = selectedMicroId === micro.id;
            
            return (
              <Card
                key={micro.id}
                className={cn(
                  "p-4 cursor-pointer transition-all hover:shadow-md",
                  isSelected && "ring-2 ring-copper shadow-md"
                )}
                onClick={() => onSelect(micro.micro, micro.id)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-charcoal">
                      {micro.micro}
                    </h3>
                  </div>
                  {isSelected && (
                    <CheckCircle2 className="w-6 h-6 text-copper flex-shrink-0" />
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {selectedMicroId && !loading && (
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
