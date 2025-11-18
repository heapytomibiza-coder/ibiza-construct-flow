/**
 * Demo Setup Page - Initialize demo data for convention
 * Access: /demo-setup (admin only)
 */
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

export default function DemoSetup() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  const seedDemoData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('demo-seed-data');
      
      if (error) throw error;
      setResults(data);
    } catch (error) {
      console.error('Error seeding demo data:', error);
      setResults({ error: (error as Error).message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold">Demo Setup</h1>
          <p className="text-muted-foreground mt-2">
            Initialize demo data for the Constructive Solutions Ibiza convention
          </p>
        </div>

        <Card className="p-6">
          <h2 className="text-2xl font-semibold mb-4">Seed Demo Accounts</h2>
          <p className="text-muted-foreground mb-6">
            This will create:
          </p>
          <ul className="list-disc list-inside space-y-2 mb-6 text-muted-foreground">
            <li>8 Professional accounts (builders, electricians, plumbers, etc.)</li>
            <li>3 Client accounts</li>
            <li>5 Sample job postings</li>
          </ul>
          
          <Button
            onClick={seedDemoData}
            disabled={loading}
            size="lg"
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Seeding Data...
              </>
            ) : (
              'Seed Demo Data'
            )}
          </Button>
        </Card>

        {results && (
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Results</h3>
            
            {results.error ? (
              <div className="flex items-start gap-2 text-destructive">
                <XCircle className="h-5 w-5 mt-0.5" />
                <div>
                  <p className="font-medium">Error</p>
                  <p className="text-sm">{results.error}</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="h-5 w-5" />
                  <p className="font-medium">{results.message}</p>
                </div>

                <div className="space-y-4 mt-6">
                  <div>
                    <h4 className="font-medium mb-2">Professionals Created: {results.results?.professionals?.length || 0}</h4>
                    <div className="space-y-1">
                      {results.results?.professionals?.map((p: any, i: number) => (
                        <div key={i} className="text-sm flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          {p.email}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Clients Created: {results.results?.clients?.length || 0}</h4>
                    <div className="space-y-1">
                      {results.results?.clients?.map((c: any, i: number) => (
                        <div key={i} className="text-sm flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          {c.email}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Jobs Created: {results.results?.jobs?.length || 0}</h4>
                    <div className="space-y-1">
                      {results.results?.jobs?.map((j: any, i: number) => (
                        <div key={i} className="text-sm flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          {j.title}
                        </div>
                      ))}
                    </div>
                  </div>

                  {results.results?.errors?.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2 text-destructive">Errors: {results.results.errors.length}</h4>
                      <div className="space-y-1">
                        {results.results.errors.map((e: any, i: number) => (
                          <div key={i} className="text-sm flex items-start gap-2">
                            <XCircle className="h-4 w-4 text-destructive mt-0.5" />
                            <div>
                              <p className="font-medium">{e.email || e.job}</p>
                              <p className="text-muted-foreground">{e.error}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Demo Credentials</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>All passwords:</strong> Demo2025!</p>
                    <p><strong>Professional emails:</strong></p>
                    <ul className="list-disc list-inside ml-4 space-y-1">
                      <li>carlos.builder@demo.com</li>
                      <li>elena.electrician@demo.com</li>
                      <li>miguel.plumber@demo.com</li>
                      <li>sofia.painter@demo.com</li>
                      <li>david.carpenter@demo.com</li>
                      <li>anna.cleaner@demo.com</li>
                      <li>marco.landscaper@demo.com</li>
                      <li>lisa.designer@demo.com</li>
                    </ul>
                    <p className="mt-2"><strong>Client emails:</strong></p>
                    <ul className="list-disc list-inside ml-4 space-y-1">
                      <li>client1@demo.com</li>
                      <li>client2@demo.com</li>
                      <li>client3@demo.com</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
