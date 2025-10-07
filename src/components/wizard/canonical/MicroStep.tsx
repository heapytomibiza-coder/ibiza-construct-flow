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
    loadMicros();
  }, [subcategory]);

  // Auto-advance after selection
  useEffect(() => {
    if (selectedMicroId && !loading) {
      const timer = setTimeout(() => {
        onNext();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [selectedMicroId, loading, onNext]);

  const loadMicros = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('services_unified')
        .select('id, micro')
        .eq('category', mainCategory)
        .eq('subcategory', subcategory)
        .order('micro');

      if (error) {
        console.error('Database error loading micro categories:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        console.warn(`No micro categories found for ${mainCategory} > ${subcategory}`);
        setMicros([]);
        return;
      }

      setMicros(data);
      console.log(`Loaded ${data.length} micro categories for ${mainCategory} > ${subcategory}`);
    } catch (error) {
      console.error('Error loading micro categories:', error);
      setMicros([]);
    } finally {
      setLoading(false);
    }
  };

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
