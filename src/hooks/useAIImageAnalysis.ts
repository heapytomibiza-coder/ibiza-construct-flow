import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type AnalysisType = 'quality_check' | 'object_detection' | 'text_extraction' | 'safety_check';

interface AnalyzeImageParams {
  imageUrl: string;
  analysisType: AnalysisType;
  entityType: string;
  entityId: string;
}

interface AnalysisResult {
  analysis_result: {
    score: number;
    summary: string;
    details: string;
  };
  tags: string[];
  confidence_score: number;
  issues_found: Array<{
    severity: 'low' | 'medium' | 'high';
    description: string;
  }>;
  recommendations: string[];
}

export function useAIImageAnalysis() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const { toast } = useToast();

  const analyzeImage = async ({
    imageUrl,
    analysisType,
    entityType,
    entityId,
  }: AnalyzeImageParams) => {
    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-image', {
        body: { imageUrl, analysisType, entityType, entityId },
      });

      if (error) throw error;

      setAnalysisResult(data);
      
      const hasIssues = data.issues_found && data.issues_found.length > 0;
      
      toast({
        title: hasIssues ? 'Analysis complete with issues' : 'Analysis complete',
        description: hasIssues 
          ? `Found ${data.issues_found.length} issue(s)`
          : 'Image analysis successful',
        variant: hasIssues ? 'destructive' : 'default',
      });

      return data;
    } catch (error) {
      console.error('Image analysis error:', error);
      toast({
        title: 'Analysis failed',
        description: 'Unable to analyze image. Please try again.',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getAnalysisHistory = async (entityType: string, entityId: string) => {
    try {
      const { data, error } = await (supabase as any)
        .from('ai_image_analysis')
        .select('*')
        .eq('entity_type', entityType)
        .eq('entity_id', entityId)
        .order('analyzed_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching analysis history:', error);
      return [];
    }
  };

  return {
    isAnalyzing,
    analysisResult,
    analyzeImage,
    getAnalysisHistory,
  };
}