/**
 * Admin utility page to seed Commercial & Industrial questions
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { seedCommercialQuestions, seedCommercialTaxonomy } from '@/lib/admin/seedCommercialQuestions';

export default function SeedCommercialQuestions() {
  const [taxonomyLoading, setTaxonomyLoading] = useState(false);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [taxonomyResult, setTaxonomyResult] = useState<any>(null);
  const [questionsResult, setQuestionsResult] = useState<any>(null);

  const handleSeedTaxonomy = async () => {
    setTaxonomyLoading(true);
    setTaxonomyResult(null);
    try {
      const result = await seedCommercialTaxonomy();
      setTaxonomyResult(result);
    } catch (error: any) {
      setTaxonomyResult({ success: false, error: error.message });
    } finally {
      setTaxonomyLoading(false);
    }
  };

  const handleSeedQuestions = async () => {
    setQuestionsLoading(true);
    setQuestionsResult(null);
    try {
      const result = await seedCommercialQuestions();
      setQuestionsResult(result);
    } catch (error: any) {
      setQuestionsResult({ success: 0, failed: 1, errors: [error.message] });
    } finally {
      setQuestionsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Seed Commercial & Industrial</h1>
        <p className="text-muted-foreground mt-2">
          Import taxonomy and question packs for Commercial & Industrial services
        </p>
      </div>

      <div className="space-y-6">
        {/* Step 1: Seed Taxonomy */}
        <Card>
          <CardHeader>
            <CardTitle>Step 1: Seed Taxonomy</CardTitle>
            <CardDescription>
              Create categories, subcategories, and micro-services in the database
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={handleSeedTaxonomy}
              disabled={taxonomyLoading}
              className="w-full"
            >
              {taxonomyLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {taxonomyLoading ? 'Seeding Taxonomy...' : 'Seed Taxonomy'}
            </Button>

            {taxonomyResult && (
              <Alert variant={taxonomyResult.success ? 'default' : 'destructive'}>
                <div className="flex items-start gap-2">
                  {taxonomyResult.success ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                  ) : (
                    <XCircle className="h-5 w-5 text-destructive mt-0.5" />
                  )}
                  <div className="flex-1">
                    <AlertDescription>
                      {taxonomyResult.success ? (
                        <>
                          <strong>Success!</strong> Taxonomy seeded successfully.
                        </>
                      ) : (
                        <>
                          <strong>Failed:</strong> {taxonomyResult.error}
                        </>
                      )}
                    </AlertDescription>
                  </div>
                </div>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Step 2: Seed Questions */}
        <Card>
          <CardHeader>
            <CardTitle>Step 2: Seed Question Packs</CardTitle>
            <CardDescription>
              Import 25 question packs (3 detailed + 22 generic) for Commercial & Industrial services
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={handleSeedQuestions}
              disabled={questionsLoading}
              className="w-full"
            >
              {questionsLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {questionsLoading ? 'Seeding Questions...' : 'Seed Question Packs'}
            </Button>

            {questionsResult && (
              <div className="space-y-3">
                {questionsResult.success > 0 && (
                  <Alert>
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <AlertDescription>
                      <strong>✅ Success:</strong> {questionsResult.success} packs seeded
                    </AlertDescription>
                  </Alert>
                )}
                
                {questionsResult.skipped > 0 && (
                  <Alert>
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    <AlertDescription>
                      <strong>⏭️ Skipped:</strong> {questionsResult.skipped} packs (already exist)
                    </AlertDescription>
                  </Alert>
                )}

                {questionsResult.failed > 0 && (
                  <Alert variant="destructive">
                    <XCircle className="h-5 w-5" />
                    <AlertDescription>
                      <strong>❌ Failed:</strong> {questionsResult.failed} packs
                      {questionsResult.errors.length > 0 && (
                        <ul className="mt-2 space-y-1 text-sm">
                          {questionsResult.errors.slice(0, 5).map((error: string, idx: number) => (
                            <li key={idx}>• {error}</li>
                          ))}
                        </ul>
                      )}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Alert>
          <AlertTriangle className="h-5 w-5" />
          <AlertDescription>
            <strong>Note:</strong> Run Step 1 first to create the taxonomy, then Step 2 to add the question packs.
            Check the browser console for detailed logs.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
