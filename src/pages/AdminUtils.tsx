import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Image } from 'lucide-react';

const AdminUtils = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const { toast } = useToast();

  const generateServiceImages = async () => {
    try {
      setLoading(true);
      setResults(null);

      const { data, error } = await supabase.functions.invoke('generate-service-images', {
        method: 'POST'
      });

      if (error) throw error;

      setResults(data);
      toast({
        title: 'Success!',
        description: `Generated images for ${data.results?.length || 0} services`,
      });
    } catch (error: any) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to generate images',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Admin Utilities</h1>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="h-5 w-5" />
              Generate Service Images
            </CardTitle>
            <CardDescription>
              Generate AI images for all services that don't have images yet
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={generateServiceImages} 
              disabled={loading}
              className="w-full"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? 'Generating Images...' : 'Generate Service Images'}
            </Button>

            {results && (
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <p className="font-semibold mb-2">{results.message}</p>
                <div className="space-y-2">
                  {results.results?.map((result: any, index: number) => (
                    <div 
                      key={index} 
                      className={`text-sm p-2 rounded ${
                        result.status === 'success' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      <span className="font-medium">{result.name}:</span> {result.status}
                      {result.error && <span className="text-xs block">{result.error}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminUtils;
