import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ExtractedData {
  measurements?: string[];
  notes?: string[];
  text: string;
  confidence: number;
}

export function useImageOCR() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const { toast } = useToast();

  const extractTextFromImage = useCallback(async (imageFile: File) => {
    setIsProcessing(true);
    try {
      // Convert image to base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onloadend = () => {
          const base64 = reader.result as string;
          resolve(base64.split(',')[1]); // Remove data:image/...;base64, prefix
        };
        reader.readAsDataURL(imageFile);
      });

      const base64Image = await base64Promise;

      // Call edge function for OCR
      const { data, error } = await supabase.functions.invoke('extract-image-text', {
        body: { image: base64Image }
      });

      if (error) throw error;

      setExtractedData(data);
      
      if (data.text) {
        toast({
          title: 'Text extracted',
          description: 'Review the extracted information and edit as needed',
        });
      }

      return data;
    } catch (error) {
      console.error('OCR error:', error);
      toast({
        title: 'Failed to extract text',
        description: 'Please enter the information manually',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, [toast]);

  const clearExtractedData = useCallback(() => {
    setExtractedData(null);
  }, []);

  return {
    extractTextFromImage,
    isProcessing,
    extractedData,
    clearExtractedData,
  };
}
