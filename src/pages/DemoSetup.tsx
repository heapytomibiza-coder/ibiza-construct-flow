/**
 * Demo Setup Page - Initialize demo data for convention
 * Access: /demo-setup (admin only)
 */
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

interface SeedError {
  email?: string;
  job?: string;
  service?: string;
  error: string;
}

interface SeedResults {
  success: boolean;
  message: string;
  results: {
    microServices: Array<{ micro: string; status: string; id?: string }>;
    professionals: Array<{ email: string; status: string }>;
    clients: Array<{ email: string; status: string }>;
    jobs: Array<{ title: string; status: string }>;
    errors: SeedError[];
  };
}

interface ApiResponse {
  success?: boolean;
  message?: string;
  results?: SeedResults['results'];
  error?: string;
}

export default function DemoSetup() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ApiResponse | null>(null);

  const seedDemoData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('demo-seed-data');
      
      if (error) throw error;
      setResults(data as ApiResponse);
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
            <li>5 Micro services (Kitchen, Solar, Pool, Painting, Garden)</li>
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

                <div className="grid gap-6 md:grid-cols-2 mt-6">
                  <div>
                    <h4 className="font-medium mb-2">
                      Micro Services: {results.results?.microServices?.length || 0}
                    </h4>
                    <div className="space-y-1">
                      {results.results?.microServices?.map((s, i) => (
                        <div key={i} className="text-sm flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          <span>{s.micro}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">
                      Professionals: {results.results?.professionals?.length || 0}
                    </h4>
                    <div className="space-y-1">
                      {results.results?.professionals?.map((p, i) => (
                        <div key={i} className="text-sm flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          <span>{p.email}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">
                      Clients: {results.results?.clients?.length || 0}
                    </h4>
                    <div className="space-y-1">
                      {results.results?.clients?.map((c, i) => (
                        <div key={i} className="text-sm flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          <span>{c.email}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">
                      Jobs: {results.results?.jobs?.length || 0}
                    </h4>
                    <div className="space-y-1">
                      {results.results?.jobs?.map((j, i) => (
                        <div key={i} className="text-sm flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          <span>{j.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {results.results?.errors && results.results.errors.length > 0 && (
                  <div className="mt-4 p-4 border border-amber-200 bg-amber-50 rounded-lg">
                    <h4 className="font-medium text-amber-800 mb-2">
                      Errors: {results.results.errors.length}
                    </h4>
                    <div className="space-y-1">
                      {results.results.errors.map((e, i) => (
                        <div key={i} className="text-sm text-amber-700">
                          <span className="font-mono">
                            {e.email || e.job || e.service}
                          </span>
                          : {e.error}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">Demo Credentials</h4>
                  <p className="text-sm mb-3">
                    <strong>All passwords:</strong> <code>Demo2025!</code>
                  </p>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="font-medium text-sm mb-1">Professional emails:</p>
                      <ul className="text-sm space-y-0.5 text-muted-foreground">
                        <li>carlos.builder@demo.com</li>
                        <li>elena.electrician@demo.com</li>
                        <li>miguel.plumber@demo.com</li>
                        <li>sofia.painter@demo.com</li>
                        <li>david.carpenter@demo.com</li>
                        <li>anna.cleaner@demo.com</li>
                        <li>marco.landscaper@demo.com</li>
                        <li>lisa.designer@demo.com</li>
                      </ul>
                    </div>

                    <div>
                      <p className="font-medium text-sm mb-1">Client emails:</p>
                      <ul className="text-sm space-y-0.5 text-muted-foreground">
                        <li>client1@demo.com (John Smith)</li>
                        <li>client2@demo.com (Sarah Johnson)</li>
                        <li>client3@demo.com (Robert Williams)</li>
                      </ul>
                    </div>
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
