import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const AIIntegrationTest = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  const testVoiceQuote = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('pro-voice-quote', {
        body: {
          audioBlob: 'mock-audio-data',
          serviceCategory: 'plumbing'
        }
      });

      if (error) throw error;
      setResults(data);
      toast.success('Voice quote AI tested successfully!');
    } catch (error) {
      console.error('Voice quote test error:', error);
      toast.error('Voice quote test failed');
    } finally {
      setLoading(false);
    }
  };

  const testPhotoQuote = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('pro-photo-quote', {
        body: {
          imageUrls: ['https://example.com/test-image.jpg'],
          serviceCategory: 'electrical'
        }
      });

      if (error) throw error;
      setResults(data);
      toast.success('Photo quote AI tested successfully!');
    } catch (error) {
      console.error('Photo quote test error:', error);
      toast.error('Photo quote test failed');
    } finally {
      setLoading(false);
    }
  };

  const testRiskAnalyzer = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-risk-analyzer', {
        body: {
          jobId: 'test-job-id',
          jobDetails: {
            complexity: 'high',
            category: 'electrical',
            estimated_hours: 8,
            time_window_hours: 6,
            total_price: 500
          },
          professionalProfile: {
            experience_level: 'beginner'
          }
        }
      });

      if (error) throw error;
      setResults(data);
      toast.success('Risk analyzer AI tested successfully!');
    } catch (error) {
      console.error('Risk analyzer test error:', error);
      toast.error('Risk analyzer test failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>🤖 AI Functions Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <Button 
            onClick={testVoiceQuote} 
            disabled={loading}
            variant="outline"
          >
            Test Voice Quote
          </Button>
          <Button 
            onClick={testPhotoQuote} 
            disabled={loading}
            variant="outline"
          >
            Test Photo Quote
          </Button>
          <Button 
            onClick={testRiskAnalyzer} 
            disabled={loading}
            variant="outline"
          >
            Test Risk Analyzer
          </Button>
        </div>
        
        {results && (
          <div className="mt-4 p-3 bg-muted rounded">
            <h4 className="font-medium mb-2">Latest Test Result:</h4>
            <pre className="text-xs overflow-auto">
              {JSON.stringify(results, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
};